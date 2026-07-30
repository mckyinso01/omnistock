import React, { useState } from "react";
import { Shield, Cpu, Database, Zap, CheckCircle2, Server, ShoppingBag, Barcode, Printer, HardDrive, Trash2, ArrowRight } from "lucide-react";
import { SelfHostProvisioningModal } from "./SelfHostProvisioningModal";

export const EnterpriseTechnicalSpecs = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const specCategories = [
    {
      title: "POS Core Engine & Offline Storage",
      icon: HardDrive,
      accent: "text-sky-400",
      bg: "bg-sky-500/10",
      border: "border-sky-500/20",
      specs: [
        { label: "Storage Architecture", value: "Dexie.js Offline IndexedDB + LocalStorage" },
        { label: "Barcode Scanning Speed", value: "Sub-10ms Camera & USB HID Decoding" },
        { label: "Receipt Printer Driver", value: "Native ESC/POS Thermal Printer Protocol" },
        { label: "Offline Resilience", value: "Auto-reconciles when connection resumes" }
      ]
    },
    {
      title: "Inventory Intelligence & Predictive Analytics",
      icon: Cpu,
      accent: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      specs: [
        { label: "Stock Triggers", value: "Automated Minimum Stock Threshold Alerts" },
        { label: "Reorder Algorithm", value: "Sales Velocity & Vendor Lead-Time Matching" },
        { label: "Batch Tracking", value: "FIFO & Expiration Date Auditing" },
        { label: "Multi-Branch Sync", value: "Background ServiceWorker Cloud PWA Sync" }
      ]
    },
    {
      title: "Integrations & API Gateways",
      icon: Server,
      accent: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      specs: [
        { label: "Payment Gateways", value: "Stripe Terminal, GCash & Cash Register SDK" },
        { label: "API Specification", value: "OpenAPI 3.1 & Schema.org JSON-LD" },
        { label: "AI Discovery", value: "Native llms.txt & llms-full.txt Specifications" },
        { label: "Hardware Support", value: "Plug & Play Barcode Scanners & Cash Drawers" }
      ]
    },
    {
      title: "Enterprise Governance & Security",
      icon: Shield,
      accent: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
      specs: [
        { label: "Attestation Policy", value: "In-Toto Kyverno Admission Control Gate" },
        { label: "Continuous Integration", value: "Automated GitHub Actions CI/CD Pipeline" },
        { label: "Deployment Strategy", value: "Argo Rollouts Blue-Green Canary Strategy" },
        { label: "Telemetry & Audit", value: "PostHog Session Replay & Cashier Audit Logs" }
      ]
    }
  ];

  return (
    <>
      <section id="specs" className="py-20 bg-slate-950 border-t border-slate-800/80 px-6 md:px-10 text-left text-slate-100">
        <div className="max-w-[1280px] mx-auto space-y-12">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-mono font-semibold uppercase">
              <Server className="h-3.5 w-3.5" />
              <span>OmniStock Technical Specifications</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              Built for High-Speed Retail & Multi-Branch Operations
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base">
              Complete technical benchmarks, hardware protocols, and offline reliability matrix for enterprise retail buyers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {specCategories.map((cat, idx) => (
              <div key={idx} className={`p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border ${cat.border} space-y-6 shadow-xl`}>
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${cat.bg} ${cat.accent}`}>
                    <cat.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white">{cat.title}</h3>
                </div>

                <div className="grid grid-cols-1 gap-3 border-t border-slate-800/60 pt-4">
                  {cat.specs.map((spec, specIdx) => (
                    <div key={specIdx} className="flex items-center justify-between py-2 border-b border-slate-800/40 text-xs font-mono">
                      <span className="text-slate-400 flex items-center gap-2">
                        <CheckCircle2 className={`h-3.5 w-3.5 ${cat.accent}`} />
                        {spec.label}
                      </span>
                      <span className="font-semibold text-slate-200 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Self Host Deployment Banner */}
          <div className="p-8 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-500/40 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-2 text-left">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[11px] font-mono font-bold uppercase">
                <Trash2 className="h-3.5 w-3.5" />
                <span>On-Premise OmniStock Sanitization Package</span>
              </div>
              <h3 className="text-2xl font-black text-white">Deploying OmniStock to your Retail Store?</h3>
              <p className="text-xs text-slate-300 max-w-xl">
                Purge sample inventory products, demo barcodes, and mock cashier accounts to start a 100% fresh store register.
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-lg shadow-emerald-600/40 shrink-0"
            >
              <span>Deploy Clean Self-Host Store</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <SelfHostProvisioningModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};
