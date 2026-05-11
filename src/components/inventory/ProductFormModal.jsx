import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Upload } from "lucide-react";

const UNITS = ["pcs", "ml", "L", "g", "kg", "pack", "box", "bottle", "can", "sachet", "set"];

export default function ProductFormModal({ product, categories, suppliers, onSave, onClose }) {
  const [form, setForm] = useState({
    name: "", sku: "", barcode: "", description: "", category_id: "", category: "",
    supplier_id: "", supplier_name: "", photo_url: "", price: 0, cost: 0,
    quantity: 0, unit: "pcs", low_stock_threshold: 10, expiry_date: "", status: "active",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || "", sku: product.sku || "", barcode: product.barcode || "",
        description: product.description || "", category_id: product.category_id || "",
        category: product.category || "", supplier_id: product.supplier_id || "",
        supplier_name: product.supplier_name || "", photo_url: product.photo_url || "",
        price: product.price || 0, cost: product.cost || 0, quantity: product.quantity || 0,
        unit: product.unit || "pcs", low_stock_threshold: product.low_stock_threshold || 10,
        expiry_date: product.expiry_date || "", status: product.status || "active",
      });
    }
  }, [product]);

  const handleCategoryChange = (catId) => {
    const cat = categories.find(c => c.id === catId);
    setForm(f => ({ ...f, category_id: catId, category: cat?.name || "" }));
  };

  const handleSupplierChange = (supId) => {
    const sup = suppliers.find(s => s.id === supId);
    setForm(f => ({ ...f, supplier_id: supId, supplier_name: sup?.name || "" }));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, photo_url: file_url }));
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return alert("Product name is required.");
    setSaving(true);
    const data = {
      ...form,
      price: Number(form.price),
      cost: Number(form.cost),
      quantity: Number(form.quantity),
      low_stock_threshold: Number(form.low_stock_threshold),
    };
    if (product?.id) {
      await base44.entities.Product.update(product.id, data);
    } else {
      await base44.entities.Product.create(data);
    }
    setSaving(false);
    onSave();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-lg font-bold text-slate-900">{product ? "Edit Product" : "Add Product"}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Photo */}
          <div className="space-y-1.5">
            <Label>Product Photo</Label>
            <div className="flex items-center gap-4">
              {form.photo_url && (
                <img src={form.photo_url} alt="product" className="w-20 h-20 rounded-xl object-cover" />
              )}
              <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading} className="gap-2">
                <Upload className="w-4 h-4" />
                {uploading ? "Uploading..." : "Upload Photo"}
              </Button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <Label>Product Name *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g., Coca-Cola 330ml" />
            </div>
            <div className="space-y-1.5">
              <Label>SKU</Label>
              <Input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} placeholder="SKU-001" />
            </div>
            <div className="space-y-1.5">
              <Label>Barcode</Label>
              <Input value={form.barcode} onChange={e => setForm(f => ({ ...f, barcode: e.target.value }))} placeholder="Scan or enter barcode" />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={form.category_id} onValueChange={handleCategoryChange}>
                <SelectTrigger><SelectValue placeholder="Select category..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— None —</SelectItem>
                  {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Supplier</Label>
              <Select value={form.supplier_id} onValueChange={handleSupplierChange}>
                <SelectTrigger><SelectValue placeholder="Select supplier..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— None —</SelectItem>
                  {suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Selling Price (₱)</Label>
              <Input type="number" min="0" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Cost Price (₱)</Label>
              <Input type="number" min="0" step="0.01" value={form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Quantity in Stock</Label>
              <Input type="number" min="0" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Unit</Label>
              <Select value={form.unit} onValueChange={v => setForm(f => ({ ...f, unit: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Low Stock Threshold</Label>
              <Input type="number" min="0" value={form.low_stock_threshold} onChange={e => setForm(f => ({ ...f, low_stock_threshold: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Expiry Date</Label>
              <Input type="date" value={form.expiry_date} onChange={e => setForm(f => ({ ...f, expiry_date: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Product details..." rows={2} />
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex gap-3 justify-end rounded-b-2xl">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            {saving ? "Saving..." : product ? "Update Product" : "Create Product"}
          </Button>
        </div>
      </div>
    </div>
  );
}