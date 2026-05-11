import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Truck, X, Trash2, Package, CheckCircle2, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";

const STATUS_COLORS = {
  draft: "bg-slate-100 text-slate-600",
  sent: "bg-blue-100 text-blue-700",
  partial: "bg-yellow-100 text-yellow-700",
  received: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
};

export default function PurchaseOrders() {
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [form, setForm] = useState({ supplier_id: "", supplier_name: "", expected_date: "", notes: "", items: [] });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const [o, s, p] = await Promise.all([
      base44.entities.PurchaseOrder.list("-created_date", 200),
      base44.entities.Supplier.filter({ status: "active" }),
      base44.entities.Product.filter({ status: "active" }),
    ]);
    setOrders(o);
    setSuppliers(s);
    setProducts(p);
    setLoading(false);
  };

  const addItem = () => {
    setForm(f => ({ ...f, items: [...f.items, { product_id: "", product_name: "", quantity_ordered: 1, quantity_received: 0, unit_cost: 0, subtotal: 0 }] }));
  };

  const updateItem = (idx, field, value) => {
    setForm(f => {
      const items = [...f.items];
      items[idx] = { ...items[idx], [field]: value };
      if (field === "product_id") {
        const prod = products.find(p => p.id === value);
        items[idx].product_name = prod?.name || "";
        items[idx].unit_cost = prod?.cost || 0;
      }
      if (field === "quantity_ordered" || field === "unit_cost") {
        items[idx].subtotal = (items[idx].quantity_ordered || 0) * (items[idx].unit_cost || 0);
      }
      return { ...f, items };
    });
  };

  const removeItem = (idx) => {
    setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  };

  const handleSupplierChange = (id) => {
    const sup = suppliers.find(s => s.id === id);
    setForm(f => ({ ...f, supplier_id: id, supplier_name: sup?.name || "" }));
  };

  const handleSave = async () => {
    if (!form.supplier_id) return alert("Please select a supplier.");
    if (form.items.length === 0) return alert("Add at least one item.");
    setSaving(true);
    const total = form.items.reduce((s, i) => s + (i.subtotal || 0), 0);
    const poNum = `PO-${Date.now()}`;
    await base44.entities.PurchaseOrder.create({ ...form, po_number: poNum, total_amount: total, status: "draft" });
    setSaving(false);
    setShowForm(false);
    setForm({ supplier_id: "", supplier_name: "", expected_date: "", notes: "", items: [] });
    loadData();
  };

  const updateStatus = async (id, status) => {
    await base44.entities.PurchaseOrder.update(id, { status });
    if (status === "received") {
      const order = orders.find(o => o.id === id);
      if (order?.items) {
        await Promise.all(order.items.map(async (item) => {
          const prod = products.find(p => p.id === item.product_id);
          if (prod) {
            await base44.entities.Product.update(item.product_id, { quantity: (prod.quantity || 0) + (item.quantity_ordered || 0) });
          }
        }));
      }
    }
    loadData();
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setShowForm(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
          <Plus className="w-4 h-4" /> New Purchase Order
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="border-2 border-emerald-200">
          <CardContent className="pt-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">New Purchase Order</h3>
              <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Supplier *</Label>
                <Select value={form.supplier_id} onValueChange={handleSupplierChange}>
                  <SelectTrigger><SelectValue placeholder="Select supplier..." /></SelectTrigger>
                  <SelectContent>
                    {suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Expected Delivery Date</Label>
                <Input type="date" value={form.expected_date} onChange={e => setForm(f => ({ ...f, expected_date: e.target.value }))} />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <Label>Notes</Label>
                <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
              </div>
            </div>

            {/* Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Items</Label>
                <Button size="sm" variant="outline" onClick={addItem} className="gap-1 text-emerald-600">
                  <Plus className="w-3 h-3" /> Add Item
                </Button>
              </div>
              {form.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-end p-3 bg-slate-50 rounded-xl">
                  <div className="col-span-5 space-y-1">
                    <p className="text-xs text-slate-500">Product</p>
                    <Select value={item.product_id} onValueChange={v => updateItem(idx, "product_id", v)}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <p className="text-xs text-slate-500">Qty</p>
                    <Input type="number" min="1" value={item.quantity_ordered} onChange={e => updateItem(idx, "quantity_ordered", Number(e.target.value))} className="h-8 text-xs" />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <p className="text-xs text-slate-500">Unit Cost</p>
                    <Input type="number" min="0" step="0.01" value={item.unit_cost} onChange={e => updateItem(idx, "unit_cost", Number(e.target.value))} className="h-8 text-xs" />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <p className="text-xs text-slate-500">Subtotal</p>
                    <p className="text-sm font-semibold text-slate-700 h-8 flex items-center">₱{(item.subtotal || 0).toLocaleString()}</p>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600 mt-4">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {form.items.length > 0 && (
              <div className="flex justify-end text-sm font-semibold text-slate-800">
                Total: ₱{form.items.reduce((s, i) => s + (i.subtotal || 0), 0).toLocaleString()}
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {saving ? "Saving..." : "Create PO"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Orders List */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 rounded-xl bg-slate-200 animate-pulse" />)}</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Truck className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No purchase orders yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <Card key={order.id} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Package className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 truncate">{order.po_number}</p>
                      <p className="text-sm text-slate-500">{order.supplier_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className={STATUS_COLORS[order.status]}>{order.status}</Badge>
                    <p className="text-sm font-bold text-slate-700">₱{(order.total_amount || 0).toLocaleString()}</p>
                    {order.status === "draft" && (
                      <Button size="sm" onClick={() => updateStatus(order.id, "sent")} className="text-xs bg-blue-600 hover:bg-blue-700 text-white">Send</Button>
                    )}
                    {(order.status === "sent" || order.status === "partial") && (
                      <Button size="sm" onClick={() => updateStatus(order.id, "received")} className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1">
                        <CheckCircle2 className="w-3 h-3" />Received
                      </Button>
                    )}
                    <button onClick={() => setExpanded(expanded === order.id ? null : order.id)} className="text-slate-400">
                      {expanded === order.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {expanded === order.id && (
                  <div className="mt-4 border-t border-slate-100 pt-4 space-y-2">
                    {(order.items || []).map((item, i) => (
                      <div key={i} className="flex justify-between text-sm text-slate-600">
                        <span>{item.product_name}</span>
                        <span>{item.quantity_ordered} × ₱{item.unit_cost?.toLocaleString()} = ₱{item.subtotal?.toLocaleString()}</span>
                      </div>
                    ))}
                    {order.expected_date && (
                      <p className="text-xs text-slate-400 flex items-center gap-1 pt-1">
                        <Clock className="w-3 h-3" /> Expected: {format(new Date(order.expected_date), "MMM d, yyyy")}
                      </p>
                    )}
                    {order.notes && <p className="text-xs text-slate-500 italic">{order.notes}</p>}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}