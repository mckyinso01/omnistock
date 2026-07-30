import { useState, useEffect } from "react";
import { entities } from "@/lib/db";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Plus, Pencil, Trash2, Send, Loader2 } from "lucide-react";
import ReportScheduleFormModal from "./ReportScheduleFormModal";
import { DESIGN_TOKENS } from "@/lib/designSystem";

const REPORT_LABELS = {
  sales: "Sales",
  cost_expenses: "Cost & Expenses",
  low_stock: "Low Stock",
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ReportScheduleList() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [testing, setTesting] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const list = await entities.ReportSchedule.list("-created_date", 200);
      setSchedules(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error("Could not load report schedules", e);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setShowModal(true); };
  const openEdit = (s) => { setEditing(s); setShowModal(true); };

  const save = async (form) => {
    if (editing?.id) {
      await entities.ReportSchedule.update(editing.id, form);
    } else {
      await entities.ReportSchedule.create(form);
    }
    setShowModal(false);
    load();
  };

  const remove = async (s) => {
    if (!confirm(`Delete schedule "${s.label || REPORT_LABELS[s.report_type]}"?`)) return;
    await entities.ReportSchedule.delete(s.id);
    load();
  };

  const test = async (s) => {
    setTesting(s.id);
    try {
      const res = await base44.functions.invoke("sendScheduledReports", { schedule_id: s.id });
      const data = res?.data || res || {};
      if (data?.error) {
        alert("Failed: " + data.error);
      } else {
        alert(`Sent ${data?.sent || 0} email(s) to ${s.recipient_email}.`);
      }
    } catch (e) {
      alert("Failed: " + (e?.message || "unknown error"));
    }
    setTesting(null);
  };

  const describeWhen = (s) => {
    if (s.frequency === "daily") return "Every day, 8 AM Manila";
    if (s.frequency === "weekly") return `Every ${WEEKDAYS[s.day_of_week] || "—"}, 8 AM Manila`;
    if (s.frequency === "monthly") return `On day ${s.day_of_month} of each month, 8 AM Manila`;
    return "—";
  };

  return (
    <Card className="water-breathing-card border border-slate-800/80 shadow-2xl bg-[#0B1C30]/90 text-white rounded-2xl app-card-hover">
      <CardHeader className="pb-3 border-b border-slate-800/80 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2.5 text-base font-bold text-white">
          <Mail className="w-4 h-4 text-cyan-400" />
          Email Report Schedules
        </CardTitle>
        <Button onClick={openNew} size="sm" className={DESIGN_TOKENS.buttons.glowingAction + " gap-2 text-xs font-bold px-4 py-2 cursor-pointer active:scale-95 transition-all"}>
          <Plus className="w-4 h-4" /> New Schedule
        </Button>
      </CardHeader>
      <CardContent className="space-y-1 pt-4">
        {loading ? (
          <p className="text-xs text-slate-400 font-mono">Loading schedules...</p>
        ) : schedules.length === 0 ? (
          <p className="text-xs text-slate-300 font-sans py-4 text-center bg-[#071322]/40 rounded-xl border border-slate-800/80">No report schedules yet. Click "New Schedule" to add one.</p>
        ) : (
          schedules.map(s => (
            <div key={s.id} className="flex items-center gap-3 py-3 border-b border-slate-800/80 last:border-0">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-white truncate">{s.label || REPORT_LABELS[s.report_type]}</span>
                  {!s.active && <Badge variant="secondary" className="bg-slate-800 text-slate-300 border-slate-700 text-xs">Inactive</Badge>}
                </div>
                <div className="text-xs text-slate-400 mt-0.5 truncate font-mono">
                  {REPORT_LABELS[s.report_type]} · {s.frequency} · {describeWhen(s)} · to {s.recipient_email}
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button size="icon" variant="ghost" onClick={() => test(s)} disabled={testing === s.id} title="Test send now" className="text-cyan-400 hover:text-cyan-300 hover:bg-slate-800">
                  {testing === s.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
                <Button size="icon" variant="ghost" onClick={() => openEdit(s)} title="Edit" className="text-slate-300 hover:text-white hover:bg-slate-800">
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => remove(s)} title="Delete" className="text-rose-400 hover:text-rose-300 hover:bg-slate-800">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
      {showModal && (
        <ReportScheduleFormModal schedule={editing} onSave={save} onClose={() => setShowModal(false)} />
      )}
    </Card>
  );
}