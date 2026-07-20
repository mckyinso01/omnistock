import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, ChefHat, FlaskConical, TrendingUp } from "lucide-react";
import { calculateRecipeCostDetails } from "@/utils/costing";

export default function RecipeDetailModal({ recipe, products, onClose }) {
  const ingredients = recipe.ingredients || [];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-bold text-slate-900">{recipe.name}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Meta */}
          <div className="flex flex-wrap gap-2">
            <Badge className={recipe.status === "active" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}>
              {recipe.status || "active"}
            </Badge>
            {recipe.yield_quantity && (
              <Badge variant="outline">
                Yield: {recipe.yield_quantity} {recipe.yield_unit || "servings"} / batch
              </Badge>
            )}
            {recipe.product_name && (
              <Badge variant="outline">
                Produces: {recipe.product_name}
              </Badge>
            )}
          </div>

          {recipe.description && (
            <p className="text-sm text-slate-600">{recipe.description}</p>
          )}

          {/* Ingredients */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-1.5">
              <FlaskConical className="w-4 h-4 text-orange-400" />
              Ingredients ({ingredients.length})
            </h3>
            {ingredients.length === 0 ? (
              <p className="text-sm text-slate-400">No ingredients defined.</p>
            ) : (
              <div className="space-y-2">
                {calculateRecipeCostDetails(recipe, products).ingredientCosts.map((ing, idx) => {
                  const prod = products.find(p => p.id === ing.product_id);
                  const stock = prod?.quantity ?? null;
                  return (
                    <div key={idx} className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg border border-slate-100">
                      <div>
                        <span className="font-medium text-slate-800">{ing.product_name || "Unknown"}</span>
                        {stock !== null && (
                          <span className="text-xs text-slate-450 ml-2">(stock: {stock} {prod?.unit || ing.unit})</span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-slate-700 block">
                          {ing.quantity_per_batch} {ing.unit}
                        </span>
                        <span className="text-xs text-slate-400 font-medium block">
                          Cost: ₱{ing.cost.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Detailed Financial Analysis */}
          {(() => {
            const costing = calculateRecipeCostDetails(recipe, products);
            return (
              <div className="border border-orange-100 rounded-xl bg-orange-50/20 p-4 space-y-3">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b border-orange-100 pb-2">
                  <TrendingUp className="w-4 h-4 text-orange-500" />
                  Financial Analysis
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-white p-2 rounded-lg border border-slate-100">
                    <span className="text-xs text-slate-500 block">Total Batch Cost</span>
                    <span className="font-bold text-slate-800">₱{costing.totalBatchCost.toFixed(2)}</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-100">
                    <span className="text-xs text-slate-500 block">Cost / Serving</span>
                    <span className="font-bold text-slate-800">₱{costing.costPerServing.toFixed(2)}</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-100">
                    <span className="text-xs text-slate-500 block">Selling Price</span>
                    <span className="font-bold text-slate-800">
                      {costing.sellingPrice > 0 ? `₱${costing.sellingPrice.toFixed(2)}` : "— Not Linked —"}
                    </span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-100">
                    <span className="text-xs text-slate-500 block">Profit / Serving</span>
                    <span className={`font-bold ${costing.profitPerServing >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                      {costing.sellingPrice > 0 ? `₱${costing.profitPerServing.toFixed(2)}` : "—"}
                    </span>
                  </div>
                </div>
                {costing.sellingPrice > 0 && (
                  <div className="flex items-center justify-between text-xs font-semibold bg-white p-2.5 rounded-lg border border-slate-100">
                    <span className="text-slate-500">Gross Margin Percentage:</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      costing.profitMargin >= 40 
                        ? "bg-green-100 text-green-700" 
                        : costing.profitMargin >= 15 
                        ? "bg-yellow-100 text-yellow-700" 
                        : "bg-red-100 text-red-700"
                    }`}>{costing.profitMargin.toFixed(1)}%</span>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Notes */}
          {recipe.notes && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Notes / Instructions</h3>
              <p className="text-sm text-slate-600 whitespace-pre-wrap bg-slate-50 rounded-lg p-3">{recipe.notes}</p>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4">
          <Button variant="outline" className="w-full" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}