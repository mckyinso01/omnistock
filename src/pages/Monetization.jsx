import { useState } from "react";
import { Check, Zap, Building2, Briefcase, Gift, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const plans = [
  {
    id: "free",
    name: "Free",
    icon: Gift,
    color: "text-slate-500",
    bg: "bg-slate-50",
    border: "border-slate-200",
    monthlyPrice: 0,
    description: "Para ma-try bago bumili",
    features: [
      "Up to 50 items",
      "Basic inventory only",
      "1 user",
    ],
    limitations: [
      "No POS",
      "No analytics",
      "No barcode",
    ],
    cta: "Get Started Free",
    ctaClass: "bg-slate-800 hover:bg-slate-700 text-white",
  },
  {
    id: "basic",
    name: "Basic",
    icon: Briefcase,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    monthlyPrice: 299,
    description: "Para sa maliit na tindahan",
    features: [
      "Up to 500 items",
      "Full POS system",
      "Barcode generation",
      "1 user (owner only)",
      "Basic reports",
    ],
    cta: "Start Basic",
    ctaClass: "bg-blue-600 hover:bg-blue-700 text-white",
  },
  {
    id: "pro",
    name: "Pro",
    icon: Zap,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-400",
    monthlyPrice: 799,
    description: "Sweet spot — para sa lumalaking negosyo",
    badge: "Most Popular",
    features: [
      "Unlimited items",
      "Full POS + payments + analytics",
      "Up to 3 users (cashier + admin)",
      "OCR catalogue import",
      "Smart pricing engine",
      "Sales forecasting",
      "Priority email support",
    ],
    cta: "Start Pro",
    ctaClass: "bg-emerald-600 hover:bg-emerald-700 text-white",
    highlighted: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    icon: Building2,
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-200",
    monthlyPrice: 1999,
    description: "Para sa malalaking operasyon",
    features: [
      "Everything in Pro",
      "Multi-branch support",
      "Supplier management",
      "Unlimited users",
      "Advanced analytics",
      "Dedicated account manager",
      "Priority support (24/7)",
    ],
    cta: "Contact Sales",
    ctaClass: "bg-violet-600 hover:bg-violet-700 text-white",
  },
];

export default function Monetization() {
  const [annual, setAnnual] = useState(false);

  const getPrice = (monthly) => {
    if (monthly === 0) return 0;
    return annual ? Math.round(monthly * 12 * 0.8) : monthly;
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold text-slate-800">Plans & Pricing</h1>
        <p className="text-slate-500 text-base">Simulan nang libre. Mag-upgrade kapag handa ka na.</p>

        {/* Billing Toggle */}
        <div className="inline-flex items-center gap-3 bg-slate-100 rounded-full p-1 mt-2">
          <button
            onClick={() => setAnnual(false)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${!annual ? "bg-white shadow text-slate-800" : "text-slate-500"}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${annual ? "bg-white shadow text-slate-800" : "text-slate-500"}`}
          >
            Annual
            <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs px-1.5 py-0">-20%</Badge>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const price = getPrice(plan.monthlyPrice);
          return (
            <Card
              key={plan.id}
              className={`relative border-2 flex flex-col ${plan.border} ${plan.highlighted ? "shadow-xl scale-[1.02]" : "shadow-sm"}`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-0 right-0 flex justify-center">
                  <Badge className="bg-emerald-600 text-white border-0 px-3 py-0.5 flex items-center gap-1">
                    <Star className="w-3 h-3" /> {plan.badge}
                  </Badge>
                </div>
              )}
              <CardHeader className="pb-3 pt-6">
                <div className={`w-10 h-10 rounded-xl ${plan.bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${plan.color}`} />
                </div>
                <h2 className="text-lg font-bold text-slate-800">{plan.name}</h2>
                <p className="text-xs text-slate-500">{plan.description}</p>
                <div className="mt-3">
                  {plan.monthlyPrice === 0 ? (
                    <span className="text-3xl font-extrabold text-slate-800">Free</span>
                  ) : (
                    <div>
                      <span className="text-3xl font-extrabold text-slate-800">
                        ₱{price.toLocaleString()}
                      </span>
                      <span className="text-sm text-slate-400 ml-1">
                        /{annual ? "year" : "mo"}
                      </span>
                      {annual && (
                        <p className="text-xs text-emerald-600 mt-0.5">
                          ₱{plan.monthlyPrice * 12 * 0.8 / 12 | 0}/mo billed annually
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 gap-4 pt-0">
                <ul className="space-y-2 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                      <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                  {plan.limitations?.map((l) => (
                    <li key={l} className="flex items-start gap-2 text-sm text-slate-400 line-through">
                      <span className="w-4 h-4 mt-0.5 shrink-0 text-center">✕</span>
                      {l}
                    </li>
                  ))}
                </ul>
                <Button className={`w-full ${plan.ctaClass}`}>
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Transaction Fee Note */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
        <p className="text-sm text-amber-800 font-medium">
          💳 Digital payments (GCash, Maya, Card) — <span className="font-bold">0.5%–1% per transaction fee</span> applies on Basic & above.
        </p>
      </div>

      {/* Revenue Projector */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-white">
        <CardContent className="p-6">
          <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-500" />
            Revenue Potential
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "100 Pro subscribers", value: "₱79,900/mo", sub: "₱958,800/year", color: "text-emerald-600" },
              { label: "50 Enterprise subs", value: "₱99,950/mo", sub: "₱1,199,400/year", color: "text-violet-600" },
              { label: "500 Basic subs", value: "₱149,500/mo", sub: "₱1,794,000/year", color: "text-blue-600" },
            ].map(item => (
              <div key={item.label} className="bg-white rounded-xl p-4 shadow-sm text-center">
                <p className="text-xs text-slate-500 mb-1">{item.label}</p>
                <p className={`text-2xl font-extrabold ${item.color}`}>{item.value}</p>
                <p className="text-xs text-slate-400">{item.sub}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}