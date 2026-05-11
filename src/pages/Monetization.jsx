import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Crown, Zap, Star, Check, TrendingUp, MessageSquare,
  FileText, Users, Package, BarChart2, CreditCard
} from "lucide-react";

const plans = [
  {
    name: "Free",
    price: 0,
    description: "Para sa mga baguhan",
    color: "border-slate-200",
    badge: "bg-slate-100 text-slate-600",
    icon: Package,
    features: [
      "Up to 50 products",
      "Up to 100 transactions/month",
      "Basic POS",
      "1 user account",
      "Basic reports (CSV export)",
    ],
    unavailable: ["Advanced Analytics", "Sales Forecast", "Multi-user", "SMS Marketing", "Priority Support"],
  },
  {
    name: "Standard",
    price: 299,
    description: "Para sa lumalaking negosyo",
    color: "border-blue-400",
    badge: "bg-blue-100 text-blue-700",
    icon: Zap,
    popular: false,
    features: [
      "Up to 500 products",
      "Unlimited transactions",
      "Full POS features",
      "Up to 3 user accounts",
      "Advanced Analytics & Reports",
      "Sales Forecast",
      "Inventory Alerts",
      "Purchase Orders",
    ],
    unavailable: ["SMS Marketing", "Priority Support", "Featured Supplier Listing"],
  },
  {
    name: "Premium",
    price: 699,
    description: "Para sa malalaking negosyo",
    color: "border-emerald-500",
    badge: "bg-emerald-100 text-emerald-700",
    icon: Crown,
    popular: true,
    features: [
      "Unlimited products",
      "Unlimited transactions",
      "Full POS features",
      "Unlimited user accounts",
      "Advanced Analytics & Reports",
      "Sales Forecast",
      "Automated Sales Reports (Email)",
      "SMS Marketing to Customers",
      "Featured Supplier Listing",
      "Priority Support",
      "Custom Branding",
    ],
    unavailable: [],
  },
];

const addons = [
  {
    icon: MessageSquare,
    title: "SMS Marketing",
    desc: "Send promotions, birthday greetings, and reminders to your customers automatically.",
    price: 199,
    color: "text-violet-500",
    bg: "bg-violet-50",
  },
  {
    icon: FileText,
    title: "Automated Sales Reports",
    desc: "Get weekly/monthly PDF reports sent directly to your email with full analytics.",
    price: 149,
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    icon: Star,
    title: "Featured Supplier",
    desc: "Your supplier listing appears at the top when shop owners search for products.",
    price: 499,
    color: "text-amber-500",
    bg: "bg-amber-50",
  },
  {
    icon: BarChart2,
    title: "Deep Insights Report",
    desc: "AI-powered inventory forecasting, slow-movers detection, and profit maximization tips.",
    price: 299,
    color: "text-emerald-500",
    bg: "bg-emerald-50",
  },
];

export default function Monetization() {
  const [billing, setBilling] = useState("monthly");

  return (
    <div className="p-4 md:p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-slate-800">Subscription Plans</h1>
        <p className="text-slate-500">I-upgrade ang iyong StockMate para sa mas maraming features</p>
        <div className="inline-flex items-center gap-1 bg-slate-100 rounded-full p-1 mt-2">
          <button
            onClick={() => setBilling("monthly")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${billing === "monthly" ? "bg-white shadow text-slate-800" : "text-slate-500"}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling("yearly")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${billing === "yearly" ? "bg-white shadow text-slate-800" : "text-slate-500"}`}
          >
            Yearly
            <span className="ml-1.5 text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">Save 20%</span>
          </button>
        </div>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const price = billing === "yearly" ? Math.round(plan.price * 0.8) : plan.price;
          return (
            <div
              key={plan.name}
              className={`relative rounded-2xl border-2 bg-white p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow ${plan.color}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">Most Popular</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${plan.badge}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{plan.name}</h3>
                  <p className="text-xs text-slate-500">{plan.description}</p>
                </div>
              </div>
              <div>
                <span className="text-3xl font-bold text-slate-800">
                  {price === 0 ? "Free" : `₱${price.toLocaleString()}`}
                </span>
                {price > 0 && <span className="text-slate-400 text-sm">/mo</span>}
              </div>
              <div className="flex-1 space-y-2">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-slate-700">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    {f}
                  </div>
                ))}
                {plan.unavailable.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-slate-400 line-through">
                    <Check className="w-4 h-4 text-slate-200 shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
              <Button
                className={`w-full mt-2 ${plan.popular ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "variant-outline"}`}
                variant={plan.popular ? "default" : "outline"}
              >
                {price === 0 ? "Get Started Free" : "Subscribe Now"}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Add-ons */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Add-on Features</h2>
          <p className="text-sm text-slate-500">I-add lang ang features na kailangan mo</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {addons.map((addon) => {
            const Icon = addon.icon;
            return (
              <Card key={addon.title} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5 space-y-3">
                  <div className={`w-10 h-10 rounded-xl ${addon.bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${addon.color}`} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm">{addon.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">{addon.desc}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-slate-700">
                        ₱{billing === "yearly" ? Math.round(addon.price * 0.8).toLocaleString() : addon.price.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-400">/mo</span>
                    </div>
                    <Button size="sm" variant="outline" className="text-xs h-7">Add</Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Revenue Sharing Info */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-emerald-50 to-blue-50">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-xl shadow flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="font-bold text-slate-800">Affiliate & Partner Program</h3>
            <p className="text-sm text-slate-500 mt-1">
              Kumita ng komisyon sa bawat bagong user na mag-sign up gamit ang iyong referral link.
              <span className="font-semibold text-emerald-600"> ₱150 per referral!</span>
            </p>
          </div>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0">
            Join Program
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}