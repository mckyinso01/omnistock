import { useState, useEffect } from "react";
import { entities } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Tag, Pencil, Trash2, X, Check } from "lucide-react";
import { DESIGN_TOKENS } from "@/lib/designSystem";

const PRESET_COLORS = [
  "#2563EB", "#10b981", "#c084fc", "#f59e0b",
  "#00e5ff", "#e11d48", "#f97316", "#84cc16",
  "#06b6d4", "#ec4899",
];

function getCategoryColor(cat) {
  if (cat.color && cat.color !== "#10b981") return cat.color;
  const str = (cat.name || cat.id || "").toString();
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PRESET_COLORS.length;
  return PRESET_COLORS[index];
}

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", color: "#2563EB" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const c = await entities.Category.list("name", 100).catch(() => []);
      setCategories(c || []);
    } catch (err) {
      console.error("Categories loadData Exception:", err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setForm({ name: "", description: "", color: PRESET_COLORS[categories.length % PRESET_COLORS.length] });
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (cat) => {
    setForm({ name: cat.name, description: cat.description || "", color: getCategoryColor(cat) });
    setEditingId(cat.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return alert("Name is required.");
    setSaving(true);
    if (editingId) {
      await entities.Category.update(editingId, form);
    } else {
      await entities.Category.create(form);
    }
    setSaving(false);
    setShowForm(false);
    loadData();
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    await entities.Category.delete(id);
    loadData();
  };

  return (
    <div className="p-4 md:p-6 space-y-6 bg-[#050811] min-h-screen text-slate-100 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0B1C30]/80 p-5 rounded-2xl border border-slate-800/80 shadow-xl">
        <div>
          <h1 className={DESIGN_TOKENS.typography.h1 + " flex items-center gap-2"}>
            <Tag className="w-6 h-6 text-cyan-400" /> Category Taxonomy & Color Coding
          </h1>
          <p className={DESIGN_TOKENS.typography.muted + " mt-1"}>
            Manage product categories, visual tag badges, and catalog taxonomy
          </p>
        </div>
        <Button onClick={openAdd} className={DESIGN_TOKENS.buttons.glowingAction + " gap-2 text-xs font-bold px-5 py-2.5 cursor-pointer active:scale-95 transition-all shrink-0"}>
          <Plus className="w-4 h-4" /> Add Category
        </Button>
      </div>

      {/* Form Modal/Card */}
      {showForm && (
        <Card className="water-breathing-card bg-[#0B1C30]/90 border border-slate-800 shadow-2xl rounded-2xl">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white">{editingId ? "Edit Category" : "New Category"}</h2>
              <button onClick={() => setShowForm(false)} className={DESIGN_TOKENS.icons.iconButton}>
                <X className="w-4 h-4 text-slate-400 hover:text-white" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Category Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Beverages & Drinks"
                  className="bg-[#071322] border-slate-700 text-slate-100 focus:border-[#00E5FF] rounded-xl text-base sm:text-sm font-medium"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Description</Label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Short description..."
                  className="bg-[#071322] border-slate-700 text-slate-100 focus:border-[#00E5FF] rounded-xl text-base sm:text-sm font-medium"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Theme Badge Color</Label>
              <div className="flex flex-wrap gap-2 pt-1">
                {PRESET_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm({ ...form, color: c })}
                    style={{ backgroundColor: c }}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform hover:scale-110 shadow-md ${form.color === c ? "ring-2 ring-white scale-110" : ""}`}
                  >
                    {form.color === c && <Check className="w-5 h-5 text-white stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800/80">
              <Button variant="ghost" onClick={() => setShowForm(false)} className={DESIGN_TOKENS.buttons.secondary}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className={DESIGN_TOKENS.buttons.glowingAction}>
                {saving ? "Saving..." : "Save Category"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-28 rounded-2xl bg-[#0B1C30] border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20 text-slate-400 bg-[#0B1C30]/40 rounded-2xl border border-slate-800/80">
          <Tag className="w-12 h-12 mx-auto mb-3 opacity-30 text-cyan-400" />
          <p className="text-base font-bold text-white">No categories configured</p>
          <p className="text-xs text-slate-400 mt-1">Create categories to group products for POS filtering</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(cat => {
            const catColor = getCategoryColor(cat);
            return (
              <Card key={cat.id} className="water-breathing-card bg-[#0B1C30]/90 border border-slate-800/80 shadow-xl rounded-2xl app-card-hover">
                <CardContent className="p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className="w-11 h-11 rounded-xl shrink-0 flex items-center justify-center shadow-lg transition-transform hover:scale-105"
                      style={{ backgroundColor: catColor, boxShadow: `0 0 16px ${catColor}66` }}
                    >
                      <Tag className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-white text-base truncate font-sans">{cat.name}</p>
                      {cat.description && (
                        <p className="text-xs text-slate-300 truncate mt-0.5 font-sans">{cat.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button className={DESIGN_TOKENS.icons.iconButton} onClick={() => openEdit(cat)} title="Edit Category">
                      <Pencil className="w-4 h-4 text-cyan-400" />
                    </button>
                    <button className={DESIGN_TOKENS.icons.iconButton} onClick={() => handleDelete(cat.id)} title="Delete Category">
                      <Trash2 className="w-4 h-4 text-rose-400" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}