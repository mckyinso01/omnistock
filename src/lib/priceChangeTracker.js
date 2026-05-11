/**
 * Price Change Tracker Service
 * Detects price changes from Transactions or StockAdjustments and saves to PriceHistory.
 * Runs client-side using Dexie entities.
 */
import { entities } from "@/lib/db";

/**
 * Called after a Transaction is saved.
 * Compares each item's unit_price against the current product price.
 * If they differ, records a PriceHistory entry.
 */
export async function trackPriceChangesFromTransaction(transaction, changedBy = "POS") {
  if (!transaction?.items?.length) return;

  for (const item of transaction.items) {
    if (!item.product_id) continue;
    const product = await entities.Product.get(item.product_id);
    if (!product) continue;

    const oldPrice = product.price || 0;
    const newPrice = item.unit_price || 0;
    const oldCost = product.cost || 0;
    const newCost = item.unit_cost || oldCost;

    const priceChanged = Math.abs(oldPrice - newPrice) > 0.001;
    const costChanged = Math.abs(oldCost - newCost) > 0.001;

    if (priceChanged || costChanged) {
      await entities.PriceHistory.create({
        product_id: item.product_id,
        product_name: item.product_name || product.name,
        old_price: oldPrice,
        new_price: priceChanged ? newPrice : oldPrice,
        old_cost: oldCost,
        new_cost: costChanged ? newCost : oldCost,
        changed_by: changedBy,
        reason: `Transaction #${transaction.transaction_number || transaction.id?.slice(-6) || "?"}`,
      });
    }
  }
}

/**
 * Called after a StockAdjustment is saved that may include cost corrections.
 * Pass the product's before/after costs explicitly.
 */
export async function trackPriceChangesFromAdjustment({ productId, oldCost, newCost, oldPrice, newPrice, adjustedBy, reason }) {
  if (!productId) return;

  const priceChanged = newPrice !== undefined && Math.abs((oldPrice || 0) - (newPrice || 0)) > 0.001;
  const costChanged = newCost !== undefined && Math.abs((oldCost || 0) - (newCost || 0)) > 0.001;

  if (!priceChanged && !costChanged) return;

  const product = await entities.Product.get(productId);
  if (!product) return;

  await entities.PriceHistory.create({
    product_id: productId,
    product_name: product.name,
    old_price: oldPrice ?? product.price ?? 0,
    new_price: newPrice ?? product.price ?? 0,
    old_cost: oldCost ?? product.cost ?? 0,
    new_cost: newCost ?? product.cost ?? 0,
    changed_by: adjustedBy || "Stock Adjustment",
    reason: reason || "Stock adjustment",
  });
}

/**
 * Scans all transactions and backfills missing PriceHistory entries.
 * Safe to call multiple times — skips duplicates based on transaction ref.
 */
export async function backfillPriceHistory() {
  const transactions = await entities.Transaction.list("-created_date", 2000);
  const existingHistory = await entities.PriceHistory.list("-created_date", 5000);
  const existingRefs = new Set(existingHistory.map(h => h.reason));

  let created = 0;
  for (const txn of transactions) {
    if (txn.status !== "completed" || txn.type !== "sale") continue;
    const ref = `Transaction #${txn.transaction_number || txn.id?.slice(-6) || "?"}`;
    if (existingRefs.has(ref)) continue;
    await trackPriceChangesFromTransaction(txn, "POS (backfill)");
    created++;
  }
  return { backfilled: created };
}