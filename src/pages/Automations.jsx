import SyncSettingsCard from "@/components/automations/SyncSettingsCard";
import ReportScheduleList from "@/components/automations/ReportScheduleList";
import { Zap } from "lucide-react";
import { DESIGN_TOKENS } from "@/lib/designSystem";

export default function Automations() {
  return (
    <div className="p-4 md:p-6 space-y-6 max-w-2xl mx-auto min-h-screen bg-[#050811] text-white font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0B1C30]/80 p-5 rounded-2xl border border-slate-800/80 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_16px_rgba(0,229,255,0.25)] shrink-0">
            <Zap className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className={DESIGN_TOKENS.typography.h1 + " flex items-center gap-2"}>
              Automations & Integrations
            </h1>
            <p className={DESIGN_TOKENS.typography.muted + " mt-0.5"}>
              Push every completed sale to Google Sheets and schedule recurring email reports
            </p>
          </div>
        </div>
      </div>
      <SyncSettingsCard />
      <ReportScheduleList />
    </div>
  );
}