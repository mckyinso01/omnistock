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

const REASONS = ["restock", "damaged", "expired", "lost", "theft", "correction", "returned", "other"];
const REASON_COLORS = {
  restock: "bg-green-100 text-green-700",
  damaged: "bg-red-100 text-red-700",
  expired: "bg-orange-100 text-orange-700",
  lost: "bg-red-100 text-red-700",
  theft: "bg-red-100 text-red-700",
  correction: "bg-blue-100 text-blue-700",
  returned: "bg-violet-100 text-violet-700",
  other: "bg-slate-100 text-slate-600",
};

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
    const [a, p] = await Promise.all([
      entities.StockAdjustment.list("-created_date", 200),
      entities.Product.filter({ status: "active" }),
    ]);
    setAdjustments(a);
    setProducts(p);
    setLoading(false);
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

    setSaving(false);
    setShowForm(false);
    setForm({ product_id: "", adjustment_type: "add", quantity_change: 1, reason: "restock", notes: "" });
    setSelectedProduct(null);
    loadData();
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setShowForm(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
          <Plus className="w-4 h-4" /> New Adjustment
        </Button>
      </div>

      {showForm && (
        <Card className="border-2 border-emerald-200">
          <CardContent className="pt-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">Stock Adjustment</h3>
              <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <Label>Product *</Label>
                <Select value={form.product_id} onValueChange={handleProductChange}>
                  <SelectTrigger><SelectValue placeholder="Select product..." /></SelectTrigger>
                  <SelectContent>
                    {products.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name} (Stock: {p.quantity || 0})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedProduct && (
                  <p className="text-xs text-slate-500">Current stock: <strong>{selectedProduct.quantity || 0} {selectedProduct.unit || "pcs"}</strong></p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Adjustment Type</Label>
                <Select value={form.adjustment_type} onValueChange={v => setForm(f => ({ ...f, adjustment_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="add">Add to Stock</SelectItem>
                    <SelectItem value="subtract">Subtract from Stock</SelectItem>
                    <SelectItem value="set">Set Exact Quantity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Quantity</Label>
                <Input type="number" min="0" value={form.quantity_change} onChange={e => setForm(f => ({ ...f, quantity_change: Number(e.target.value) }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Reason</Label>
                <Select value={form.reason} onValueChange={v => setForm(f => ({ ...f, reason: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {REASONS.map(r => <SelectItem key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Notes</Label>
                <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Optional details..." />
              </div>
            </div>
            {selectedProduct && form.quantity_change > 0 && (
              <div className="bg-blue-50 rounded-xl p-3 text-sm text-blue-800">
                <strong>Preview:</strong> {selectedProduct.quantity || 0} →{" "}
                {form.adjustment_type === "add" ? (selectedProduct.quantity || 0) + form.quantity_change
                  : form.adjustment_type === "subtract" ? Math.max(0, (selectedProduct.quantity || 0) - form.quantity_change)
                  : form.quantity_change} {selectedProduct.unit || "pcs"}
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {saving ? "Saving..." : "Apply Adjustment"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* History */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Adjustment History</h3>
        {loading ? (
          <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 rounded-xl bg-slate-200 animate-pulse" />)}</div>
        ) : adjustments.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No adjustments yet</p>
          </div>
        ) : (
          adjustments.map(adj => (
            <div key={adj.id} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${adj.adjustment_type === "add" ? "bg-green-100" : "bg-red-100"}`}>
                {adj.adjustment_type === "add" ? <ArrowUp className="w-4 h-4 text-green-600" /> : <ArrowDown className="w-4 h-4 text-red-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{adj.product_name}</p>
                <p className="text-xs text-slate-500">
                  {adj.quantity_before} → {adj.quantity_after} · {format(new Date(adj.created_date), "MMM d, h:mm a")}
                </p>
              </div>
              <Badge className={REASON_COLORS[adj.reason] || "bg-slate-100 text-slate-600"}>{adj.reason}</Badge>
            </div>
          ))
        )}
      </div>
    </div>
  );
}