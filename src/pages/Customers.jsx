import { useState, useEffect } from "react";
import { entities } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Plus, Search, Users, Pencil, Trash2, Phone, Mail, Star, Loader2, X, DollarSign, ShoppingBag } from "lucide-react";
import { DESIGN_TOKENS } from "@/lib/designSystem";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", birthday: "", notes: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const c = await entities.Customer.list("-created_date", 200).catch(() => []);
      setCustomers(c || []);
    } catch (err) {
      console.error("Customers loadData Exception:", err);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setForm({ name: "", phone: "", email: "", address: "", birthday: "", notes: "" });
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (c) => {
    setForm({
      name: c.name,
      phone: c.phone || "",
      email: c.email || "",
      address: c.address || "",
      birthday: c.birthday || "",
      notes: c.notes || "",
    });
    setEditingId(c.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return alert("Name is required.");
    setSaving(true);
    try {
      if (editingId) {
        await entities.Customer.update(editingId, form);
      } else {
        await entities.Customer.create({ ...form, total_spent: 0, visit_count: 0, loyalty_points: 100 });
      }
    } catch (err) {
      console.error("Customer Save Exception:", err);
    } finally {
      setSaving(false);
      setShowForm(false);
      loadData();
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;
    try {
      await entities.Customer.delete(id);
      loadData();
    } catch (err) {
      console.error("Customer Delete Exception:", err);
    }
  };

  const getLoyaltyTier = (points) => {
    if (points >= 1000) return { label: "Gold", color: "bg-yellow-950/80 text-yellow-300 border border-yellow-500/50 font-mono" };
    if (points >= 500) return { label: "Silver", color: "bg-slate-800/80 text-slate-200 border border-slate-600/50 font-mono" };
    return { label: "Bronze", color: "bg-amber-950/80 text-amber-300 border border-amber-500/50 font-mono" };
  };

  const filtered = customers.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto bg-[#050811] text-slate-100 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0B1C30]/80 p-5 rounded-2xl border border-slate-800/80 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_16px_rgba(0,229,255,0.25)] shrink-0">
            <Users className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className={DESIGN_TOKENS.typography.h1 + " flex items-center gap-2"}>
              Customer Directory & CRM
            </h1>
            <p className={DESIGN_TOKENS.typography.muted + " mt-0.5"}>
              Manage customer profiles, purchase history, and loyalty rewards
            </p>
          </div>
        </div>
        <Button onClick={openAdd} className={DESIGN_TOKENS.buttons.glowingAction + " gap-2 text-xs font-bold px-5 py-2.5 cursor-pointer active:scale-95 transition-all shrink-0"}>
          <Plus className="w-4 h-4" /> Add Customer
        </Button>
      </div>

      {/* Search & Actions */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
          <input
            type="text"
            placeholder="Search customers by name, phone, or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-700/80 bg-[#071322] text-slate-100 placeholder:text-slate-500 focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF] outline-none text-base sm:text-sm font-medium transition-all font-sans"
          />
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <Card className="water-breathing-card border border-slate-700/80 bg-[#0B1C30]/90 shadow-2xl rounded-2xl">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className={DESIGN_TOKENS.typography.h2}>{editingId ? "Edit Customer" : "New Customer"}</h3>
              <button onClick={() => setShowForm(false)} className={DESIGN_TOKENS.icons.iconButton}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Full Name *</Label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Juan dela Cruz" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700/80 bg-[#071322] text-slate-100 placeholder:text-slate-500 focus:border-[#00E5FF] outline-none text-base sm:text-sm font-medium" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Phone</Label>
                <input type="text" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+63 9XX XXX XXXX" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700/80 bg-[#071322] text-slate-100 placeholder:text-slate-500 focus:border-[#00E5FF] outline-none text-base sm:text-sm font-medium font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Email</Label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@example.com" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700/80 bg-[#071322] text-slate-100 placeholder:text-slate-500 focus:border-[#00E5FF] outline-none text-base sm:text-sm font-medium font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Birthday</Label>
                <input type="date" value={form.birthday} onChange={e => setForm(f => ({ ...f, birthday: e.target.value }))} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700/80 bg-[#071322] text-slate-100 focus:border-[#00E5FF] outline-none text-base sm:text-sm font-medium font-mono" />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Address</Label>
                <input type="text" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Street, City" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700/80 bg-[#071322] text-slate-100 placeholder:text-slate-500 focus:border-[#00E5FF] outline-none text-base sm:text-sm font-medium" />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Notes</Label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Customer preferences, VIP notes..." className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700/80 bg-[#071322] text-slate-100 placeholder:text-slate-500 focus:border-[#00E5FF] outline-none text-base sm:text-sm font-medium" />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2 border-t border-slate-800">
              <Button variant="ghost" onClick={() => setShowForm(false)} className={DESIGN_TOKENS.buttons.secondary}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className={DESIGN_TOKENS.buttons.glowingAction}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Customer"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Customers", value: customers.length, icon: <Users className="w-5 h-5 text-cyan-400" />, color: "text-cyan-400", border: "border-cyan-500/30" },
          { label: "Total Revenue", value: `₱${customers.reduce((s, c) => s + (c.total_spent || 0), 0).toLocaleString()}`, icon: <DollarSign className="w-5 h-5 text-emerald-400" />, color: "text-emerald-400", border: "border-emerald-500/30" },
          { label: "Total Visits", value: customers.reduce((s, c) => s + (c.visit_count || 0), 0), icon: <ShoppingBag className="w-5 h-5 text-violet-400" />, color: "text-violet-400", border: "border-violet-500/30" },
        ].map(stat => (
          <Card key={stat.label} className={`water-breathing-card bg-[#0B1C30]/90 border ${stat.border} shadow-xl rounded-2xl app-card-hover`}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#071322] border border-slate-800 flex items-center justify-center shrink-0">
                {stat.icon}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">{stat.label}</p>
                <p className={`text-2xl font-bold mt-0.5 ${stat.color} font-mono`}>{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Customer List */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-44 rounded-2xl bg-[#0B1C30] border border-slate-800 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-400 bg-[#0B1C30]/40 rounded-2xl border border-slate-800/80">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30 text-cyan-400" />
          <p className="text-base font-bold text-white">No customers found</p>
          <p className="text-xs text-slate-400 mt-1">Add your first customer to start tracking loyalty and rewards</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(c => {
            const tier = getLoyaltyTier(c.loyalty_points || 0);
            return (
              <Card key={c.id} className="water-breathing-card bg-[#0B1C30]/90 border border-slate-800/80 shadow-xl rounded-2xl app-card-hover">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-white text-base font-sans tracking-tight">{c.name}</p>
                      <Badge className={`text-xs mt-1.5 px-2.5 py-0.5 ${tier.color}`}>
                        <Star className="w-3 h-3 mr-1 text-yellow-400 fill-yellow-400" />{tier.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button onClick={() => openEdit(c)} className={DESIGN_TOKENS.icons.iconButton} title="Edit Customer">
                        <Pencil className="w-4 h-4 text-cyan-400" />
                      </button>
                      <button onClick={() => handleDelete(c.id)} className={DESIGN_TOKENS.icons.iconButton} title="Delete Customer">
                        <Trash2 className="w-4 h-4 text-rose-400" />
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-slate-300 font-mono space-y-1.5">
                    {c.phone && <p className="flex items-center gap-2 text-slate-300"><Phone className="w-3.5 h-3.5 text-cyan-400" />{c.phone}</p>}
                    {c.email && <p className="flex items-center gap-2 text-slate-300"><Mail className="w-3.5 h-3.5 text-cyan-400" />{c.email}</p>}
                  </div>
                  <div className="grid grid-cols-3 gap-2 border-t border-slate-800/80 pt-3.5 text-center text-xs">
                    <div>
                      <p className="font-bold text-emerald-400 font-mono text-sm">₱{(c.total_spent || 0).toLocaleString()}</p>
                      <p className="text-slate-400 text-[11px] font-mono mt-0.5">Spent</p>
                    </div>
                    <div>
                      <p className="font-bold text-cyan-400 font-mono text-sm">{c.visit_count || 0}</p>
                      <p className="text-slate-400 text-[11px] font-mono mt-0.5">Visits</p>
                    </div>
                    <div>
                      <p className="font-bold text-violet-400 font-mono text-sm">{c.loyalty_points || 0}</p>
                      <p className="text-slate-400 text-[11px] font-mono mt-0.5">Points</p>
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