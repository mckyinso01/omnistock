import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, TrendingUp, BarChart3, ShoppingBag } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";
import { format, subDays, startOfDay, endOfDay, startOfWeek, startOfMonth } from "date-fns";

const COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4"];

export default function Analytics() {
  const [transactions, setTransactions] = useState([]);
  const [period, setPeriod] = useState("7days");
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const t = await base44.entities.Transaction.list("-created_date", 500);
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

  if (loading) return <div className="p-6 text-slate-400">Loading analytics...</div>;

  return (
    <div className="p-4 md:p-6 space-y-6">
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
              <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
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
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₱${v}`} />
              <Tooltip formatter={(v) => [`₱${v.toLocaleString()}`, "Revenue"]} />
              <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
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
            {paymentData.length === 0 ? (
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
            {topProducts.length === 0 ? (
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
    </div>
  );
}