import React, { useState, useEffect } from 'react';
import { Save, Layers, Building, Users, Crown, Sparkles } from 'lucide-react';
import { entities } from '@/lib/db';
import { useBranch } from '@/lib/BranchContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import HelpTip from '@/components/ui/HelpTip';

const MODES = [
  { value: 'single_owner', label: 'Single Owner', icon: Building, desc: 'One company, many branches under one owner' },
  { value: 'multi_tenant', label: 'Multi-Tenant SaaS', icon: Users, desc: 'Multiple companies sign up, each isolated' },
  { value: 'franchise', label: 'Franchise', icon: Crown, desc: 'HQ + franchisees with royalty tracking' },
];

export default function GeneralTab({ onUpdated }) {
  const { organization } = useBranch();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [mode, setMode] = useState('single_owner');
  const [multiBranch, setMultiBranch] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (organization) {
      setName(organization.name || '');
      setMode(organization.deployment_mode || 'single_owner');
      setMultiBranch(organization.multi_branch_enabled || false);
    }
  }, [organization]);

  const handleSave = async () => {
    if (!organization) return;
    setSaving(true);
    try {
      await entities.Organization.update(organization.id, {
        name,
        deployment_mode: mode,
        multi_branch_enabled: multiBranch,
      });
      await onUpdated();
      toast({ title: 'Organization settings saved' });
    } catch (err) {
      toast({ title: 'Save failed', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Organization Name */}
      <div className="glass-fantasy-cyber rounded-2xl p-5 space-y-3">
        <Label className="text-sm font-bold text-white">Organization Name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your company name" />
      </div>

      {/* Deployment Mode */}
      <div className="glass-fantasy-cyber rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#00E5FF]" />
          <Label className="text-sm font-bold text-white">Deployment Model</Label>
          <HelpTip content="Determines how branches and tenants are isolated. Single Owner = one company. Multi-Tenant = many companies. Franchise = HQ + franchisees with royalty tracking." />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {MODES.map((m) => {
            const Icon = m.icon;
            const active = mode === m.value;
            return (
              <button
                key={m.value}
                onClick={() => setMode(m.value)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer
                  ${active
                    ? 'bg-[#2563EB]/20 border-[#00E5FF]/50 shadow-[0_0_15px_rgba(0,229,255,0.2)]'
                    : 'bg-[#071322] border-slate-700/80 hover:border-blue-500/40'
                  }`}
              >
                <Icon className={`w-5 h-5 mb-2 ${active ? 'text-[#00E5FF]' : 'text-slate-400'}`} />
                <p className={`text-sm font-bold ${active ? 'text-white' : 'text-slate-300'}`}>{m.label}</p>
                <p className="text-[11px] text-slate-500 mt-1">{m.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Multi-Branch Toggle */}
      <div className="glass-fantasy-cyber rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#00E5FF]" />
            <Label className="text-sm font-bold text-white">Multi-Branch Mode</Label>
            <HelpTip content="When enabled, the branch selector appears in the top bar and all data is scoped by branch. When disabled, the app operates in single-store mode." />
          </div>
          <button
            onClick={() => setMultiBranch(!multiBranch)}
            className={`relative w-12 h-6 rounded-full transition-all cursor-pointer ${multiBranch ? 'bg-[#2563EB]' : 'bg-slate-700'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${multiBranch ? 'left-6' : 'left-0.5'}`} />
          </button>
        </div>
        <p className="text-xs text-slate-400">
          {multiBranch
            ? 'Branch selector is visible. All records are scoped by branch.'
            : 'Single-store mode. All records belong to the Main Branch.'}
        </p>
      </div>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        <Save className="w-4 h-4" />
        {saving ? 'Saving...' : 'Save Organization Settings'}
      </Button>
    </div>
  );
}