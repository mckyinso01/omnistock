import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const force = !!body?.frequency;

    const settings = await base44.asServiceRole.entities.SyncSetting.list();
    if (settings.length === 0) {
      return Response.json({ error: "No sync setting configured. Open the Automations page to configure the Google Sheets sync." }, { status: 400 });
    }
    const setting = settings[0];
    if (!setting.spreadsheet_id) {
      return Response.json({ error: "Spreadsheet URL/ID missing in sync setting." }, { status: 400 });
    }

    // Decide if a scheduled run is due today (Asia/Manila time).
    let due = false;
    if (force) {
      due = true;
    } else {
      const manila = new Date(Date.now() + 8 * 60 * 60 * 1000);
      const wday = manila.getUTCDay();
      const dom = manila.getUTCDate();
      if (setting.daily_enabled) due = true;
      if (setting.weekly_enabled && wday === 1) due = true;
      if (setting.monthly_enabled && dom === 1) due = true;
    }
    if (!due) return Response.json({ ok: true, message: "Not scheduled to run today.", appended: 0 });

    // New completed sales since the last sync.
    const sinceMs = setting.last_synced_at ? new Date(setting.last_synced_at).getTime() : 0;
    const allTxns = await base44.asServiceRole.entities.Transaction.filter({ status: "completed" });
    const batch = allTxns
      .filter(t => t.created_date && new Date(t.created_date).getTime() > sinceMs)
      .sort((a, b) => new Date(a.created_date).getTime() - new Date(b.created_date).getTime());

    // Connect to Google Sheets.
    const { accessToken } = await base44.asServiceRole.connectors.getConnection("googlesheets");
    if (!accessToken) return Response.json({ error: "Google Sheets connector not authorized." }, { status: 400 });

    let spreadsheetId = setting.spreadsheet_id.trim();
    const sm = spreadsheetId.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (sm) spreadsheetId = sm[1];

    const sheetName = (setting.sheet_tab_name || "Transactions").trim();
    const headers = ["Date", "Transaction #", "Customer", "Cashier", "Items", "Total Qty", "Subtotal", "Discount", "Tax", "Total Amount", "Total Cost", "Gross Profit", "Payment Method", "Status", "Synced At"];

    // Verify access.
    const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const meta = await metaRes.json();
    if (!metaRes.ok) {
      return Response.json({ error: "Cannot access spreadsheet. Check the URL and ensure it is shared with your connected Google account.", details: meta.error?.message || "unknown" }, { status: 400 });
    }

    // Create the tab if missing.
    const tabExists = (meta.sheets || []).some(s => s.properties?.title === sheetName);
    if (!tabExists) {
      const createRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ requests: [{ addSheet: { properties: { title: sheetName } } }] }),
      });
      if (!createRes.ok) {
        const e = await createRes.json();
        return Response.json({ error: `Failed to create tab "${sheetName}": ${e.error?.message || "unknown"}` }, { status: 400 });
      }
    }

    // Seed header row if the first row is empty.
    const headerRange = encodeURIComponent(`${sheetName}!A1:O1`);
    const headerGet = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${headerRange}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const headerData = await headerGet.json();
    if (!headerData.values || headerData.values.length === 0) {
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${headerRange}?valueInputOption=RAW`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ values: [headers] }),
      });
    }

    const now = new Date();

    if (batch.length === 0) {
      // Nothing new — still advance the cursor so it stays accurate.
      await base44.asServiceRole.entities.SyncSetting.update(setting.id, { last_synced_at: now.toISOString() });
      return Response.json({ ok: true, message: "No new sales since last sync.", appended: 0, last_synced_at: now.toISOString() });
    }

    const rows = batch.map(t => {
      const items = t.items || [];
      const itemsStr = items.slice(0, 5).map((it) => `${it.product_name || "?"} x${it.quantity || 0}`).join(", ") + (items.length > 5 ? ` +${items.length - 5} more` : "");
      const totalQty = items.reduce((q, it) => q + (Number(it.quantity) || 0), 0);
      const subtotal = Number(t.subtotal) || 0;
      const discount = Number(t.discount_amount) || 0;
      const tax = Number(t.tax_amount) || 0;
      const total = Number(t.total_amount) || 0;
      const totalCost = items.reduce((c, it) => c + (Number(it.unit_cost) || 0) * (Number(it.quantity) || 0), 0);
      const profit = total - totalCost;
      const dateStr = t.created_date ? new Date(t.created_date).toISOString().replace("T", " ").slice(0, 19) : "";
      return [dateStr, t.transaction_number || "", t.customer_name || "", t.cashier_name || "", itemsStr, totalQty, subtotal.toFixed(2), discount.toFixed(2), tax.toFixed(2), total.toFixed(2), totalCost.toFixed(2), profit.toFixed(2), t.payment_method || "", t.status || "", now.toISOString()];
    });

    const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
    const appendRes = await fetch(appendUrl, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ values: rows }),
    });
    if (!appendRes.ok) {
      const e = await appendRes.json();
      return Response.json({ error: `Append failed: ${e.error?.message || "unknown"}` }, { status: 500 });
    }

    // Advance the dedupe cursor to the latest created_date so old sales never re-append.
    const latest = batch[batch.length - 1].created_date;
    await base44.asServiceRole.entities.SyncSetting.update(setting.id, { last_synced_at: latest });

    return Response.json({ ok: true, appended: batch.length, last_synced_at: latest });
  } catch (err) {
    return Response.json({ error: err.message || "sync failed" }, { status: 500 });
  }
});