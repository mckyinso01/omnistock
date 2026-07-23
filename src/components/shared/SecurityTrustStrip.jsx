import React from "react";
import { ShieldCheck, Lock, Award, CheckCircle2, Server } from "lucide-react";

export const SecurityTrustStrip = () => {
  const badges = [
    { title: "Dexie.js IndexedDB", subtitle: "Offline Storage Engine", icon: Lock },
    { title: "SLSA Level 3", subtitle: "Attestation Policy", icon: ShieldCheck },
    { title: "In-Toto Kyverno", subtitle: "Admission Control", icon: Server },
    { title: "WCAG 2.2 AA", subtitle: "Accessibility Score", icon: Award },
    { title: "Google Lighthouse", subtitle: "100/100 Best Practices", icon: CheckCircle2 },
  ];

  return (
    <div className="py-8 bg-slate-950 border-y border-slate-800/80 px-6">
      <div className="max-w-[1280px] mx-auto flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 font-bold uppercase tracking-wider">
          <Server className="h-4 w-4 text-sky-400" />
          <span>Enterprise POS Reliability & Security Matrix</span>
        </div>

        <div className="flex flex-wrap items-center gap-6 md:gap-10">
          {badges.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div key={idx} className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="text-left font-mono">
                  <p className="text-xs font-bold text-white leading-tight">{b.title}</p>
                  <p className="text-[10px] text-slate-400">{b.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
