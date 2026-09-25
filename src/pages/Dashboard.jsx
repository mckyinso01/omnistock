import { useState, useEffect, useRef, useMemo } from "react";
import { entities } from "@/lib/db";
import { DESIGN_TOKENS } from "@/lib/designSystem";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import PullToRefreshIndicator from "@/components/shared/PullToRefreshIndicator";
import LowStockWidget from "@/components/dashboard/LowStockWidget";
import LowStockBanner from "@/components/dashboard/LowStockBanner";
import { useStockNotifications } from "@/hooks/useStockNotifications";
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

  const [timeframe, setTimeframe] = useState("7d");

  const salesChart = useMemo(() => {
    let daysCount = 7;
    if (timeframe === "30d") daysCount = 30;
    if (timeframe === "monthly") daysCount = 30;
    if (timeframe === "ytd") daysCount = 90;

    return Array.from({ length: daysCount }, (_, i) => {
      const day = subDays(new Date(), (daysCount - 1) - i);
      const dayStr = day.toDateString();
      const daySales = transactions
        .filter(
          (t) =>
            t.status === "completed" &&
            t.type === "sale" &&
            new Date(t.created_date).toDateString() === dayStr
        )
        .reduce((sum, t) => sum + (t.total_amount || 0), 0);
      return { day: format(day, daysCount > 14 ? "MMM dd" : "EEE"), sales: daySales };
    });
  }, [transactions, timeframe]);

  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 5);
  }, [transactions]);

  const timeframes = [
    { value: "7d", label: "7-Day" },
    { value: "30d", label: "30-Day" },
    { value: "monthly", label: "Monthly" },
    { value: "ytd", label: "YTD" },
  ];

  return (
    <div ref={scrollRef} className="tm-dashboard p-8 md:p-10 space-y-5 overflow-y-auto h-full">
      <PullToRefreshIndicator pulling={pulling} pullDistance={pullDistance} refreshing={refreshing} threshold={threshold} />

      {/* Low Stock Banner */}
      <LowStockBanner products={products} />

      {/* Income Analytics — Full Width Hero Section */}
      <section className="tm-panel tm-analytics relative overflow-hidden tm-arrive">
        {/* Hero Image Banner */}
        <div className="tm-hero">
          <img
            src="https://media.base44.com/images/public/6a01dbe1194ecb62dc80b3b8/ae0f7aae8_generated_be9521cb.jpg"
            alt=""
            className="w-full h-full object-cover opacity-90 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#082b2a]/80 via-[#0a3836]/15 to-[#082b2a]/45" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#082b2a]/22 to-transparent" />
        </div>

        {/* Chart Header */}
        <div className="relative flex items-center justify-between gap-5 px-7 pt-6 pb-5 border-b border-[#e2efeb]">
          <h2 className="text-2xl font-bold tracking-tight text-[#123c35] flex items-center gap-2.5">
            <TrendingUp className="w-5 h-5 text-[#16785f]" />
            Income Analytics
          </h2>
          <div className="flex items-center gap-1.5 p-1 border border-[#dcebe6] rounded-xl bg-[#f4f8f6]">
            {timeframes.map((tf) => (
              <button
                key={tf.value}
                onClick={() => setTimeframe(tf.value)}
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer
                  ${timeframe === tf.value
                    ? "bg-[#146f5b] text-white shadow-[0_4px_11px_rgba(20,111,91,0.2)]"
                    : "text-[#648078] hover:bg-[#e5f3ed] hover:text-[#164d40]"}`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Area */}
        <div className="px-7 py-6 bg-gradient-to-b from-[#fbfdfc] to-white">
          {loading ? (
            <div className="w-full h-[220px] bg-[#f4f8f6] animate-pulse rounded-xl border border-[#e2efeb] flex items-center justify-center text-sm text-[#81948c]">
              Loading sales trend...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={salesChart}>
                <defs>
                  <linearGradient id="tmSalesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.24} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e6efeb" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#81948c" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#81948c" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₱${v}`} />
                <Tooltip
                  contentStyle={{ background: "#fff", border: "1px solid #d8eae5", borderRadius: 12, fontSize: 13, color: "#143d34", boxShadow: "0 10px 30px rgba(20,67,60,0.1)" }}
                  formatter={(v) => [`₱${v.toLocaleString()}`, "Sales"]}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#16866c"
                  strokeWidth={3}
                  fill="url(#tmSalesGrad)"
                  dot={{ fill: "#20aa83", r: 4 }}
                  activeDot={{ fill: "#20aa83", r: 6, style: { filter: "drop-shadow(0 0 5px rgba(32,170,131,0.5))" } }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <KPICard
          title="Today's Sales"
          value={DESIGN_TOKENS.formatCurrency(todaySales)}
          icon={<PhilippinePeso className="w-[19px] h-[19px]" />}
          sub={`${todayOrders} orders`}
          loading={loading}
          index={0}
        />
        <KPICard
          title="Total Products"
          value={totalProducts}
          icon={<Package className="w-[19px] h-[19px]" />}
          sub="active items"
          loading={loading}
          index={1}
        />
        <KPICard
          title="Transactions"
          value={transactions.filter((t) => t.status === "completed").length}
          icon={<ShoppingCart className="w-[19px] h-[19px]" />}
          sub="all time"
          loading={loading}
          index={2}
        />
        <KPICard
          title="Stock Alerts"
          value={alerts.length}
          icon={<AlertTriangle className="w-[19px] h-[19px]" />}
          sub={`${lowStockCount} low stock`}
          urgent={alerts.length > 0}
          loading={loading}
          index={3}
        />
        <KPICard
          title="Customers"
          value={customers.length}
          icon={<Users className="w-[19px] h-[19px]" />}
          sub={`${customers.filter(c => (c.loyalty_points || 0) >= 500).length} loyalty members`}
          loading={loading}
          index={4}
        />
      </div>

      {/* Bottom: Recent Sales + Low Stock Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Sales */}
        <section className="tm-panel p-6 tm-arrive" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center justify-between gap-4 border-b border-[#e2efeb] pb-4">
            <h3 className="text-lg font-bold tracking-tight text-[#173e36]">Recent Sales</h3>
            <Link to="/pos" className="text-sm font-semibold text-[#16785f] hover:text-[#0e5946] flex items-center gap-1.5 transition-colors cursor-pointer">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="pt-4 space-y-2.5">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="space-y-1.5 flex-1 mr-4">
                      <div className="h-4 w-2/3 bg-[#e6efeb] animate-pulse rounded" />
                      <div className="h-3 w-1/3 bg-[#edf6f1] animate-pulse rounded" />
                    </div>
                    <div className="h-4 w-12 bg-[#e6efeb] animate-pulse rounded" />
                  </div>
                ))}
              </div>
            ) : recentTransactions.length === 0 ? (
              <p className="text-center py-9 text-[#84968e] text-sm">No transactions yet</p>
            ) : (
              recentTransactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#f4f8f6] transition-colors border border-transparent hover:border-[#d8eae5]">
                  <div className="min-w-0">
                    <p className="text-sm text-[#143d34] truncate font-medium">
                      {t.customer_name || `Txn #${t.transaction_number || t.id.slice(-6)}`}
                    </p>
                    <Badge className="text-[10px] mt-0.5 bg-[#e8f5ef] text-[#17775e] border border-[#c9eee8] font-semibold uppercase">
                      {t.payment_method}
                    </Badge>
                  </div>
                  <span className="text-sm font-bold text-[#16785f] tabular-nums shrink-0 ml-2">
                    {DESIGN_TOKENS.formatCurrency(t.total_amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Low Stock Widget */}
        <section className="tm-panel p-6 tm-arrive" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center justify-between gap-4 border-b border-[#e2efeb] pb-4">
            <h3 className="text-lg font-bold tracking-tight text-[#173e36]">Low Stock Widget</h3>
            <div className="tm-icon">
              <Package className="w-[19px] h-[19px]" />
            </div>
          </div>
          <div className="pt-4">
            <LowStockWidget products={products} />
          </div>
        </section>
      </div>
    </div>
  );
}

function KPICard({ title, value, icon, sub, urgent, loading, index }) {
  return (
    <article
      className="tm-panel tm-metric p-5 min-h-[148px] flex flex-col justify-center"
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <p className="text-xs font-semibold text-[#668077] leading-snug">{title}</p>
        <div className={urgent ? "tm-icon-urgent" : "tm-icon"}>
          {icon}
        </div>
      </div>
      {loading ? (
        <div className="space-y-1.5 py-1">
          <div className="h-7 w-24 bg-[#e6efeb] animate-pulse rounded" />
          <div className="h-3 w-16 bg-[#edf6f1] animate-pulse rounded" />
        </div>
      ) : (
        <>
          <p className="text-[29px] font-bold text-[#143d34] tracking-tight tabular-nums leading-tight">{value}</p>
          <p className="text-xs text-[#879990] mt-1">{sub}</p>
        </>
      )}
    </article>
  );
}