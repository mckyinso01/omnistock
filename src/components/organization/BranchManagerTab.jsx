import React, { useState, useEffect } from 'react';
import { Plus, Store, Building2, MapPin, Phone, Pencil, Trash2, X } from 'lucide-react';
import { entities } from '@/lib/db';
import { useBranch } from '@/lib/BranchContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

export default function BranchManagerTab() {
  const { branches, refreshBranches } = useBranch();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const handleDelete = async (branch) => {
    if (branch.code === 'MAIN' || branch.name === 'Main Branch') {
      toast({ title: 'Cannot delete Main Branch', variant: 'destructive' });
      return;
    }
    if (!confirm(`Delete branch "${branch.name}"? Records will remain but lose branch assignment.`)) return;
    try {
      await entities.Branch.delete(branch.id);
      await refreshBranches();
      toast({ title: 'Branch deleted' });
    } catch (err) {
      toast({ title: 'Delete failed', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{branches.length} branch(es) configured</p>
        <Button size="sm" onClick={() => { setEditing(null); setShowForm(true); }}>
          <Plus className="w-4 h-4" /> Add Branch
        </Button>
      </div>

      {/* Branch List */}
      <div className="grid gap-3">
        {branches.map((branch) => (
          <div key={branch.id} className="glass-fantasy-cyber rounded-xl p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
              ${branch.is_supply_hub ? 'bg-amber-500/15 border border-amber-500/40' : 'bg-[#2563EB]/15 border border-[#00E5FF]/40'}`}>
              {branch.is_supply_hub ? (
                <Building2 className="w-5 h-5 text-amber-400" />
              ) : (
                <Store className="w-5 h-5 text-[#00E5FF]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-white truncate">{branch.name}</p>
                {branch.code === 'MAIN' && <Badge variant="cyan">Default</Badge>}
                {branch.is_supply_hub && <Badge variant="warning">Warehouse</Badge>}
                {branch.is_franchise && <Badge variant="violet">Franchise</Badge>}
              </div>
              <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500 font-mono">
                {branch.code && <span>{branch.code}</span>}
                {branch.address && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{branch.address}</span>}
                {branch.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{branch.phone}</span>}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Button size="icon" variant="ghost" onClick={() => { setEditing(branch); setShowForm(true); }}>
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => handleDelete(branch)}>
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <BranchFormModal
          branch={editing}
          onClose={() => setShowForm(false)}
          onSaved={async () => { await refreshBranches(); setShowForm(false); }}
        />
      )}
    </div>
  );
}

function BranchFormModal({ branch, onClose, onSaved }) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: branch?.name || '',
    code: branch?.code || '',
    address: branch?.address || '',
    phone: branch?.phone || '',
    manager_name: branch?.manager_name || '',
    timezone: branch?.timezone || 'Asia/Manila',
    currency: branch?.currency || 'PHP',
    is_supply_hub: branch?.is_supply_hub || false,
    is_franchise: branch?.is_franchise || false,
    franchisee_name: branch?.franchisee_name || '',
    royalty_percent: branch?.royalty_percent || 5,
    status: branch?.status || 'active',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: 'Branch name is required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      if (branch) {
        await entities.Branch.update(branch.id, form);
        toast({ title: 'Branch updated' });
      } else {
        await entities.Branch.create(form);
        toast({ title: 'Branch created' });
      }
      await onSaved();
    } catch (err) {
      toast({ title: 'Save failed', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="glass-fantasy-mystic rounded-2xl w-full max-w-lg modal-scroll-wrapper" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-800/60">
          <h3 className="text-base font-bold text-white">{branch ? 'Edit Branch' : 'New Branch'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Branch Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. BGC Branch" />
            </div>
            <div>
              <Label className="text-xs">Branch Code</Label>
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. BGC-01" />
            </div>
          </div>
          <div>
            <Label className="text-xs">Address</Label>
            <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Street, City" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="09xx..." />
            </div>
            <div>
              <Label className="text-xs">Manager Name</Label>
              <Input value={form.manager_name} onChange={(e) => setForm({ ...form, manager_name: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Timezone</Label>
              <Input value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Currency</Label>
              <Input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_supply_hub} onChange={(e) => setForm({ ...form, is_supply_hub: e.target.checked })} className="w-4 h-4 accent-amber-500" />
              <span className="text-xs text-slate-300">Supply Hub / Warehouse</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_franchise} onChange={(e) => setForm({ ...form, is_franchise: e.target.checked })} className="w-4 h-4 accent-violet-500" />
              <span className="text-xs text-slate-300">Franchise Branch</span>
            </label>
          </div>
          {form.is_franchise && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-violet-950/30 border border-violet-800/40 rounded-xl">
              <div>
                <Label className="text-xs">Franchisee Name</Label>
                <Input value={form.franchisee_name} onChange={(e) => setForm({ ...form, franchisee_name: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Royalty %</Label>
                <Input type="number" value={form.royalty_percent} onChange={(e) => setForm({ ...form, royalty_percent: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2 p-5 border-t border-slate-800/60">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="flex-1">{saving ? 'Saving...' : 'Save Branch'}</Button>
        </div>
      </div>
    </div>
  );
}