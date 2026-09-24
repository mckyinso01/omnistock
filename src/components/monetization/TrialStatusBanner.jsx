import { Badge } from "@/components/ui/badge";
import { Zap, Briefcase, Clock, ChevronRight } from "lucide-react";

const PLAN_CONFIG = {
  basic_trial: { label: "Basic Trial", icon: Briefcase, color: "bg-cyan-950/80 text-cyan-300 border border-cyan-500/50", dot: "bg-cyan-400" },
  pro_trial:   { label: "Pro Trial",   icon: Zap,       color: "bg-emerald-950/80 text-emerald-300 border border-emerald-500/50", dot: "bg-emerald-400" },
  basic:       { label: "Basic",       icon: Briefcase, color: "bg-cyan-950/80 text-cyan-300 border border-cyan-500/50", dot: "bg-cyan-400" },
  pro:         { label: "Pro",         icon: Zap,       color: "bg-emerald-950/80 text-emerald-300 border border-emerald-500/50", dot: "bg-emerald-400" },
  free:        { label: "Free",        icon: Clock,     color: "bg-slate-900/80 text-slate-300 border border-slate-700", dot: "bg-slate-400" },
};

export default function TrialStatusBanner({ trialData, daysRemaining }) {
  if (!trialData) return null;

  const plan = trialData.plan || 'free';
  const config = PLAN_CONFIG[plan] || PLAN_CONFIG.free;
  const Icon = config.icon;
  const isTrial = plan.includes('trial');
  const hasPaused = trialData.paused_plan || null;

  return (
    <div className={`rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 border border-slate-800 shadow-xl ${
      plan === 'pro_trial' || plan === 'pro'
        ? 'bg-gradient-to-r from-emerald-950/90 to-teal-950/90 text-white border-emerald-500/30'
        : plan === 'basic_trial' || plan === 'basic'
        ? 'bg-gradient-to-r from-cyan-950/90 to-blue-950/90 text-white border-cyan-500/30'
        : 'bg-[#0B1C30] text-white'
    }`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
        plan !== 'free' ? 'bg-[#0B1C30]/20 backdrop-blur-xs' : 'bg-[#071322] border border-slate-700'
      }`}>
        <Icon className={`w-5 h-5 ${plan !== 'free' ? 'text-white' : 'text-cyan-400'}`} />
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-bold text-base text-white">
            {config.label} {isTrial ? 'Active' : 'Plan'}
          </p>
          {isTrial && daysRemaining > 0 && (
            <Badge className="bg-[#0B1C30]/20 text-white border-0 text-xs font-mono">
              {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left
            </Badge>
          )}
        </div>

        {isTrial && daysRemaining > 0 && (
          <div className="mt-1.5">
            <div className="w-full bg-[#0B1C30]/20 rounded-full h-1.5">
              <div
                className="bg-[#0B1C30] rounded-full h-1.5 transition-all"
                style={{ width: `${Math.min(100, (daysRemaining / (plan === 'pro_trial' ? 7 : 7)) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {hasPaused && (
          <p className={`text-xs mt-1 ${plan !== 'free' ? 'text-white/80' : 'text-slate-300'}`}>
            ⏸ {PLAN_CONFIG[hasPaused]?.label || hasPaused} paused — resumes automatically after this trial
          </p>
        )}

        {plan === 'free' && (
          <p className="text-sm text-slate-300 mt-0.5">No active paid plan. Upgrade to unlock full enterprise features.</p>
        )}
      </div>

      {plan !== 'free' && (
        <ChevronRight className="w-5 h-5 text-white/60 shrink-0 hidden sm:block" />
      )}
    </div>
  );
}