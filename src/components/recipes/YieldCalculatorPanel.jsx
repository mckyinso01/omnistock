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
    <Card className="border-2 border-orange-200 bg-orange-50/40">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-orange-500" />
            <CardTitle className="text-base text-slate-900">Yield Calculator — {recipe.name}</CardTitle>
          </div>
          <Button size="sm" variant="ghost" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Batch Input */}
        <div className="flex items-end gap-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">How many batches?</Label>
            <Input
              type="number"
              min="1"
              value={batchCount}
              onChange={e => setBatchCount(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-28 bg-white"
            />
          </div>
          <div className="flex items-center gap-3 pb-1">
            <div className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 ${
              canMake ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}>
              {canMake ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              {requestedServings} {recipe.yield_unit || "servings"} {canMake ? "possible ✓" : "— not enough stock!"}
            </div>
          </div>
        </div>

        {/* Max Possible */}
        <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Maximum possible from current stock</p>
            <p className="text-2xl font-bold text-slate-900">
              {maxPossibleServings} <span className="text-base font-normal text-slate-500">{recipe.yield_unit || "servings"}</span>
            </p>
            <p className="text-xs text-slate-400">({maxPossibleBatches} batch{maxPossibleBatches !== 1 ? "es" : ""})</p>
          </div>
          {limitingIngredient && limitingIngredient.maxBatchesPossible !== Infinity && (
            <div className="text-right">
              <p className="text-xs text-red-500 flex items-center gap-1 justify-end">
                <TrendingDown className="w-3.5 h-3.5" />
                Bottleneck
              </p>
              <p className="text-sm font-semibold text-red-600">{limitingIngredient.product_name}</p>
              <p className="text-xs text-slate-400">{limitingIngredient.currentStock} {limitingIngredient.unit} left</p>
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
            <div className="bg-white border border-slate-200 rounded-xl p-4 grid grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block font-medium mb-1">Total Raw Cost</span>
                <span className="text-base font-bold text-slate-800">₱{totalCostForRequested.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium mb-1">Projected Revenue</span>
                <span className="text-base font-bold text-slate-800">
                  {costing.sellingPrice > 0 ? `₱${totalRevenueForRequested.toFixed(2)}` : "—"}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium mb-1">Projected Profit</span>
                <span className={`text-base font-bold ${totalProfitForRequested >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                  {costing.sellingPrice > 0 ? `₱${totalProfitForRequested.toFixed(2)}` : "—"}
                </span>
              </div>
            </div>
          );
        })()}

        {/* Ingredient Table */}
        {ingredientStats.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-4 py-2.5 font-medium text-slate-600">Ingredient</th>
                  <th className="text-right px-3 py-2.5 font-medium text-slate-600">Stock</th>
                  <th className="text-right px-3 py-2.5 font-medium text-slate-600">Needed</th>
                  <th className="text-right px-3 py-2.5 font-medium text-slate-600">After</th>
                  <th className="text-center px-3 py-2.5 font-medium text-slate-600">Max Batches</th>
                </tr>
              </thead>
              <tbody>
                {ingredientStats.map((ing, idx) => (
                  <tr key={idx} className={`border-b border-slate-50 last:border-0 ${!ing.sufficient ? "bg-red-50" : ""}`}>
                    <td className="px-4 py-2.5 font-medium text-slate-800">{ing.product_name || "Unknown"}</td>
                    <td className="px-3 py-2.5 text-right text-slate-600">
                      {ing.currentStock} {ing.unit}
                    </td>
                    <td className={`px-3 py-2.5 text-right font-medium ${!ing.sufficient ? "text-red-600" : "text-slate-700"}`}>
                      {ing.needed} {ing.unit}
                    </td>
                    <td className={`px-3 py-2.5 text-right font-medium ${ing.remaining < 0 ? "text-red-500" : "text-green-600"}`}>
                      {ing.remaining >= 0 ? ing.remaining.toFixed(2) : `${Math.abs(ing.remaining).toFixed(2)} short`} {ing.unit}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        ing.maxBatchesPossible === 0
                          ? "bg-red-100 text-red-700"
                          : ing.maxBatchesPossible <= 2
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
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