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
    const t = await entities.Transaction.list("-created_date", 500);
    setTransactions(t.filter((x) => x.status === "completed" && x.type === "sale"));
    setLoading(false);
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
    a.download = `stockmate-sales-${format(new Date(), "yyyy-MM-dd")}.csv`;
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
    <div className="p-4 md:p-6 space-y-6">
      {/* Tab switcher */}
      <div className="flex gap-2 border-b border-slate-200 pb-0">
        {[
          { id: "overview", label: "Overview" },
          { id: "monthly", label: "Monthly Analysis" },
          { id: "topCustomers", label: "Top Customers" },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
              ? "border-emerald-500 text-emerald-700"
              : "border-transparent text-slate-500 hover:text-slate-700"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "monthly" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <label className="text-xs text-slate-500 font-medium">Select Month</label>
              <input type="month" value={analysisMonth} onChange={e => setAnalysisMonth(e.target.value)}
                className="h-9 rounded-md border border-input px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
            </div>
            <Button onClick={handleRunAnalysis} disabled={runningAnalysis} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
              {runningAnalysis ? <><BarChart3 className="w-4 h-4 animate-pulse" /> Analyzing...</> : <><BarChart3 className="w-4 h-4" /> Run Analysis</>}
            </Button>
          </div>

          {monthlyReport && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { label: "Month", value: monthlyReport.month },
                  { label: "Transactions", value: monthlyReport.total_transactions },
                  { label: "Total Revenue", value: `₱${monthlyReport.total_revenue.toLocaleString("en-PH", { minimumFractionDigits: 2 })}` },
                ].map(k => (
                  <Card key={k.label} className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <p className="text-xs text-slate-500 uppercase tracking-wide">{k.label}</p>
                      <p className="text-xl font-bold text-slate-800 mt-1">{k.value}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* By Category */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-500" /> Sales by Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {monthlyReport.by_category.length === 0 ? (
                    <p className="text-sm text-slate-400 py-4 text-center">No category data</p>
                  ) : (
                    <div className="space-y-2">
                      {monthlyReport.by_category.map(cat => (
                        <div key={cat.category} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800">{cat.category}</p>
                            <p className="text-xs text-slate-400">{cat.qty_sold} units sold · {cat.margin_pct}% margin</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-bold text-emerald-600">₱{cat.revenue.toLocaleString()}</p>
                            <p className="text-xs text-slate-400">profit: ₱{cat.gross_profit.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* By Recipe */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-violet-500" /> Sales by Recipe
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {monthlyReport.by_recipe.length === 0 ? (
                    <p className="text-sm text-slate-400 py-4 text-center">No recipe data — link products to recipes to track this.</p>
                  ) : (
                    <div className="space-y-2">
                      {monthlyReport.by_recipe.map(r => (
                        <div key={r.recipe} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800">{r.recipe}</p>
                            <p className="text-xs text-slate-400">{r.qty_sold} sold · ~{r.estimated_batches} batches · {r.margin_pct}% margin</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-bold text-violet-600">₱{r.revenue.toLocaleString()}</p>
                            <p className="text-xs text-slate-400">profit: ₱{r.gross_profit.toLocaleString()}</p>
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
      {activeTab !== "overview" && null}
      {activeTab === "overview" && <>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 Days</SelectItem>
            <SelectItem value="30days">Last 30 Days</SelectItem>
            <SelectItem value="thisMonth">This Month</SelectItem>
            <SelectItem value="allTime">All Time</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={exportCSV} className="gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Revenue", value: `₱${totalRevenue.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`, color: "text-emerald-600" },
          { label: "Orders", value: totalOrders, color: "text-blue-600" },
          { label: "Avg. Order", value: `₱${avgOrder.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`, color: "text-violet-600" },
          { label: "Gross Profit", value: `₱${grossProfit.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`, color: grossProfit >= 0 ? "text-emerald-600" : "text-red-500" },
        ].map((kpi) => (
          <Card key={kpi.label} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">{kpi.label}</p>
              {loading ? (
                <div className="h-6 w-24 bg-slate-100 animate-pulse rounded mt-1" />
              ) : (
                <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Chart */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Daily Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="w-full h-[220px] bg-slate-50 animate-pulse rounded-lg border border-slate-100 flex items-center justify-center text-xs text-slate-450 font-medium">
              Loading daily revenue...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₱${v}`} />
                <Tooltip formatter={(v) => [`₱${v.toLocaleString()}`, "Revenue"]} />
                <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* P&L Summary */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            Profit & Loss Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total Revenue", value: `₱${totalRevenue.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`, color: "text-emerald-600", bg: "bg-emerald-50" },
              { label: "Total COGS", value: `₱${totalExpenses.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`, color: "text-red-500", bg: "bg-red-50" },
              { label: "Gross Profit", value: `₱${netProfit.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`, color: netProfit >= 0 ? "text-blue-600" : "text-red-500", bg: "bg-blue-50" },
              { label: "Profit Margin", value: `${profitMargin}%`, color: Number(profitMargin) >= 20 ? "text-emerald-600" : "text-orange-500", bg: "bg-orange-50" },
            ].map(item => (
              <div key={item.label} className={`${item.bg} rounded-xl p-4 text-center`}>
                <p className="text-xs text-slate-500 mb-1">{item.label}</p>
                {loading ? (
                  <div className="h-6 w-20 bg-slate-200/50 animate-pulse rounded mx-auto mt-1" />
                ) : (
                  <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sales Forecast */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <LineChartIcon className="w-4 h-4 text-violet-500" />
            Sales Forecast (Next 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="w-full h-[220px] bg-slate-50 animate-pulse rounded-lg border border-slate-100 flex items-center justify-center text-xs text-slate-450 font-medium">
              Loading sales forecast...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} interval={2} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `₱${v}`} />
                <Tooltip formatter={(v, name) => [`₱${(v || 0).toLocaleString()}`, name === "actual" ? "Actual" : "Forecast"]} />
                <ReferenceLine x={format(new Date(), "MMM d")} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: "Today", position: "top", fontSize: 10, fill: "#94a3b8" }} />
                <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} dot={false} connectNulls={false} />
                <Line type="monotone" dataKey="forecast" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" dot={false} connectNulls={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
          <p className="text-xs text-slate-405 mt-2 text-center">
            <span className="inline-flex items-center gap-1"><span className="w-4 h-0.5 bg-emerald-500 inline-block"></span> Actual</span>
            <span className="mx-3 inline-flex items-center gap-1"><span className="w-4 h-0.5 bg-violet-500 inline-block border-t-2 border-dashed border-violet-500"></span> Forecast</span>
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Payment Breakdown */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-500" />
              Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="w-full h-[200px] bg-slate-50 animate-pulse rounded-lg border border-slate-100 flex items-center justify-center text-xs text-slate-450 font-medium">
                Loading payment breakdown...
              </div>
            ) : paymentData.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={paymentData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                    {paymentData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `₱${v.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-violet-500" />
              Top Products
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="flex items-center gap-3 flex-1 min-w-0 mr-4">
                      <div className="w-5 h-5 rounded-full bg-slate-100 animate-pulse shrink-0" />
                      <div className="flex-1 space-y-1.5 min-w-0">
                        <div className="h-4 w-2/3 bg-slate-100 animate-pulse rounded" />
                        <div className="h-3 w-1/3 bg-slate-50 animate-pulse rounded" />
                      </div>
                    </div>
                    <div className="h-4 w-12 bg-slate-100 animate-pulse rounded shrink-0" />
                  </div>
                ))}
              </div>
            ) : topProducts.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No data</p>
            ) : (
              topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-xs font-bold text-slate-500 flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{p.name}</p>
                    <p className="text-xs text-slate-400">{p.qty} sold</p>
                  </div>
                  <p className="text-sm font-semibold text-emerald-600 shrink-0">
                    ₱{p.revenue.toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
      </>}
    </div>
  );
}