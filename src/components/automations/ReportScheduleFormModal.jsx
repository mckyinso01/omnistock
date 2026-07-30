import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { X } from "lucide-react";

const REPORT_TYPES = [
  { value: "sales", label: "Sales Report" },
  { value: "cost_expenses", label: "Cost & Expenses Report" },
  { value: "low_stock", label: "Low Stock Report" },
];

const FREQUENCIES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function ReportScheduleFormModal({ schedule, onSave, onClose }) {
  const [form, setForm] = useState({
    label: "",
    report_type: "sales",
    frequency: "daily",
    day_of_week: 1,
    day_of_month: 1,
    recipient_email: "",
    active: true,
  });

  useEffect(() => {
    try {
      if (schedule) {
        setForm({
          label: schedule.label || "",
          report_type: schedule.report_type || "sales",
          frequency: schedule.frequency || "daily",
          day_of_week: schedule.day_of_week ?? 1,
          day_of_month: schedule.day_of_month ?? 1,
          recipient_email: schedule.recipient_email || "",
          active: schedule.active !== false,
        });
      }
    } catch (err) {
      console.error("ReportScheduleFormModal useEffect exception:", err);
    }
  }, [schedule]);

  const save = () => {
    if (!form.recipient_email.trim()) return alert("Recipient email is required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.recipient_email.trim())) return alert("Enter a valid email.");
    onSave({
      ...form,
      recipient_email: form.recipient_email.trim(),
      day_of_week: form.frequency === "weekly" ? Number(form.day_of_week) : null,
      day_of_month: form.frequency === "monthly" ? Number(form.day_of_month) : null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0B1C30] border border-slate-800 rounded-2xl shadow-2xl w-full max-w-md text-white">
        <div className="sticky top-0 bg-[#0B1C30] border-b border-slate-800 px-5 py-3 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="font-bold text-white">{schedule ? "Edit Schedule" : "New Schedule"}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="space-y-1.5">
            <Label className="text-slate-300">Label (optional)</Label>
            <Input className="bg-[#071322] border-slate-700 text-white font-mono placeholder:text-slate-500" value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} placeholder="e.g., Daily Sales to Owner" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-300">Report Type</Label>
            <Select value={form.report_type} onValueChange={v => setForm({ ...form, report_type: v })}>
              <SelectTrigger className="bg-[#071322] border-slate-700 text-white font-mono"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[#071322] border-slate-700 text-white">
                {REPORT_TYPES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-300">Frequency</Label>
            <Select value={form.frequency} onValueChange={v => setForm({ ...form, frequency: v })}>
              <SelectTrigger className="bg-[#071322] border-slate-700 text-white font-mono"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[#071322] border-slate-700 text-white">
                {FREQUENCIES.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {form.frequency === "weekly" && (
            <div className="space-y-1.5">
              <Label className="text-slate-300">Day of Week</Label>
              <Select value={String(form.day_of_week)} onValueChange={v => setForm({ ...form, day_of_week: parseInt(v) })}>
                <SelectTrigger className="bg-[#071322] border-slate-700 text-white font-mono"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#071322] border-slate-700 text-white">
                  {WEEKDAYS.map((d, i) => <SelectItem key={i} value={String(i)}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          {form.frequency === "monthly" && (
            <div className="space-y-1.5">
              <Label className="text-slate-300">Day of Month (1–28)</Label>
              <Input
                type="number"
                min="1"
                max="28"
                className="bg-[#071322] border-slate-700 text-white font-mono"
                value={form.day_of_month}
                onChange={e => setForm({ ...form, day_of_month: parseInt(e.target.value) || 1 })}
              />
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="text-slate-300">Recipient Email</Label>
            <Input type="email" className="bg-[#071322] border-slate-700 text-white font-mono placeholder:text-slate-500" value={form.recipient_email} onChange={e => setForm({ ...form, recipient_email: e.target.value })} placeholder="owner@example.com" />
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-sm text-slate-300">Active</span>
            <Switch checked={form.active} onCheckedChange={v => setForm({ ...form, active: v })} />
          </div>
        </div>
        <div className="sticky bottom-0 bg-[#0B1C30] border-t border-slate-800 px-5 py-3 flex gap-2 justify-end rounded-b-2xl z-10">
          <Button variant="outline" onClick={onClose} className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">Cancel</Button>
          <Button onClick={save} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-md">
            {schedule ? "Save" : "Create"}
          </Button>
        </div>
      </div>
    </div>
  );
}