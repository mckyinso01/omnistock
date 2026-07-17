import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

const MANILA_OFFSET_MS = 8 * 60 * 60 * 1000;

function manilaParts(d) {
  const m = new Date(d.getTime() + MANILA_OFFSET_MS);
  return {
    y: m.getUTCFullYear(),
    mo: m.getUTCMonth(),
    d: m.getUTCDate(),
    wday: m.getUTCDay(),
    iso: m.toISOString().slice(0, 10),
  };
}

function rangeForFrequency(freq, now) {
  const p = manilaParts(now);
  if (freq === "daily") {
    const yp = manilaParts(new Date(now.getTime() - 24 * 60 * 60 * 1000));
    return { start: yp.iso, end: yp.iso, label: `Daily ${yp.iso}` };
  }
  if (freq === "weekly") {
    const endMs = now.getTime() - 24 * 60 * 60 * 1000;
    const startMs = endMs - 6 * 24 * 60 * 60 * 1000;
    const sp = manilaParts(new Date(startMs));
    const ep = manilaParts(new Date(endMs));
    return { start: sp.iso, end: ep.iso, label: `Weekly ${sp.iso} to ${ep.iso}` };
  }
  let prevY = p.y, prevMo = p.mo - 1;
  if (prevMo < 0) { prevMo = 11; prevY -= 1; }
  const lastDay = new Date(Date.UTC(prevY, prevMo + 1, 0)).getUTCDate();
  const start = `${prevY}-${String(prevMo + 1).padStart(2, "0")}-01`;
  const end = `${prevY}-${String(prevMo + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { start, end, label: `Monthly ${start} to ${end}` };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const forceFrequency = body?.frequency;

    const settings = await base44.asServiceRole.entities.SyncSetting.list();
    if (!settings.length) {
      return Response.json({ error: "No sync setting configured. Open the Automations page to configure Google Sheets sync." }, { status: 400 });
    }
    const setting = settings[0];
    if (!setting.spreadsheet_id) {
      return Response.json({ error: "Spreadsheet URL/ID missing in sync setting." }, { status: 400 });
    }

    const now = new Date();
    const p = manilaParts(now);

    const due = [];
    if (forceFrequency) {
      due.push(forceFrequency);
    } else {
      if (setting.daily_enabled) due.push("daily");
      if (setting.weekly_enabled && p.wday === 1) due.push("weekly");
      if (setting.monthly_enabled && p.d === 1) due.push("monthly");
    }

    if (!due.length) return Response.json({ ok: true, message: "No frequencies due today.", frequencies: [] });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection("googlesheets");
    if (!accessToken) return Response.json({ error: "Google Sheets connector not authorized." }, { status: 400 });

    const txns = await base44.asServiceRole.entities.Transaction.filter({ status: "completed" });

    let spreadsheetId = setting.spreadsheet_id.trim();
    const sm = spreadsheetId.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (sm) spreadsheetId = sm[1];

    const sheetName = (setting.sheet_tab_name || "Transaction Summaries").trim();
    const headers = ["Period Label", "Frequency", "Start", "End", "Transactions", "Items Sold", "Total Sales (PHP)", "Total Cost (PHP)", "Gross Profit (PHP)", "Payment Breakdown", "Generated At"];

    // Verify spreadsheet access
    const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const meta = await metaRes.json();
    if (!metaRes.ok) {
      return Response.json({ error: "Cannot access spreadsheet. Check the URL and ensure it is shared with your connected Google account.", details: meta.error?.message || "unknown" }, { status: 400 });
    }
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

    // Seed header row if empty
    const headerRange = encodeURIComponent(`${sheetName}!A1:K1`);
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

    const results = [];
    for (const freq of due) {
      const r = rangeForFrequency(freq, now);
      const matched = txns.filter(t => {
        if (!t.created_date) return false;
        const ms = new Date(t.created_date).getTime() + MANILA_OFFSET_MS;
        const ds = new Date(ms).toISOString().slice(0, 10);
        return ds >= r.start && ds <= r.end;
      });

      const totalSales = matched.reduce((s, t) => s + (t.total_amount || 0), 0);
      const totalCost = matched.reduce((s, t) => {
        const items = t.items || [];
        return s + items.reduce((cs, it) => cs + ((it.unit_cost || 0) * (it.quantity || 0)), 0);
      }, 0);
      const grossProfit = totalSales - totalCost;
      const itemsSold = matched.reduce((s, t) => s + (t.items || []).reduce((q, it) => q + (it.quantity || 0), 0), 0);

      const pm = {};
      matched.forEach(t => { const m = t.payment_method || "unknown"; pm[m] = (pm[m] || 0) + (t.total_amount || 0); });
      const pmStr = Object.entries(pm).map(([k, v]) => `${k}: ${v.toFixed(2)}`).join("; ");

      const row = [r.label, freq, r.start, r.end, matched.length, itemsSold, totalSales.toFixed(2), totalCost.toFixed(2), grossProfit.toFixed(2), pmStr, new Date().toISOString()];

      const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
      const appendRes = await fetch(appendUrl, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ values: [row] }),
      });
      if (!appendRes.ok) {
        const e = await appendRes.json();
        results.push({ frequency: freq, period: r.label, error: e.error?.message || "append failed" });
      } else {
        results.push({ frequency: freq, period: r.label, transactions: matched.length, total_sales: totalSales, total_cost: totalCost, gross_profit: grossProfit });
      }
    }

    return Response.json({ ok: true, results });
  } catch (err) {
    return Response.json({ error: err.message || "sync failed" }, { status: 500 });
  }
});