import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X, FlaskConical, AlertTriangle, CheckCircle2, TrendingDown, TrendingUp } from "lucide-react";
import { calculateRecipeCostDetails } from "@/utils/costing";

export default function YieldCalculatorPanel({ recipe, products, onClose }) {
  const [batchCount, setBatchCount] = useState(1);

  const ingredients = recipe.ingredients || [];

  // For each ingredient, get current stock and compute stats
  const ingredientStats = ingredients.map(ing => {
    const prod = products.find(p => p.id === ing.product_id);
    const currentStock = prod?.quantity || 0;
    const needed = ing.quantity_per_batch * batchCount;
    const sufficient = currentStock >= needed;
    const maxBatchesPossible = ing.quantity_per_batch > 0
      ? Math.floor(currentStock / ing.quantity_per_batch)
      : Infinity;

    return {
      ...ing,
      currentStock,
      needed,
      sufficient,
      maxBatchesPossible,
      remaining: currentStock - needed,
      productUnit: prod?.unit || ing.unit,
    };
  });

  // Limiting ingredient (bottleneck)
  const maxPossibleBatches = ingredientStats.length > 0
    ? Math.min(...ingredientStats.map(i => i.maxBatchesPossible))
    : 0;

  const maxPossibleServings = maxPossibleBatches * (recipe.yield_quantity || 1);
  const requestedServings = batchCount * (recipe.yield_quantity || 1);
  const canMake = ingredientStats.every(i => i.sufficient);

  const limitingIngredient = ingredientStats.reduce((min, cur) =>
    cur.maxBatchesPossible < (min?.maxBatchesPossible ?? Infinity) ? cur : min, null
  );

  return (
    <Card className="border border-orange-500/40 bg-[#0B1C30] shadow-xl app-card-hover">
      <CardHeader className="pb-3 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-orange-400" />
            <CardTitle className="text-base font-semibold text-white">Yield Calculator — {recipe.name}</CardTitle>
          </div>
          <Button size="sm" variant="ghost" onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-5">
        {/* Batch Input */}
        <div className="flex items-end gap-4 flex-wrap">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-200">How many batches?</Label>
            <Input
              type="number"
              min="1"
              value={batchCount}
              onChange={e => setBatchCount(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-28 bg-[#071322] border-slate-700 text-cyan-300 font-mono text-center focus:border-orange-500"
            />
          </div>
          <div className="flex items-center gap-3 pb-0.5">
            <div className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 border font-mono ${
              canMake ? "bg-emerald-950/80 text-emerald-300 border-emerald-800/60" : "bg-rose-950/80 text-rose-300 border-rose-800/60"
            }`}>
              {canMake ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
              {requestedServings} {recipe.yield_unit || "servings"} {canMake ? "possible ✓" : "— not enough stock!"}
            </div>
          </div>
        </div>

        {/* Max Possible */}
        <div className="bg-[#071322] rounded-xl border border-slate-800 p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 mb-0.5 font-medium">Maximum possible from current stock</p>
            <p className="text-2xl font-bold text-white font-mono">
              {maxPossibleServings} <span className="text-sm font-normal text-slate-400">{recipe.yield_unit || "servings"}</span>
            </p>
            <p className="text-xs text-slate-500 font-mono">({maxPossibleBatches} batch{maxPossibleBatches !== 1 ? "es" : ""})</p>
          </div>
          {limitingIngredient && limitingIngredient.maxBatchesPossible !== Infinity && (
            <div className="text-right">
              <p className="text-xs text-rose-400 flex items-center gap-1 justify-end font-semibold">
                <TrendingDown className="w-3.5 h-3.5" />
                Bottleneck
              </p>
              <p className="text-sm font-semibold text-rose-300">{limitingIngredient.product_name}</p>
              <p className="text-xs text-slate-400 font-mono">{limitingIngredient.currentStock} {limitingIngredient.unit} left</p>
            </div>
          )}
        </div>

        {/* Costing Summary for batches */}
        {(() => {
          const costing = calculateRecipeCostDetails(recipe, products);
          const totalCostForRequested = costing.costPerServing * requestedServings;
          const totalRevenueForRequested = costing.sellingPrice * requestedServings;
          const totalProfitForRequested = totalRevenueForRequested - totalCostForRequested;
          return (
            <div className="bg-[#071322] border border-slate-800 rounded-xl p-4 grid grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-medium mb-1">Total Raw Cost</span>
                <span className="text-base font-bold text-cyan-300 font-mono">₱{totalCostForRequested.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium mb-1">Projected Revenue</span>
                <span className="text-base font-bold text-white font-mono">
                  {costing.sellingPrice > 0 ? `₱${totalRevenueForRequested.toFixed(2)}` : "—"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium mb-1">Projected Profit</span>
                <span className={`text-base font-bold font-mono ${totalProfitForRequested >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {costing.sellingPrice > 0 ? `₱${totalProfitForRequested.toFixed(2)}` : "—"}
                </span>
              </div>
            </div>
          );
        })()}

        {/* Ingredient Table */}
        {ingredientStats.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#071322]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-[#050811]">
                  <th className="text-left px-4 py-2.5 font-medium text-slate-300">Ingredient</th>
                  <th className="text-right px-3 py-2.5 font-medium text-slate-300">Stock</th>
                  <th className="text-right px-3 py-2.5 font-medium text-slate-300">Needed</th>
                  <th className="text-right px-3 py-2.5 font-medium text-slate-300">After</th>
                  <th className="text-center px-3 py-2.5 font-medium text-slate-300">Max Batches</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {ingredientStats.map((ing, idx) => (
                  <tr key={idx} className={`transition-colors ${!ing.sufficient ? "bg-rose-950/30 text-rose-200" : "hover:bg-slate-800/40 text-slate-200"}`}>
                    <td className="px-4 py-2.5 font-medium text-white">{ing.product_name || "Unknown"}</td>
                    <td className="px-3 py-2.5 text-right text-slate-300 font-mono">
                      {ing.currentStock} {ing.unit}
                    </td>
                    <td className={`px-3 py-2.5 text-right font-medium font-mono ${!ing.sufficient ? "text-rose-300" : "text-cyan-300"}`}>
                      {ing.needed} {ing.unit}
                    </td>
                    <td className={`px-3 py-2.5 text-right font-medium font-mono ${ing.remaining < 0 ? "text-rose-400" : "text-emerald-400"}`}>
                      {ing.remaining >= 0 ? ing.remaining.toFixed(2) : `${Math.abs(ing.remaining).toFixed(2)} short`} {ing.unit}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${
                        ing.maxBatchesPossible === 0
                          ? "bg-rose-950/80 text-rose-300 border border-rose-800/60"
                          : ing.maxBatchesPossible <= 2
                          ? "bg-amber-950/80 text-amber-300 border border-amber-800/60"
                          : "bg-emerald-950/80 text-emerald-300 border border-emerald-800/60"
                      }`}>
                        {ing.maxBatchesPossible === Infinity ? "∞" : ing.maxBatchesPossible}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {ingredients.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-3">
            No ingredients defined for this recipe yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}