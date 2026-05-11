import { useTrialStatus } from "@/hooks/useTrialStatus";
import TrialStatusBanner from "@/components/monetization/TrialStatusBanner";
import ReferralCard from "@/components/monetization/ReferralCard";
import { Loader2 } from "lucide-react";

export default function Monetization() {
  const { trialData, loading, getDaysRemaining } = useTrialStatus();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Plans & Referrals</h1>
        <p className="text-sm text-slate-500 mt-0.5">Tingnan ang iyong plan at i-share ang StockMate sa iba.</p>
      </div>

      <TrialStatusBanner trialData={trialData} daysRemaining={getDaysRemaining()} />
      <ReferralCard trialData={trialData} />
    </div>
  );
}