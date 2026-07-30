import { useState, useEffect } from "react";
import { entities } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, ChefHat, FlaskConical, Pencil, Trash2, Eye } from "lucide-react";
import RecipeFormModal from "@/components/recipes/RecipeFormModal";
import RecipeDetailModal from "@/components/recipes/RecipeDetailModal";
import YieldCalculatorPanel from "@/components/recipes/YieldCalculatorPanel";
import { calculateRecipeCostDetails } from "@/utils/costing";

import { DESIGN_TOKENS } from "@/lib/designSystem";

export default function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [viewingRecipe, setViewingRecipe] = useState(null);
  const [selectedForCalc, setSelectedForCalc] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [r, p] = await Promise.all([
        entities.Recipe.list("-created_date", 100).catch(() => []),
        entities.Product.list("-created_date", 200).catch(() => []),
      ]);
      setRecipes(r || []);
      setProducts(p || []);
    } catch (err) {
      console.error("Recipes loadData Exception:", err);
      setRecipes([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this recipe?")) return;
    await entities.Recipe.delete(id);
    loadData();
  };

  const handleSave = () => {
    setShowForm(false);
    setEditingRecipe(null);
    loadData();
  };

  const filtered = recipes.filter((r) =>
    r.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.product_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 font-sans">
      {/* Header */}
      <div className="bg-[#0B1C30]/90 border-b border-slate-800/80 px-4 md:px-8 py-5 backdrop-blur-md sticky top-0 z-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-950/60 border border-amber-500/40 flex items-center justify-center shadow-[0_0_16px_rgba(245,158,11,0.25)] shrink-0">
              <ChefHat className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h1 className={DESIGN_TOKENS.typography.h1 + " flex items-center gap-2"}>
                Recipes & Costing Engine
              </h1>
              <p className={DESIGN_TOKENS.typography.muted + " mt-0.5"}>
                Manage raw ingredients, calculate batch costs & compute yield
              </p>
            </div>
          </div>
          <Button
            onClick={() => { setEditingRecipe(null); setShowForm(true); }}
            className={DESIGN_TOKENS.buttons.glowingAction + " gap-2 text-xs font-bold px-5 py-2.5 cursor-pointer active:scale-95 transition-all shrink-0"}
          >
            <Plus className="w-4 h-4" />
            Add Recipe
          </Button>
        </div>
      </div>

      <div className="p-4 md:p-8 space-y-6">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search recipes by name or product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-[#071322] border-slate-700 text-white placeholder:text-slate-500 focus:border-orange-500"
          />
        </div>

        {/* Yield Calculator Panel */}
        {selectedForCalc && (
          <YieldCalculatorPanel
            recipe={selectedForCalc}
            products={products}
            onClose={() => setSelectedForCalc(null)}
          />
        )}

        {/* Recipe Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="h-48 rounded-xl bg-slate-800/50 animate-pulse border border-slate-800" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <ChefHat className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-400" />
            <p className="text-lg font-medium text-slate-300">No recipes found</p>
            <p className="text-sm mt-1">Add your first recipe to compute ingredient yield and cost</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                products={products}
                onEdit={() => { setEditingRecipe(recipe); setShowForm(true); }}
                onDelete={() => handleDelete(recipe.id)}
                onView={() => setViewingRecipe(recipe)}
                onCalculate={() => setSelectedForCalc(recipe)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showForm && (
        <RecipeFormModal
          recipe={editingRecipe}
          products={products}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditingRecipe(null); }}
        />
      )}
      {viewingRecipe && (
        <RecipeDetailModal
          recipe={viewingRecipe}
          products={products}
          onClose={() => setViewingRecipe(null)}
        />
      )}
    </div>
  );
}

function RecipeCard({ recipe, products, onEdit, onDelete, onView, onCalculate }) {
  const ingredientCount = recipe.ingredients?.length || 0;
  const costing = calculateRecipeCostDetails(recipe, products);

  // Compute max possible batches from current stock
  const maxBatches = (() => {
    if (!recipe.ingredients?.length) return null;
    let min = Infinity;
    for (const ing of recipe.ingredients) {
      const prod = products.find(p => p.id === ing.product_id);
      if (!prod || !ing.quantity_per_batch) continue;
      const possible = Math.floor((prod.quantity || 0) / ing.quantity_per_batch);
      if (possible < min) min = possible;
    }
    return min === Infinity ? 0 : min;
  })();

  const maxServings = maxBatches !== null ? maxBatches * (recipe.yield_quantity || 1) : null;

  return (
    <Card className="border border-slate-800 bg-[#0B1C30] shadow-lg app-card-hover">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-semibold text-white truncate">{recipe.name}</CardTitle>
            {recipe.product_name && (
              <p className="text-xs text-slate-400 mt-0.5">Produces: <span className="font-medium text-cyan-300">{recipe.product_name}</span></p>
            )}
          </div>
          <Badge
            variant="secondary"
            className={recipe.status === "active" ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-mono" : "bg-slate-800 text-slate-400 border border-slate-700"}
          >
            {recipe.status || "active"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-slate-300">
          <div className="flex items-center gap-1.5">
            <FlaskConical className="w-4 h-4 text-orange-400" />
            <span>{ingredientCount} ingredient{ingredientCount !== 1 ? "s" : ""}</span>
          </div>
          {recipe.yield_quantity && (
            <div className="text-slate-400">
              Yield: <span className="font-medium text-white">{recipe.yield_quantity} {recipe.yield_unit || "pcs"}/batch</span>
            </div>
          )}
        </div>

        <div className="border border-slate-800 pt-3 grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs bg-[#071322] p-3 rounded-xl">
          <div>
            <span className="text-slate-400 block font-medium">Batch Cost</span>
            <span className="text-sm font-bold text-cyan-300 font-mono">₱{costing.totalBatchCost.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Cost / Serving</span>
            <span className="text-sm font-bold text-cyan-300 font-mono">₱{costing.costPerServing.toFixed(2)}</span>
          </div>
          {costing.sellingPrice > 0 && (
            <>
              <div>
                <span className="text-slate-400 block font-medium">Profit / Serving</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">₱{costing.profitPerServing.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Profit Margin</span>
                <span className={`text-sm font-extrabold font-mono ${
                  costing.profitMargin >= 40 
                    ? "text-emerald-400" 
                    : costing.profitMargin >= 15 
                    ? "text-amber-400" 
                    : "text-rose-400"
                }`}>{costing.profitMargin.toFixed(1)}%</span>
              </div>
            </>
          )}
        </div>

        {maxServings !== null && (
          <div className={`rounded-xl px-3 py-2 text-sm font-medium flex items-center justify-between border ${
            maxServings === 0
              ? "bg-rose-950/50 text-rose-300 border-rose-800/60"
              : maxServings <= 5
              ? "bg-amber-950/50 text-amber-300 border-amber-800/60"
              : "bg-emerald-950/50 text-emerald-300 border-emerald-800/60"
          }`}>
            <span>Possible servings from stock:</span>
            <span className="text-base font-bold font-mono">{maxServings}</span>
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <Button size="sm" variant="outline" className="flex-1 gap-1 border-slate-700 bg-[#071322] text-slate-200 hover:text-white hover:bg-slate-800 text-xs font-medium" onClick={onCalculate}>
            <FlaskConical className="w-3.5 h-3.5 text-orange-400" />
            Yield Calc
          </Button>
          <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-800" onClick={onView}>
            <Eye className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-800" onClick={onEdit}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/50" onClick={onDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}