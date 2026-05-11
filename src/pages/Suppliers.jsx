import { useState, useEffect } from "react";
import { entities } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Truck, Pencil, Trash2, X, Phone, Mail, MapPin } from "lucide-react";

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", contact_person: "", phone: "", email: "", address: "", notes: "", status: "active" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const s = await entities.Supplier.list("name", 200);
    setSuppliers(s);
    setLoading(false);
  };

  const openAdd = () => {
    setForm({ name: "", contact_person: "", phone: "", email: "", address: "", notes: "", status: "active" });
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (s) => {
    setForm({ name: s.name, contact_person: s.contact_person || "", phone: s.phone || "", email: s.email || "", address: s.address || "", notes: s.notes || "", status: s.status || "active" });
    setEditingId(s.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return alert("Supplier name is required.");
    setSaving(true);
    if (editingId) {
      await entities.Supplier.update(editingId, form);
    } else {
      await entities.Supplier.create(form);
    }
    setSaving(false);
    setShowForm(false);
    loadData();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this supplier?")) return;
    await entities.Supplier.delete(id);
    loadData();
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex justify-end">
        <Button onClick={openAdd} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
          <Plus className="w-4 h-4" />
          Add Supplier
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="border-2 border-emerald-200">
          <CardContent className="pt-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">{editingId ? "Edit Supplier" : "New Supplier"}</h3>
              <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Supplier Name *</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Company or supplier name" />
              </div>
              <div className="space-y-1.5">
                <Label>Contact Person</Label>
                <Input value={form.contact_person} onChange={e => setForm(f => ({ ...f, contact_person: e.target.value }))} placeholder="Full name" />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+63 9XX XXX XXXX" />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@supplier.com" />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <Label>Address</Label>
                <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Business address" />
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
                <Label>Notes</Label>
                <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Payment terms, delivery schedule, etc." rows={2} />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* List */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-36 rounded-xl bg-slate-200 animate-pulse" />)}
        </div>
      ) : suppliers.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Truck className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No suppliers yet. Add your first supplier.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map(s => (
            <Card key={s.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-slate-800">{s.name}</p>
                    {s.contact_person && <p className="text-sm text-slate-500">{s.contact_person}</p>}
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge className={s.status === "active" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}>
                      {s.status}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1.5 text-sm text-slate-500">
                  {s.phone && <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 shrink-0" />{s.phone}</p>}
                  {s.email && <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 shrink-0" />{s.email}</p>}
                  {s.address && <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 shrink-0" /><span className="truncate">{s.address}</span></p>}
                </div>
                <div className="flex gap-1 justify-end border-t border-slate-100 pt-2">
                  <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}