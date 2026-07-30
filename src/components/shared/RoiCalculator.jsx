import React, { useState } from "react";
import { Calculator, TrendingUp, Clock, DollarSign, ArrowRight, Store } from "lucide-react";

export const RoiCalculator = () => {
  const [storeCount, setStoreCount] = useState(2);
  const [dailyTransactions, setDailyTransactions] = useState(120);

  // Calculations
  const checkoutTimeSavingsSecPerSale = 18; // 18 seconds saved per transaction
  const monthlyHoursSaved = Math.round((dailyTransactions * storeCount * checkoutTimeSavingsSecPerSale * 30) / 3600);
  const stockShrinkageReductionPhp = Math.round(storeCount * dailyTransactions * 12 * 30 * 0.08); // 8% shrinkage prevention
  const annualSavingsPhp = stockShrinkageReductionPhp * 12;

  return (
    <section id="roi-calculator" className="py-20 bg-slate-950 border-t border-slate-800/80 px-6 md:px-10 text-left text-slate-100">
      <div className="max-w-[1280px] mx-auto space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-mono font-semibold uppercase">
            <Calculator className="h-3.5 w-3.5" />
            <span>Retail Savings & Stock Shrinkage Calculator</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            How Much Time & Profit Will OmniStock Save Your Store?
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base">
            Eliminate manual inventory discrepancies, stock-outs, and long checkout lines across your retail branches.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Sliders Input Panel */}
          <div className="lg:col-span-7 p-8 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-8 shadow-xl">
            
            {/* Slider 1: Store Branches */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-slate-300">Number of Store Branches / Registers</span>
                <span className="font-mono text-sky-400 font-bold px-3 py-1 rounded bg-slate-950 border border-slate-800">
                  {storeCount} Branches
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                value={storeCount}
                onChange={(e) => setStoreCount(Number(e.target.value))}
                className="w-full accent-sky-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>1 Branch</span>
                <span>10 Branches</span>
                <span>20 Branches</span>
              </div>
            </div>

            {/* Slider 2: Daily Sales Transactions */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-slate-300">Average Daily Transactions per Branch</span>
                <span className="font-mono text-sky-400 font-bold px-3 py-1 rounded bg-slate-950 border border-slate-800">
                  {dailyTransactions} Transactions/day
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="500"
                step="10"
                value={dailyTransactions}
                onChange={(e) => setDailyTransactions(Number(e.target.value))}
                className="w-full accent-sky-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>20 Sales/day</span>
                <span>250 Sales/day</span>
                <span>500 Sales/day</span>
              </div>
            </div>
          </div>

          {/* Results Outcome Panel */}
          <div className="lg:col-span-5 p-8 rounded-2xl bg-gradient-to-b from-sky-950/40 via-slate-900 to-slate-950 border border-sky-500/40 space-y-8 shadow-2xl relative overflow-hidden">
            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-sky-400 font-bold">Store Productivity Yield</span>
              <h3 className="text-2xl font-black text-white">Your Retail Growth Impact</h3>
            </div>

            <div className="space-y-4 font-mono">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3 text-slate-300 text-xs">
                  <Clock className="h-5 w-5 text-sky-400" />
                  <span>Register Queue Time Saved</span>
                </div>
                <span className="text-xl font-bold text-sky-400">{monthlyHoursSaved} hrs/mo</span>
              </div>

              <div className="p-4 rounded-xl bg-sky-950/60 border border-sky-500/50 flex items-center justify-between">
                <div className="flex items-center gap-3 text-slate-200 text-xs">
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                  <span>Inventory Loss Protection / Mo</span>
                </div>
                <span className="text-2xl font-black text-emerald-400">+₱{stockShrinkageReductionPhp.toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 text-center space-y-3">
              <p className="text-xs text-slate-400 font-mono">Est. Annual Profit Saved: <span className="text-white font-bold">₱{annualSavingsPhp.toLocaleString()} PHP</span></p>
              <a
                href="#pricing"
                className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-lg shadow-sky-600/30"
              >
                <span>Deploy OmniStock Register</span>
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
