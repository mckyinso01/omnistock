import { useState, useEffect, useRef, useMemo } from "react";
import { entities } from "@/lib/db";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import PullToRefreshIndicator from "@/components/shared/PullToRefreshIndicator";
import LowStockWidget from "@/components/dashboard/LowStockWidget";
import LowStockBanner from "@/components/dashboard/LowStockBanner";
import { useStockNotifications } from "@/hooks/useStockNotifications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  Package,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  PhilippinePeso,
  Users,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, subDays } from "date-fns";

export default function Dashboard() {
  useStockNotifications();

  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  const loadData = async () => {
    setLoading(true);
    const [p, t, a, c] = await Promise.all([
      entities.Product.list("-created_date", 200),
      entities.Transaction.list("-created_date", 100),
      entities.StockAlert.filter({ status: "active" }),
      entities.Customer.list("-created_date", 200),
    ]);
    setProducts(p);
    setTransactions(t);
    setAlerts(a);
    setCustomers(c);
    setLoading(false);
  };

  const { pulling, pullDistance, refreshing, threshold } = usePullToRefresh(loadData, scrollRef);

  useEffect(() => {
    loadData();
  }, []);

  const todaySales = useMemo(() => {
    return transactions
      .filter(
        (t) =>
          t.status === "completed" &&
          t.type === "sale" &&
          new Date(t.created_date).toDateString() === new Date().toDateString()
      )
      .reduce((sum, t) => sum + (t.total_amount || 0), 0);
  }, [transactions]);

  const todayOrders = useMemo(() => {
    return transactions.filter(
      (t) =>
        t.status === "completed" &&
        t.type === "sale" &&
        new Date(t.created_date).toDateString() === new Date().toDateString()
    ).length;
  }, [transactions]);

  const lowStockCount = useMemo(() => {
    return products.filter(
      (p) => p.status === "active" && (p.quantity || 0) <= (p.low_stock_threshold || 10)
    ).length;
  }, [products]);

  const totalProducts = useMemo(() => {
    return products.filter((p) => p.status === "active").length;
  }, [products]);

  // Sales chart last 7 days
  const salesChart = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const day = subDays(new Date(), 6 - i);
      const dayStr = day.toDateString();
      const daySales = transactions
        .filter(
          (t) =>
            t.status === "completed" &&
            t.type === "sale" &&
            new Date(t.created_date).toDateString() === dayStr
        )
        .reduce((sum, t) => sum + (t.total_amount || 0), 0);
      return { day: format(day, "EEE"), sales: daySales };
    });
  }, [transactions]);

  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 5);
  }, [transactions]);

  const paymentColors = {
    cash: "bg-green-100 text-green-700",
    gcash: "bg-blue-100 text-blue-700",
    maya: "bg-purple-100 text-purple-700",
    card: "bg-orange-100 text-orange-700",
    bank_transfer: "bg-slate-100 text-slate-700",
    split: "bg-pink-100 text-pink-700",
  };

  return (
    <div ref={scrollRef} className="p-4 md:p-6 space-y-6 overflow-y-auto h-full">
      <PullToRefreshIndicator pulling={pulling} pullDistance={pullDistance} refreshing={refreshing} threshold={threshold} />
      {/* Low Stock Banner */}
      <LowStockBanner products={products} />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Today's Sales"
          value={`₱${todaySales.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`}
          icon={<PhilippinePeso className="w-5 h-5" />}
          color="from-emerald-500 to-teal-600"
          sub={`${todayOrders} orders`}
          loading={loading}
        />
        <KPICard
          title="Total Products"
          value={totalProducts}
          icon={<Package className="w-5 h-5" />}
          color="from-blue-500 to-indigo-600"
          sub="active items"
          loading={loading}
        />
        <KPICard
          title="Transactions"
          value={transactions.filter((t) => t.status === "completed").length}
          icon={<ShoppingCart className="w-5 h-5" />}
          color="from-violet-500 to-purple-600"
          sub="all time"
          loading={loading}
        />
        <KPICard
          title="Stock Alerts"
          value={alerts.length}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="from-orange-500 to-red-500"
          sub={`${lowStockCount} low stock`}
          urgent={alerts.length > 0}
          loading={loading}
        />
        <KPICard
          title="Customers"
          value={customers.length}
          icon={<Users className="w-5 h-5" />}
          color="from-pink-500 to-rose-600"
          sub={`${customers.filter(c => (c.loyalty_points || 0) >= 500).length} loyalty members`}
          loading={loading}
        />
      </div>

      {/* Chart + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sales Chart */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Sales — Last 7 Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="w-full h-[200px] bg-slate-50 animate-pulse rounded-lg border border-slate-100 flex items-center justify-center text-xs text-slate-450 font-medium">
                Loading sales trend...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={salesChart}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₱${v}`} />
                  <Tooltip formatter={(v) => [`₱${v.toLocaleString()}`, "Sales"]} />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#salesGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold text-slate-800">Recent Sales</CardTitle>
            <Link to="/pos" className="text-xs text-emerald-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="space-y-1.5 flex-1 mr-4">
                      <div className="h-4 w-2/3 bg-slate-100 animate-pulse rounded" />
                      <div className="h-3 w-1/3 bg-slate-50 animate-pulse rounded" />
                    </div>
                    <div className="h-4 w-12 bg-slate-100 animate-pulse rounded" />
                  </div>
                ))}
              </div>
            ) : recentTransactions.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">No transactions yet</p>
            ) : (
              recentTransactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">
                      {t.customer_name || `Txn #${t.transaction_number || t.id.slice(-6)}`}
                    </p>
                    <Badge className={`text-xs mt-0.5 ${paymentColors[t.payment_method] || "bg-slate-100 text-slate-600"}`}>
                      {t.payment_method}
                    </Badge>
                  </div>
                  <span className="text-sm font-semibold text-slate-800 shrink-0 ml-2">
                    ₱{(t.total_amount || 0).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Widget */}
      <LowStockWidget products={products} />
    </div>
  );
}

function KPICard({ title, value, icon, color, sub, urgent, loading }) {
  return (
    <Card className={`border-0 shadow-sm overflow-hidden ${urgent ? "ring-2 ring-red-300" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</p>
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-white`}>
            {icon}
          </div>
        </div>
        {loading ? (
          <div className="space-y-1.5 py-1">
            <div className="h-6 w-24 bg-slate-100 animate-pulse rounded" />
            <div className="h-3 w-16 bg-slate-50 animate-pulse rounded" />
          </div>
        ) : (
          <>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}