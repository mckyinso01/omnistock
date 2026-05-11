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
    const [t, p] = await Promise.all([
      entities.Transaction.list("-created_date", 1000),
      entities.Product.list("name", 300),
    ]);
    setTransactions(t.filter(x => x.status === "completed" && x.type === "sale"));
    setProducts(p);
    setLoading(false);
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
      if (!productSales[item.product_name]) productSales[item.product_name] = { qty: 0, revenue: 0 };
      productSales[item.product_name].qty += item.quantity || 0;
      productSales[item.product_name].revenue += item.subtotal || 0;
    });
  });
  const topProducts = Object.entries(productSales)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

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
    doc.text("StockMate - Sales Report", 14, 18);
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
    doc.text("Generated by StockMate Inventory & POS System", 14, 285);

    doc.save(`StockMate-Report-${periodLabel}-${format(new Date(), "yyyy-MM-dd")}.pdf`);
    setGenerating(false);
  };

  const sendEmailReport = async () => {
    if (!emailTo || !emailTo.includes("@")) return alert("Enter a valid email address.");
    setSendingEmail(true);
    const periodLabel = { thisWeek: "This Week", lastWeek: "Last Week", thisMonth: "This Month", lastMonth: "Last Month", last7: "Last 7 Days" }[period] || period;

    const emailBody = `
Hi,

Here is your StockMate Sales Report for ${periodLabel}:

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

— StockMate Automated Reports
    `;

    await base44.integrations.Core.SendEmail({
      to: emailTo,
      subject: `StockMate Sales Report — ${periodLabel} (${format(new Date(), "MMMM d, yyyy")})`,
      body: emailBody,
    });
    setSendingEmail(false);
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 4000);
  };

  if (loading) return <div className="p-6 text-slate-400">Loading report data...</div>;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Sales Reports</h1>
          <p className="text-sm text-slate-500">Generate at i-email ang iyong business reports</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="thisWeek">This Week</SelectItem>
            <SelectItem value="lastWeek">Last Week</SelectItem>
            <SelectItem value="last7">Last 7 Days</SelectItem>
            <SelectItem value="thisMonth">This Month</SelectItem>
            <SelectItem value="lastMonth">Last Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: DollarSign, label: "Revenue", value: `₱${totalRevenue.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`, color: "text-emerald-600", bg: "bg-emerald-50" },
          { icon: ShoppingBag, label: "Orders", value: totalOrders, color: "text-blue-600", bg: "bg-blue-50" },
          { icon: TrendingUp, label: "Gross Profit", value: `₱${grossProfit.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`, color: grossProfit >= 0 ? "text-violet-600" : "text-red-500", bg: "bg-violet-50" },
          { icon: Package, label: "Profit Margin", value: `${profitMargin}%`, color: Number(profitMargin) >= 20 ? "text-emerald-600" : "text-orange-500", bg: "bg-orange-50" },
        ].map(kpi => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="border-0 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">{kpi.label}</p>
                  <p className={`text-lg font-bold ${kpi.color}`}>{kpi.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-violet-500" />
              Top Products
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topProducts.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">No sales data for this period</p>
            ) : topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3 py-1.5 border-b border-slate-50 last:border-0">
                <span className="w-6 h-6 rounded-full bg-slate-100 text-xs font-bold text-slate-500 flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{p.name}</p>
                  <p className="text-xs text-slate-400">{p.qty} sold</p>
                </div>
                <p className="text-sm font-semibold text-emerald-600 shrink-0">₱{p.revenue.toLocaleString()}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Low Stock Summary */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Package className="w-4 h-4 text-orange-500" />
              Low Stock Items
              {lowStockItems.length > 0 && (
                <Badge className="bg-red-100 text-red-600 border-0 text-xs">{lowStockItems.length}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {lowStockItems.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm text-slate-400">All stocks are sufficient!</p>
              </div>
            ) : lowStockItems.slice(0, 8).map(p => (
              <div key={p.id} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                <p className="text-sm font-medium text-slate-800 truncate">{p.name}</p>
                <Badge className={`text-xs border-0 ${(p.quantity || 0) === 0 ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"}`}>
                  {p.quantity || 0} {p.unit || "pcs"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Generate & Send */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Download PDF */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              Download PDF Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-slate-500">
              I-download ang kompletong sales report bilang PDF file na may sales summary, top products, at low stock alerts.
            </p>
            <Button
              onClick={generatePDF}
              disabled={generating}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {generating ? "Generating..." : "Download PDF Report"}
            </Button>
          </CardContent>
        </Card>

        {/* Email Report */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-500" />
              Send via Email
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500">Send report to email:</Label>
              <Input
                type="email"
                placeholder="example@email.com"
                value={emailTo}
                onChange={e => setEmailTo(e.target.value)}
              />
            </div>
            <Button
              onClick={sendEmailReport}
              disabled={sendingEmail || emailSent}
              className={`w-full gap-2 ${emailSent ? "bg-emerald-600" : "bg-emerald-600 hover:bg-emerald-700"} text-white`}
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
      <Card className="border-0 shadow-sm border-l-4 border-l-violet-400">
        <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5 text-violet-500" />
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="font-semibold text-slate-800">Automated Report Schedule</h3>
            <p className="text-sm text-slate-500">Awtomatikong magsend ng report sa iyong email. Available sa Premium plan.</p>
            <div className="flex flex-wrap gap-2 items-center">
              <Select value={scheduleFreq} onValueChange={setScheduleFreq}>
                <SelectTrigger className="w-36 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly (Mon)</SelectItem>
                  <SelectItem value="monthly">Monthly (1st)</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white gap-1 h-8 text-xs">
                <Calendar className="w-3 h-3" />
                Set Schedule
              </Button>
              <Badge className="bg-violet-100 text-violet-700 border-0 text-xs">Premium Feature</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}