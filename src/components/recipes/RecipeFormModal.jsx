import { useState, useEffect } from "react";
import { entities } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Trash2 } from "lucide-react";

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
    if (recipe) {
      setForm({
        name: recipe.name || "",
        product_id: recipe.product_id || "",
        product_name: recipe.product_name || "",
        description: recipe.description || "",
        yield_quantity: recipe.yield_quantity || 1,
        yield_unit: recipe.yield_unit || "servings",
        ingredients: recipe.ingredients || [],
        notes: recipe.notes || "",
        status: recipe.status || "active",
      });
    }
  }, [recipe]);

  const addIngredient = () => {
    setForm(f => ({
      ...f,
      ingredients: [...f.ingredients, { product_id: "", product_name: "", quantity_per_batch: 1, unit: "g" }]
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
    setForm(f => ({ ...f, product_id: pid, product_name: prod?.name || "" }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) return alert("Recipe name is required.");
    setSaving(true);
    const data = { ...form, yield_quantity: Number(form.yield_quantity) };
    if (recipe?.id) {
      await entities.Recipe.update(recipe.id, data);
    } else {
      await entities.Recipe.create(data);
    }
    setSaving(false);
    onSave();
  };

  // Only show products that can be "finished products" — exclude those used as ingredients
  const ingredientProductIds = new Set(form.ingredients.map(i => i.product_id));

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-lg font-bold text-slate-900">{recipe ? "Edit Recipe" : "Add Recipe"}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <Label>Recipe Name *</Label>
              <Input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g., Taho Drink, Burger Meal"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Finished Product (optional)</Label>
              <Select value={form.product_id} onValueChange={handleProductSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Link to a product..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— None —</SelectItem>
                  {products.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Yield per Batch</Label>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                value={form.yield_quantity}
                onChange={e => setForm(f => ({ ...f, yield_quantity: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Yield Unit</Label>
              <Select value={form.yield_unit} onValueChange={v => setForm(f => ({ ...f, yield_unit: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["servings", "cups", "pcs", "bottles", "packs", "liters", "kg", "portions"].map(u => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Brief description of this recipe..."
                rows={2}
              />
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-base font-semibold text-slate-800">Ingredients</Label>
              <Button size="sm" variant="outline" onClick={addIngredient} className="gap-1">
                <Plus className="w-3.5 h-3.5" />
                Add Ingredient
              </Button>
            </div>

            {form.ingredients.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4 border border-dashed border-slate-200 rounded-lg">
                No ingredients yet. Click "Add Ingredient" to start.
              </p>
            ) : (
              <div className="space-y-3">
                {form.ingredients.map((ing, idx) => (
                  <div key={idx} className="flex gap-2 items-end p-3 bg-slate-50 rounded-lg">
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs text-slate-500">Ingredient</Label>
                      <Select value={ing.product_id} onValueChange={v => updateIngredient(idx, "product_id", v)}>
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Select ingredient..." />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map(p => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name} {p.quantity !== undefined ? `(${p.quantity} ${p.unit || ""})` : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-24 space-y-1">
                      <Label className="text-xs text-slate-500">Qty</Label>
                      <Input
                        type="number"
                        min="0.001"
                        step="0.001"
                        value={ing.quantity_per_batch}
                        onChange={e => updateIngredient(idx, "quantity_per_batch", Number(e.target.value))}
                        className="bg-white"
                      />
                    </div>
                    <div className="w-24 space-y-1">
                      <Label className="text-xs text-slate-500">Unit</Label>
                      <Select value={ing.unit} onValueChange={v => updateIngredient(idx, "unit", v)}>
                        <SelectTrigger className="bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-600 mb-0.5" onClick={() => removeIngredient(idx)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label>Notes / Instructions</Label>
            <Textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Cooking instructions, quality tips, etc..."
              rows={3}
            />
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex gap-3 justify-end rounded-b-2xl">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-orange-500 hover:bg-orange-600 text-white">
            {saving ? "Saving..." : recipe ? "Update Recipe" : "Create Recipe"}
          </Button>
        </div>
      </div>
    </div>
  );
}