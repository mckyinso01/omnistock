import React, { useState } from "react";
import { ShieldCheck, Key, HardDrive, Trash2, Server, CheckCircle2, AlertTriangle, ArrowRight, Loader2, Lock } from "lucide-react";
import { purgeClientState } from "../../utils/purgeClientState";

export const SelfHostProvisioningModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [storeName, setStoreName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [stripeSecretKey, setStripeSecretKey] = useState("");

  if (!isOpen) return null;

  const handleExecuteSanitization = async () => {
    setLoading(true);
    try {
      // Wipes all IndexedDB POS stock, receipts, and local storage
      await purgeClientState();
      
      setSuccess(true);
      setStep(3);
    } catch (err) {
      alert(`Provisioning error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl max-w-xl w-full p-6 text-slate-100 shadow-2xl space-y-6 text-left relative overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Server className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">StockMate Self-Host Provisioning</h2>
              <p className="text-xs text-slate-400">On-Premise Deployment & Mock Data Sanitization</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm font-mono px-2 py-1 rounded bg-slate-950 border border-slate-800"
          >
            ESC
          </button>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
          <div className={`p-2 rounded-lg border ${step === 1 ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold" : "bg-slate-950 border-slate-800 text-slate-500"}`}>
            1. Purge Demo Stock
          </div>
          <div className={`p-2 rounded-lg border ${step === 2 ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold" : "bg-slate-950 border-slate-800 text-slate-500"}`}>
            2. Store Setup
          </div>
          <div className={`p-2 rounded-lg border ${step === 3 ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold" : "bg-slate-950 border-slate-800 text-slate-500"}`}>
            3. Clean Deploy
          </div>
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-amber-300">Demo Inventory Sanitization Notice</h3>
                <p className="text-xs text-amber-200/80 leading-relaxed">
                  Purging will remove all sample products, mock receipts, demo cashiers, and test transactions from your local browser IndexedDB database.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer shadow-lg shadow-emerald-600/30"
              >
                <span>Proceed to Store Setup</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Store / Business Name</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="My Retail Enterprise Store"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Owner Email</label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="owner@store.com"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Owner Password</label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Password123!"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs border border-slate-800 font-bold cursor-pointer"
              >
                Back
              </button>

              <button
                onClick={handleExecuteSanitization}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer shadow-lg shadow-emerald-600/30"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                <span>Sanitize & Deploy POS</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && success && (
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white">StockMate POS Initialized!</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                All sample product catalogs and demo transactions have been purged. Your clean store instance is ready.
              </p>
            </div>

            <button
              onClick={() => {
                onClose();
                window.location.href = "/inventory";
              }}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer shadow-lg shadow-emerald-600/30"
            >
              Open Clean StockMate Register
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
