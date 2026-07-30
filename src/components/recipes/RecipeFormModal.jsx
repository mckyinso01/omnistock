import { useState, useEffect } from "react";
import { entities } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus, Trash2 } from "lucide-react";
import { calculateRecipeCostDetails } from "@/utils/costing";

const UNITS = ["ml", "L", "g", "kg", "pcs", "cups", "tbsp", "tsp", "oz", "lb", "pack", "sachet", "bottle", "can"];

export default function RecipeFormModal({ recipe, products, onSave, onClose }) {
  const [form, setForm] = useState({
    name: "",
    product_id: "",
    product_name: "",
    description: "",
    yield_quantity: 1,
    yield_unit: "servings",
    ingredients: [],
    notes: "",
    status: "active",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      if (recipe) {
        setForm({
          name: recipe.name || "",
          product_id: recipe.product_id || "",
          product_name: recipe.product_name || "",
          description: recipe.description || "",
          yield_quantity: recipe.yield_quantity || 1,
          yield_unit: recipe.yield_unit || "servings",
          ingredients: (recipe.ingredients || []).map(ing => ({
            ...ing,
            id: ing.id || Math.random().toString(36).substring(2, 11)
          })),
          notes: recipe.notes || "",
          status: recipe.status || "active",
        });
      }
    } catch (err) {
      console.error("RecipeFormModal useEffect exception:", err);
    }
  }, [recipe]);

  const costing = (() => {
    const simulatedRecipe = {
      product_id: form.product_id,
      yield_quantity: Number(form.yield_quantity) || 1,
      ingredients: form.ingredients
    };
    return calculateRecipeCostDetails(simulatedRecipe, products);
  })();

  const addIngredient = () => {
    setForm(f => ({
      ...f,
      ingredients: [...f.ingredients, { id: Math.random().toString(36).substring(2, 11), product_id: "", product_name: "", quantity_per_batch: 1, unit: "g" }]
    }));
  };

  const updateIngredient = (idx, field, value) => {
    setForm(f => {
      const updated = [...f.ingredients];
      updated[idx] = { ...updated[idx], [field]: value };
      if (field === "product_id") {
        const prod = products.find(p => p.id === value);
        if (prod) {
          updated[idx].product_name = prod.name;
          updated[idx].unit = prod.unit || "g";
        }
      }
      return { ...f, ingredients: updated };
    });
  };

  const removeIngredient = (idx) => {
    setForm(f => ({ ...f, ingredients: f.ingredients.filter((_, i) => i !== idx) }));
  };

  const handleProductSelect = (pid) => {
    const prod = products.find(p => p.id === pid);
    setTimeout(() => setForm(f => ({ ...f, product_id: pid, product_name: prod?.name || "" })), 0);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return alert("Recipe name is required.");
    setSaving(true);
    const cleanedIngredients = form.ingredients.map((ing) => {
      const copy = { ...ing };
      delete copy.id;
      return copy;
    });
    const data = { ...form, yield_quantity: Number(form.yield_quantity), ingredients: cleanedIngredients };
    if (recipe?.id) {
      await entities.Recipe.update(recipe.id, data);
    } else {
      await entities.Recipe.create(data);
    }

    // Roll up calculated serving cost to the linked Product
    if (form.product_id && form.product_id !== "none") {
      const costingDetails = calculateRecipeCostDetails(data, products);
      await entities.Product.update(form.product_id, { cost: costingDetails.costPerServing });
    }

    setSaving(false);
    onSave();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0B1C30] border border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#0B1C30] border-b border-slate-800 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-lg font-bold text-white">{recipe ? "Edit Recipe" : "Add Recipe"}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <Label className="text-slate-200">Recipe Name *</Label>
              <Input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g., Taho Drink, Burger Meal"
                className="bg-[#071322] border-slate-700 text-white placeholder:text-slate-500 focus:border-orange-500"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-200">Finished Product (optional)</Label>
              <select
                value={form.product_id}
                onChange={e => handleProductSelect(e.target.value)}
                className="flex h-9 w-full rounded-md border border-slate-700 bg-[#071322] px-3 py-1.5 text-sm text-white shadow-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="none" className="bg-[#071322] text-white">— None —</option>
                {products.map(p => (
                  <option key={p.id} value={p.id} className="bg-[#071322] text-white">{p.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-200">Status</Label>
              <select
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="flex h-9 w-full rounded-md border border-slate-700 bg-[#071322] px-3 py-1.5 text-sm text-white shadow-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="active" className="bg-[#071322] text-white">Active</option>
                <option value="inactive" className="bg-[#071322] text-white">Inactive</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-200">Yield per Batch</Label>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                value={form.yield_quantity}
                onChange={e => setForm(f => ({ ...f, yield_quantity: e.target.value }))}
                className="bg-[#071322] border-slate-700 text-cyan-300 font-mono focus:border-orange-500"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-200">Yield Unit</Label>
              <select
                value={form.yield_unit}
                onChange={e => setForm(f => ({ ...f, yield_unit: e.target.value }))}
                className="flex h-9 w-full rounded-md border border-slate-700 bg-[#071322] px-3 py-1.5 text-sm text-white shadow-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                {["servings", "cups", "pcs", "bottles", "packs", "liters", "kg", "portions"].map(u => (
                  <option key={u} value={u} className="bg-[#071322] text-white">{u}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <Label className="text-slate-200">Description</Label>
              <Textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Brief description of this recipe..."
                rows={2}
                className="bg-[#071322] border-slate-700 text-white placeholder:text-slate-500 focus:border-orange-500"
              />
            </div>
          </div>

          {/* Live Costing Calculator Banner */}
          <div className="bg-gradient-to-r from-[#071322] to-[#0B1C30] border border-orange-500/30 rounded-xl p-4 flex items-center justify-between text-sm shadow-md">
            <div>
              <p className="text-xs text-slate-400 font-medium">Estimated Batch Cost</p>
              <p className="text-lg font-bold text-cyan-300 font-mono">₱{costing.totalBatchCost.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400 font-medium">Cost per Serving</p>
              <p className="text-lg font-bold text-cyan-300 font-mono">₱{costing.costPerServing.toFixed(2)}</p>
            </div>
            {costing.sellingPrice > 0 ? (
              <div className="text-right">
                <p className="text-xs text-slate-400 font-medium">Projected Margin</p>
                <p className={`text-lg font-bold font-mono ${
                  costing.profitMargin >= 40 
                    ? "text-emerald-400" 
                    : costing.profitMargin >= 15 
                    ? "text-amber-400" 
                    : "text-rose-400"
                }`}>{costing.profitMargin.toFixed(1)}%</p>
              </div>
            ) : (
              <div className="text-right text-slate-500 text-xs">
                Product not linked
              </div>
            )}
          </div>

          {/* Ingredients */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-base font-semibold text-white">Ingredients</Label>
              <Button size="sm" variant="outline" onClick={addIngredient} className="gap-1 border-slate-700 bg-[#071322] text-slate-200 hover:text-white hover:bg-slate-800">
                <Plus className="w-3.5 h-3.5 text-orange-400" />
                Add Ingredient
              </Button>
            </div>

            {form.ingredients.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6 border border-dashed border-slate-800 rounded-xl bg-[#071322]/50">
                No ingredients yet. Click "Add Ingredient" to start.
              </p>
            ) : (
              <div className="space-y-3">
                {form.ingredients.map((ing, idx) => (
                  <div key={ing.id} className="flex gap-2 items-end p-3 bg-[#071322] border border-slate-800 rounded-xl">
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs text-slate-400">Ingredient</Label>
                      <select
                        value={ing.product_id}
                        onChange={e => updateIngredient(idx, "product_id", e.target.value)}
                        className="flex h-9 w-full rounded-md border border-slate-700 bg-[#050811] px-3 py-1.5 text-sm text-white shadow-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                      >
                        <option value="" className="bg-[#050811] text-white">Select ingredient...</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id} className="bg-[#050811] text-white">
                            {p.name} {p.quantity !== undefined ? `(${p.quantity} ${p.unit || ""})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-24 space-y-1">
                      <Label className="text-xs text-slate-400">Qty</Label>
                      <Input
                        type="number"
                        min="0.001"
                        step="0.001"
                        value={ing.quantity_per_batch}
                        onChange={e => updateIngredient(idx, "quantity_per_batch", Number(e.target.value))}
                        className="bg-[#050811] border-slate-700 text-cyan-300 font-mono focus:border-orange-500"
                      />
                    </div>
                    <div className="w-24 space-y-1">
                      <Label className="text-xs text-slate-400">Unit</Label>
                      <select
                        value={ing.unit}
                        onChange={e => updateIngredient(idx, "unit", e.target.value)}
                        className="flex h-9 w-full rounded-md border border-slate-700 bg-[#050811] px-3 py-1.5 text-sm text-white shadow-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                      >
                        {UNITS.map(u => <option key={u} value={u} className="bg-[#050811] text-white">{u}</option>)}
                      </select>
                    </div>
                    <Button size="sm" variant="ghost" className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 mb-0.5" onClick={() => removeIngredient(idx)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-slate-200">Notes / Instructions</Label>
            <Textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Cooking instructions, quality tips, etc..."
              rows={3}
              className="bg-[#071322] border-slate-700 text-white placeholder:text-slate-500 focus:border-orange-500"
            />
          </div>
        </div>

        <div className="sticky bottom-0 bg-[#0B1C30] border-t border-slate-800 px-6 py-4 flex gap-3 justify-end rounded-b-2xl">
          <Button variant="outline" onClick={onClose} className="bg-[#071322] border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800">Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-orange-500 hover:bg-orange-600 text-white font-medium shadow-md">
            {saving ? "Saving..." : recipe ? "Update Recipe" : "Create Recipe"}
          </Button>
        </div>
      </div>
    </div>
  );
}