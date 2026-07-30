import { useState, useEffect } from "react";
import { entities } from "@/lib/db";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  FileText, Download, Mail, Calendar, TrendingUp,
  DollarSign, ShoppingBag, Package, Send, CheckCircle2, Loader2
} from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";
import jsPDF from "jspdf";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import TopProductsAnalytics from "@/components/sales/TopProductsAnalytics";
import DESIGN_TOKENS from "@/lib/designSystem";

export default function SalesReport() {
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [period, setPeriod] = useState("thisMonth");
  const [emailTo, setEmailTo] = useState("");
  const [scheduleFreq, setScheduleFreq] = useState("weekly");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [t, p] = await Promise.all([
        entities.Transaction.list("-created_date", 1000).catch(() => []),
        entities.Product.list("name", 300).catch(() => []),
      ]);
      setTransactions((t || []).filter(x => x.status === "completed" && x.type === "sale"));
      setProducts(p || []);
    } catch (err) {
      console.error("SalesReport loadData Exception:", err);
      setTransactions([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredTxns = () => {
    const now = new Date();
    let cutoffStart, cutoffEnd;
    if (period === "thisWeek") {
      cutoffStart = startOfWeek(now, { weekStartsOn: 1 });
      cutoffEnd = endOfWeek(now, { weekStartsOn: 1 });
    } else if (period === "lastWeek") {
      cutoffStart = startOfWeek(subDays(now, 7), { weekStartsOn: 1 });
      cutoffEnd = endOfWeek(subDays(now, 7), { weekStartsOn: 1 });
    } else if (period === "thisMonth") {
      cutoffStart = startOfMonth(now);
      cutoffEnd = endOfMonth(now);
    } else if (period === "lastMonth") {
      cutoffStart = startOfMonth(subDays(now, 30));
      cutoffEnd = endOfMonth(subDays(now, 30));
    } else {
      cutoffStart = subDays(now, 7);
      cutoffEnd = now;
    }
    return transactions.filter(t => {
      const d = new Date(t.created_date);
      return d >= cutoffStart && d <= cutoffEnd;
    });
  };

  const periodTxns = getFilteredTxns();
  const totalRevenue = periodTxns.reduce((s, t) => s + (t.total_amount || 0), 0);
  const totalOrders = periodTxns.length;
  const totalCost = periodTxns.reduce((s, t) =>
    s + (t.items || []).reduce((a, i) => a + (i.unit_cost || 0) * (i.quantity || 0), 0), 0);
  const grossProfit = totalRevenue - totalCost;
  const profitMargin = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : 0;

  const productSales = {};
  periodTxns.forEach(t => {
    (t.items || []).forEach(item => {
      if (!productSales[item.product_name]) productSales[item.product_name] = { qty: 0, revenue: 0, cost: 0 };
      productSales[item.product_name].qty += item.quantity || 0;
      productSales[item.product_name].revenue += item.subtotal || 0;
      productSales[item.product_name].cost += (item.unit_cost || 0) * (item.quantity || 0);
    });
  });
  const topProducts = Object.entries(productSales)
    .map(([name, data]) => ({ name, ...data, profit: data.revenue - data.cost }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);
  const itemsSold = periodTxns.reduce((s, t) => s + (t.items || []).reduce((q, it) => q + (it.quantity || 0), 0), 0);

  const lowStockItems = products.filter(p => p.status === "active" && (p.quantity || 0) <= (p.low_stock_threshold || 10));

  const generatePDF = () => {
    setGenerating(true);
    const doc = new jsPDF();
    const periodLabel = { thisWeek: "This Week", lastWeek: "Last Week", thisMonth: "This Month", lastMonth: "Last Month", last7: "Last 7 Days" }[period] || period;

    // Header
    doc.setFillColor(16, 185, 129);
    doc.rect(0, 0, 210, 35, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("OmniStock - Sales Report", 14, 18);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Period: ${periodLabel}  |  Generated: ${format(new Date(), "MMMM d, yyyy hh:mm a")}`, 14, 28);

    // KPI Summary
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Summary", 14, 50);

    const kpis = [
      ["Total Revenue", `₱${totalRevenue.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`],
      ["Total Orders", totalOrders.toString()],
      ["Gross Profit", `₱${grossProfit.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`],
      ["Profit Margin", `${profitMargin}%`],
    ];
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    kpis.forEach(([label, value], i) => {
      const x = 14 + (i % 2) * 93;
      const y = 60 + Math.floor(i / 2) * 18;
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(x, y - 7, 88, 14, 3, 3, "F");
      doc.setTextColor(100, 116, 139);
      doc.text(label, x + 4, y);
      doc.setTextColor(30, 30, 30);
      doc.setFont("helvetica", "bold");
      doc.text(value, x + 4, y + 7);
      doc.setFont("helvetica", "normal");
    });

    // Top Products
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text("Top Selling Products", 14, 108);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Product", 14, 118);
    doc.text("Qty Sold", 120, 118);
    doc.text("Revenue", 160, 118);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 120, 196, 120);

    topProducts.forEach((p, i) => {
      const y = 128 + i * 10;
      doc.setTextColor(30, 30, 30);
      doc.text(`${i + 1}. ${p.name}`, 14, y);
      doc.text(p.qty.toString(), 120, y);
      doc.setTextColor(16, 185, 129);
      doc.text(`₱${p.revenue.toLocaleString()}`, 160, y);
      doc.setTextColor(30, 30, 30);
    });

    // Low Stock Warning
    if (lowStockItems.length > 0) {
      const startY = 135 + topProducts.length * 10 + 10;
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(239, 68, 68);
      doc.text(`⚠ Low Stock Alert (${lowStockItems.length} items)`, 14, startY);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      lowStockItems.slice(0, 8).forEach((p, i) => {
        doc.setTextColor(30, 30, 30);
        doc.text(`• ${p.name} — ${p.quantity || 0} ${p.unit || "pcs"} left`, 14, startY + 10 + i * 9);
      });
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Generated by OmniStock Inventory & POS System", 14, 285);

    doc.save(`OmniStock-Report-${periodLabel}-${format(new Date(), "yyyy-MM-dd")}.pdf`);
    setGenerating(false);
  };

  const sendEmailReport = async () => {
    if (!emailTo || !emailTo.includes("@")) return alert("Enter a valid email address.");
    setSendingEmail(true);
    const periodLabel = { thisWeek: "This Week", lastWeek: "Last Week", thisMonth: "This Month", lastMonth: "Last Month", last7: "Last 7 Days" }[period] || period;

    const emailBody = `
Hi,

Here is your OmniStock Sales Report for ${periodLabel}:

📊 SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Revenue:   ₱${totalRevenue.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
Total Orders:    ${totalOrders}
Gross Profit:    ₱${grossProfit.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
Profit Margin:   ${profitMargin}%

🏆 TOP 5 PRODUCTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━
${topProducts.slice(0, 5).map((p, i) => `${i + 1}. ${p.name} — ${p.qty} sold — ₱${p.revenue.toLocaleString()}`).join("\n")}

${lowStockItems.length > 0 ? `⚠️ LOW STOCK ALERT\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n${lowStockItems.slice(0, 5).map(p => `• ${p.name}: ${p.quantity || 0} ${p.unit || "pcs"} left`).join("\n")}` : ""}

Report generated on ${format(new Date(), "MMMM d, yyyy hh:mm a")}

— OmniStock Automated Reports
    `;

    await base44.integrations.Core.SendEmail({
      to: emailTo,
      subject: `OmniStock Sales Report — ${periodLabel} (${format(new Date(), "MMMM d, yyyy")})`,
      body: emailBody,
    });
    setSendingEmail(false);
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 4000);
  };

  if (loading) return <div className="p-6 text-slate-400">Loading report data...</div>;

  return (
    <div className="p-4 md:p-6 space-y-6 bg-[#050811] text-slate-100 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0B1C30]/80 p-5 rounded-2xl border border-slate-800/80 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_16px_rgba(0,229,255,0.25)] shrink-0">
            <FileText className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className={DESIGN_TOKENS.typography.h1 + " flex items-center gap-2"}>
              Sales Reports & Export Engine
            </h1>
            <p className={DESIGN_TOKENS.typography.muted + " mt-0.5"}>
              Generate, schedule, and email detailed financial and inventory performance reports
            </p>
          </div>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-44 bg-[#071322] border-slate-700 text-white font-mono text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#071322] border-slate-700 text-white font-mono text-xs">
            <SelectItem value="thisWeek">This Week</SelectItem>
            <SelectItem value="lastWeek">Last Week</SelectItem>
            <SelectItem value="last7">Last 7 Days</SelectItem>
            <SelectItem value="thisMonth">This Month</SelectItem>
            <SelectItem value="lastMonth">Last Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview"><FileText className="w-4 h-4 inline mr-1" />Overview</TabsTrigger>
          <TabsTrigger value="analytics"><TrendingUp className="w-4 h-4 inline mr-1" />Top Products</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-6">

          {/* KPI Summary Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: DollarSign, label: "Revenue", value: `₱${totalRevenue.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`, color: "text-emerald-400" },
              { icon: ShoppingBag, label: "Orders", value: totalOrders, color: "text-cyan-400" },
              { icon: TrendingUp, label: "Gross Profit", value: `₱${grossProfit.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`, color: grossProfit >= 0 ? "text-violet-400" : "text-rose-400" },
              { icon: Package, label: "Profit Margin", value: `${profitMargin}%`, color: Number(profitMargin) >= 20 ? "text-emerald-400" : "text-amber-400" },
            ].map(kpi => {
              const Icon = kpi.icon;
              return (
                <Card key={kpi.label} className="water-breathing-card bg-[#0B1C30]/80 border border-slate-800/80 rounded-2xl p-1 shadow-xl app-card-hover">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#071322] border border-slate-700/80 flex items-center justify-center shrink-0">
                      <Icon className={`w-5 h-5 ${kpi.color}`} />
                    </div>
                    <div>
                      <p className={DESIGN_TOKENS.typography.muted}>{kpi.label}</p>
                      <p className={`text-lg font-bold ${kpi.color}`}>{kpi.value}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Products Card */}
            <Card className="water-breathing-card bg-[#0B1C30]/80 rounded-2xl border border-slate-800/80 p-1 shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className={DESIGN_TOKENS.typography.h2 + " flex items-center gap-2"}>
                  <ShoppingBag className="w-4 h-4 text-cyan-400" />
                  Top Products Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {topProducts.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-6 font-sans">No sales data recorded for this period</p>
                ) : topProducts.map((p, i) => (
                  <div key={p.name} className="flex items-center gap-3 py-2 border-b border-slate-800/60 last:border-0">
                    <span className="w-6 h-6 rounded-full bg-[#071322] border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-100 truncate">{p.name}</p>
                      <p className="text-xs text-slate-400 font-mono">{p.qty} sold</p>
                    </div>
                    <p className="text-sm font-bold text-emerald-400 shrink-0 font-mono">₱{p.revenue.toLocaleString()}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Low Stock Summary Card */}
            <Card className="water-breathing-card bg-[#0B1C30]/80 rounded-2xl border border-slate-800/80 p-1 shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className={DESIGN_TOKENS.typography.h2 + " flex items-center gap-2"}>
                  <Package className="w-4 h-4 text-amber-400" />
                  Low Stock Inventory Summary
                  {lowStockItems.length > 0 && (
                    <Badge className="bg-rose-950/80 text-rose-300 border border-rose-500/50 font-mono text-xs ml-auto">
                      {lowStockItems.length} {lowStockItems.length > 1 ? "alerts" : "alert"}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {lowStockItems.length === 0 ? (
                  <div className="text-center py-6 space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                    <p className="text-sm text-slate-300 font-medium">All stocks are in healthy threshold!</p>
                  </div>
                ) : lowStockItems.slice(0, 8).map(p => (
                  <div key={p.id} className="flex items-center justify-between py-2 border-b border-slate-800/60 last:border-0">
                    <p className="text-sm font-semibold text-slate-200 truncate">{p.name}</p>
                    <Badge className={`text-xs font-mono ${(p.quantity || 0) === 0 ? "bg-rose-950/80 text-rose-300 border border-rose-500/50" : "bg-amber-950/80 text-amber-300 border border-amber-500/50"}`}>
                      {p.quantity || 0} {p.unit || "pcs"} left
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

      {/* Generate & Send */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Download PDF */}
        <Card className="water-breathing-card bg-[#0B1C30]/80 rounded-2xl border border-slate-800/80 p-1 shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-white flex items-center gap-2 font-sans">
              <FileText className="w-5 h-5 text-cyan-400" />
              Download PDF Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-300 font-sans leading-relaxed">
              I-download ang kompletong sales report bilang PDF file na may sales summary, top products, at low stock alerts.
            </p>
            <Button
              onClick={generatePDF}
              disabled={generating}
              className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold tracking-wide rounded-xl py-3 shadow-[0_0_20px_rgba(0,229,255,0.35)] hover:shadow-[0_0_30px_rgba(0,229,255,0.6)] transition-all duration-300 gap-2 cursor-pointer"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {generating ? "Generating..." : "Download PDF Report"}
            </Button>
          </CardContent>
        </Card>

        {/* Email Report */}
        <Card className="water-breathing-card bg-[#0B1C30]/80 rounded-2xl border border-slate-800/80 p-1 shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-white flex items-center gap-2 font-sans">
              <Mail className="w-5 h-5 text-emerald-400" />
              Send via Email
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="sales-report-email" className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Send report to email:</Label>
              <Input
                id="sales-report-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="example@email.com"
                value={emailTo}
                onChange={e => setEmailTo(e.target.value)}
                className="bg-[#071322] border border-slate-800 focus:border-[#00E5FF] text-slate-100 placeholder:text-slate-500 rounded-xl px-3.5 py-2.5 text-base sm:text-sm transition-all outline-none font-mono"
              />
            </div>
            <Button
              onClick={sendEmailReport}
              disabled={sendingEmail || emailSent}
              className={`w-full gap-2 font-bold tracking-wide rounded-xl py-3 transition-all duration-300 cursor-pointer ${
                emailSent 
                  ? "bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]" 
                  : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.7)]"
              }`}
            >
              {sendingEmail ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
              ) : emailSent ? (
                <><CheckCircle2 className="w-4 h-4" /> Report Sent!</>
              ) : (
                <><Send className="w-4 h-4" /> Send Report Now</>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Automated Schedule */}
      <Card className="water-breathing-card bg-[#0B1C30]/80 rounded-2xl border border-slate-800/80 border-l-4 border-l-violet-400 p-1 shadow-xl">
        <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#071322] border border-violet-500/30 text-violet-400 shadow-[0_0_12px_rgba(192,132,252,0.2)] shrink-0">
            <Calendar className="w-5 h-5 text-violet-400" />
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="font-bold text-white text-base font-sans">Automated Report Schedule</h3>
            <p className="text-sm text-slate-300 font-sans">Awtomatikong magsend ng report sa iyong email. Available sa Premium plan.</p>
            <div className="flex flex-wrap gap-2 items-center">
              <Select value={scheduleFreq} onValueChange={setScheduleFreq}>
                <SelectTrigger className="w-36 h-9 text-xs bg-[#071322] border-slate-800 text-slate-100 font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0B1C30] border-slate-800 text-slate-100 font-mono">
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly (Mon)</SelectItem>
                  <SelectItem value="monthly">Monthly (1st)</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" className="bg-violet-600 hover:bg-violet-500 text-white font-bold tracking-wide rounded-lg gap-1.5 h-9 text-xs shadow-[0_0_15px_rgba(192,132,252,0.3)] transition-all cursor-pointer">
                <Calendar className="w-3.5 h-3.5" />
                Set Schedule
              </Button>
              <Badge className="bg-violet-950/80 text-violet-300 border border-violet-500/50 font-mono text-xs px-2.5 py-1">Premium Feature</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-6">
          <TopProductsAnalytics
            topProducts={topProducts}
            totalRevenue={totalRevenue}
            totalOrders={totalOrders}
            itemsSold={itemsSold}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}