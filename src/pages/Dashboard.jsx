import { useState, useEffect, useRef } from "react";
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
  const { pulling, pullDistance, refreshing, threshold } = usePullToRefresh(loadData, scrollRef);

  useEffect(() => {
    loadData();
  }, []);

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

  const todaySales = transactions
    .filter(
      (t) =>
        t.status === "completed" &&
        t.type === "sale" &&
        new Date(t.created_date).toDateString() === new Date().toDateString()
    )
    .reduce((sum, t) => sum + (t.total_amount || 0), 0);

  const todayOrders = transactions.filter(
    (t) =>
      t.status === "completed" &&
      t.type === "sale" &&
      new Date(t.created_date).toDateString() === new Date().toDateString()
  ).length;

  const lowStockCount = products.filter(
    (p) => p.status === "active" && (p.quantity || 0) <= (p.low_stock_threshold || 10)
  ).length;

  const totalProducts = products.filter((p) => p.status === "active").length;

  // Sales chart last 7 days
  const salesChart = Array.from({ length: 7 }, (_, i) => {
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

  const recentTransactions = transactions.slice(0, 5);

  const paymentColors = {
    cash: "bg-green-100 text-green-700",
    gcash: "bg-blue-100 text-blue-700",
    maya: "bg-purple-100 text-purple-700",
    card: "bg-orange-100 text-orange-700",
    bank_transfer: "bg-slate-100 text-slate-700",
    split: "bg-pink-100 text-pink-700",
  };

  if (loading) {
    return (
      <div className="p-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-slate-200 animate-pulse" />
        ))}
      </div>
    );
  }

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
        />
        <KPICard
          title="Total Products"
          value={totalProducts}
          icon={<Package className="w-5 h-5" />}
          color="from-blue-500 to-indigo-600"
          sub="active items"
        />
        <KPICard
          title="Transactions"
          value={transactions.filter((t) => t.status === "completed").length}
          icon={<ShoppingCart className="w-5 h-5" />}
          color="from-violet-500 to-purple-600"
          sub="all time"
        />
        <KPICard
          title="Stock Alerts"
          value={alerts.length}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="from-orange-500 to-red-500"
          sub={`${lowStockCount} low stock`}
          urgent={alerts.length > 0}
        />
        <KPICard
          title="Customers"
          value={customers.length}
          icon={<Users className="w-5 h-5" />}
          color="from-pink-500 to-rose-600"
          sub={`${customers.filter(c => (c.loyalty_points || 0) >= 500).length} loyalty members`}
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
            {recentTransactions.length === 0 ? (
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

function KPICard({ title, value, icon, color, sub, urgent }) {
  return (
    <Card className={`border-0 shadow-sm overflow-hidden ${urgent ? "ring-2 ring-red-300" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</p>
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-white`}>
            {icon}
          </div>
        </div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
      </CardContent>
    </Card>
  );
}