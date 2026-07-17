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
    return { start: yp.iso, end: yp.iso, label: yp.iso };
  }
  if (freq === "weekly") {
    const endMs = now.getTime() - 24 * 60 * 60 * 1000;
    const startMs = endMs - 6 * 24 * 60 * 60 * 1000;
    const sp = manilaParts(new Date(startMs));
    const ep = manilaParts(new Date(endMs));
    return { start: sp.iso, end: ep.iso, label: `${sp.iso} to ${ep.iso}` };
  }
  let prevY = p.y, prevMo = p.mo - 1;
  if (prevMo < 0) { prevMo = 11; prevY -= 1; }
  const lastDay = new Date(Date.UTC(prevY, prevMo + 1, 0)).getUTCDate();
  const start = `${prevY}-${String(prevMo + 1).padStart(2, "0")}-01`;
  const end = `${prevY}-${String(prevMo + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { start, end, label: `${start} to ${end}` };
}

function encodeHeader(s) {
  if (/^[\x00-\x7F]*$/.test(s)) return s;
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return `=?UTF-8?B?${btoa(bin)}?=`;
}

function buildMime(to, subject, html) {
  return [
    `To: ${to}`,
    `From: StockMate Reports <me>`,
    `Subject: ${encodeHeader(subject)}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset=UTF-8`,
    `Content-Transfer-Encoding: 8bit`,
    ``,
    html,
  ].join("\r\n");
}

async function sendViaGmail(accessToken, to, subject, html) {
  const raw = buildMime(to, subject, html);
  const bytes = new TextEncoder().encode(raw);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  const b64 = btoa(bin);
  return fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ raw: b64 }),
  });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const forceScheduleId = body?.schedule_id;

    const now = new Date();
    const p = manilaParts(now);

    let schedules = await base44.asServiceRole.entities.ReportSchedule.filter({ active: true });
    if (forceScheduleId) {
      schedules = schedules.filter(s => s.id === forceScheduleId);
      if (!schedules.length) {
        return Response.json({ error: "Schedule not found or inactive." }, { status: 404 });
      }
    } else {
      schedules = schedules.filter(s => {
        if (s.frequency === "daily") return true;
        if (s.frequency === "weekly") return s.day_of_week === p.wday;
        if (s.frequency === "monthly") return s.day_of_month === p.d;
        return false;
      });
    }

    if (!schedules.length) {
      return Response.json({ sent: 0, results: [], message: "No schedules due today." });
    }

    const txns = await base44.asServiceRole.entities.Transaction.filter({ status: "completed" });
    const products = await base44.asServiceRole.entities.Product.filter({ status: "active" });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection("gmail");
    if (!accessToken) return Response.json({ error: "Gmail connector not authorized." }, { status: 400 });

    const results = [];
    for (const s of schedules) {
      try {
        const r = rangeForFrequency(s.frequency, now);
        const matched = txns.filter(t => {
          if (!t.created_date) return false;
          const ms = new Date(t.created_date).getTime() + MANILA_OFFSET_MS;
          const ds = new Date(ms).toISOString().slice(0, 10);
          return ds >= r.start && ds <= r.end;
        });
        const totalSales = matched.reduce((a, t) => a + (t.total_amount || 0), 0);
        const totalCost = matched.reduce((a, t) => {
          const items = t.items || [];
          return a + items.reduce((c, it) => c + ((it.unit_cost || 0) * (it.quantity || 0)), 0);
        }, 0);
        const itemsSold = matched.reduce((a, t) => a + (t.items || []).reduce((q, it) => q + (it.quantity || 0), 0), 0);

        let subject = "";
        let html = "";
        const freqLabel = s.frequency.charAt(0).toUpperCase() + s.frequency.slice(1);
        const periodLine = `<p>Period: <b>${r.start}</b> to <b>${r.end}</b></p>`;

        if (s.report_type === "sales") {
          subject = `[StockMate] ${freqLabel} Sales Report — ${r.label}`;
          const pm = {};
          matched.forEach(t => { const m = t.payment_method || "unknown"; pm[m] = (pm[m] || 0) + (t.total_amount || 0); });
          const pmRows = Object.entries(pm).map(([k, v]) => `<tr><td style="padding:4px 12px">${k}</td><td style="padding:4px 12px;text-align:right">&#8369;${v.toFixed(2)}</td></tr>`).join("");
          html = `<div style="font-family:Arial,sans-serif;color:#334155">
<h2 style="color:#065f46">${freqLabel} Sales Report</h2>${periodLine}
<p>Total Sales: <b style="color:#047857">&#8369;${totalSales.toFixed(2)}</b></p>
<p>Transactions: <b>${matched.length}</b> &nbsp; Items Sold: <b>${itemsSold}</b></p>
<h3 style="margin-top:18px;color:#475569">Payment Method Breakdown</h3>
<table style="border-collapse:collapse;border:1px solid #e2e8f0;font-size:13px">${pmRows || "<tr><td>No sales</td></tr>"}</table>
<p style="margin-top:18px;color:#94a3b8;font-size:11px">Generated by StockMate Automations</p></div>`;
        } else if (s.report_type === "cost_expenses") {
          const grossProfit = totalSales - totalCost;
          subject = `[StockMate] ${freqLabel} Cost & Expenses Report — ${r.label}`;
          html = `<div style="font-family:Arial,sans-serif;color:#334155">
<h2 style="color:#065f46">${freqLabel} Cost & Expenses Report</h2>${periodLine}
<p>Total Sales: <b>&#8369;${totalSales.toFixed(2)}</b></p>
<p>Total Cost (COGS): <b>&#8369;${totalCost.toFixed(2)}</b></p>
<p style="font-size:16px">Gross Profit: <b style="color:${grossProfit >= 0 ? "#047857" : "#b91c1c"}">&#8369;${grossProfit.toFixed(2)}</b></p>
<p style="margin-top:6px;color:#475569">Margin: <b>${totalSales > 0 ? ((grossProfit / totalSales) * 100).toFixed(1) : "0.0"}%</b></p>
<p style="margin-top:18px;color:#94a3b8;font-size:11px">Generated by StockMate Automations</p></div>`;
        } else if (s.report_type === "low_stock") {
          const low = products.filter(p => (p.quantity || 0) <= (p.low_stock_threshold || 10));
          const outOfStock = low.filter(p => (p.quantity || 0) === 0);
          const lowOnly = low.filter(p => (p.quantity || 0) > 0);
          subject = `[StockMate] Low Stock Report — ${r.label}`;
          const rows = low.slice().sort((a, b) => (a.quantity || 0) - (b.quantity || 0)).slice(0, 50).map(p => `<tr>
<td style="padding:4px 12px">${p.name || ""}</td>
<td style="padding:4px 12px;text-align:right">${p.quantity || 0}</td>
<td style="padding:4px 12px;text-align:right">${p.low_stock_threshold || 10}</td>
<td style="padding:4px 12px">${p.category || ""}</td></tr>`).join("");
          html = `<div style="font-family:Arial,sans-serif;color:#334155">
<h2 style="color:#065f46">Low Stock Report</h2>${periodLine}
<p>Out of Stock: <b style="color:#b91c1c">${outOfStock.length}</b> &nbsp; Low: <b style="color:#b45309">${lowOnly.length}</b> &nbsp; Total Active Products: ${products.length}</p>
<table style="border-collapse:collapse;border:1px solid #e2e8f0;font-size:13px;margin-top:10px">
<thead><tr style="background:#f1f5f9"><th style="padding:6px 12px;text-align:left">Product</th><th style="padding:6px 12px;text-align:right">Qty</th><th style="padding:6px 12px;text-align:right">Threshold</th><th style="padding:6px 12px;text-align:left">Category</th></tr></thead>
<tbody>${rows || "<tr><td colspan=4>No low stock items</td></tr>"}</tbody></table>
<p style="margin-top:18px;color:#94a3b8;font-size:11px">Generated by StockMate Automations</p></div>`;
        } else {
          continue;
        }

        const sendRes = await sendViaGmail(accessToken, s.recipient_email, subject, html);
        if (!sendRes.ok) {
          const e = await sendRes.json();
          results.push({ scheduleId: s.id, recipient: s.recipient_email, error: e.error?.message || "send failed" });
        } else {
          results.push({ scheduleId: s.id, recipient: s.recipient_email, status: "sent" });
        }
      } catch (e) {
        results.push({ scheduleId: s.id, error: e.message || "schedule failed" });
      }
    }
    return Response.json({ sent: results.filter(r => r.status === "sent").length, results });
  } catch (err) {
    return Response.json({ error: err.message || "dispatch failed" }, { status: 500 });
  }
});