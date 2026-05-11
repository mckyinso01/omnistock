import { useState, useEffect } from "react";
import { entities } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Users, Phone, Mail, Star, Trash2, Pencil, X } from "lucide-react";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", birthday: "", notes: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const c = await entities.Customer.list("-total_spent", 300);
    setCustomers(c);
    setLoading(false);
  };

  const openAdd = () => {
    setForm({ name: "", phone: "", email: "", address: "", birthday: "", notes: "" });
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (c) => {
    setForm({ name: c.name, phone: c.phone || "", email: c.email || "", address: c.address || "", birthday: c.birthday || "", notes: c.notes || "" });
    setEditingId(c.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return alert("Customer name is required.");
    setSaving(true);
    if (editingId) {
      await entities.Customer.update(editingId, form);
    } else {
      await entities.Customer.create({ ...form, loyalty_points: 0, total_spent: 0, visit_count: 0, status: "active" });
    }
    setSaving(false);
    setShowForm(false);
    loadData();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this customer?")) return;
    await entities.Customer.delete(id);
    loadData();
  };

  const getLoyaltyTier = (points) => {
    if (points >= 1000) return { label: "Gold", color: "bg-yellow-100 text-yellow-700" };
    if (points >= 500) return { label: "Silver", color: "bg-slate-100 text-slate-600" };
    return { label: "Bronze", color: "bg-orange-100 text-orange-700" };
  };

  const filtered = customers.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button onClick={openAdd} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
          <Plus className="w-4 h-4" /> Add Customer
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="border-2 border-emerald-200">
          <CardContent className="pt-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">{editingId ? "Edit Customer" : "New Customer"}</h3>
              <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Full Name *</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Juan dela Cruz" />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+63 9XX XXX XXXX" />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@example.com" />
              </div>
              <div className="space-y-1.5">
                <Label>Birthday</Label>
                <Input type="date" value={form.birthday} onChange={e => setForm(f => ({ ...f, birthday: e.target.value }))} />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <Label>Address</Label>
                <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Street, City" />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <Label>Notes</Label>
                <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Customer preferences, VIP notes..." />
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

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Customers", value: customers.length, color: "text-blue-600" },
          { label: "Total Revenue", value: `₱${customers.reduce((s, c) => s + (c.total_spent || 0), 0).toLocaleString()}`, color: "text-emerald-600" },
          { label: "Total Visits", value: customers.reduce((s, c) => s + (c.visit_count || 0), 0), color: "text-violet-600" },
        ].map(stat => (
          <Card key={stat.label} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wide">{stat.label}</p>
              <p className={`text-xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Customer List */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-36 rounded-xl bg-slate-200 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No customers yet</p>
          <p className="text-sm">Add your first customer to start tracking loyalty</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(c => {
            const tier = getLoyaltyTier(c.loyalty_points || 0);
            return (
              <Card key={c.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">{c.name}</p>
                      <Badge className={`text-xs mt-1 ${tier.color}`}>
                        <Star className="w-3 h-3 mr-1" />{tier.label}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-slate-500 space-y-1">
                    {c.phone && <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" />{c.phone}</p>}
                    {c.email && <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" />{c.email}</p>}
                  </div>
                  <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-center text-xs">
                    <div>
                      <p className="font-bold text-emerald-600">₱{(c.total_spent || 0).toLocaleString()}</p>
                      <p className="text-slate-400">Spent</p>
                    </div>
                    <div>
                      <p className="font-bold text-blue-600">{c.visit_count || 0}</p>
                      <p className="text-slate-400">Visits</p>
                    </div>
                    <div>
                      <p className="font-bold text-violet-600">{c.loyalty_points || 0}</p>
                      <p className="text-slate-400">Points</p>
                    </div>
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