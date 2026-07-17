import { useState, useEffect } from "react";
import { entities } from "@/lib/db";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table2, Save, Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function SyncSettingsCard() {
  const [setting, setSetting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(null);
  const [msg, setMsg] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const list = await entities.SyncSetting.list();
    if (list.length > 0) {
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
    setLoading(false);
  };

  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      if (setting.id) {
        await entities.SyncSetting.update(setting.id, setting);
      } else {
        await entities.SyncSetting.create(setting);
      }
      setMsg({ type: "success", text: "Sync settings saved." });
      await load();
    } catch (e) {
      setMsg({ type: "error", text: e.message || "Save failed." });
    }
    setSaving(false);
  };

  const syncNow = async () => {
    setTesting("now");
    setMsg(null);
    try {
      const res = await base44.functions.invoke("syncToSheets", { frequency: "now" });
      const data = res.data || res;
      if (data?.error) {
        setMsg({ type: "error", text: data.error });
      } else if ((data?.appended ?? 0) === 0) {
        setMsg({ type: "success", text: "Up to date — no new sales to push." });
      } else {
        setMsg({ type: "success", text: `Synced ${data.appended} new sale(s) to your sheet.` });
      }
      await load();
    } catch (e) {
      setMsg({ type: "error", text: e.message || "Sync failed." });
    }
    setTesting(null);
  };

  if (loading) return <p className="text-slate-400 text-sm">Loading sync settings...</p>;

  const frequencies = [
    { key: "daily_enabled", label: "Daily — run every night at 11 PM Manila time" },
    { key: "weekly_enabled", label: "Weekly — run every Monday at 11 PM" },
    { key: "monthly_enabled", label: "Monthly — run on the 1st at 11 PM" },
  ];

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-800">
          <Table2 className="w-4 h-4 text-emerald-600" />
          Google Sheets Sync
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-slate-600 bg-emerald-50 rounded-lg p-2.5 leading-relaxed">
          Each completed sale is pushed to your Google Sheet as its own row — Date, Transaction #, Items, Total, Profit, Payment method, and more. Set your sheet and schedule below.
        </p>
        <div className="space-y-1.5">
          <Label>Spreadsheet URL or ID</Label>
          <Input
            value={setting.spreadsheet_id || ""}
            onChange={e => setSetting({ ...setting, spreadsheet_id: e.target.value })}
            placeholder="https://docs.google.com/spreadsheets/d/..."
          />
          <p className="text-xs text-slate-400">Share the sheet with your connected Google account (Editor access).</p>
        </div>
        <div className="space-y-1.5">
          <Label>Sheet Tab Name</Label>
          <Input
            value={setting.sheet_tab_name || ""}
            onChange={e => setSetting({ ...setting, sheet_tab_name: e.target.value })}
            placeholder="Transaction Summaries"
          />
          <p className="text-xs text-slate-400">If the tab doesn't exist, we'll create it.</p>
        </div>
        <div className="space-y-2.5 py-2 border-y border-slate-100">
          <p className="text-sm font-medium text-slate-600">Run the per-sale sync automatically:</p>
          {frequencies.map(r => (
            <div key={r.key} className="flex items-center justify-between">
              <span className="text-sm text-slate-600">{r.label}</span>
              <Switch
                checked={!!setting[r.key]}
                onCheckedChange={v => setSetting({ ...setting, [r.key]: v })}
              />
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 justify-between items-center">
          <Button onClick={save} disabled={saving} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
            {saving ? "Saving..." : (<><Save className="w-4 h-4" /> Save</>)}
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={syncNow} disabled={!!testing} className="gap-2 text-sm bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
              {testing === "now" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
              Sync Now
            </Button>
          </div>
        </div>
        {msg && (
          <div className={`flex items-start gap-2 text-xs ${msg.type === "success" ? "text-emerald-700" : "text-red-600"}`}>
            {msg.type === "success" ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> : <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />}
            <span>{msg.text}</span>
          </div>
        )}
        {setting?.last_synced_at && !msg && (
          <p className="text-xs text-slate-400 flex items-center gap-1 pl-0.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Last synced {new Date(setting.last_synced_at).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" })}.
          </p>
        )}
      </CardContent>
    </Card>
  );
}