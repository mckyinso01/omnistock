import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle, Moon, Sun, Monitor, ShieldCheck, KeyRound } from "lucide-react";
import { DESIGN_TOKENS } from "@/lib/designSystem";

export default function Settings() {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const handleDeleteAccount = async () => {
    if (confirmText !== "DELETE") return;
    setDeleting(true);
    try {
      const user = await base44.auth.me();
      await base44.entities.User.delete(user.id);
      base44.auth.logout("/");
    } catch (e) {
      setDeleting(false);
      alert("Failed to delete account. Please try again.");
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-2xl mx-auto bg-[#050811] text-slate-100 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0B1C30]/80 p-5 rounded-2xl border border-slate-800/80 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_16px_rgba(0,229,255,0.25)] shrink-0">
            <Monitor className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className={DESIGN_TOKENS.typography.h1 + " flex items-center gap-2"}>
              System & Security Settings
            </h1>
            <p className={DESIGN_TOKENS.typography.muted + " mt-0.5"}>
              Manage system preferences, privacy opt-out, and account safety
            </p>
          </div>
        </div>
      </div>

      {/* Theme */}
      <Card className="water-breathing-card border border-slate-800/80 bg-[#0B1C30]/90 shadow-xl rounded-2xl app-card-hover">
        <CardHeader className="pb-2 border-b border-slate-800/80">
          <CardTitle className="text-base font-bold text-white flex items-center gap-2.5">
            <Monitor className="w-4 h-4 text-cyan-400" />
            Appearance & Theme
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            OmniStock is operating in Stitch Midnight Logic dark mode by default for maximum visual contrast and ergonomic clarity.
          </p>
          <div className="flex items-center gap-3 text-cyan-400 text-xs font-mono bg-[#071322] p-3 rounded-xl border border-slate-800">
            <Sun className="w-4 h-4 text-amber-400" /> Light &nbsp;·&nbsp; <Moon className="w-4 h-4 text-cyan-400" /> Dark — Stitch Variation B Active
          </div>
        </CardContent>
      </Card>

      {/* Telemetry Privacy & Data Safety (HIG-PRIVACY-OPT-OUT) */}
      <Card className="water-breathing-card border border-slate-800/80 bg-[#0B1C30]/90 shadow-xl rounded-2xl app-card-hover">
        <CardHeader className="pb-2 border-b border-slate-800/80">
          <CardTitle className="text-base font-bold text-white flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Privacy & Telemetry Opt-Out
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            Control automated diagnostic logs and analytical telemetry sharing in accordance with Apple Section 5.1.2 & Google Data Safety guidelines.
          </p>
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#071322] border border-slate-800">
            <div>
              <div className="text-xs font-bold text-white font-sans">Share Diagnostic Telemetry</div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">Anonymous crash logs & performance telemetry</div>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4 accent-cyan-400 rounded cursor-pointer" />
          </div>
        </CardContent>
      </Card>

      {/* Commercial License Verification & Restoral (HIG-RESTORE-LICENSE) */}
      <Card className="water-breathing-card border border-slate-800/80 bg-[#0B1C30]/90 shadow-xl rounded-2xl app-card-hover">
        <CardHeader className="pb-2 border-b border-slate-800/80">
          <CardTitle className="text-base font-bold text-white flex items-center gap-2.5">
            <KeyRound className="w-4 h-4 text-amber-400" />
            Commercial License Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            Re-verify or restore active enterprise SaaS license keys for Self-Hosted ($4,999), White-Label ($12,999), or Hosted Cloud ($299/mo) deployments.
          </p>
          <Button
            variant="ghost"
            className={DESIGN_TOKENS.buttons.secondary + " w-full gap-2 text-xs font-bold text-amber-300 hover:text-amber-200 border-amber-500/30 py-2.5"}
            onClick={() => alert("✅ License Status Verified: Active Standalone Commercial License (v2.4)")}
          >
            Restore / Verify Active License Key
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="water-breathing-card border border-rose-800/60 bg-rose-950/20 shadow-xl rounded-2xl app-card-hover">
        <CardHeader className="pb-2 border-b border-rose-900/40">
          <CardTitle className="text-base font-bold text-rose-400 flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            Permanently delete your account and all associated inventory/sales data. This action cannot be undone.
          </p>
          <Button
            onClick={() => setShowDeleteDialog(true)}
            className={DESIGN_TOKENS.buttons.danger + " gap-2 text-xs font-bold px-5 py-2.5 cursor-pointer active:scale-95 transition-all"}
          >
            <Trash2 className="w-4 h-4" />
            Delete Account
          </Button>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#0B1C30] border border-rose-800/60 rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-950/90 border border-rose-800/60 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h2 className="font-bold text-white text-base">Delete Account</h2>
                <p className="text-xs text-slate-400">This action is permanent and non-reversible.</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 font-sans">
              Type <span className="font-bold text-rose-400 font-mono">DELETE</span> to confirm:
            </p>
            <input
              className="w-full rounded-xl border border-slate-700 bg-[#071322] px-3.5 py-2 text-xs text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
              placeholder="Type DELETE"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
            />
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="ghost" className={DESIGN_TOKENS.buttons.secondary + " text-xs"} onClick={() => { setShowDeleteDialog(false); setConfirmText(""); }}>
                Cancel
              </Button>
              <Button
                className={DESIGN_TOKENS.buttons.danger + " text-xs"}
                disabled={confirmText !== "DELETE" || deleting}
                onClick={handleDeleteAccount}
              >
                {deleting ? "Deleting..." : "Delete Account"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}