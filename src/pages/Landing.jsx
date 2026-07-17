import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Boxes, ScanLine, CreditCard, BarChart3, ShoppingCart, Truck, Users,
  Bell, FileSpreadsheet, Mail, CloudOff, Smartphone, ShieldCheck, ArrowRight,
  Clock, TrendingUp, Calculator, Package
} from "lucide-react";

const tools = [
  { icon: Boxes, title: "Inventory Management", desc: "Track stock, cost, and price for every product. Bulk-edit via CSV, barcode scan, and AI catalogue uploader." },
  { icon: ShoppingCart, title: "Point of Sale", desc: "Fast checkout with cash, GCash, Maya, card, or split payment. Auto-deducts stock and rewards loyalty points." },
  { icon: BarChart3, title: "Sales Analytics", desc: "Real-time revenue, profit margin, top products, and 7-day trends for smarter decisions." },
  { icon: ScanLine, title: "AI Catalogue Scanner", desc: "Snap your handwritten catalogue and AI digitizes it — with a confidence review before saving." },
  { icon: Truck, title: "Purchase Orders", desc: "Create POs to suppliers, track deliveries, and reconcile received stock." },
  { icon: Users, title: "Customer CRM", desc: "Store customers, loyalty points, and purchase history for repeat business." },
  { icon: Calculator, title: "Pricing & Margins", desc: "Bulk markup and margin-based price and cost updates. Auto-audit trail of every change." },
  { icon: Package, title: "Recipes & Yield", desc: "Track recipe ingredients, yield cost, and profitability for each finished product." },
];

const specs = [
  { icon: Smartphone, title: "Mobile-first", desc: "Runs smoothly on phone, tablet, and desktop. Safe-area support for notched displays." },
  { icon: CloudOff, title: "Offline-ready", desc: "Works even offline; auto-syncs to the cloud once you reconnect." },
  { icon: FileSpreadsheet, title: "Google Sheets sync", desc: "Auto-pushes each sale as a row to your spreadsheet — daily, weekly, or monthly." },
  { icon: Mail, title: "Email reports", desc: "Automatically sends sales, cost, and low-stock reports to your inbox." },
  { icon: CreditCard, title: "Stripe billing", desc: "Secure subscriptions for Basic and Pro tiers." },
  { icon: ShieldCheck, title: "User-level security", desc: "Only authorized users can view and edit data." },
];

const benefits = [
  { icon: Clock, title: "Save time", desc: "Less time on manual encoding and stock counting — re-invest it into growth." },
  { icon: TrendingUp, title: "Boost revenue", desc: "Instantly see which products earn and what deserves a push." },
  { icon: Bell, title: "Never run out", desc: "Auto-alert when stock runs low — so you always have enough product on hand." },
  { icon: FileSpreadsheet, title: "Data backup", desc: "Every sale is logged to Google Sheets and emailed — no lost data." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur-md bg-slate-950/70 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
              <Boxes className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold">OmniStock</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm text-slate-300 hover:text-white hidden sm:block">Dashboard</Link>
            <Button asChild size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white">
              <Link to="/inventory">Open app <ArrowRight className="w-4 h-4" /></Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-16 pb-24">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent" />
        <div className="max-w-4xl mx-auto px-4 text-center relative">
          <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30 mb-6 hover:bg-emerald-500/20">
            🇵🇭 Built for Filipino businesses
          </Badge>
          <h1 className="text-4xl sm:text-6xl font-bold leading-tight mb-5">
            Inventory, POS, & Analytics<br />
            in <span className="bg-gradient-to-r from-emerald-300 to-emerald-500 bg-clip-text text-transparent">one app</span>.
          </h1>
          <p className="text-slate-300 text-lg sm:text-xl mb-8 max-w-2xl mx-auto">
            Manage stock, pricing, and sales with an AI catalogue scanner, Google Sheets auto-sync, and automated email reports — all on smartphone or desktop.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2">
              <Link to="/inventory"><ShoppingCart className="w-5 h-5" /> Start selling</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent border-white/20 text-white hover:bg-white/10">
              <Link to="/">View dashboard</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Tools */}
      <section className="py-16 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">Included Tools</h2>
            <p className="text-slate-400">Everything you need for smooth operations — right inside.</p>
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

      {/* Specs */}
      <section className="py-16 bg-slate-900/40 border-y border-white/10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">Tech Specs</h2>
            <p className="text-slate-400">Built for the modern business.</p>
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
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">What it does for your business</h2>
            <p className="text-slate-400">More than a tool — a solution to real business problems.</p>
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
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to speed up your business?</h2>
          <p className="text-slate-300 mb-6">Open OmniStock and start selling today.</p>
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