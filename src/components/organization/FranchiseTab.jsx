import React, { useState, useEffect } from 'react';
import { Save, Crown, Percent, Building2, TrendingUp } from 'lucide-react';
import { entities } from '@/lib/db';
import { useBranch } from '@/lib/BranchContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import HelpTip from '@/components/ui/HelpTip';

export default function FranchiseTab({ onUpdated }) {
  const { organization, branches, refreshBranches } = useBranch();
  const { toast } = useToast();
  const [royaltyDefault, setRoyaltyDefault] = useState(5);
  const [franchiseeRoyalties, setFranchiseeRoyalties] = useState({});
  const [saving, setSaving] = useState(false);

  const franchiseBranches = branches.filter(b => b.is_franchise);

  useEffect(() => {
    if (organization?.settings?.franchise_royalty_default) {
      setRoyaltyDefault(organization.settings.franchise_royalty_default);
    }
    const map = {};
    franchiseBranches.forEach(b => { map[b.id] = b.royalty_percent || royaltyDefault; });
    setFranchiseeRoyalties(map);
  }, [organization, branches]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save org-level default
      await entities.Organization.update(organization.id, {
        settings: { ...organization.settings, franchise_royalty_default: royaltyDefault },
      });
      // Save per-franchisee overrides
      for (const branchId of Object.keys(franchiseeRoyalties)) {
        const branch = branches.find(b => b.id === branchId);
        if (branch && branch.royalty_percent !== franchiseeRoyalties[branchId]) {
          await entities.Branch.update(branchId, { royalty_percent: franchiseeRoyalties[branchId] });
        }
      }
      await onUpdated();
      await refreshBranches();
      toast({ title: 'Franchise settings saved' });
    } catch (err) {
      toast({ title: 'Save failed', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="glass-fantasy-mystic rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4 text-violet-400" />
          <Label className="text-sm font-bold text-white">Default Franchise Royalty %</Label>
          <HelpTip content="The default royalty percentage applied to all franchisee branches unless overridden individually below." />
        </div>
        <div className="flex items-center gap-2">
          <Input type="number" step="0.5" value={royaltyDefault} onChange={(e) => setRoyaltyDefault(parseFloat(e.target.value) || 0)} className="w-32" />
          <Percent className="w-4 h-4 text-slate-400" />
        </div>
      </div>

      {/* Franchisee Branches */}
      <div className="glass-fantasy-cyber rounded-2xl p-5 space-y-3">
        <Label className="text-sm font-bold text-white">Franchisee Branches</Label>
        {franchiseBranches.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">No franchise branches yet. Mark a branch as franchise in the Branches tab.</p>
        ) : (
          <div className="grid gap-2">
            {franchiseBranches.map((branch) => (
              <div key={branch.id} className="flex items-center gap-3 p-3 bg-[#071322] border border-violet-800/40 rounded-xl">
                <Building2 className="w-4 h-4 text-violet-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{branch.name}</p>
                  {branch.franchisee_name && <p className="text-[10px] text-slate-500">{branch.franchisee_name}</p>}
                </div>
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    step="0.5"
                    value={franchiseeRoyalties[branch.id] ?? royaltyDefault}
                    onChange={(e) => setFranchiseeRoyalties({ ...franchiseeRoyalties, [branch.id]: parseFloat(e.target.value) || 0 })}
                    className="w-20 text-right"
                  />
                  <Percent className="w-3 h-3 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Royalty Reports Placeholder */}
      <div className="glass-fantasy-cyber rounded-2xl p-5 space-y-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#00E5FF]" />
          <Label className="text-sm font-bold text-white">Royalty Reports</Label>
          <Badge variant="cyan">Coming Soon</Badge>
        </div>
        <p className="text-xs text-slate-500">Monthly royalty reports will be auto-generated from franchisee sales and tracked here.</p>
      </div>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Franchise Settings'}
      </Button>
    </div>
  );
}