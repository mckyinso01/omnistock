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
    const [r, p] = await Promise.all([
      entities.Recipe.list("-created_date", 100),
      entities.Product.list("-created_date", 200),
    ]);
    setRecipes(r);
    setProducts(p);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this recipe?")) return;
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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 md:px-8 py-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Recipes</h1>
              <p className="text-sm text-slate-500">Manage ingredients & compute yield per batch</p>
            </div>
          </div>
          <Button
            onClick={() => { setEditingRecipe(null); setShowForm(true); }}
            className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
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
            placeholder="Search recipes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
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
              <div key={i} className="h-48 rounded-xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <ChefHat className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium">No recipes yet</p>
            <p className="text-sm mt-1">Add your first recipe to compute ingredient yield</p>
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
    <Card className="border border-slate-200 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-semibold text-slate-900 truncate">{recipe.name}</CardTitle>
            {recipe.product_name && (
              <p className="text-xs text-slate-500 mt-0.5">Produces: <span className="font-medium text-slate-700">{recipe.product_name}</span></p>
            )}
          </div>
          <Badge
            variant="secondary"
            className={recipe.status === "active" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}
          >
            {recipe.status || "active"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <div className="flex items-center gap-1.5">
            <FlaskConical className="w-4 h-4 text-orange-400" />
            <span>{ingredientCount} ingredient{ingredientCount !== 1 ? "s" : ""}</span>
          </div>
          {recipe.yield_quantity && (
            <div className="text-slate-500">
              Yield: <span className="font-medium text-slate-800">{recipe.yield_quantity} {recipe.yield_unit || "pcs"}/batch</span>
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 pt-3 grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs bg-slate-50/50 p-2.5 rounded-lg border">
          <div>
            <span className="text-slate-500 block font-medium">Batch Cost</span>
            <span className="text-sm font-bold text-slate-800">₱{costing.totalBatchCost.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-slate-500 block font-medium">Cost / Serving</span>
            <span className="text-sm font-bold text-slate-800">₱{costing.costPerServing.toFixed(2)}</span>
          </div>
          {costing.sellingPrice > 0 && (
            <>
              <div>
                <span className="text-slate-500 block font-medium">Profit / Serving</span>
                <span className="text-sm font-bold text-emerald-600">₱{costing.profitPerServing.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">Profit Margin</span>
                <span className={`text-sm font-extrabold ${
                  costing.profitMargin >= 40 
                    ? "text-green-600" 
                    : costing.profitMargin >= 15 
                    ? "text-yellow-600" 
                    : "text-red-500"
                }`}>{costing.profitMargin.toFixed(1)}%</span>
              </div>
            </>
          )}
        </div>

        {maxServings !== null && (
          <div className={`rounded-lg px-3 py-2 text-sm font-medium flex items-center justify-between ${
            maxServings === 0
              ? "bg-red-50 text-red-700"
              : maxServings <= 5
              ? "bg-yellow-50 text-yellow-700"
              : "bg-green-50 text-green-700"
          }`}>
            <span>Possible servings from stock:</span>
            <span className="text-base font-bold">{maxServings}</span>
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={onCalculate}>
            <FlaskConical className="w-3.5 h-3.5" />
            Yield Calc
          </Button>
          <Button size="sm" variant="ghost" onClick={onView}>
            <Eye className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onEdit}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600" onClick={onDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}