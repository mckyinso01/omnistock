import React, { useState } from "react";
import { Server, Sparkles, Code, Cloud, ShieldCheck, X, Check, DollarSign } from "lucide-react";

export default function LicensingDeploymentTierBar() {
  const [activeModal, setActiveModal] = useState(null);
  const [purgeSuccess, setPurgeSuccess] = useState(false);

  const handleSelfHostPurge = () => {
    sessionStorage.clear();
    localStorage.clear();
    setPurgeSuccess(true);
    setTimeout(() => {
      setPurgeSuccess(false);
      setActiveModal(null);
      window.location.href = "/login";
    }, 1200);
  };

  return (
    <>
      {/* Floating 4-Tier Commercial Licensing & Deployment Bar */}
      <div className="fixed bottom-4 right-4 z-40 bg-[#0B1C30]/95 backdrop-blur-md border border-blue-900/50 rounded-2xl p-2 shadow-2xl flex items-center gap-1.5 animate-in slide-in-from-bottom-5 duration-300 select-none">
        <div className="px-3 py-1.5 flex items-center gap-2 border-r border-slate-800/80">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">Software Factory</span>
        </div>

        {/* 1. Enterprise Self-Host */}
        <button
          onClick={() => setActiveModal("self-host")}
          className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-emerald-400 hover:bg-emerald-950/30 border border-transparent hover:border-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
          title="Enterprise Self-Hosted / On-Premise ($4,999)"
        >
          <Server className="w-3.5 h-3.5 text-emerald-400" />
          <span>Self-Host</span>
        </button>

        {/* 2. White-Label Agency */}
        <button
          onClick={() => setActiveModal("white-label")}
          className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-blue-400 hover:bg-blue-950/30 border border-transparent hover:border-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
          title="White-Label Agency License ($12,999)"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>White-Label</span>
        </button>

        {/* 3. Perpetual Source Code IP */}
        <button
          onClick={() => setActiveModal("source-code")}
          className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-purple-400 hover:bg-purple-950/30 border border-transparent hover:border-purple-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
          title="Full Source Code & IP Ownership ($24,999)"
        >
          <Code className="w-3.5 h-3.5 text-purple-400" />
          <span>Source Code</span>
        </button>

        {/* 4. Managed SaaS Cloud */}
        <button
          onClick={() => setActiveModal("cloud-saas")}
          className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-amber-400 hover:bg-amber-950/30 border border-transparent hover:border-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
          title="Hosted Cloud SaaS Portal ($299/mo)"
        >
          <Cloud className="w-3.5 h-3.5 text-amber-400" />
          <span>Cloud SaaS</span>
        </button>
      </div>

      {/* 1. Self-Host Modal */}
      {activeModal === "self-host" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#071322] border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 space-y-5 text-left shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
                  <Server className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Enterprise Self-Host / On-Premise</h3>
                  <p className="text-xs text-slate-400 font-mono">Standard Valuation: $4,999 One-Time</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <p>Deploy OmniStock POS on your private cloud, local server, or Sari-Sari store hardware with 100% data sovereignty.</p>
              <div className="p-3 bg-[#050811] rounded-xl border border-slate-800 space-y-2 font-mono text-[11px]">
                <div className="text-emerald-400 font-semibold">Self-Host Provisioning Wizard:</div>
                <div>✓ 3-Step Database Sanitization (`purgeClientState`)</div>
                <div>✓ Offline Dexie IndexedDB Vault Engine</div>
                <div>✓ Custom Air-Gapped Network Configuration</div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={handleSelfHostPurge}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-2"
              >
                {purgeSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>State Purged! Redirecting...</span>
                  </>
                ) : (
                  <>
                    <Server className="w-4 h-4" />
                    <span>Purge Demo State & Provision Clean Instance</span>
                  </>
                )}
              </button>
              <button onClick={() => setActiveModal(null)} className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. White-Label Modal */}
      {activeModal === "white-label" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#071322] border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 space-y-5 text-left shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-950/60 border border-blue-500/30 text-blue-400">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">White-Label Agency License</h3>
                  <p className="text-xs text-slate-400 font-mono">Standard Valuation: $12,999 One-Time</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <p>Rebrand OmniStock under your agency name, logo, domain, and custom client pricing models.</p>
              <div className="p-3 bg-[#050811] rounded-xl border border-slate-800 space-y-2 font-mono text-[11px]">
                <div className="text-blue-400 font-semibold">White-Label Features:</div>
                <div>✓ Custom Domain CNAME DNS Validation</div>
                <div>✓ Brand Logo URL & Accent Color Customizer</div>
                <div>✓ Multi-Tenant Reseller Commission Engine</div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
              <button onClick={() => setActiveModal(null)} className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Source Code IP Modal */}
      {activeModal === "source-code" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#071322] border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 space-y-5 text-left shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-400">
                  <Code className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Full Source Code & IP Ownership</h3>
                  <p className="text-xs text-slate-400 font-mono">Standard Valuation: $24,999 One-Time</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <p>Own the complete perpetual source code IP, Git repository history, and custom build scripts.</p>
              <div className="p-3 bg-[#050811] rounded-xl border border-slate-800 space-y-2 font-mono text-[11px]">
                <div className="text-purple-400 font-semibold">IP Ownership Deliverables:</div>
                <div>✓ Complete GitHub Repository Transfer</div>
                <div>✓ 1-Click `docker-compose.yml` Deployment Suite</div>
                <div>✓ Commercial Unrestricted Source Code Rights</div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
              <button onClick={() => setActiveModal(null)} className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Cloud SaaS Modal */}
      {activeModal === "cloud-saas" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#071322] border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 space-y-5 text-left shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-500/30 text-amber-400">
                  <Cloud className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Hosted Cloud SaaS Tier</h3>
                  <p className="text-xs text-slate-400 font-mono">Standard Valuation: $299 / Month</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <p>Fully managed enterprise cloud hosting with automatic SSL, daily backups, and 99.99% SLA uptime.</p>
              <div className="p-3 bg-[#050811] rounded-xl border border-slate-800 space-y-2 font-mono text-[11px]">
                <div className="text-amber-400 font-semibold">Managed Cloud Inclusions:</div>
                <div>✓ Automated Cloud Backups & Real-Time Sync</div>
                <div>✓ 24/7 Enterprise Support SLA</div>
                <div>✓ Zero Maintenance Infrastructure</div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
              <button onClick={() => setActiveModal(null)} className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
