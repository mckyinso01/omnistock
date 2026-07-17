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
  { icon: Boxes, title: "Inventory Management", desc: "Subaybayan ang stock, cost, at presyo ng bawat produkto. Bulk-edit gamit ang CSV, barcode scan, at AI catalogue uploader." },
  { icon: ShoppingCart, title: "Point of Sale", desc: "Mabilis na checkout gamit ang cash, GCash, Maya, card, o split payment. Auto-deduct sa stock at loyalty points." },
  { icon: BarChart3, title: "Sales Analytics", desc: "Real-time na kita ng revenue, profit margin, top products, at 7-day trend para sa matalinong desisyon." },
  { icon: ScanLine, title: "AI Catalogue Scanner", desc: "I-cam ang handwritten catalogue at ililipat ng AI papuntang digital — may confidence review bago i-save." },
  { icon: Truck, title: "Purchase Orders", desc: "Bumuo ng PO sa suppliers, subaybayan ang deliveries, at i-reconcile ang natanggap na stock." },
  { icon: Users, title: "Customer CRM", desc: "Itago ang customers, loyalty points, at purchase history para sa repeat business." },
  { icon: Calculator, title: "Pricing & Margins", desc: "Bulk markup at margin-based na pag-set ng presyo at cost. Auto-audit trail ng price changes." },
  { icon: Package, title: "Recipes & Yield", desc: "Subaybayan ang recipe ingredients, yield cost, at profitability ng bawat finished product." },
];

const specs = [
  { icon: Smartphone, title: "Mobile-first", desc: "Gumagana nang maayos sa phone, tablet, at desktop. Safe-area support para sa notch." },
  { icon: CloudOff, title: "Offline-ready", desc: "Tumatakbo kahit walang internet; auto-sync sa cloud kapag nag-online ulit." },
  { icon: FileSpreadsheet, title: "Google Sheets sync", desc: "Auto-push ng bawat sale bilang row sa iyong spreadsheet — araw-araw, weekly, o monthly." },
  { icon: Mail, title: "Email reports", desc: "Awtomatikong ipadala ang sales, cost, at low-stock reports sa inbox mo." },
  { icon: CreditCard, title: "Stripe billing", desc: "Secure subscriptions para sa Basic at Pro tiers." },
  { icon: ShieldCheck, title: "User-level security", desc: "Tanging authorized users lang ang makakita at makakapag-edit ng data." },
];

const benefits = [
  { icon: Clock, title: "I-save ang oras", desc: "Bawas oras sa manual encoding at stock counting — gamitin mo para sa paglago ng negosyo." },
  { icon: TrendingUp, title: "Tumaas ang kita", desc: "Makita agad kung aling produkto ang kumikita at kung anong kailangan ibenta." },
  { icon: Bell, title: "Hindi maubusan", desc: "Auto-alert kapag bababa na ang stock — para sapat lagi ang available na produkto." },
  { icon: FileSpreadsheet, title: "Data backup", desc: "Bawat sale ay naka-log sa Google Sheets at naka-email report — walang nawawalang data." },
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
              <Link to="/inventory">Buksan <ArrowRight className="w-4 h-4" /></Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-16 pb-24">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent" />
        <div className="max-w-4xl mx-auto px-4 text-center relative">
          <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30 mb-6 hover:bg-emerald-500/20">
            🇵🇭 Gawa para sa Pinoy na negosyo
          </Badge>
          <h1 className="text-4xl sm:text-6xl font-bold leading-tight mb-5">
            Imbentaryo, POS, at Analytics<br />
            sa <span className="bg-gradient-to-r from-emerald-300 to-emerald-500 bg-clip-text text-transparent">iisang app</span>.
          </h1>
          <p className="text-slate-300 text-lg sm:text-xl mb-8 max-w-2xl mx-auto">
            Pamahalaan ang stock, presyo, at benta gamit ang AI catalogue scanner, Google Sheets auto-sync, at awtomatikong email reports. Lahat sa smartphone o desktop.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2">
              <Link to="/inventory"><ShoppingCart className="w-5 h-5" /> Simulan ang benta</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent border-white/20 text-white hover:bg-white/10">
              <Link to="/">Tingnan ang dashboard</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Tools */}
      <section className="py-16 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">Mga Kasamang Tools</h2>
            <p className="text-slate-400">Lahat ng kailangan mo para sa smooth na operations — nasa loob na.</p>
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
            <p className="text-slate-400">Binitawan mo sa modernong negosyo.</p>
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
            <h2 className="text-3xl font-bold mb-2">Ano ang maitutulong sa negosyo mo?</h2>
            <p className="text-slate-400">Hindi lang gamit — solusyon para sa tunay na problema ng negosyo.</p>
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
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Handa nang bilisan ang negosyo?</h2>
          <p className="text-slate-300 mb-6">Buksan ang OmniStock at simulan na ang benta ngayon.</p>
          <Button asChild size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2">
            <Link to="/inventory"><ArrowRight className="w-5 h-5" /> Buksan ang app</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 text-center text-sm text-slate-500">
        OmniStock · Imbentaryo at POS para sa negosyong Pinoy.
      </footer>
    </div>
  );
}