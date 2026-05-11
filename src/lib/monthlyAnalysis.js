/**
 * Monthly Analysis Service
 * Analyzes Transaction data by Recipe and Category for a given month.
 * Runs client-side using Dexie entities.
 */
import { entities } from "@/lib/db";
import { startOfMonth, endOfMonth, format } from "date-fns";

export async function runMonthlyAnalysis(targetDate = new Date()) {
  const monthStart = startOfMonth(targetDate);
  const monthEnd = endOfMonth(targetDate);
  const monthLabel = format(targetDate, "MMMM yyyy");

  const [transactions, products, categories, recipes] = await Promise.all([
    entities.Transaction.list("-created_date", 2000),
    entities.Product.list("name", 500),
    entities.Category.list("name", 200),
    entities.Recipe.list("name", 200),
  ]);

  const monthTxns = transactions.filter(t => {
    const d = new Date(t.created_date);
    return t.status === "completed" && t.type === "sale" && d >= monthStart && d <= monthEnd;
  });

  // ── By Category ──────────────────────────────────────────────────────────
  const productCategoryMap = {};
  products.forEach(p => {
    productCategoryMap[p.id] = { category: p.category || "Uncategorized", category_id: p.category_id };
  });

  const categoryStats = {};
  monthTxns.forEach(t => {
    (t.items || []).forEach(item => {
      const cat = productCategoryMap[item.product_id]?.category || "Uncategorized";
      if (!categoryStats[cat]) categoryStats[cat] = { revenue: 0, qty: 0, orders: 0, cogs: 0 };
      categoryStats[cat].revenue += item.subtotal || 0;
      categoryStats[cat].qty += item.quantity || 0;
      categoryStats[cat].cogs += (item.unit_cost || 0) * (item.quantity || 0);
      categoryStats[cat].orders += 1;
    });
  });

  const byCategory = Object.entries(categoryStats)
    .map(([name, data]) => ({
      category: name,
      revenue: data.revenue,
      qty_sold: data.qty,
      order_lines: data.orders,
      gross_profit: data.revenue - data.cogs,
      margin_pct: data.revenue > 0 ? +((( data.revenue - data.cogs) / data.revenue) * 100).toFixed(1) : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  // ── By Recipe ─────────────────────────────────────────────────────────────
  // Match sold products to recipes that produce them
  const recipeProductMap = {};
  recipes.forEach(r => {
    if (r.product_id) recipeProductMap[r.product_id] = r;
  });

  const recipeStats = {};
  monthTxns.forEach(t => {
    (t.items || []).forEach(item => {
      const recipe = recipeProductMap[item.product_id];
      if (!recipe) return;
      const key = recipe.name;
      if (!recipeStats[key]) recipeStats[key] = { recipe_id: recipe.id, revenue: 0, qty: 0, batches: 0, cogs: 0 };
      recipeStats[key].revenue += item.subtotal || 0;
      recipeStats[key].qty += item.quantity || 0;
      recipeStats[key].cogs += (item.unit_cost || 0) * (item.quantity || 0);
      // Estimate batches based on yield_quantity
      if (recipe.yield_quantity > 0) {
        recipeStats[key].batches += (item.quantity || 0) / recipe.yield_quantity;
      }
    });
  });

  const byRecipe = Object.entries(recipeStats)
    .map(([name, data]) => ({
      recipe: name,
      revenue: data.revenue,
      qty_sold: data.qty,
      estimated_batches: +data.batches.toFixed(2),
      gross_profit: data.revenue - data.cogs,
      margin_pct: data.revenue > 0 ? +((( data.revenue - data.cogs) / data.revenue) * 100).toFixed(1) : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  return {
    month: monthLabel,
    total_transactions: monthTxns.length,
    total_revenue: monthTxns.reduce((s, t) => s + (t.total_amount || 0), 0),
    by_category: byCategory,
    by_recipe: byRecipe,
    generated_at: new Date().toISOString(),
  };
}