import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { Crown, Award, TrendingUp, Users, Gift, Package } from "lucide-react";
import { entities } from "@/lib/db";

const fmt = (n) => `₱${Number(n || 0).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const TIERS = [
  { name: "Diamond", min: 1000, color: "bg-cyan-100 text-cyan-700 border-cyan-200", discount: "20%" },
  { name: "Gold", min: 500, color: "bg-amber-100 text-amber-700 border-amber-200", discount: "10%" },
  { name: "Silver", min: 100, color: "bg-slate-100 text-slate-300 border-slate-200", discount: "5%" },
  { name: "Member", min: 0, color: "bg-emerald-100 text-emerald-700 border-emerald-200", discount: "—" },
];

const tierOf = (points) => TIERS.find(t => points >= t.min) || TIERS[TIERS.length - 1];

export default function TopCustomersAnalysis() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const list = await entities.Customer.list("-loyalty_points", 100);
        setCustomers((list || []).filter(c => c.status !== "inactive"));
      } catch (e) {
        setCustomers([]);
        setError(e?.message || "Unable to load customer data.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <div className="p-6 text-slate-400 text-sm">Loading top customers…</div>;
  }

  if (error) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="py-10 text-center">
          <p className="text-sm text-rose-400">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (customers.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="py-12 text-center">
          <Users className="w-10 h-10 text-slate-200 mx-auto mb-2" />
          <p className="text-sm text-slate-400">No customer records yet. Add customers from the Customers page to surface loyalty insights here.</p>
        </CardContent>
      </Card>
    );
  }

  const totalSpent = customers.reduce((s, c) => s + (c.total_spent || 0), 0);
  const totalPoints = customers.reduce((s, c) => s + (c.loyalty_points || 0), 0);
  const topBySpend = [...customers].sort((a, b) => (b.total_spent || 0) - (a.total_spent || 0)).slice(0, 10);
  const topByPoints = [...customers].sort((a, b) => (b.loyalty_points || 0) - (a.loyalty_points || 0)).slice(0, 10);

  const chartData = topBySpend.map(c => {
    const nm = c.name || "Unknown";
    return { name: nm.length > 14 ? nm.slice(0, 12) + "…" : nm, full: nm, spent: c.total_spent || 0 };
  });

  const kpis = [
    { icon: Users, label: "Customers", value: customers.length, sub: `${totalPoints} total points`, color: "bg-gradient-to-r from-cyan-300 via-emerald-300 to-cyan-400 text-transparent bg-clip-text animate-shimmer", bg: "bg-cyan-500/10 border-cyan-500/30" },
    { icon: TrendingUp, label: "Total Spend", value: fmt(totalSpent), sub: "Lifetime value", color: "bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400 text-transparent bg-clip-text animate-shimmer", bg: "bg-emerald-500/10 border-emerald-500/30" },
    { icon: Crown, label: "Top Spender", value: topBySpend[0]?.name ?? "—", sub: topBySpend[0] ? fmt(topBySpend[0].total_spent) : "No data", color: "bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 text-transparent bg-clip-text animate-shimmer", bg: "bg-amber-500/10 border-amber-500/30" },
    { icon: Award, label: "Most Loyal", value: topByPoints[0]?.name ?? "—", sub: topByPoints[0] ? `${topByPoints[0].loyalty_points} pts` : "No data", color: "bg-gradient-to-r from-violet-300 via-fuchsia-300 to-violet-400 text-transparent bg-clip-text animate-shimmer", bg: "bg-violet-500/10 border-violet-500/30" },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(k => {
          const Icon = k.icon;
          return (
            <Card key={k.label} className="bg-[#0B1C30]/90 border border-slate-800/80 shadow-xl rounded-2xl hover:border-cyan-500/40 transition-all">
              <CardContent className="p-4">
                <div className={`w-9 h-9 rounded-xl ${k.bg} border flex items-center justify-center mb-2`}>
                  <Icon className="w-4 h-4 text-cyan-300" />
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{k.label}</p>
                <p className={`text-lg font-extrabold font-mono ${k.color} truncate mt-0.5`} title={typeof k.value === "string" ? k.value : undefined}>{k.value}</p>
                {k.sub && <p className="text-xs text-slate-400 mt-0.5 font-mono">{k.sub}</p>}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-[#0B1C30]/90 border border-slate-800/80 shadow-xl rounded-2xl">
        <CardHeader className="pb-3 border-b border-slate-800/80">
          <CardTitle className="text-base font-bold text-white flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-400" /> Top 10 Customers by Spending
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-72 -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 60 }}>
                <defs>
                  <linearGradient id="customerGlassGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.95} />
                    <stop offset="60%" stopColor="#2563EB" stopOpacity={0.75} />
                    <stop offset="100%" stopColor="#0B1C30" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} angle={-35} textAnchor="end" height={70} interval={0} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={(v) => `₱${Math.round(v)}`} />
                <RTooltip
                  cursor={{ fill: "transparent" }}
                  formatter={(v) => fmt(v)}
                  labelFormatter={(l, payload) => payload?.[0]?.payload?.full || l}
                  contentStyle={{ backgroundColor: "#071322", borderColor: "#334155", color: "#fff", borderRadius: "0.75rem" }}
                />
                <Bar dataKey="spent" fill="url(#customerGlassGradient)" stroke="#F59E0B" strokeWidth={1.5} maxBarSize={32} radius={[8, 8, 2, 2]} className="transition-all duration-300 hover:brightness-125" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#0B1C30]/90 border border-slate-800/80 shadow-xl rounded-2xl">
        <CardHeader className="pb-3 border-b border-slate-800/80">
          <CardTitle className="text-base font-bold text-white flex items-center gap-2">
            <Gift className="w-4 h-4 text-emerald-400" /> Loyalty Tiers & Suggested Discount
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#071322]">
            <table className="w-full text-sm">
              <thead className="bg-slate-900/90 text-xs text-slate-300 uppercase font-mono border-b border-slate-800">
                <tr>
                  <th className="text-left p-3">#</th>
                  <th className="text-left p-3">Customer</th>
                  <th className="text-left p-3">Contact</th>
                  <th className="text-right p-3">Spent</th>
                  <th className="text-right p-3">Points</th>
                  <th className="text-right p-3">Visits</th>
                  <th className="text-center p-3">Tier</th>
                  <th className="text-center p-3">Suggested</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono">
                {topByPoints.map((c, i) => {
                  const tier = tierOf(c.loyalty_points || 0);
                  return (
                    <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3">
                        <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "bg-slate-800 text-slate-300"}`}>{i + 1}</span>
                      </td>
                      <td className="p-3 font-bold text-white truncate max-w-[160px] text-base">{c.name}</td>
                      <td className="p-3 text-slate-300 text-xs">{c.phone || c.email || "—"}</td>
                      <td className="p-3 text-right font-bold text-emerald-400">{fmt(c.total_spent)}</td>
                      <td className="p-3 text-right text-cyan-300 font-bold">{c.loyalty_points || 0}</td>
                      <td className="p-3 text-right text-slate-300">{c.visit_count || 0}</td>
                      <td className="p-3 text-center">
                        <Badge className={`text-xs border ${tier.color}`}>{tier.name}</Badge>
                      </td>
                      <td className="p-3 text-center font-bold text-emerald-300">{tier.discount} off</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 font-mono">
            {TIERS.map(t => (
              <div key={t.name} className={`px-3 py-1.5 rounded-lg border text-xs ${t.color}`}>
                <strong>{t.name}</strong> · {t.min}+ pts · {t.discount} discount
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}