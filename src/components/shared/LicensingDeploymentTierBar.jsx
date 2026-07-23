import React, { useState } from "react";
import { Server, Tag, Code, Zap, ArrowRight, ShieldCheck } from "lucide-react";
import { SelfHostProvisioningModal } from "./SelfHostProvisioningModal";
import { WhiteLabelCustomizerModal } from "./WhiteLabelCustomizerModal";
import { SourceCodeLicenseModal } from "./SourceCodeLicenseModal";

export const LicensingDeploymentTierBar = ({ appName = "StockMate POS", onSelectHostedCloud }) => {
  const [activeModal, setActiveModal] = useState("none");

  const tiers = [
    {
      id: "selfhost",
      title: "Enterprise Self-Hosted",
      subtitle: "On-Premise / Local Retail Server",
      icon: Server,
      accent: "text-amber-400",
      border: "hover:border-amber-500/50",
      bg: "bg-amber-500/10",
      description: "Deploy on store local servers or private cloud. Sub-1ms SQLite ACID transactions with automated 1-click state purge engine.",
      badge: "Air-Gapped Ready",
      actionLabel: "Configure Self-Host",
      onAction: () => setActiveModal("selfhost")
    },
    {
      id: "whitelabel",
      title: "White-Label Agency License",
      subtitle: "Multi-Store Rebranding",
      icon: Tag,
      accent: "text-purple-400",
      border: "hover:border-purple-500/50",
      bg: "bg-purple-500/10",
      description: "Rebrand StockMate under your company logo, custom color palette, custom domain (CNAME), and merchant portal.",
      badge: "Custom Domain CNAME",
      actionLabel: "White-Label Setup",
      onAction: () => setActiveModal("whitelabel")
    },
    {
      id: "sourcecode",
      title: "Perpetual Source Code",
      subtitle: "Full IP Ownership License",
      icon: Code,
      accent: "text-emerald-400",
      border: "hover:border-emerald-500/50",
      bg: "bg-emerald-500/10",
      description: "Complete Git repository access, React/Vite source code, POS receipt printer engine, Docker Compose & lifetime updates.",
      badge: "Full IP Ownership",
      actionLabel: "View Code License",
      onAction: () => setActiveModal("sourcecode")
    },
    {
      id: "cloud",
      title: "Hosted Cloud SaaS",
      subtitle: "Instant Cloud POS Portal",
      icon: Zap,
      accent: "text-blue-400",
      border: "hover:border-blue-500/50",
      bg: "bg-blue-500/10",
      description: "Managed 99.99% uptime cloud instance with automatic inventory sync, multi-branch analytics, and zero server maintenance.",
      badge: "99.99% Uptime",
      actionLabel: "Launch Cloud Portal",
      onAction: () => {
        if (onSelectHostedCloud) onSelectHostedCloud();
        else alert(`Launching ${appName} Managed Cloud Workspace!`);
      }
    }
  ];

  return (
    <div className="py-8 px-4 max-w-7xl mx-auto text-left text-slate-100">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Flexible Enterprise Deployment Tiers</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Choose How You Deploy {appName}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto mt-1">
          Select the exact licensing model that fits your retail deployment, on-premise infrastructure, or multi-store rebranding needs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {tiers.map((tier) => {
          const IconComp = tier.icon;
          return (
            <div
              key={tier.id}
              className={`p-5 rounded-2xl bg-slate-900/80 border border-slate-800 ${tier.border} backdrop-blur-md transition-all duration-300 shadow-xl flex flex-col justify-between group`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl ${tier.bg} ${tier.accent}`}>
                    <IconComp className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-slate-400">
                    {tier.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-100 group-hover:text-white transition">
                  {tier.title}
                </h3>
                <p className="text-[11px] font-mono text-slate-400 mb-2">{tier.subtitle}</p>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">{tier.description}</p>
              </div>

              <button
                onClick={tier.onAction}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition group-hover:border-slate-700 cursor-pointer"
              >
                <span>{tier.actionLabel}</span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      <SelfHostProvisioningModal
        isOpen={activeModal === "selfhost"}
        onClose={() => setActiveModal("none")}
      />
      <WhiteLabelCustomizerModal
        isOpen={activeModal === "whitelabel"}
        onClose={() => setActiveModal("none")}
        appName={appName}
      />
      <SourceCodeLicenseModal
        isOpen={activeModal === "sourcecode"}
        onClose={() => setActiveModal("none")}
        appName={appName}
      />
    </div>
  );
};
