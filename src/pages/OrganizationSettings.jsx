import React, { useState, useEffect } from 'react';
import { Building2, Sliders, Crown, Settings, Shield } from 'lucide-react';
import { useBranch } from '@/lib/BranchContext';
import { useToast } from '@/components/ui/use-toast';
import GeneralTab from '@/components/organization/GeneralTab';
import BranchManagerTab from '@/components/organization/BranchManagerTab';
import ApprovalThresholdsTab from '@/components/organization/ApprovalThresholdsTab';
import FranchiseTab from '@/components/organization/FranchiseTab';

const TABS = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'branches', label: 'Branches', icon: Building2 },
  { id: 'thresholds', label: 'Approval Thresholds', icon: Shield },
  { id: 'franchise', label: 'Franchise', icon: Crown },
];

export default function OrganizationSettings() {
  const { organization, refreshOrganization, multiBranchEnabled } = useBranch();
  const [activeTab, setActiveTab] = useState('general');

  const tabs = TABS.filter(t => t.id !== 'franchise' || (organization?.deployment_mode === 'franchise'));

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="glass-fantasy-cyber rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#2563EB]/20 border border-[#00E5FF]/40 rounded-xl flex items-center justify-center">
            <Building2 className="w-5 h-5 text-[#00E5FF]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Organization Settings</h2>
            <p className="text-xs text-slate-400 font-mono">
              {organization?.name || 'Loading...'} · {organization?.deployment_mode || 'single_owner'}
              {multiBranchEnabled ? ' · Multi-Branch ON' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1.5 p-1.5 bg-[#0B1C30]/60 border border-blue-900/40 rounded-xl overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer
                ${active
                  ? 'bg-[#2563EB]/20 text-[#00E5FF] border border-[#00E5FF]/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40 border border-transparent'
                }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'general' && <GeneralTab onUpdated={refreshOrganization} />}
        {activeTab === 'branches' && <BranchManagerTab />}
        {activeTab === 'thresholds' && <ApprovalThresholdsTab onUpdated={refreshOrganization} />}
        {activeTab === 'franchise' && <FranchiseTab onUpdated={refreshOrganization} />}
      </div>
    </div>
  );
}