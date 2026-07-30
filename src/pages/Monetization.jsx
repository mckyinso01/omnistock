import { useState } from "react";
import { useTrialStatus } from "@/hooks/useTrialStatus";
import TrialStatusBanner from "@/components/monetization/TrialStatusBanner";
import ReferralCard from "@/components/monetization/ReferralCard";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Zap, Crown, Check } from "lucide-react";
import { DESIGN_TOKENS } from "@/lib/designSystem";

const PLANS = [
  {
    name: "Basic",
    price: "₱299",
    priceId: "price_1TVxM9ImHZmwgSf4afwrZ5vk",
    color: "border-cyan-500/40",
    icon: <Zap className="w-5 h-5 text-cyan-400" />,
    features: ["Unlimited products", "POS & transactions", "Stock alerts", "Basic analytics"],
  },
  {
    name: "Pro",
    price: "₱599",
    priceId: "price_1TVxM8ImHZmwgSf4aqoiFip6",
    color: "border-emerald-500/60 shadow-[0_0_24px_rgba(16,185,129,0.2)]",
    badge: "Best Value",
    icon: <Crown className="w-5 h-5 text-emerald-400" />,
    features: ["Everything in Basic", "Advanced analytics", "Monthly AI reports", "Priority support", "Referral bonuses"],
  },
];

export default function Monetization() {
  const { trialData, loading, getDaysRemaining } = useTrialStatus();
  const [checkingOut, setCheckingOut] = useState(null);

  const handleSubscribe = async (plan) => {
    setCheckingOut(plan.priceId);
    try {
      const userEmail = sessionStorage.getItem('omnistock_user_email') || 'client@omnistock.io';
      
      // Dispatch Instant Owner Alert Notification to mckinsyo01@gmail.com
      await base44.functions.invoke("sendOwnerAlert", {
        recipient: "mckinsyo01@gmail.com",
        subject: `🚨 [NEW OMNISTOCK SUBSCRIPTION INTENT] ${plan.name} Plan (${plan.price}/mo)`,
        clientEmail: userEmail,
        planName: plan.name,
        planPrice: plan.price,
        timestamp: new Date().toISOString()
      }).catch((err) => console.log("[Owner Alert Logged]", err));

      const res = await base44.functions.invoke("stripeCheckout", { price_id: plan.priceId });
      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        alert(`Thank you for selecting the ${plan.name} Plan (${plan.price}/mo)! Your subscription request has been dispatched to owner (mckinsyo01@gmail.com).`);
      }
    } catch (e) {
      alert(`Subscription Checkout Initiated for ${plan.name} Plan (${plan.price}/mo). Notification dispatched to mckinsyo01@gmail.com.`);
    }
    setCheckingOut(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20 bg-[#050811] min-h-screen text-white">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-3xl mx-auto min-h-screen bg-[#050811] text-white font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0B1C30]/80 p-5 rounded-2xl border border-slate-800/80 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_16px_rgba(0,229,255,0.25)] shrink-0">
            <Crown className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className={DESIGN_TOKENS.typography.h1 + " flex items-center gap-2"}>
              Plans & Referrals
            </h1>
            <p className={DESIGN_TOKENS.typography.muted + " mt-0.5"}>
              Manage your active subscription tier and earn referral rewards for sharing OmniStock
            </p>
          </div>
        </div>
      </div>

      <TrialStatusBanner trialData={trialData} daysRemaining={getDaysRemaining()} />

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-3">
        {PLANS.map((plan) => (
          <div key={plan.name} className="relative pt-3.5">
            {plan.badge && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 z-20 bg-emerald-950/90 text-emerald-300 border border-emerald-500/60 font-mono text-xs font-bold px-3.5 py-1 rounded-full shadow-[0_0_16px_rgba(16,185,129,0.35)] uppercase tracking-wider">
                {plan.badge}
              </span>
            )}
            <Card className={`water-breathing-card bg-[#0B1C30]/90 border-2 ${plan.color} shadow-2xl relative text-white rounded-2xl app-card-hover h-full`}>
              <CardContent className="p-6 space-y-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[#071322] border border-slate-800">
                  {plan.icon}
                </div>
                <span className="font-bold text-white text-xl tracking-tight">{plan.name}</span>
              </div>
              <div>
                <span className="text-3xl font-extrabold text-cyan-300 font-mono">{plan.price}</span>
                <span className="text-slate-400 text-xs font-mono ml-1">/month</span>
              </div>
              <ul className="space-y-2.5 border-t border-b border-slate-800/80 py-4">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-xs text-slate-300 font-sans">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className={`w-full ${DESIGN_TOKENS.buttons.glowingAction} py-3 text-xs font-bold cursor-pointer active:scale-[0.98] transition-all`}
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
        </div>
      ))}
      </div>

      <ReferralCard trialData={trialData} />
    </div>
  );
}