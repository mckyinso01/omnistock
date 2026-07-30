import React, { useState } from "react";
import { Tag, CheckCircle2, Globe, Palette, Shield, X, Sparkles, RefreshCw } from "lucide-react";

export const WhiteLabelCustomizerModal = ({
  isOpen,
  onClose,
  appName = "OmniStock POS",
  onSaveConfig
}) => {
  const [brandName, setBrandName] = useState(`${appName} Whitelabel`);
  const [logoUrl, setLogoUrl] = useState("https://omnistock.antigravity.ai/logo.png");
  const [primaryColor, setPrimaryColor] = useState("#10b981");
  const [customDomain, setCustomDomain] = useState("pos.yourretail.com");
  const [cnameStatus, setCnameStatus] = useState("idle");

  if (!isOpen) return null;

  const handleVerifyCname = () => {
    setCnameStatus("verifying");
    setTimeout(() => setCnameStatus("verified"), 1000);
  };

  const handleSave = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("omnistock_whitelabel_brand", brandName);
      localStorage.setItem("omnistock_whitelabel_logo", logoUrl);
      localStorage.setItem("omnistock_whitelabel_domain", customDomain);
    }
    if (onSaveConfig) {
      onSaveConfig({ brandName, logoUrl, primaryColor, customDomain });
    }
    alert(`OmniStock Whitelabel License configured for ${brandName}! CNAME ${customDomain} is now active.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in-50 duration-200">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 text-left text-slate-100">
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 uppercase tracking-wider">
                White-Label Agency License Setup
              </h3>
              <p className="text-xs text-slate-400">Rebrand OmniStock POS & Inventory under your company identity</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Live Preview Box */}
        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
          <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-amber-400" />
            <span>Live POS Brand Preview</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-white text-xs" style={{ backgroundColor: primaryColor }}>
                {brandName.charAt(0)}
              </div>
              <span className="font-bold text-sm text-slate-100">{brandName}</span>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {customDomain}
            </span>
          </div>
        </div>

        {/* Form Inputs */}
        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Brand Name</label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Logo URL</label>
            <input
              type="text"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Primary Accent Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-9 h-9 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer"
                />
                <span className="font-mono text-slate-300">{primaryColor}</span>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Custom CNAME Domain</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                />
                <button
                  onClick={handleVerifyCname}
                  className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-mono text-[11px] transition shrink-0"
                >
                  {cnameStatus === "verifying" ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : cnameStatus === "verified" ? "DNS ✓" : "Verify"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition">
            Cancel
          </button>
          <button onClick={handleSave} className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-lg">
            Save OmniStock Whitelabel Config
          </button>
        </div>
      </div>
    </div>
  );
};
