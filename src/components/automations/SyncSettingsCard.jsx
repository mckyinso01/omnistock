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
        sheet_tab_name: "Transaction Summaries",
        daily_enabled: false,
        weekly_enabled: false,
        monthly_enabled: false,
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

  const testSync = async (freq) => {
    setTesting(freq);
    setMsg(null);
    try {
      const res = await base44.functions.invoke("syncToSheets", { frequency: freq });
      const data = res.data || res;
      if (data?.error) {
        setMsg({ type: "error", text: data.error });
      } else {
        const r = (data?.results || [])[0] || {};
        const summary = r.error
          ? `${freq}: ${r.error}`
          : `${freq}: stored ${r.transactions ?? 0} txns, ₱${(r.total_sales ?? 0).toFixed(2)} sales, ₱${(r.gross_profit ?? 0).toFixed(2)} profit`;
        setMsg({ type: r.error ? "error" : "success", text: summary });
      }
    } catch (e) {
      setMsg({ type: "error", text: e.message || "Test failed." });
    }
    setTesting(null);
  };

  if (loading) return <p className="text-slate-400 text-sm">Loading sync settings...</p>;

  const frequencies = [
    { key: "daily_enabled", label: "Daily — covers previous day, runs at 11 PM Manila" },
    { key: "weekly_enabled", label: "Weekly — covers last 7 days, runs Monday 11 PM" },
    { key: "monthly_enabled", label: "Monthly — covers last month, runs on 1st at 11 PM" },
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
          <p className="text-sm font-medium text-slate-600">Frequencies to sync automatically:</p>
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
            {["daily", "weekly", "monthly"].map(f => (
              <Button key={f} variant="outline" onClick={() => testSync(f)} disabled={!!testing} className="gap-2 text-sm capitalize">
                {testing === f ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                Test {f}
              </Button>
            ))}
          </div>
        </div>
        {msg && (
          <div className={`flex items-start gap-2 text-xs ${msg.type === "success" ? "text-emerald-700" : "text-red-600"}`}>
            {msg.type === "success" ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> : <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />}
            <span>{msg.text}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}