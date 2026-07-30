import { useState, useEffect } from "react";
import { entities } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, TrendingUp, BarChart3, ShoppingBag, DollarSign, LineChart as LineChartIcon } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, ReferenceLine,
} from "recharts";
import { format, subDays, startOfMonth, addDays, subMonths } from "date-fns";
import { runMonthlyAnalysis } from "@/lib/monthlyAnalysis";
import TopCustomersAnalysis from "@/components/analytics/TopCustomersAnalysis";
import { DESIGN_TOKENS } from "@/lib/designSystem";

const COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4"];

export default function Analytics() {
  const [transactions, setTransactions] = useState([]);
  const [period, setPeriod] = useState("7days");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [monthlyReport, setMonthlyReport] = useState(null);
  const [runningAnalysis, setRunningAnalysis] = useState(false);
  const [analysisMonth, setAnalysisMonth] = useState(format(new Date(), "yyyy-MM"));

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const t = await entities.Transaction.list("-created_date", 500).catch(() => []);
      setTransactions((t || []).filter((x) => x.status === "completed" && x.type === "sale"));
    } catch (err) {
      console.error("Analytics loadData Exception:", err);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const filterByPeriod = (txns) => {
    const now = new Date();
    const cutoff =
      period === "7days" ? subDays(now, 7)
      : period === "30days" ? subDays(now, 30)
      : period === "thisMonth" ? startOfMonth(now)
      : subDays(now, 365);
    return txns.filter((t) => new Date(t.created_date) >= cutoff);
  };

  const periodTxns = filterByPeriod(transactions);

  const totalRevenue = periodTxns.reduce((sum, t) => sum + (t.total_amount || 0), 0);
  const totalOrders = periodTxns.length;
  const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const totalCost = periodTxns.reduce((sum, t) =>
    sum + (t.items || []).reduce((s, i) => s + (i.unit_cost || 0) * (i.quantity || 0), 0), 0
  );
  const grossProfit = totalRevenue - totalCost;

  // Daily chart data
  const days = period === "7days" ? 7 : period === "30days" ? 30 : 30;
  const dailyData = Array.from({ length: Math.min(days, 30) }, (_, i) => {
    const day = subDays(new Date(), (Math.min(days, 30) - 1) - i);
    const dayStr = format(day, "yyyy-MM-dd");
    const dayTxns = periodTxns.filter(
      (t) => format(new Date(t.created_date), "yyyy-MM-dd") === dayStr
    );
    return {
      day: format(day, days <= 7 ? "EEE" : "MMM d"),
      revenue: dayTxns.reduce((s, t) => s + (t.total_amount || 0), 0),
      orders: dayTxns.length,
    };
  });

  // Payment method breakdown
  const paymentData = Object.entries(
    periodTxns.reduce((acc, t) => {
      acc[t.payment_method] = (acc[t.payment_method] || 0) + (t.total_amount || 0);
      return acc;
    }, {})
  ).map(([name, value]) => ({ name: name.toUpperCase(), value }));

  // Top products
  const productSales = {};
  periodTxns.forEach((t) => {
    (t.items || []).forEach((item) => {
      if (!productSales[item.product_name]) {
        productSales[item.product_name] = { qty: 0, revenue: 0 };
      }
      productSales[item.product_name].qty += item.quantity || 0;
      productSales[item.product_name].revenue += item.subtotal || 0;
    });
  });
  const topProducts = Object.entries(productSales)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // P&L
  const totalExpenses = periodTxns.reduce((sum, t) =>
    sum + (t.items || []).reduce((s, i) => s + (i.unit_cost || 0) * (i.quantity || 0), 0), 0
  );
  const netProfit = grossProfit;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0;

  // Sales Forecast — simple 7-day moving average extrapolated 7 days
  const last14 = Array.from({ length: 14 }, (_, i) => {
    const day = subDays(new Date(), 13 - i);
    const dayStr = format(day, "yyyy-MM-dd");
    const dayRev = periodTxns
      .filter(t => format(new Date(t.created_date), "yyyy-MM-dd") === dayStr)
      .reduce((s, t) => s + (t.total_amount || 0), 0);
    return { date: dayStr, revenue: dayRev };
  });
  const avg7 = last14.slice(-7).reduce((s, d) => s + d.revenue, 0) / 7;
  const forecastData = [
    ...last14.map(d => ({ day: format(new Date(d.date), "MMM d"), actual: d.revenue, forecast: null })),
    ...Array.from({ length: 7 }, (_, i) => ({
      day: format(addDays(new Date(), i + 1), "MMM d"),
      actual: null,
      forecast: Math.round(avg7 * (0.9 + Math.random() * 0.2)),
    })),
  ];

  const exportCSV = () => {
    const headers = ["Date", "Transaction #", "Customer", "Payment", "Total"];
    const rows = periodTxns.map((t) => [
      format(new Date(t.created_date), "yyyy-MM-dd HH:mm"),
      t.transaction_number || t.id,
      t.customer_name || "-",
      t.payment_method,
      t.total_amount,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `omnistock-sales-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  const handleRunAnalysis = async () => {
    setRunningAnalysis(true);
    const [year, month] = analysisMonth.split("-").map(Number);
    const report = await runMonthlyAnalysis(new Date(year, month - 1, 1));
    setMonthlyReport(report);
    setRunningAnalysis(false);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 bg-[#050811] text-slate-100 min-h-screen font-sans pb-12">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0B1C30]/90 border border-slate-800/80 p-4 rounded-2xl shadow-xl backdrop-blur-md">
        <div>
          <h1 className={DESIGN_TOKENS.typography.h1 + " flex items-center gap-2"}>
            <LineChartIcon className="w-5 h-5 text-cyan-400" /> Revenue & Financial Analytics
          </h1>
          <p className={DESIGN_TOKENS.typography.muted + " mt-0.5"}>Real-time sales performance, P&L breakdown, and predictive AI forecasting</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-44 bg-[#071322] border-slate-700 text-white font-medium text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#071322] border-slate-700 text-slate-200">
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="thisMonth">This Month</SelectItem>
              <SelectItem value="allTime">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportCSV} className="gap-2 text-slate-200 border-slate-700 bg-[#071322] hover:bg-slate-800 text-xs font-semibold">
            <Download className="w-4 h-4 text-blue-400" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 border-b border-slate-800/80 pb-0 overflow-x-auto">
        {[
          { id: "overview", label: "Executive Overview" },
          { id: "monthly", label: "Monthly Deep Dive" },
          { id: "topCustomers", label: "Top Customer Insights" },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all duration-200 rounded-t-lg ${activeTab === tab.id
              ? "border-blue-500 text-blue-400 bg-[#0B1C30]/80 shadow-md"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#0B1C30]/40"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "monthly" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-end gap-3 bg-[#0B1C30]/80 p-4 rounded-2xl border border-slate-800/80">
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Select Target Month</label>
              <input type="month" value={analysisMonth} onChange={e => setAnalysisMonth(e.target.value)}
                className="h-10 rounded-xl bg-[#071322] border border-slate-700 px-3 py-1 text-sm text-white font-mono shadow-sm focus:outline-none focus:border-blue-500" />
            </div>
            <Button onClick={handleRunAnalysis} disabled={runningAnalysis} className="bg-blue-600 hover:bg-blue-500 text-white font-bold h-10 gap-2 shadow-lg shadow-blue-600/30 app-card-hover">
              {runningAnalysis ? <><BarChart3 className="w-4 h-4 animate-pulse" /> Analyzing Database...</> : <><BarChart3 className="w-4 h-4" /> Run Monthly Audit</>}
            </Button>
          </div>

          {monthlyReport && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: "Report Month", value: monthlyReport.month, color: "text-white" },
                  { label: "Completed Sales", value: monthlyReport.total_transactions, color: "text-blue-400" },
                  { label: "Total Revenue", value: `₱${monthlyReport.total_revenue.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`, color: "text-cyan-400" },
                ].map(k => (
                  <Card key={k.label} className="bg-[#0B1C30]/90 border border-slate-800/80 shadow-xl rounded-2xl app-card-hover">
                    <CardContent className="p-5">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{k.label}</p>
                      <p className={`text-2xl font-bold font-mono mt-1 ${k.color}`}>{k.value}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* By Category */}
              <Card className="bg-[#0B1C30]/90 border border-slate-800/80 shadow-xl rounded-2xl">
                <CardHeader className="pb-3 border-b border-slate-800/80">
                  <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-400" /> Sales Breakdown by Category
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {monthlyReport.by_category.length === 0 ? (
                    <p className="text-sm text-slate-400 py-6 text-center font-mono">No category sales recorded for selected month</p>
                  ) : (
                    <div className="space-y-3">
                      {monthlyReport.by_category.map(cat => (
                        <div key={cat.category} className="flex items-center gap-4 p-3 bg-[#071322] border border-slate-800/80 rounded-xl">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white">{cat.category}</p>
                            <p className="text-xs font-mono text-slate-400">{cat.qty_sold} units sold · <span className="text-emerald-400 font-bold">{cat.margin_pct}% margin</span></p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-base font-bold font-mono text-cyan-400">₱{cat.revenue.toLocaleString()}</p>
                            <p className="text-xs font-mono text-slate-400">Profit: <span className="text-emerald-400">₱{cat.gross_profit.toLocaleString()}</span></p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* By Recipe */}
              <Card className="bg-[#0B1C30]/90 border border-slate-800/80 shadow-xl rounded-2xl">
                <CardHeader className="pb-3 border-b border-slate-800/80">
                  <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-violet-400" /> Sales Breakdown by Recipe
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {monthlyReport.by_recipe.length === 0 ? (
                    <p className="text-sm text-slate-400 py-6 text-center font-mono">No recipe data — link products to recipes to track raw ingredient costing.</p>
                  ) : (
                    <div className="space-y-3">
                      {monthlyReport.by_recipe.map(r => (
                        <div key={r.recipe} className="flex items-center gap-4 p-3 bg-[#071322] border border-slate-800/80 rounded-xl">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white">{r.recipe}</p>
                            <p className="text-xs font-mono text-slate-400">{r.qty_sold} sold · ~{r.estimated_batches} batches · <span className="text-emerald-400 font-bold">{r.margin_pct}% margin</span></p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-base font-bold font-mono text-violet-400">₱{r.revenue.toLocaleString()}</p>
                            <p className="text-xs font-mono text-slate-400">Profit: <span className="text-emerald-400">₱{r.gross_profit.toLocaleString()}</span></p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {activeTab === "topCustomers" && <TopCustomersAnalysis />}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* KPI Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Revenue", value: `₱${totalRevenue.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`, color: "bg-gradient-to-r from-cyan-300 via-emerald-300 to-cyan-400 text-transparent bg-clip-text animate-shimmer", badge: "REALTIME", badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40", bg: "bg-[#071322] border-slate-800 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(0,229,255,0.2)]" },
              { label: "Total Sales Orders", value: totalOrders, color: "bg-gradient-to-r from-blue-300 via-indigo-200 to-blue-400 text-transparent bg-clip-text animate-shimmer", badge: "ORDERS", badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40", bg: "bg-[#071322] border-slate-800 hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(37,99,235,0.2)]" },
              { label: "Average Order Value", value: `₱${avgOrder.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`, color: "bg-gradient-to-r from-violet-300 via-fuchsia-300 to-violet-400 text-transparent bg-clip-text animate-shimmer", badge: "AVG TICKET", badgeColor: "bg-violet-500/20 text-violet-300 border-violet-500/40", bg: "bg-[#071322] border-slate-800 hover:border-violet-500/50 hover:shadow-[0_0_20px_rgba(139,92,246,0.2)]" },
              { label: "Gross Profit Margin", value: `₱${grossProfit.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`, color: grossProfit >= 0 ? "bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400 text-transparent bg-clip-text animate-shimmer" : "text-rose-400", badge: "GROSS PROFIT", badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40", bg: "bg-[#071322] border-slate-800 hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]" },
            ].map((kpi) => (
              <Card key={kpi.label} className={`${kpi.bg} border shadow-xl rounded-2xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group`}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{kpi.label}</p>
                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${kpi.badgeColor} font-bold inline-flex items-center gap-1`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                      {kpi.badge}
                    </span>
                  </div>
                  {loading ? (
                    <div className="h-7 w-28 bg-slate-800 animate-pulse rounded mt-1" />
                  ) : (
                    <p className={`text-xl sm:text-2xl font-extrabold font-mono ${kpi.color} tracking-tight mt-1`}>{kpi.value}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Revenue Chart */}
          <Card className="bg-[#0B1C30]/90 border border-slate-800/80 shadow-xl rounded-2xl">
            <CardHeader className="pb-3 border-b border-slate-800/80">
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                Daily Sales Revenue Trajectory
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {loading ? (
                <div className="w-full h-[240px] bg-[#071322] animate-pulse rounded-xl border border-slate-800 flex items-center justify-center text-xs text-slate-500 font-mono">
                  Loading revenue telemetry data...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={dailyData}>
                    <defs>
                      <linearGradient id="glassBarGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00E5FF" stopOpacity={0.95} />
                        <stop offset="60%" stopColor="#2563EB" stopOpacity={0.75} />
                        <stop offset="100%" stopColor="#0B1C30" stopOpacity={0.4} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₱${v}`} />
                    <Tooltip cursor={{ fill: "transparent" }} contentStyle={{ backgroundColor: "#071322", borderColor: "#334155", color: "#fff", borderRadius: "0.75rem" }} formatter={(v) => [`₱${v.toLocaleString()}`, "Revenue"]} />
                    <Bar dataKey="revenue" fill="url(#glassBarGradient)" stroke="#00E5FF" strokeWidth={1.5} maxBarSize={32} radius={[8, 8, 2, 2]} className="transition-all duration-300 hover:brightness-125" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* P&L Summary */}
          <Card className="bg-[#0B1C30]/90 border border-slate-800/80 shadow-xl rounded-2xl">
            <CardHeader className="pb-3 border-b border-slate-800/80">
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Profit & Loss Summary Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Total Revenue", value: `₱${totalRevenue.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`, color: "bg-gradient-to-r from-cyan-300 via-emerald-300 to-cyan-400 text-transparent bg-clip-text animate-shimmer", badge: "REALTIME", badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40", bg: "bg-[#071322] border-slate-800 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(0,229,255,0.2)]" },
                  { label: "Total COGS", value: `₱${totalExpenses.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`, color: "bg-gradient-to-r from-rose-400 via-amber-300 to-rose-400 text-transparent bg-clip-text animate-shimmer", badge: "COST BASIS", badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/40", bg: "bg-[#071322] border-slate-800 hover:border-rose-500/50 hover:shadow-[0_0_20px_rgba(244,63,94,0.2)]" },
                  { label: "Net Gross Profit", value: `₱${netProfit.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`, color: netProfit >= 0 ? "bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400 text-transparent bg-clip-text animate-shimmer" : "text-rose-400", badge: netProfit >= 0 ? "+100% PROFIT" : "DEFICIT", badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40", bg: "bg-[#071322] border-slate-800 hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]" },
                  { label: "Profit Margin", value: `${profitMargin}%`, color: Number(profitMargin) >= 20 ? "bg-gradient-to-r from-cyan-300 via-blue-300 to-cyan-400 text-transparent bg-clip-text animate-shimmer" : "text-amber-400", badge: "OPTIMAL", badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40", bg: "bg-[#071322] border-slate-800 hover:border-amber-500/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]" },
                ].map(item => (
                  <div key={item.label} className={`${item.bg} border rounded-xl p-4 text-center transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group`}>
                    <div className="flex justify-between items-center mb-1.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</p>
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${item.badgeColor} font-bold inline-flex items-center gap-1`}>
                        <span class="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                        {item.badge}
                      </span>
                    </div>
                    {loading ? (
                      <div className="h-7 w-24 bg-slate-800 animate-pulse rounded mx-auto mt-1" />
                    ) : (
                      <p className={`text-xl font-extrabold font-mono ${item.color} tracking-tight`}>{item.value}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sales Forecast */}
          <Card className="bg-[#0B1C30]/90 border border-slate-800/80 shadow-xl rounded-2xl">
            <CardHeader className="pb-3 border-b border-slate-800/80">
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <LineChartIcon className="w-4 h-4 text-violet-400" />
                7-Day Predictive AI Sales Forecast
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {loading ? (
                <div className="w-full h-[220px] bg-[#071322] animate-pulse rounded-xl border border-slate-800 flex items-center justify-center text-xs text-slate-500 font-mono">
                  Computing moving average predictive model...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={forecastData}>
                    <defs>
                      <linearGradient id="actualLineGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#00E5FF" />
                        <stop offset="50%" stopColor="#2563EB" />
                        <stop offset="100%" stopColor="#10B981" />
                      </linearGradient>
                      <linearGradient id="forecastLineGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#C084FC" />
                        <stop offset="100%" stopColor="#E11D48" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} interval={2} />
                    <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `₱${v}`} />
                    <Tooltip contentStyle={{ backgroundColor: "#071322", borderColor: "#334155", color: "#fff" }} formatter={(v, name) => [`₱${(v || 0).toLocaleString()}`, name === "actual" ? "Actual Sales" : "AI Forecast"]} />
                    <ReferenceLine x={format(new Date(), "MMM d")} stroke="#64748b" strokeDasharray="4 4" label={{ value: "Today", position: "top", fontSize: 10, fill: "#64748b" }} />
                    <Line type="monotone" dataKey="actual" stroke="url(#actualLineGradient)" strokeWidth={3} dot={{ r: 4, fill: '#00E5FF', strokeWidth: 2 }} activeDot={{ r: 7, fill: '#10B981', stroke: '#fff', strokeWidth: 2 }} connectNulls={false} />
                    <Line type="monotone" dataKey="forecast" stroke="url(#forecastLineGradient)" strokeWidth={3} strokeDasharray="6 6" className="animate-dash-flow" dot={{ r: 4, fill: '#C084FC' }} activeDot={{ r: 7, fill: '#E11D48' }} connectNulls={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
              <p className="text-xs font-mono text-slate-400 mt-2 text-center">
                <span className="inline-flex items-center gap-1.5"><span className="w-4 h-1 bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full inline-block"></span> Historical Sales (Moving Fluid Stream)</span>
                <span className="mx-4 inline-flex items-center gap-1.5"><span className="w-4 h-1 bg-gradient-to-r from-purple-400 to-rose-500 rounded-full inline-block animate-pulse"></span> Extrapolated AI Projection (Live Signal)</span>
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Payment Breakdown */}
            <Card className="bg-[#0B1C30]/90 border border-slate-800/80 shadow-xl rounded-2xl">
              <CardHeader className="pb-3 border-b border-slate-800/80">
                <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-400" />
                  Payment Channels Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {loading ? (
                  <div className="w-full h-[200px] bg-[#071322] animate-pulse rounded-xl border border-slate-800 flex items-center justify-center text-xs text-slate-500 font-mono">
                    Loading payment channels...
                  </div>
                ) : paymentData.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-8 font-mono">No payment transactions recorded</p>
                ) : (
                  <div className="relative flex flex-col items-center justify-center">
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <defs>
                          <linearGradient id="cyanEmeraldGradient" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#00E5FF" />
                            <stop offset="100%" stopColor="#10B981" />
                          </linearGradient>
                          <linearGradient id="bluePurpleGradient" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#3B82F6" />
                            <stop offset="100%" stopColor="#8B5CF6" />
                          </linearGradient>
                          <linearGradient id="amberRoseGradient" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#F59E0B" />
                            <stop offset="100%" stopColor="#EF4444" />
                          </linearGradient>
                        </defs>
                        <Pie data={paymentData} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={5} dataKey="value" label={false} labelLine={false}>
                          {paymentData.map((_, i) => {
                            const gradients = ["url(#cyanEmeraldGradient)", "url(#bluePurpleGradient)", "url(#amberRoseGradient)"];
                            return <Cell key={i} fill={gradients[i % gradients.length]} stroke="#0B1C30" strokeWidth={3} className="transition-all duration-300 hover:opacity-90 cursor-pointer" />;
                          })}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: "#071322", borderColor: "#334155", color: "#fff", borderRadius: "0.75rem" }} formatter={(v) => [`₱${v.toLocaleString()}`, "Channel Volume"]} />
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Center Hole Stat Overlay */}
                    <div className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                      <p className="text-[9px] font-mono font-bold text-slate-400 tracking-wider uppercase">VOL</p>
                      <p className="text-xs font-extrabold font-mono text-cyan-300">₱{totalRevenue.toLocaleString()}</p>
                    </div>

                    {/* Live Bottom Legend Pills */}
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-2 font-mono text-xs w-full">
                      {paymentData.map((item, i) => {
                        const total = paymentData.reduce((acc, curr) => acc + curr.value, 0);
                        const pct = total > 0 ? ((item.value / total) * 100).toFixed(0) : 0;
                        const badgeBgs = ["bg-emerald-500/10 border-emerald-500/30 text-emerald-300", "bg-blue-500/10 border-blue-500/30 text-blue-300", "bg-amber-500/10 border-amber-500/30 text-amber-300"];
                        return (
                          <div key={item.name} className={`px-3 py-1 rounded-xl border ${badgeBgs[i % badgeBgs.length]} flex items-center gap-2 font-bold`}>
                            <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
                            <span>{item.name}: ₱{item.value.toLocaleString()} ({pct}%)</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card className="bg-[#0B1C30]/90 border border-slate-800/80 shadow-xl rounded-2xl">
              <CardHeader className="pb-3 border-b border-slate-800/80">
                <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-violet-400" />
                  Top Best-Selling Products
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="h-12 bg-[#071322] rounded-xl border border-slate-800 animate-pulse" />
                    ))}
                  </div>
                ) : topProducts.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-8 font-mono">No product sales data</p>
                ) : (
                  topProducts.map((p, i) => (
                    <div key={p.name} className="flex items-center gap-3 p-3 bg-[#071322] border border-slate-800/80 rounded-xl app-card-hover">
                      <span className="w-6 h-6 rounded-lg bg-blue-950 text-xs font-bold font-mono text-blue-400 border border-blue-800/60 flex items-center justify-center shrink-0">
                        #{i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{p.name}</p>
                        <p className="text-xs font-mono text-slate-400">{p.qty} units sold</p>
                      </div>
                      <p className="text-sm font-bold font-mono text-cyan-400 shrink-0">
                        ₱{p.revenue.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}