import React, { useState } from "react";
import { Sparkles, XCircle, CheckCircle2 } from "lucide-react";

export default function EnterprisePriceComparisonMatrix() {
  const [headcount, setHeadcount] = useState(50);

  const competitorMonthlyCost = headcount * 18;
  const competitorAnnualCost = competitorMonthlyCost * 12;

  const emsMonthlyCost = 129;
  const emsAnnualCost = emsMonthlyCost * 12;

  const annualSavings = competitorAnnualCost - emsAnnualCost;
  const savingsPercent = ((annualSavings / competitorAnnualCost) * 100).toFixed(0);

  return (
    <div className="p-8 rounded-3xl bg-[#131316] border border-purple-500/30 space-y-8 relative overflow-hidden shadow-2xl my-8 text-slate-100">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20 inline-flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          Competitive ROI & Price Comparison Engine
        </span>
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
          Why Pay $800/Mo for Legacy ERPs When You Can Have OmniStock for $129?
        </h2>
        <p className="text-xs md:text-sm text-slate-400">
          Compare the cost of NetSuite/Katana ERP subscriptions and custom software development against our Turnkey OmniStock Solution.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300 uppercase font-mono">Select Warehouse Scale:</span>
          <span className="text-xl font-bold font-mono text-purple-400">{headcount} Locations/Users</span>
        </div>
        <input 
          type="range" 
          min="10" 
          max="500" 
          value={headcount} 
          onChange={(e) => setHeadcount(Number(e.target.value))}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Option A: Legacy ERP SaaS</span>
          <h3 className="text-lg font-bold text-slate-200">NetSuite / Katana ERP</h3>
          <div className="text-2xl font-extrabold font-mono text-rose-400">${competitorAnnualCost.toLocaleString()}/yr</div>
          <p className="text-xs text-slate-400">Expensive seat licenses + high maintenance fees.</p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Option B: Custom Dev Agency</span>
          <h3 className="text-lg font-bold text-slate-200">Agency Custom Build</h3>
          <div className="text-2xl font-extrabold font-mono text-amber-400">$70,000 - $130,000</div>
          <p className="text-xs text-slate-400">6-12 months delay + agency dev overhead.</p>
        </div>

        <div className="p-6 rounded-2xl bg-purple-950/40 border-2 border-purple-500 space-y-4 relative shadow-xl">
          <span className="text-[10px] font-mono text-purple-400 uppercase font-bold">Option C: Software Factory</span>
          <h3 className="text-lg font-bold text-white">OmniStock Solution</h3>
          <div className="text-2xl font-extrabold font-mono text-emerald-400">${emsAnnualCost.toLocaleString()}/yr</div>
          <div className="text-xs font-bold text-emerald-300">Save ${annualSavings.toLocaleString()} ({savingsPercent}% Savings/yr)!</div>
          <div className="text-[11px] text-purple-200">Flat $129/mo + 1-click $4,499 full IP buyout options.</div>
        </div>
      </div>
    </div>
  );
}
