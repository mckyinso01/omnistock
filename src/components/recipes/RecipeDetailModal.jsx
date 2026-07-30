import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, ChefHat, FlaskConical, TrendingUp } from "lucide-react";
import { calculateRecipeCostDetails } from "@/utils/costing";

export default function RecipeDetailModal({ recipe, products, onClose }) {
  const ingredients = recipe.ingredients || [];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0B1C30] border border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#0B1C30] border-b border-slate-800 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-orange-400" />
            <h2 className="text-lg font-bold text-white">{recipe.name}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Meta */}
          <div className="flex flex-wrap gap-2">
            <Badge className={recipe.status === "active" ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-mono" : "bg-slate-800 text-slate-400 border border-slate-700"}>
              {recipe.status || "active"}
            </Badge>
            {recipe.yield_quantity && (
              <Badge variant="outline" className="border-slate-700 text-slate-300">
                Yield: {recipe.yield_quantity} {recipe.yield_unit || "servings"} / batch
              </Badge>
            )}
            {recipe.product_name && (
              <Badge variant="outline" className="border-cyan-800/60 text-cyan-300 bg-cyan-950/40">
                Produces: {recipe.product_name}
              </Badge>
            )}
          </div>

          {recipe.description && (
            <p className="text-sm text-slate-300">{recipe.description}</p>
          )}

          {/* Ingredients */}
          <div>
            <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-1.5">
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
                    <div key={idx} className="flex items-center justify-between px-3 py-2.5 bg-[#071322] rounded-xl border border-slate-800">
                      <div>
                        <span className="font-medium text-white text-sm">{ing.product_name || "Unknown"}</span>
                        {stock !== null && (
                          <span className="text-xs text-slate-400 ml-2">(stock: {stock} {prod?.unit || ing.unit})</span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-slate-200 block font-mono">
                          {ing.quantity_per_batch} {ing.unit}
                        </span>
                        <span className="text-xs text-cyan-400 font-mono block">
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
              <div className="border border-orange-500/30 rounded-xl bg-gradient-to-b from-[#071322] to-[#0B1C30] p-4 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5 border-b border-slate-800 pb-2">
                  <TrendingUp className="w-4 h-4 text-orange-400" />
                  Financial Analysis
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-[#071322] p-2.5 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-400 block">Total Batch Cost</span>
                    <span className="font-bold text-cyan-300 font-mono text-base">₱{costing.totalBatchCost.toFixed(2)}</span>
                  </div>
                  <div className="bg-[#071322] p-2.5 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-400 block">Cost / Serving</span>
                    <span className="font-bold text-cyan-300 font-mono text-base">₱{costing.costPerServing.toFixed(2)}</span>
                  </div>
                  <div className="bg-[#071322] p-2.5 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-400 block">Selling Price</span>
                    <span className="font-bold text-white font-mono text-base">
                      {costing.sellingPrice > 0 ? `₱${costing.sellingPrice.toFixed(2)}` : "— Not Linked —"}
                    </span>
                  </div>
                  <div className="bg-[#071322] p-2.5 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-400 block">Profit / Serving</span>
                    <span className={`font-bold font-mono text-base ${costing.profitPerServing >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {costing.sellingPrice > 0 ? `₱${costing.profitPerServing.toFixed(2)}` : "—"}
                    </span>
                  </div>
                </div>
                {costing.sellingPrice > 0 && (
                  <div className="flex items-center justify-between text-xs font-semibold bg-[#071322] p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-300">Gross Margin Percentage:</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${
                      costing.profitMargin >= 40 
                        ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800/60" 
                        : costing.profitMargin >= 15 
                        ? "bg-amber-950/80 text-amber-300 border border-amber-800/60" 
                        : "bg-rose-950/80 text-rose-300 border border-rose-800/60"
                    }`}>{costing.profitMargin.toFixed(1)}%</span>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Notes */}
          {recipe.notes && (
            <div>
              <h3 className="text-sm font-semibold text-slate-200 mb-2">Notes / Instructions</h3>
              <p className="text-sm text-slate-300 whitespace-pre-wrap bg-[#071322] border border-slate-800 rounded-xl p-3">{recipe.notes}</p>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-[#0B1C30] border-t border-slate-800 px-6 py-4">
          <Button variant="outline" className="w-full bg-[#071322] border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800 font-medium" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}