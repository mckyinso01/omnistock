import React, { useState } from "react";
import { Server, Sparkles, Code, Cloud, ShieldCheck, X, Check, DollarSign, FileText } from "lucide-react";

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

        {/* 0. System Specs & Features (specs.md) */}
        <button
          onClick={() => setActiveModal("specs")}
          className="px-3 py-1.5 rounded-xl text-xs font-medium text-cyan-300 hover:text-white bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/40 transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(0,229,255,0.2)]"
          title="Inspect Full System Architecture & Specifications (specs.md)"
        >
          <FileText className="w-3.5 h-3.5 text-cyan-400" />
          <span>System Specs</span>
        </button>

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
          className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-cyan-400 hover:bg-cyan-950/30 border border-transparent hover:border-cyan-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
          title="White-Label Agency License ($12,999)"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
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

      {/* 0. System Specs Modal */}
      {activeModal === "specs" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in select-text">
          <div className="bg-[#071322] border border-cyan-500/50 rounded-2xl max-w-3xl w-full max-h-[85vh] p-6 space-y-4 text-left shadow-[0_0_30px_rgba(0,229,255,0.25)] relative flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-400">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">OmniStock POS: System Architecture & Specifications</h3>
                  <p className="text-xs text-cyan-300 font-mono">Authoritative Document: omnistock/specs.md (v3.5.0-PROD)</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 text-xs text-slate-300 pr-2 font-sans leading-relaxed">
              <div className="p-3 bg-[#050811] rounded-xl border border-cyan-900/60 font-mono text-[11px] text-cyan-300 space-y-1">
                <div>⚡ System Architecture: React 18.3+ SPA + Dexie.js 4.0 Offline IndexedDB Engine</div>
                <div>🎨 UI Theme: Demon Slayer Midnight Electric Blue (#050811 / #0B1C30 / #2563EB / #00E5FF)</div>
                <div>🌐 Deployment URL: https://omnistock-pos.surge.sh | Showcase: https://gatzdevs.surge.sh</div>
              </div>

              <div>
                <h4 className="font-bold text-sm text-cyan-400 mb-2">🤖 5 Autonomous AI & Algorithmic Background Modules:</h4>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-200">
                  <li><strong>Module 1: Autonomous Stock Re-Ordering & Auto-PO Generator:</strong> Analyzes 7d/14d/30d sales velocity to calculate exact Re-Order Points (ROP) and auto-draft supplier Purchase Orders.</li>
                  <li><strong>Module 2: Autonomous Pilferage & Theft Detection AI Guard:</strong> Background scanner comparing theoretical recipe consumption against actual physical inventory to flag unauthorized loss.</li>
                  <li><strong>Module 3: Autonomous Self-Healing Offline Sync Engine (Dexie.js):</strong> Instant failover to local IndexedDB during network outages with zero-conflict background re-sync on reconnection.</li>
                  <li><strong>Module 4: Autonomous EOD Cashier Drawer Reconciliation Sentinel:</strong> Auto-computes expected drawer cash, flags overage/shortage, and locks historical shift ledgers.</li>
                  <li><strong>Module 5: Autonomous Multi-Tenant Provisioning & 3-Step Purge Engine:</strong> 3-Step automated database sanitization wizard for rapid enterprise tenant deployment.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-sm text-cyan-400 mb-2">📊 10 Flagship Enterprise Capabilities:</h4>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-200">
                  <li><strong>POS Register HUD:</strong> Sub-10ms UI, multi-payment tender (Cash, Card, GCash/Maya), touch grid.</li>
                  <li><strong>Recipe & Portion Control:</strong> Unit/ingredient level deduction (grams/ml) with per-serving COGS calculation.</li>
                  <li><strong>Multi-Timeframe Income Engine:</strong> Interactive Daily, 7-Day Weekly, 30-Day Monthly, and YTD Annual P&L rollups.</li>
                  <li><strong>Real-Time Stock & Expiry Alerts:</strong> Push banners, audio cues, and color-coded stock safety badges.</li>
                  <li><strong>Barcode Scanner HUD:</strong> Sub-10ms optical GTIN/EAN camera stream processing + USB HID listener.</li>
                  <li><strong>80mm Thermal Receipt Generator:</strong> Instant print preview with store branding, VAT breakdown, & QR code.</li>
                  <li><strong>100% Offline Dexie Register:</strong> Uninterrupted sales execution during internet outages.</li>
                  <li><strong>Multi-Tenant Staff RBAC & Audit Ledger:</strong> Cashier, Manager, Admin roles backed by immutable action logs.</li>
                  <li><strong>ASC 606 GAAP Revenue Dashboard:</strong> Gross margin reports, revenue recognition, inventory turnover.</li>
                  <li><strong>4-Tier Commercial Licensing:</strong> Cloud SaaS ($299/mo), Self-Hosted ($4,999), White-Label ($12,999), Source IP ($24,999).</li>
                </ul>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-400 font-mono">File Path: omnistock/specs.md</span>
              <button onClick={() => setActiveModal(null)} className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-[0_0_12px_rgba(0,229,255,0.4)]">
                Close Specifications
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
