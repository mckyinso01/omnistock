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
  { name: "Silver", min: 100, color: "bg-slate-100 text-slate-700 border-slate-200", discount: "5%" },
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
          <p className="text-sm text-red-500">{error}</p>
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
    { icon: Users, label: "Customers", value: customers.length, sub: `${totalPoints} total points`, color: "text-blue-600", bg: "bg-blue-50" },
    { icon: TrendingUp, label: "Total Spend", value: fmt(totalSpent), sub: "Lifetime value", color: "text-emerald-600", bg: "bg-emerald-50" },
    { icon: Crown, label: "Top Spender", value: topBySpend[0]?.name ?? "—", sub: topBySpend[0] ? fmt(topBySpend[0].total_spent) : "No data", color: "text-amber-600", bg: "bg-amber-50" },
    { icon: Award, label: "Most Loyal", value: topByPoints[0]?.name ?? "—", sub: topByPoints[0] ? `${topByPoints[0].loyalty_points} pts` : "No data", color: "text-violet-600", bg: "bg-violet-50" },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(k => {
          const Icon = k.icon;
          return (
            <Card key={k.label} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className={`w-9 h-9 rounded-xl ${k.bg} flex items-center justify-center mb-2`}>
                  <Icon className={`w-4 h-4 ${k.color}`} />
                </div>
                <p className="text-xs text-slate-500">{k.label}</p>
                <p className={`text-lg font-bold ${k.color} truncate`} title={typeof k.value === "string" ? k.value : undefined}>{k.value}</p>
                {k.sub && <p className="text-xs text-slate-400 mt-0.5">{k.sub}</p>}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-500" /> Top 10 Customers by Spending
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72 -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} angle={-35} textAnchor="end" height={70} interval={0} />
                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={(v) => `₱${Math.round(v)}`} />
                <RTooltip
                  formatter={(v) => fmt(v)}
                  labelFormatter={(l, payload) => payload?.[0]?.payload?.full || l}
                  contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
                />
                <Bar dataKey="spent" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? "#f59e0b" : i === 1 ? "#7c3aed" : "#0ea5e9"} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Gift className="w-4 h-4 text-emerald-500" /> Loyalty Tiers & Suggested Discount
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-slate-100">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                <tr>
                  <th className="text-left p-2">#</th>
                  <th className="text-left p-2">Customer</th>
                  <th className="text-left p-2">Contact</th>
                  <th className="text-right p-2">Spent</th>
                  <th className="text-right p-2">Points</th>
                  <th className="text-right p-2">Visits</th>
                  <th className="text-center p-2">Tier</th>
                  <th className="text-center p-2">Suggested</th>
                </tr>
              </thead>
              <tbody>
                {topByPoints.map((c, i) => {
                  const tier = tierOf(c.loyalty_points || 0);
                  return (
                    <tr key={c.id} className="border-t border-slate-100">
                      <td className="p-2">
                        <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"}`}>{i + 1}</span>
                      </td>
                      <td className="p-2 font-medium text-slate-800 truncate max-w-[160px]">{c.name}</td>
                      <td className="p-2 text-slate-500 text-xs">{c.phone || c.email || "—"}</td>
                      <td className="p-2 text-right font-semibold text-emerald-600">{fmt(c.total_spent)}</td>
                      <td className="p-2 text-right text-slate-600">{c.loyalty_points || 0}</td>
                      <td className="p-2 text-right text-slate-600">{c.visit_count || 0}</td>
                      <td className="p-2 text-center">
                        <Badge className={`text-xs border ${tier.color}`}>{tier.name}</Badge>
                      </td>
                      <td className="p-2 text-center font-semibold text-emerald-700">{tier.discount} off</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
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