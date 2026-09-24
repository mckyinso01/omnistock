import React, { useState, useEffect } from 'react';
import { Save, Shield, DollarSign, Percent, Package, Tag, RotateCcw } from 'lucide-react';
import { entities } from '@/lib/db';
import { useBranch } from '@/lib/BranchContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import HelpTip from '@/components/ui/HelpTip';

const THRESHOLD_FIELDS = [
  { key: 'po_value', label: 'PO Value Threshold', icon: DollarSign, desc: 'Purchase orders above this amount route to HQ for approval', prefix: '₱' },
  { key: 'price_change_percent', label: 'Price Change %', icon: Percent, desc: 'Price changes exceeding this percentage route for approval', suffix: '%' },
  { key: 'stock_adjustment_units', label: 'Stock Adjustment Units', icon: Package, desc: 'Adjustments above this unit count route for approval', suffix: ' units' },
  { key: 'discount_percent', label: 'Discount %', icon: Tag, desc: 'Discounts exceeding this percentage route for approval', suffix: '%' },
  { key: 'refund_value', label: 'Refund Value', icon: RotateCcw, desc: 'Refunds above this amount route for approval', prefix: '₱' },
];

export default function ApprovalThresholdsTab({ onUpdated }) {
  const { organization } = useBranch();
  const { toast } = useToast();
  const [thresholds, setThresholds] = useState({});
  const [priceControls, setPriceControls] = useState({ enabled: false, default_floor_percent: -10, default_ceiling_percent: 25 });
  const [autoReplenish, setAutoReplenish] = useState({ enabled: false, rop_multiplier: 1.5 });
  const [escalationHours, setEscalationHours] = useState(24);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (organization?.settings) {
      setThresholds(organization.settings.approval_thresholds || {});
      setPriceControls(organization.settings.price_controls || { enabled: false, default_floor_percent: -10, default_ceiling_percent: 25 });
      setAutoReplenish(organization.settings.auto_replenishment || { enabled: false, rop_multiplier: 1.5 });
      setEscalationHours(organization.settings.escalation_timeout_hours || 24);
    }
  }, [organization]);

  const handleSave = async () => {
    if (!organization) return;
    setSaving(true);
    try {
      await entities.Organization.update(organization.id, {
        settings: {
          ...organization.settings,
          approval_thresholds: thresholds,
          price_controls: priceControls,
          auto_replenishment: autoReplenish,
          escalation_timeout_hours: escalationHours,
        },
      });
      await onUpdated();
      toast({ title: 'Approval thresholds saved' });
    } catch (err) {
      toast({ title: 'Save failed', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Thresholds */}
      <div className="glass-fantasy-cyber rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#00E5FF]" />
          <Label className="text-sm font-bold text-white">Approval Thresholds</Label>
          <HelpTip content="When a branch action crosses any of these thresholds, it automatically creates an Approval Request routed to the appropriate approver." />
        </div>
        <div className="grid gap-3">
          {THRESHOLD_FIELDS.map((field) => {
            const Icon = field.icon;
            return (
              <div key={field.key} className="flex items-center gap-3 p-3 bg-[#071322] border border-slate-700/60 rounded-xl">
                <Icon className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-200">{field.label}</p>
                  <p className="text-[10px] text-slate-500">{field.desc}</p>
                </div>
                <div className="flex items-center gap-1">
                  {field.prefix && <span className="text-xs text-slate-400 font-mono">{field.prefix}</span>}
                  <Input
                    type="number"
                    value={thresholds[field.key] ?? 0}
                    onChange={(e) => setThresholds({ ...thresholds, [field.key]: parseFloat(e.target.value) || 0 })}
                    className="w-24 text-right"
                  />
                  {field.suffix && <span className="text-xs text-slate-400 font-mono">{field.suffix}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Price Controls */}
      <div className="glass-fantasy-cyber rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-bold text-white">Price Controls (Floor / Ceiling)</Label>
          <button
            onClick={() => setPriceControls({ ...priceControls, enabled: !priceControls.enabled })}
            className={`relative w-12 h-6 rounded-full transition-all cursor-pointer ${priceControls.enabled ? 'bg-[#2563EB]' : 'bg-slate-700'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${priceControls.enabled ? 'left-6' : 'left-0.5'}`} />
          </button>
        </div>
        {priceControls.enabled && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Default Floor % (below cost)</Label>
              <Input type="number" value={priceControls.default_floor_percent} onChange={(e) => setPriceControls({ ...priceControls, default_floor_percent: parseFloat(e.target.value) || 0 })} />
            </div>
            <div>
              <Label className="text-xs">Default Ceiling % (above cost)</Label>
              <Input type="number" value={priceControls.default_ceiling_percent} onChange={(e) => setPriceControls({ ...priceControls, default_ceiling_percent: parseFloat(e.target.value) || 0 })} />
            </div>
          </div>
        )}
      </div>

      {/* Auto-Replenishment */}
      <div className="glass-fantasy-cyber rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-bold text-white">Auto-Replenishment (ROP)</Label>
          <button
            onClick={() => setAutoReplenish({ ...autoReplenish, enabled: !autoReplenish.enabled })}
            className={`relative w-12 h-6 rounded-full transition-all cursor-pointer ${autoReplenish.enabled ? 'bg-[#2563EB]' : 'bg-slate-700'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${autoReplenish.enabled ? 'left-6' : 'left-0.5'}`} />
          </button>
        </div>
        {autoReplenish.enabled && (
          <div>
            <Label className="text-xs">ROP Multiplier (threshold × this = reorder qty)</Label>
            <Input type="number" step="0.1" value={autoReplenish.rop_multiplier} onChange={(e) => setAutoReplenish({ ...autoReplenish, rop_multiplier: parseFloat(e.target.value) || 1 })} />
          </div>
        )}
      </div>

      {/* Escalation Timeout */}
      <div className="glass-fantasy-cyber rounded-2xl p-5 space-y-3">
        <Label className="text-sm font-bold text-white">Escalation Timeout (hours)</Label>
        <Input type="number" value={escalationHours} onChange={(e) => setEscalationHours(parseInt(e.target.value) || 24)} className="w-32" />
        <p className="text-[11px] text-slate-500">Unresolved approval requests auto-escalate after this many hours.</p>
      </div>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Thresholds & Settings'}
      </Button>
    </div>
  );
}