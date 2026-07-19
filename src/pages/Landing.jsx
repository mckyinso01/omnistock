import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Boxes, ScanLine, CreditCard, BarChart3, ShoppingCart, Truck, Users,
  Bell, FileSpreadsheet, Mail, CloudOff, Smartphone, ShieldCheck, ArrowRight,
  Clock, TrendingUp, Calculator, Package, Sparkles, CheckCircle2
} from "lucide-react";

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
  { icon: Bell, title: "Never get caught short", desc: "Restockalerts fire the moment an item falls below your custom threshold." },
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
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-slate-950/80 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
              <Boxes className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold tracking-tight">OmniStock</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-slate-300">
            <a href="#tools" className="hover:text-white transition-colors">Tools</a>
            <a href="#specs" className="hover:text-white transition-colors">Specs</a>
            <a href="#benefits" className="hover:text-white transition-colors">Benefits</a>
          </div>
          <Button asChild size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white">
            <Link to="/inventory">Open app <ArrowRight className="w-4 h-4" /></Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-20 pb-20">
        <div className="absolute inset-0 bg-radial-gradient from-emerald-600/20 via-transparent to-transparent" style={{ background: "radial-gradient(circle at 50% 0%, rgba(16,185,129,0.18), transparent 60%)" }} />
        <div className="max-w-4xl mx-auto px-4 text-center relative">
          <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30 mb-6 hover:bg-emerald-500/20">
            🇵🇭 Built for Filipino retailers
          </Badge>
          <h1 className="text-4xl sm:text-6xl font-bold leading-tight tracking-tight mb-5">
            Inventory, POS, & Analytics<br />
            running on <span className="bg-gradient-to-r from-emerald-300 to-emerald-500 bg-clip-text text-transparent">one quiet engine</span>.
          </h1>
          <p className="text-slate-300 text-lg sm:text-xl mb-8 max-w-2xl mx-auto">
            OmniStock replaces the spreadsheets, paper catalogues, and manual stock counts that quietly drain your day — so you can spend it growing sales instead.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2">
              <Link to="/inventory"><ShoppingCart className="w-5 h-5" /> Start selling</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent border-white/20 text-white hover:bg-white/10">
              <Link to="/">See the dashboard</Link>
            </Button>
          </div>
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {stats.map(s => (
              <div key={s.label} className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-emerald-300">{s.value}</p>
                <p className="text-xs text-slate-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools */}
      <section id="tools" className="py-16 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="bg-white/5 border-white/10 text-emerald-300 mb-3">
              <Sparkles className="w-3 h-3 mr-1" /> Eight tools, one app
            </Badge>
            <h2 className="text-3xl font-bold mb-2">Everything you need to run the floor</h2>
            <p className="text-slate-400 max-w-xl mx-auto">From the backroom inventory count to the front-counter sale — and everything in between.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tools.map((t) => {
              const Icon = t.icon;
              return (
                <Card key={t.title} className="bg-white/5 border-white/10 hover:border-emerald-500/40 transition-colors">
                  <CardContent className="p-5 space-y-2">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center mb-2">
                      <Icon className="w-5 h-5 text-emerald-300" />
                    </div>
                    <h3 className="font-semibold">{t.title}</h3>
                    <p className="text-sm text-slate-400">{t.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-slate-900/40 border-y border-white/10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">From paper catalogue to live sale in four steps</h2>
            <p className="text-slate-400">A workflow designed for the realities of a busy Filipino sari-sari or retail store.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {howItWorks.map((step, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-sm shrink-0">
                  {i + 1}
                </div>
                <p className="text-sm text-slate-200 pt-1">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specs */}
      <section id="specs" className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">Engineered for the modern mestizo</h2>
            <p className="text-slate-400">Quiet, dependable plumbing — so you don't notice it working.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {specs.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.title} className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{s.title}</h3>
                    <p className="text-sm text-slate-400">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="py-16 bg-slate-900/40 border-y border-white/10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">Why store owners switch</h2>
            <p className="text-slate-400">Not just software — a measurable lift for the things that matter.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {benefits.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.title} className="text-center p-6 rounded-xl bg-gradient-to-b from-emerald-500/10 to-transparent border border-emerald-500/20">
                  <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center mb-3">
                    <Icon className="w-6 h-6 text-emerald-300" />
                  </div>
                  <h3 className="font-semibold mb-1">{b.title}</h3>
                  <p className="text-sm text-slate-400">{b.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-6 text-sm text-slate-300">
            {["No setup fees", "Mobile + desktop", "Offline-ready"].map(t => (
              <span key={t} className="inline-flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> {t}</span>
            ))}
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to reclaim your day?</h2>
          <p className="text-slate-300 mb-6">Open OmniStock and ring your first sale in minutes — no spreadsheets required.</p>
          <Button asChild size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2">
            <Link to="/inventory"><ArrowRight className="w-5 h-5" /> Open the app</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 text-center text-sm text-slate-500">
        OmniStock · Inventory & POS for Filipino businesses.
      </footer>
    </div>
  );
}