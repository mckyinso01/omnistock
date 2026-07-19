import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

const CONNECTOR_ID = "6a315e4b59d42a65c6aa846f"; // ARIA Google Calendar (BYO shared)

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await req.json().catch(() => ({}));
    const poId = payload?.po_id;
    const all = payload?.all === true;

    if (!poId && !all) {
      return Response.json({ error: "Provide po_id (single PO) or all=true (sync every unfulfilled PO with an expected date)." }, { status: 400 });
    }

    let connection;
    try {
      connection = await base44.asServiceRole.connectors.getConnection("googlecalendar");
    } catch (e) {
      return Response.json({
        error: "Google Calendar is not connected. Authorize it from the chat or dashboard > connectors, then try again.",
        details: e?.message,
      }, { status: 400 });
    }
    const accessToken = connection?.accessToken;
    if (!accessToken) {
      return Response.json({ error: "Google Calendar access token is missing. Reconnect the connector and retry." }, { status: 400 });
    }

    let pos;
    if (poId) {
      const po = await base44.asServiceRole.entities.PurchaseOrder.get(poId);
      pos = [po];
    } else {
      const allPos = await base44.asServiceRole.entities.PurchaseOrder.list("-created_date", 200);
      pos = (allPos || []).filter(p => p.expected_date && p.status !== "received" && p.status !== "cancelled");
    }

    const results = [];
    for (const po of pos) {
      if (!po.expected_date) {
        results.push({ po_id: po.id, po_number: po.po_number, ok: false, error: "No expected_date on this PO." });
        continue;
      }
      const start = new Date(`${po.expected_date}T09:00:00`);
      const end = new Date(`${po.expected_date}T10:00:00`);
      const summary = `📦 PO ${po.po_number || po.id} — ${po.supplier_name || "Supplier"}`;
      const descriptionLines = ["Stock delivery scheduled by OmniStock."];
      if (po.supplier_name) descriptionLines.push(`Supplier: ${po.supplier_name}`);
      if (po.po_number) descriptionLines.push(`PO #: ${po.po_number}`);
      descriptionLines.push(`Status: ${po.status || "draft"}`);
      if (po.notes) descriptionLines.push(`Notes: ${po.notes}`);
      const itemSummary = (po.items || []).slice(0, 8).map(i => `• ${i.product_name || "Item"} × ${i.quantity_ordered || 0}`).join("\n");
      if (itemSummary) descriptionLines.push("Items:\n" + itemSummary);

      const eventBody = {
        summary,
        description: descriptionLines.join("\n"),
        start: { dateTime: start.toISOString() },
        end: { dateTime: end.toISOString() },
        reminders: { useDefault: false, overrides: [{ method: "popup", minutes: 60 }, { method: "popup", minutes: 600 }] },
      };

      const r = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify(eventBody),
      });
      const data = await r.json();
      results.push({
        po_id: po.id,
        po_number: po.po_number,
        ok: r.ok,
        event_id: data?.id || null,
        error: r.ok ? null : (data?.error?.message || "Failed to create event"),
      });
    }

    const failed = results.filter(r => !r.ok);
    if (failed.length === results.length && results.length > 0) {
      return Response.json({ success: false, error: failed[0]?.error || "All events failed to create.", results }, { status: 502 });
    }
    return Response.json({ success: true, created: results.filter(r => r.ok).length, failed: failed.length, results });
  } catch (error) {
    return Response.json({ error: error?.message || "Unexpected server error" }, { status: 500 });
  }
});