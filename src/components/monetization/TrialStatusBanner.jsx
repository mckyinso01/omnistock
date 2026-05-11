import { Badge } from "@/components/ui/badge";
import { Zap, Briefcase, Clock, ChevronRight } from "lucide-react";

const PLAN_CONFIG = {
  basic_trial: { label: "Basic Trial", icon: Briefcase, color: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
  pro_trial:   { label: "Pro Trial",   icon: Zap,       color: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  basic:       { label: "Basic",       icon: Briefcase, color: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
  pro:         { label: "Pro",         icon: Zap,       color: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  free:        { label: "Free",        icon: Clock,     color: "bg-slate-100 text-slate-600", dot: "bg-slate-400" },
};

export default function TrialStatusBanner({ trialData, daysRemaining }) {
  if (!trialData) return null;

  const plan = trialData.plan || 'free';
  const config = PLAN_CONFIG[plan] || PLAN_CONFIG.free;
  const Icon = config.icon;
  const isTrial = plan.includes('trial');
  const hasPaused = trialData.paused_plan;

  return (
    <div className={`rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 ${
      plan === 'pro_trial' || plan === 'pro'
        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
        : plan === 'basic_trial' || plan === 'basic'
        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
        : 'bg-slate-100'
    }`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
        plan !== 'free' ? 'bg-white/20' : 'bg-slate-200'
      }`}>
        <Icon className={`w-5 h-5 ${plan !== 'free' ? 'text-white' : 'text-slate-500'}`} />
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={`font-bold text-base ${plan !== 'free' ? 'text-white' : 'text-slate-800'}`}>
            {config.label} {isTrial ? 'Active' : 'Plan'}
          </p>
          {isTrial && daysRemaining > 0 && (
            <Badge className="bg-white/20 text-white border-0 text-xs">
              {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left
            </Badge>
          )}
        </div>

        {isTrial && daysRemaining > 0 && (
          <div className="mt-1.5">
            <div className="w-full bg-white/20 rounded-full h-1.5">
              <div
                className="bg-white rounded-full h-1.5 transition-all"
                style={{ width: `${Math.min(100, (daysRemaining / (plan === 'pro_trial' ? 7 : 7)) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {hasPaused && (
          <p className={`text-xs mt-1 ${plan !== 'free' ? 'text-white/70' : 'text-slate-500'}`}>
            ⏸ {PLAN_CONFIG[hasPaused]?.label || hasPaused} paused — magre-resume after this trial
          </p>
        )}

        {plan === 'free' && (
          <p className="text-sm text-slate-500 mt-0.5">Walang active plan. Mag-upgrade para ma-unlock ang lahat ng features.</p>
        )}
      </div>

      {plan !== 'free' && (
        <ChevronRight className="w-5 h-5 text-white/60 shrink-0 hidden sm:block" />
      )}
    </div>
  );
}