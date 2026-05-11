import { useState } from "react";
import { useTrialStatus } from "@/hooks/useTrialStatus";
import TrialStatusBanner from "@/components/monetization/TrialStatusBanner";
import ReferralCard from "@/components/monetization/ReferralCard";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Zap, Crown, Check } from "lucide-react";

const PLANS = [
  {
    name: "Basic",
    price: "₱299",
    priceId: "price_1TVxM9ImHZmwgSf4afwrZ5vk",
    color: "border-blue-200",
    icon: <Zap className="w-5 h-5 text-blue-500" />,
    features: ["Unlimited products", "POS & transactions", "Stock alerts", "Basic analytics"],
  },
  {
    name: "Pro",
    price: "₱599",
    priceId: "price_1TVxM8ImHZmwgSf4aqoiFip6",
    color: "border-emerald-400",
    badge: "Best Value",
    icon: <Crown className="w-5 h-5 text-emerald-600" />,
    features: ["Everything in Basic", "Advanced analytics", "Monthly AI reports", "Priority support", "Referral bonuses"],
  },
];

export default function Monetization() {
  const { trialData, loading, getDaysRemaining } = useTrialStatus();
  const [checkingOut, setCheckingOut] = useState(null);

  const handleSubscribe = async (plan) => {
    const isIframe = window.self !== window.top;
    if (isIframe) {
      alert("Subscription checkout only works from the published app. Please open the app directly.");
      return;
    }
    setCheckingOut(plan.priceId);
    try {
      const res = await base44.functions.invoke("stripeCheckout", { price_id: plan.priceId });
      if (res.data?.url) window.location.href = res.data.url;
    } catch (e) {
      alert("Failed to start checkout. Please try again.");
    }
    setCheckingOut(null);
  };

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

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PLANS.map((plan) => (
          <Card key={plan.name} className={`border-2 ${plan.color} shadow-sm relative`}>
            {plan.badge && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                {plan.badge}
              </span>
            )}
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                {plan.icon}
                <span className="font-bold text-slate-800 text-lg">{plan.name}</span>
              </div>
              <div>
                <span className="text-3xl font-extrabold text-slate-800">{plan.price}</span>
                <span className="text-slate-400 text-sm">/mo</span>
              </div>
              <ul className="space-y-1.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => handleSubscribe(plan)}
                disabled={checkingOut === plan.priceId}
              >
                {checkingOut === plan.priceId ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                ) : (
                  `Subscribe to ${plan.name}`
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <ReferralCard trialData={trialData} />
    </div>
  );
}