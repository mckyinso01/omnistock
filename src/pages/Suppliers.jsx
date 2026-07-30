import { useState, useEffect } from "react";
import { entities } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Plus, Truck, Phone, Mail, MapPin, Pencil, Trash2, X, Loader2 } from "lucide-react";
import { DESIGN_TOKENS } from "@/lib/designSystem";

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
    try {
      const data = await entities.Supplier.list("-created_date", 200).catch(() => []);
      setSuppliers(data || []);
    } catch (err) {
      console.error("Suppliers loadData Exception:", err);
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setForm({ name: "", contact_person: "", phone: "", email: "", address: "", notes: "", status: "active" });
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (s) => {
    setForm({
      name: s.name,
      contact_person: s.contact_person || "",
      phone: s.phone || "",
      email: s.email || "",
      address: s.address || "",
      notes: s.notes || "",
      status: s.status || "active",
    });
    setEditingId(s.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return alert("Supplier name is required.");
    setSaving(true);
    try {
      if (editingId) {
        await entities.Supplier.update(editingId, form);
      } else {
        await entities.Supplier.create(form);
      }
    } catch (err) {
      console.error("Supplier Save Exception:", err);
    } finally {
      setSaving(false);
      setShowForm(false);
      loadData();
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this supplier?")) return;
    try {
      await entities.Supplier.delete(id);
      loadData();
    } catch (err) {
      console.error("Supplier Delete Exception:", err);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto bg-[#050811] text-slate-100 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0B1C30]/80 p-5 rounded-2xl border border-slate-800/80 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_16px_rgba(0,229,255,0.25)] shrink-0">
            <Truck className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className={DESIGN_TOKENS.typography.h1 + " flex items-center gap-2"}>
              Supplier Management Directory
            </h1>
            <p className={DESIGN_TOKENS.typography.muted + " mt-0.5"}>
              Manage vendor contacts, procurement channels, and delivery notes
            </p>
          </div>
        </div>
        <Button onClick={openAdd} className={DESIGN_TOKENS.buttons.glowingAction + " gap-2 text-xs font-bold px-5 py-2.5 cursor-pointer active:scale-95 transition-all shrink-0"}>
          <Plus className="w-4 h-4" /> Add Supplier
        </Button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <Card className="water-breathing-card border border-slate-700/80 bg-[#0B1C30]/90 shadow-2xl rounded-2xl">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className={DESIGN_TOKENS.typography.h2}>{editingId ? "Edit Supplier" : "New Supplier"}</h3>
              <button onClick={() => setShowForm(false)} className={DESIGN_TOKENS.icons.iconButton}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Supplier Name *</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Company or supplier name" className="bg-[#071322] border-slate-700 text-white" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Contact Person</Label>
                <Input value={form.contact_person} onChange={e => setForm(f => ({ ...f, contact_person: e.target.value }))} placeholder="Full name" className="bg-[#071322] border-slate-700 text-white" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Phone</Label>
                <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Phone number" className="bg-[#071322] border-slate-700 text-white font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Email</Label>
                <Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@supplier.com" className="bg-[#071322] border-slate-700 text-white font-mono" />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Address</Label>
                <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Full address" className="bg-[#071322] border-slate-700 text-white" />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2 border-t border-slate-800">
              <Button variant="ghost" onClick={() => setShowForm(false)} className={DESIGN_TOKENS.buttons.secondary}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className={DESIGN_TOKENS.buttons.glowingAction}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Supplier"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Supplier List */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-44 rounded-2xl bg-[#0B1C30] border border-slate-800 animate-pulse" />)}
        </div>
      ) : suppliers.length === 0 ? (
        <div className="text-center py-20 text-slate-400 bg-[#0B1C30]/40 rounded-2xl border border-slate-800/80">
          <Truck className="w-12 h-12 mx-auto mb-3 opacity-30 text-cyan-400" />
          <p className="text-base font-bold text-white">No suppliers registered</p>
          <p className="text-xs text-slate-400 mt-1">Add your first vendor or distributor to streamline restocking</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map(s => (
            <Card key={s.id} className="water-breathing-card bg-[#0B1C30]/90 border border-slate-800/80 shadow-xl rounded-2xl app-card-hover">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-white text-base font-sans tracking-tight">{s.name}</p>
                    {s.contact_person && <p className="text-xs text-slate-400 mt-0.5">Contact: {s.contact_person}</p>}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge className={s.status === "active" ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 font-mono text-xs px-2.5 py-0.5" : "bg-slate-800/80 text-slate-400 border border-slate-700 font-mono text-xs px-2.5 py-0.5"}>
                      {s.status}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs text-slate-300 font-mono">
                  {s.phone && <p className="flex items-center gap-2 text-slate-300"><Phone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />{s.phone}</p>}
                  {s.email && <p className="flex items-center gap-2 text-slate-300"><Mail className="w-3.5 h-3.5 text-cyan-400 shrink-0" />{s.email}</p>}
                  {s.address && <p className="flex items-center gap-2 text-slate-300"><MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" /><span className="truncate">{s.address}</span></p>}
                </div>
                <div className="flex gap-1.5 justify-end border-t border-slate-800/80 pt-3">
                  <button onClick={() => openEdit(s)} className={DESIGN_TOKENS.icons.iconButton} title="Edit Supplier">
                    <Pencil className="w-4 h-4 text-cyan-400" />
                  </button>
                  <button onClick={() => handleDelete(s.id)} className={DESIGN_TOKENS.icons.iconButton} title="Delete Supplier">
                    <Trash2 className="w-4 h-4 text-rose-400" />
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