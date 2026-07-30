import { useState, useEffect, useRef, useMemo } from "react";
import { entities } from "@/lib/db";
import { DESIGN_TOKENS } from "@/lib/designSystem";
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
    try {
      const [p, t, a, c] = await Promise.all([
        entities.Product.list("-created_date", 200).catch(() => []),
        entities.Transaction.list("-created_date", 100).catch(() => []),
        entities.StockAlert.filter({ status: "active" }).catch(() => []),
        entities.Customer.list("-created_date", 200).catch(() => []),
      ]);
      setProducts(p || []);
      setTransactions(t || []);
      setAlerts(a || []);
      setCustomers(c || []);
    } catch (err) {
      console.error("Dashboard loadData Exception:", err);
      setProducts([]);
      setTransactions([]);
      setAlerts([]);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
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

  return (
    <div ref={scrollRef} className="p-4 md:p-6 space-y-6 overflow-y-auto h-full">
      <PullToRefreshIndicator pulling={pulling} pullDistance={pullDistance} refreshing={refreshing} threshold={threshold} />
      {/* Low Stock Banner */}
      <LowStockBanner products={products} />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Today's Sales"
          value={DESIGN_TOKENS.formatCurrency(todaySales)}
          icon={<PhilippinePeso className="w-5 h-5" />}
          variant="cyber"
          sub={`${todayOrders} orders`}
          loading={loading}
        />
        <KPICard
          title="Total Products"
          value={totalProducts}
          icon={<Package className="w-5 h-5" />}
          variant="cyber"
          sub="active items"
          loading={loading}
        />
        <KPICard
          title="Transactions"
          value={transactions.filter((t) => t.status === "completed").length}
          icon={<ShoppingCart className="w-5 h-5" />}
          variant="emerald"
          sub="all time"
          loading={loading}
        />
        <KPICard
          title="Stock Alerts"
          value={alerts.length}
          icon={<AlertTriangle className="w-5 h-5" />}
          variant="amber"
          sub={`${lowStockCount} low stock`}
          urgent={alerts.length > 0}
          loading={loading}
        />
        <KPICard
          title="Customers"
          value={customers.length}
          icon={<Users className="w-5 h-5" />}
          variant="cyber"
          sub={`${customers.filter(c => (c.loyalty_points || 0) >= 500).length} loyalty members`}
          loading={loading}
        />
      </div>

      {/* Chart + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sales Chart */}
        <Card className="lg:col-span-2 water-breathing-card rounded-2xl">
          <CardHeader className="pb-3 border-b border-slate-800/80">
            <CardTitle className={DESIGN_TOKENS.typography.h2 + " flex items-center gap-2"}>
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Sales — Last 7 Days
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {loading ? (
              <div className="w-full h-[200px] bg-[#071322] animate-pulse rounded-xl border border-slate-800 flex items-center justify-center text-xs text-slate-400 font-mono">
                Loading sales trend...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={salesChart}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₱${v}`} />
                  <Tooltip contentStyle={DESIGN_TOKENS.charts.tooltipStyle} formatter={(v) => [`₱${v.toLocaleString()}`, "Sales"]} />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#00e5ff"
                    strokeWidth={2.5}
                    fill="url(#salesGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="water-breathing-card rounded-2xl">
          <CardHeader className="pb-3 border-b border-slate-800/80 flex flex-row items-center justify-between">
            <CardTitle className={DESIGN_TOKENS.typography.h2}>Recent Sales</CardTitle>
            <Link to="/pos" className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="space-y-1.5 flex-1 mr-4">
                      <div className="h-4 w-2/3 bg-slate-800 animate-pulse rounded" />
                      <div className="h-3 w-1/3 bg-slate-900 animate-pulse rounded" />
                    </div>
                    <div className="h-4 w-12 bg-slate-800 animate-pulse rounded" />
                  </div>
                ))}
              </div>
            ) : recentTransactions.length === 0 ? (
              <p className={DESIGN_TOKENS.typography.muted + " text-center py-6"}>No transactions yet</p>
            ) : (
              recentTransactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#071322] transition-colors border border-transparent hover:border-slate-800/80">
                  <div className="min-w-0">
                    <p className={DESIGN_TOKENS.typography.body + " text-slate-100 truncate"}>
                      {t.customer_name || `Txn #${t.transaction_number || t.id.slice(-6)}`}
                    </p>
                    <Badge className="text-[10px] mt-0.5 bg-blue-950/80 text-cyan-300 border border-blue-800/60 font-mono uppercase">
                      {t.payment_method}
                    </Badge>
                  </div>
                  <span className="text-sm font-bold text-cyan-300 font-mono shrink-0 ml-2">
                    {DESIGN_TOKENS.formatCurrency(t.total_amount)}
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

function KPICard({ title, value, icon, variant = "cyber", sub, urgent, loading }) {
  const iconVariants = {
    cyber: DESIGN_TOKENS.icons.cyberGlass,
    amber: `${DESIGN_TOKENS.icons.amberGlass} animate-icon-glow-amber`,
    flame: `${DESIGN_TOKENS.icons.flameGlass} animate-icon-glow-amber`,
    emerald: DESIGN_TOKENS.icons.emeraldGlass,
  };

  const iconClass = urgent ? `${DESIGN_TOKENS.icons.amberGlass} animate-icon-glow-amber` : (iconVariants[variant] || DESIGN_TOKENS.icons.cyberGlass);

  return (
    <Card className="water-breathing-card rounded-2xl overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <p className={DESIGN_TOKENS.typography.h3}>{title}</p>
          <div className={iconClass}>
            {icon}
          </div>
        </div>
        {loading ? (
          <div className="space-y-1.5 py-1">
            <div className="h-6 w-24 bg-slate-800 animate-pulse rounded" />
            <div className="h-3 w-16 bg-slate-900 animate-pulse rounded" />
          </div>
        ) : (
          <>
            <p className="text-2xl font-extrabold text-white tracking-tight font-mono">{value}</p>
            <p className={DESIGN_TOKENS.typography.muted}>{sub}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}