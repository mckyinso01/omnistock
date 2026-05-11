/**
 * Weekly Purchase Order Report Service
 * Groups open PO records by supplier and sends email reports.
 * Runs client-side using Dexie entities + Base44 SendEmail integration.
 */
import { entities } from "@/lib/db";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";

export async function sendWeeklyPOReports() {
  const orders = await entities.PurchaseOrder.list("-created_date", 500);

  // Only open orders: draft, sent, partial
  const openOrders = orders.filter(o => ["draft", "sent", "partial"].includes(o.status));

  if (openOrders.length === 0) return { sent: 0, message: "No open purchase orders." };

  // Load suppliers to get their emails
  const suppliers = await entities.Supplier.list("name", 200);
  const supplierMap = {};
  suppliers.forEach(s => { supplierMap[s.id] = s; });

  // Group by supplier
  const bySupplier = {};
  openOrders.forEach(o => {
    const key = o.supplier_id || "unknown";
    if (!bySupplier[key]) bySupplier[key] = [];
    bySupplier[key].push(o);
  });

  let sent = 0;
  const results = [];

  for (const [supplierId, orders] of Object.entries(bySupplier)) {
    const supplier = supplierMap[supplierId];
    if (!supplier?.email) {
      results.push({ supplier: supplier?.name || supplierId, status: "skipped", reason: "No email on file" });
      continue;
    }

    const totalValue = orders.reduce((s, o) => s + (o.total_amount || 0), 0);
    const orderLines = orders.map(o => {
      const items = (o.items || []).map(i =>
        `    • ${i.product_name}: ${i.quantity_ordered} ${i.unit || "pcs"} ordered, ${i.quantity_received || 0} received`
      ).join("\n");
      return `PO #${o.po_number || o.id.slice(-6)} — Status: ${o.status.toUpperCase()}${o.expected_date ? ` — Expected: ${format(new Date(o.expected_date), "MMM d, yyyy")}` : ""}
${items || "    (no items listed)"}`;
    }).join("\n\n");

    const body = `Hi ${supplier.contact_person || supplier.name},

This is your weekly open Purchase Order summary from StockMate.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OPEN PURCHASE ORDERS — Week of ${format(new Date(), "MMMM d, yyyy")}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Supplier: ${supplier.name}
Open POs: ${orders.length}
Total Value: ₱${totalValue.toLocaleString("en-PH", { minimumFractionDigits: 2 })}

ORDER DETAILS:
${orderLines}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Please coordinate with us to fulfill or update the status of these orders.

— StockMate Automated Reports
Generated: ${format(new Date(), "MMMM d, yyyy hh:mm a")}`;

    await base44.integrations.Core.SendEmail({
      to: supplier.email,
      subject: `StockMate — Open Purchase Orders for ${supplier.name} (Week of ${format(new Date(), "MMM d, yyyy")})`,
      body,
    });

    sent++;
    results.push({ supplier: supplier.name, email: supplier.email, pos: orders.length, status: "sent" });
  }

  return { sent, results };
}