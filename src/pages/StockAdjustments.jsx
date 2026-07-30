import { useState, useEffect } from "react";
import { entities } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, ArrowUp, ArrowDown, RefreshCw, Package, X } from "lucide-react";
import { format } from "date-fns";
import { trackPriceChangesFromAdjustment } from "@/lib/priceChangeTracker";

const REASONS = ["restock", "damaged", "expired", "lost", "theft", "correction", "returned", "other"];
const REASON_COLORS = {
  restock: "bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-mono",
  damaged: "bg-rose-950/80 text-rose-300 border border-rose-800/60 font-mono",
  expired: "bg-amber-950/80 text-amber-300 border border-amber-800/60 font-mono",
  lost: "bg-rose-950/80 text-rose-300 border border-rose-800/60 font-mono",
  theft: "bg-rose-950/80 text-rose-300 border border-rose-800/60 font-mono",
  correction: "bg-blue-950/80 text-blue-300 border border-blue-800/60 font-mono",
  returned: "bg-violet-950/80 text-violet-300 border border-violet-800/60 font-mono",
  other: "bg-slate-800 text-slate-300 border border-slate-700 font-mono",
};

import { DESIGN_TOKENS } from "@/lib/designSystem";

export default function StockAdjustments() {
  const [adjustments, setAdjustments] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ product_id: "", adjustment_type: "add", quantity_change: 1, reason: "restock", notes: "" });
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [a, p] = await Promise.all([
        entities.StockAdjustment.list("-created_date", 200).catch(() => []),
        entities.Product.filter({ status: "active" }).catch(() => []),
      ]);
      setAdjustments(a || []);
      setProducts(p || []);
    } catch (err) {
      console.error("StockAdjustments loadData Exception:", err);
      setAdjustments([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProductChange = (id) => {
    const prod = products.find(p => p.id === id);
    setSelectedProduct(prod || null);
    setForm(f => ({ ...f, product_id: id }));
  };

  const handleSave = async () => {
    if (!form.product_id) return alert("Select a product.");
    if (!form.quantity_change || form.quantity_change <= 0) return alert("Enter a valid quantity.");
    const prod = products.find(p => p.id === form.product_id);
    if (!prod) return;

    setSaving(true);
    const before = prod.quantity || 0;
    let after = before;
    if (form.adjustment_type === "add") after = before + form.quantity_change;
    else if (form.adjustment_type === "subtract") after = Math.max(0, before - form.quantity_change);
    else if (form.adjustment_type === "set") after = form.quantity_change;

    await Promise.all([
      entities.Product.update(form.product_id, { quantity: after }),
      entities.StockAdjustment.create({
        product_id: form.product_id,
        product_name: prod.name,
        adjustment_type: form.adjustment_type,
        quantity_before: before,
        quantity_change: form.quantity_change,
        quantity_after: after,
        reason: form.reason,
        notes: form.notes,
      }),
    ]);

    // Track cost price changes if product has a cost recorded
    if (prod.cost) {
      await trackPriceChangesFromAdjustment({
        productId: form.product_id,
        oldCost: prod.cost,
        newCost: prod.cost,
        oldPrice: prod.price,
        newPrice: prod.price,
        adjustedBy: "Stock Adjustment",
        reason: `${form.reason} — ${form.notes || "qty adjusted"}`,
      });
    }

    setSaving(false);
    setShowForm(false);
    setForm({ product_id: "", adjustment_type: "add", quantity_change: 1, reason: "restock", notes: "" });
    setSelectedProduct(null);
    loadData();
  };

  return (
    <div className="p-4 md:p-6 space-y-6 bg-[#050811] min-h-screen text-slate-100 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0B1C30]/80 p-5 rounded-2xl border border-slate-800/80 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_16px_rgba(0,229,255,0.25)] shrink-0">
            <RefreshCw className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className={DESIGN_TOKENS.typography.h1 + " flex items-center gap-2"}>
              Stock Adjustments
            </h1>
            <p className={DESIGN_TOKENS.typography.muted + " mt-0.5"}>
              Record stock counts, restocks, damage & audit adjustments
            </p>
          </div>
        </div>
        <Button onClick={() => setShowForm(true)} className={DESIGN_TOKENS.buttons.glowingAction + " gap-2 text-xs font-bold px-5 py-2.5 cursor-pointer active:scale-95 transition-all shrink-0"}>
          <Plus className="w-4 h-4" /> New Adjustment
        </Button>
      </div>

      {showForm && (
        <Card className="border border-emerald-500/40 bg-[#0B1C30] shadow-xl app-card-hover">
          <CardContent className="pt-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-semibold text-white">Stock Adjustment Form</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <Label className="text-slate-200">Product *</Label>
                <Select value={form.product_id} onValueChange={handleProductChange}>
                  <SelectTrigger className="bg-[#071322] border-slate-700 text-white"><SelectValue placeholder="Select product..." /></SelectTrigger>
                  <SelectContent className="bg-[#071322] border-slate-700 text-white">
                    {products.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name} (Stock: {p.quantity || 0})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedProduct && (
                  <p className="text-xs text-slate-400">Current stock: <strong className="text-cyan-300 font-mono">{selectedProduct.quantity || 0} {selectedProduct.unit || "pcs"}</strong></p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-200">Adjustment Type</Label>
                <Select value={form.adjustment_type} onValueChange={v => setForm(f => ({ ...f, adjustment_type: v }))}>
                  <SelectTrigger className="bg-[#071322] border-slate-700 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#071322] border-slate-700 text-white">
                    <SelectItem value="add">Add to Stock</SelectItem>
                    <SelectItem value="subtract">Subtract from Stock</SelectItem>
                    <SelectItem value="set">Set Exact Quantity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-200">Quantity</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.quantity_change}
                  onChange={e => setForm(f => ({ ...f, quantity_change: Number(e.target.value) }))}
                  className="bg-[#071322] border-slate-700 text-cyan-300 font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-200">Reason</Label>
                <Select value={form.reason} onValueChange={v => setForm(f => ({ ...f, reason: v }))}>
                  <SelectTrigger className="bg-[#071322] border-slate-700 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#071322] border-slate-700 text-white">
                    {REASONS.map(r => <SelectItem key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-200">Notes</Label>
                <Textarea
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  placeholder="Optional details..."
                  className="bg-[#071322] border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>
            </div>
            {selectedProduct && form.quantity_change > 0 && (
              <div className="bg-[#071322] border border-blue-500/30 rounded-xl p-3 text-sm text-blue-300 font-mono">
                <strong>Preview:</strong> {selectedProduct.quantity || 0} →{" "}
                {form.adjustment_type === "add" ? (selectedProduct.quantity || 0) + form.quantity_change
                  : form.adjustment_type === "subtract" ? Math.max(0, (selectedProduct.quantity || 0) - form.quantity_change)
                  : form.quantity_change} {selectedProduct.unit || "pcs"}
              </div>
            )}
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setShowForm(false)} className="bg-[#071322] border-slate-700 text-slate-200 hover:text-white">Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium">
                {saving ? "Saving..." : "Apply Adjustment"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* History */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Adjustment History</h3>
        {loading ? (
          <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 rounded-xl bg-slate-800/50 animate-pulse border border-slate-800" />)}</div>
        ) : adjustments.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-400" />
            <p>No stock adjustments recorded yet</p>
          </div>
        ) : (
          adjustments.map(adj => (
            <div key={adj.id} className="flex items-center gap-3 p-3.5 bg-[#0B1C30] border border-slate-800/80 rounded-xl shadow-md app-card-hover">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center ${adj.adjustment_type === "add" ? "bg-emerald-950/80 border border-emerald-800/60" : "bg-rose-950/80 border border-rose-800/60"}`}>
                {adj.adjustment_type === "add" ? <ArrowUp className="w-4 h-4 text-emerald-400" /> : <ArrowDown className="w-4 h-4 text-rose-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{adj.product_name}</p>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  <span className="text-cyan-300">{adj.quantity_before}</span> → <span className="text-emerald-400 font-bold">{adj.quantity_after}</span> · {format(new Date(adj.created_date), "MMM d, h:mm a")}
                </p>
              </div>
              <Badge className={REASON_COLORS[adj.reason] || "bg-slate-800 text-slate-300 border border-slate-700"}>{adj.reason}</Badge>
            </div>
          ))
        )}
      </div>
    </div>
  );
}