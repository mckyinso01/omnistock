import { useState, useEffect } from "react";
import { entities } from "@/lib/db";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table2, Save, Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useApiToast } from "@/hooks/useApiToast";
import HelpTip from "@/components/ui/HelpTip";
import { DESIGN_TOKENS } from "@/lib/designSystem";

export default function SyncSettingsCard() {
  const [setting, setSetting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(null);
  const [msg, setMsg] = useState(null);
  const { toastSuccess, toastError } = useApiToast();

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const list = await entities.SyncSetting.list();
      if (Array.isArray(list) && list.length > 0) {
        setSetting(list[0]);
      } else {
        setSetting({
          spreadsheet_id: "",
          sheet_tab_name: "Transactions",
          daily_enabled: false,
          weekly_enabled: false,
          monthly_enabled: false,
          last_synced_at: null,
        });
      }
    } catch (e) {
      toastError(e, "Could not load sync settings");
      setSetting({
        spreadsheet_id: "",
        sheet_tab_name: "Transactions",
        daily_enabled: false,
        weekly_enabled: false,
        monthly_enabled: false,
        last_synced_at: null,
      });
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    if (!setting) return;
    setSaving(true);
    setMsg(null);
    try {
      if (setting.id) {
        await entities.SyncSetting.update(setting.id, setting);
      } else {
        await entities.SyncSetting.create(setting);
      }
      setMsg({ type: "success", text: "Sync settings saved." });
      toastSuccess("Settings saved", "Your Google Sheets sync settings are saved.");
      await load();
    } catch (e) {
      setMsg({ type: "error", text: e?.message || "Save failed." });
      toastError(e, "Save failed");
    }
    setSaving(false);
  };

  const syncNow = async () => {
    setTesting("now");
    setMsg(null);
    try {
      const res = await base44.functions.invoke("syncToSheets", { frequency: "now" });
      const data = res?.data || res || {};
      if (data?.error) {
        setMsg({ type: "error", text: data.error });
      } else if ((data?.appended ?? 0) === 0) {
        setMsg({ type: "success", text: "Up to date — no new sales to push." });
        toastSuccess("Up to date", "No new sales to push to your sheet.");
      } else {
        setMsg({ type: "success", text: `Synced ${data.appended} new sale(s) to your sheet.` });
        toastSuccess("Sync complete", `${data.appended} new sale(s) sent to Google Sheets.`);
      }
      await load();
    } catch (e) {
      setMsg({ type: "error", text: e?.message || "Sync failed." });
      toastError(e, "Sync failed");
    }
    setTesting(null);
  };

  if (loading) return <p className="text-slate-400 text-sm">Loading sync settings...</p>;
  if (!setting) return null;

  const frequencies = [
    { key: "daily_enabled", label: "Daily — run every night at 11 PM Manila time" },
    { key: "weekly_enabled", label: "Weekly — run every Monday at 11 PM" },
    { key: "monthly_enabled", label: "Monthly — run on the 1st at 11 PM" },
  ];

  return (
    <Card className="water-breathing-card border border-slate-800/80 shadow-2xl bg-[#0B1C30]/90 text-white rounded-2xl app-card-hover">
      <CardHeader className="pb-3 border-b border-slate-800/80">
        <CardTitle className="flex items-center gap-2.5 text-base font-bold text-white">
          <Table2 className="w-4 h-4 text-cyan-400" />
          Google Sheets Sync
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <p className="text-xs text-slate-300 bg-[#071322] border border-slate-800 rounded-xl p-3.5 leading-relaxed font-sans">
          Each completed sale is pushed to your Google Sheet as its own row — Date, Transaction #, Items, Total, Profit, Payment method, and more. Set your sheet and schedule below.
        </p>
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Spreadsheet URL or ID <HelpTip>Paste the full Google Sheets URL or just the ID part of the address.</HelpTip></Label>
          <Input
            className="bg-[#071322] border-slate-700/80 text-white font-mono text-xs placeholder:text-slate-500 rounded-xl"
            value={setting.spreadsheet_id || ""}
            onChange={e => setSetting({ ...setting, spreadsheet_id: e.target.value })}
            placeholder="https://docs.google.com/spreadsheets/d/..."
          />
          <p className="text-[11px] text-slate-400">Share the sheet with your connected Google account (Editor access).</p>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Sheet Tab Name</Label>
          <Input
            className="bg-[#071322] border-slate-700/80 text-white font-mono text-xs placeholder:text-slate-500 rounded-xl"
            value={setting.sheet_tab_name || ""}
            onChange={e => setSetting({ ...setting, sheet_tab_name: e.target.value })}
            placeholder="Transactions"
          />
          <p className="text-[11px] text-slate-400">If the tab doesn't exist, we'll create it.</p>
        </div>
        <div className="space-y-3 py-3.5 border-y border-slate-800/80">
          <p className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Run the per-sale sync automatically:</p>
          {frequencies.map(r => (
            <div key={r.key} className="flex items-center justify-between">
              <span className="text-xs text-slate-300 font-sans">{r.label}</span>
              <Switch
                checked={!!setting[r.key]}
                onCheckedChange={v => setSetting({ ...setting, [r.key]: v })}
              />
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2.5 justify-between items-center pt-2">
          <Button onClick={save} disabled={saving} className={DESIGN_TOKENS.buttons.glowingAction + " text-xs font-bold px-5 py-2.5 cursor-pointer active:scale-95 transition-all"}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (<><Save className="w-4 h-4" /> Save Settings</>)}
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={syncNow} disabled={!!testing} className={DESIGN_TOKENS.buttons.secondary + " gap-2 text-xs font-bold text-cyan-300 hover:text-cyan-200 border-cyan-500/30"}>
              {testing === "now" ? <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" /> : <Send className="w-3.5 h-3.5 text-cyan-400" />}
              Sync Now
            </Button>
          </div>
        </div>
        {msg && (
          <div className={`flex items-start gap-2 text-xs p-3 rounded-xl border ${msg.type === "success" ? "bg-emerald-950/60 border-emerald-700/60 text-emerald-300 font-mono" : "bg-rose-950/60 border-rose-700/60 text-rose-300 font-mono"}`}>
            {msg.type === "success" ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-400" /> : <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-400" />}
            <span>{msg.text}</span>
          </div>
        )}
        {setting?.last_synced_at && !msg && (
          <p className="text-[11px] text-slate-400 flex items-center gap-1.5 pl-0.5 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
            Last synced {new Date(setting.last_synced_at).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" })}.
          </p>
        )}
      </CardContent>
    </Card>
  );
}