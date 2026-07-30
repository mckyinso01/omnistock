import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { TrendingUp, Award, ShoppingBag, Crown, Package } from "lucide-react";

const fmt = (n) => `₱${Number(n || 0).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function TopProductsAnalytics({ topProducts, totalRevenue, totalOrders, itemsSold }) {
  const profitSum = topProducts.reduce((s, p) => s + (p.profit || 0), 0);
  const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const topProduct = topProducts[0];

  const kpis = [
    { icon: Crown, label: "Top Product", value: topProduct?.name ?? "—", sub: topProduct ? fmt(topProduct.revenue) : "No sales", color: "text-amber-400", bg: "bg-amber-50" },
    { icon: TrendingUp, label: "Total Revenue", value: fmt(totalRevenue), sub: `${totalOrders} orders`, color: "text-emerald-400", bg: "bg-emerald-50" },
    { icon: Award, label: "Gross Profit", value: fmt(profitSum), sub: "Top 10 only", color: "text-violet-400", bg: "bg-violet-50" },
    { icon: ShoppingBag, label: "Items Sold", value: itemsSold, sub: `AOV ${fmt(aov)}`, color: "text-cyan-400", bg: "bg-blue-50" },
  ];

  const chartData = topProducts.map(p => ({
    name: p.name.length > 16 ? p.name.slice(0, 14) + "…" : p.name,
    full: p.name,
    revenue: p.revenue || 0,
  }));

  return (
    <div className="space-y-5">
      {/* Summary KPIs */}
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

      {/* Revenue Bar Chart */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" /> Top 10 Products by Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-10 h-10 text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No sales data for this period.</p>
            </div>
          ) : (
            <div className="h-72 -ml-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} angle={-35} textAnchor="end" height={70} interval={0} />
                  <YAxis tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={(v) => `₱${Math.round(v)}`} />
                  <Tooltip
                    formatter={(v) => fmt(v)}
                    labelFormatter={(l, payload) => payload?.[0]?.payload?.full || l}
                    contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
                  />
                  <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={i === 0 ? "#16a34a" : i === 1 ? "#7c3aed" : "#0ea5e9"} fillOpacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profitability Ranking Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" /> Profitability Ranking
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topProducts.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No data for this period.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-100">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                  <tr>
                    <th className="text-left p-2">#</th>
                    <th className="text-left p-2">Product</th>
                    <th className="text-right p-2">Qty</th>
                    <th className="text-right p-2">Revenue</th>
                    <th className="text-right p-2">Profit</th>
                    <th className="text-right p-2">Margin</th>
                    <th className="text-right p-2">% of Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((p, i) => {
                    const margin = p.revenue > 0 ? (p.profit / p.revenue) * 100 : 0;
                    const share = totalRevenue > 0 ? (p.revenue / totalRevenue) * 100 : 0;
                    return (
                      <tr key={p.name} className="border-t border-slate-100">
                        <td className="p-2">
                          <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"}`}>{i + 1}</span>
                        </td>
                        <td className="p-2 font-medium text-slate-200 truncate max-w-[200px]">{p.name}</td>
                        <td className="p-2 text-right text-slate-400">{p.qty}</td>
                        <td className="p-2 text-right font-semibold text-emerald-400">{fmt(p.revenue)}</td>
                        <td className="p-2 text-right font-medium text-violet-400">{fmt(p.profit)}</td>
                        <td className="p-2 text-right text-slate-400">{margin.toFixed(0)}%</td>
                        <td className="p-2 text-right"><Badge variant="outline" className="text-xs">{share.toFixed(1)}%</Badge></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}