import SyncSettingsCard from "@/components/automations/SyncSettingsCard";
import ReportScheduleList from "@/components/automations/ReportScheduleList";
import { Zap } from "lucide-react";

export default function Automations() {
  return (
    <div className="p-4 md:p-6 space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Automations</h1>
          <p className="text-sm text-slate-500">Sync transaction summaries to Google Sheets and schedule recurring email reports.</p>
        </div>
      </div>
      <SyncSettingsCard />
      <ReportScheduleList />
    </div>
  );
}