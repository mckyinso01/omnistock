import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Boxes, ScanLine, CreditCard, BarChart3, ShoppingCart, Truck, Users,
  Bell, FileSpreadsheet, Mail, CloudOff, Smartphone, ShieldCheck, ArrowRight,
  Clock, TrendingUp, Calculator, Package, Sparkles, CheckCircle2
} from "lucide-react";
import { InteractiveVideoPlayer } from "../components/shared/InteractiveVideoPlayer";
import { EnterpriseTechnicalSpecs } from "../components/shared/EnterpriseTechnicalSpecs";
import { SecurityTrustStrip } from "../components/shared/SecurityTrustStrip";
import { RoiCalculator } from "../components/shared/RoiCalculator";
import { FaqSection } from "../components/shared/FaqSection";
import { LicensingDeploymentTierBar } from "../components/shared/LicensingDeploymentTierBar";

const stats = [
  { value: "8-in-1", label: "Modules in one app" },
  { value: "100%", label: "Works offline" },
  { value: "<10s", label: "Per-sale checkout" },
  { value: "24/7", label: "Auto reports & alerts" },
];

const tools = [
  { icon: Boxes, title: "Inventory Management", desc: "Track stock, cost, and pricing for every SKU with CSV bulk-edit, barcode scan, and AI catalogue upload." },
  { icon: ShoppingCart, title: "Point of Sale", desc: "Fast multi-tender checkout — cash, GCash, Maya, card, or split. Auto-deducts stock and awards loyalty points." },
  { icon: BarChart3, title: "Sales Analytics", desc: "Live revenue, profit margin, top products, and 7-day trends — the numbers behind every decision." },
  { icon: ScanLine, title: "AI Catalogue Scanner", desc: "Snap a handwritten catalogue; AI digitizes it to editable rows — with confidence scores before you commit." },
  { icon: Truck, title: "Purchase Orders", desc: "Create POs to suppliers, schedule deliveries, and reconcile stock as it arrives." },
  { icon: Users, title: "Customer CRM", desc: "Capture customers, loyalty points, and purchase history to power repeat business." },
  { icon: Calculator, title: "Pricing & Margins", desc: "Bulk markup and margin-based pricing with a complete audit trail of every change." },
  { icon: Package, title: "Recipes & Yield", desc: "Cost every batch — track recipe ingredients, yield, and per-unit profitability." },
];

const specs = [
  { icon: Smartphone, title: "Mobile-first", desc: "Built for phone, tablet, and desktop with safe-area support for notched displays." },
  { icon: CloudOff, title: "Offline-ready", desc: "Ring up sales with no internet — they auto-sync to the cloud when you reconnect." },
  { icon: FileSpreadsheet, title: "Google Sheets sync", desc: "Every sale becomes a spreadsheet row — automatically, on a daily, weekly, or monthly schedule." },
  { icon: Mail, title: "Automated email reports", desc: "Sales, cost, and low-stock reports land in your inbox without lifting a finger." },
  { icon: CreditCard, title: "Stripe billing", desc: "Secure subscription tiers for Basic and Pro plans." },
  { icon: ShieldCheck, title: "User-level security", desc: "Only authorized users see or edit your data. Roles by design." },
];

const benefits = [
  { icon: Clock, title: "Reclaim your hours", desc: "Less time on manual encoding and stock counts — more time on growing the business." },
  { icon: TrendingUp, title: "Make smarter money moves", desc: "Spot what sells, what's slipping, and where your profit really comes from." },
  { icon: Bell, title: "Never get caught short", desc: "Restock alerts fire the moment an item falls below your custom threshold." },
  { icon: FileSpreadsheet, title: "Sleep easy, data's safe", desc: "Every sale is logged to Google Sheets and emailed — nothing falls through the cracks." },
];

const howItWorks = [
  "Add your products by CSV, barcode, or a single photo of your paper catalogue.",
  "Ring sales on any device — stock, loyalty, and profit update automatically.",
  "Let OmniStock sync every transaction to Google Sheets and email you the report.",
  "Watch dashboards and alerts flag what to reorder — and which customers to reward.",
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#050811] text-white overflow-x-hidden font-sans">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-[#050811]/90 border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md">
              <Boxes className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold tracking-tight text-white">OmniStock</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-slate-300 font-medium">
            <a href="#tools" className="hover:text-cyan-400 transition-colors">Tools</a>
            <a href="#specs" className="hover:text-cyan-400 transition-colors">Specs</a>
            <a href="#benefits" className="hover:text-cyan-400 transition-colors">Benefits</a>
          </div>
          <Button asChild size="sm" className="bg-cyan-600 hover:bg-cyan-500 text-[#fff] font-bold shadow-md">
            <Link to="/inventory">Open app <ArrowRight className="w-4 h-4 ml-1" /></Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-16 pb-20 bg-gradient-to-b from-[#0B1C30] via-[#050811] to-[#050811] border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 text-center relative">
          <Badge className="bg-emerald-950/80 text-emerald-300 border border-emerald-700/50 mb-6 hover:bg-emerald-900 font-bold px-3 py-1">
            🇵🇭 Built for Filipino retailers
          </Badge>
          <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight tracking-tight text-white mb-5">
            Inventory, POS, & Analytics<br />
            running on <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">one quiet engine</span>.
          </h1>
          <p className="text-slate-300 text-lg sm:text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
            OmniStock replaces spreadsheets, paper catalogues, and manual stock counts — so you can spend your time growing sales instead.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="bg-cyan-600 hover:bg-cyan-500 text-[#fff] font-bold gap-2 shadow-lg">
              <Link to="/inventory"><ShoppingCart className="w-5 h-5" /> Start selling</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-[#071322] border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-[#fff] font-bold">
              <Link to="/">See the dashboard</Link>
            </Button>
          </div>
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {stats.map(s => (
              <div key={s.label} className="text-center p-4 rounded-xl bg-[#0B1C30] border border-slate-800 shadow-xl">
                <p className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">{s.value}</p>
                <p className="text-xs text-slate-300 font-medium mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Interactive POS Barcode & Inventory Simulator Video (Red-to-Yellow Flame Rotating Border) */}
          <div className="mt-10 max-w-4xl mx-auto moving-border-card bg-[#0B1C30] rounded-2xl overflow-hidden shadow-2xl">
            <div className="w-full h-full bg-[#0B1C30] rounded-2xl overflow-hidden">
              <InteractiveVideoPlayer 
                title="OmniStock POS Barcode Scanner & Receipt Simulator" 
                autoPlay={true}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Licensing & Deployment Tier Selector Bar */}
      <section className="bg-[#050811] border-t border-slate-800">
        <LicensingDeploymentTierBar appName="OmniStock POS" />
      </section>

      {/* Tools */}
      <section id="tools" className="py-16 bg-[#050811]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="bg-cyan-950/80 border-cyan-700/50 text-cyan-300 mb-3 font-semibold">
              <Sparkles className="w-3.5 h-3.5 mr-1 text-cyan-400" /> Eight tools, one app
            </Badge>
            <h2 className="text-3xl font-extrabold text-white mb-2">Everything you need to run the floor</h2>
            <p className="text-slate-300 max-w-xl mx-auto">From backroom inventory counts to front-counter sales.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tools.map((t) => {
              const Icon = t.icon;
              return (
                <Card key={t.title} className="bg-[#0B1C30] border-slate-800 hover:border-cyan-500/50 hover:shadow-xl transition-all">
                  <CardContent className="p-5 space-y-2 text-left">
                    <div className="w-10 h-10 rounded-lg bg-[#071322] border border-slate-700 flex items-center justify-center mb-2">
                      <Icon className="w-5 h-5 text-cyan-400" />
                    </div>
                    <h3 className="font-bold text-white text-base">{t.title}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">{t.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-[#0B1C30]/50 border-y border-slate-800">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-white mb-2">From paper catalogue to live sale in four steps</h2>
            <p className="text-slate-300">A workflow designed for the realities of a busy retail store.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {howItWorks.map((step, i) => (
              <div key={i} className="flex items-start gap-3 p-5 rounded-2xl bg-[#0B1C30] border border-slate-800 shadow-xl text-left">
                <div className="w-8 h-8 rounded-full bg-cyan-950/80 text-cyan-300 flex items-center justify-center font-extrabold text-sm shrink-0 border border-cyan-700/50 font-mono">
                  {i + 1}
                </div>
                <p className="text-sm text-slate-200 font-medium pt-1 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specs */}
      <section id="specs" className="py-16 bg-[#050811]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-white mb-2">Engineered for the modern merchant</h2>
            <p className="text-slate-300">Quiet, dependable plumbing — working reliably behind the scenes.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {specs.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.title} className="flex items-start gap-3 p-5 rounded-2xl bg-[#0B1C30] border border-slate-800 shadow-xl text-left">
                  <div className="w-10 h-10 rounded-lg bg-[#071322] border border-slate-700 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">{s.title}</h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="py-16 bg-[#0B1C30]/50 border-y border-slate-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-white mb-2">Why store owners switch</h2>
            <p className="text-slate-300">A measurable lift for the things that matter most to your business.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {benefits.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.title} className="text-left p-6 rounded-2xl bg-[#0B1C30] border border-slate-800 shadow-xl">
                  <div className="w-12 h-12 rounded-xl bg-[#071322] border border-slate-700 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="font-bold text-white text-base mb-1">{b.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{b.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Security & Reliability Trust Strip */}
      <SecurityTrustStrip />

      {/* Full Enterprise Technical Specifications Matrix */}
      <EnterpriseTechnicalSpecs />

      {/* Interactive Retail ROI & Savings Calculator */}
      <RoiCalculator />

      {/* Interactive FAQ Accordion */}
      <FaqSection />

      {/* CTA */}
      <section className="py-20 bg-[#050811]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-6 text-sm text-slate-300 font-semibold">
            {["No setup fees", "Mobile + desktop", "Offline-ready"].map(t => (
              <span key={t} className="inline-flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-cyan-400" /> {t}</span>
            ))}
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">Ready to reclaim your day?</h2>
          <p className="text-slate-300 mb-8 text-base">Open OmniStock and ring your first sale in minutes — no spreadsheets required.</p>
          <Button asChild size="lg" className="bg-cyan-600 hover:bg-cyan-500 text-[#fff] font-bold gap-2 shadow-lg">
            <Link to="/inventory"><ArrowRight className="w-5 h-5" /> Open the app</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-400 bg-[#050811]">
        OmniStock · Inventory & POS for modern businesses.
      </footer>
    </div>
  );
}