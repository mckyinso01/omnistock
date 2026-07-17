import { useState, useEffect } from "react";
import { entities } from "@/lib/db";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Plus, Pencil, Trash2, Send, Loader2 } from "lucide-react";
import ReportScheduleFormModal from "./ReportScheduleFormModal";

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
    const list = await entities.ReportSchedule.list("-created_date", 200);
    setSchedules(list);
    setLoading(false);
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
      const data = res.data || res;
      if (data?.error) {
        alert("Failed: " + data.error);
      } else {
        alert(`Sent ${data?.sent || 0} email(s) to ${s.recipient_email}.`);
      }
    } catch (e) {
      alert("Failed: " + (e.message || "unknown error"));
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
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-800">
          <Mail className="w-4 h-4 text-emerald-600" />
          Email Report Schedules
        </CardTitle>
        <Button onClick={openNew} size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="w-4 h-4" /> New Schedule
        </Button>
      </CardHeader>
      <CardContent className="space-y-1">
        {loading ? (
          <p className="text-sm text-slate-400">Loading schedules...</p>
        ) : schedules.length === 0 ? (
          <p className="text-sm text-slate-400 py-2">No report schedules yet. Click "New Schedule" to add one.</p>
        ) : (
          schedules.map(s => (
            <div key={s.id} className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-slate-800 truncate">{s.label || REPORT_LABELS[s.report_type]}</span>
                  {!s.active && <Badge variant="secondary" className="text-xs">Inactive</Badge>}
                </div>
                <div className="text-xs text-slate-500 mt-0.5 truncate">
                  {REPORT_LABELS[s.report_type]} · {s.frequency} · {describeWhen(s)} · to {s.recipient_email}
                </div>
              </div>
              <div className="flex gap-0.5 shrink-0">
                <Button size="icon" variant="ghost" onClick={() => test(s)} disabled={testing === s.id} title="Test send now">
                  {testing === s.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 text-emerald-600" />}
                </Button>
                <Button size="icon" variant="ghost" onClick={() => openEdit(s)} title="Edit">
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => remove(s)} title="Delete">
                  <Trash2 className="w-4 h-4 text-red-500" />
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