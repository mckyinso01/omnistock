import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight, PackageX, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DESIGN_TOKENS } from "@/lib/designSystem";

export default function LowStockWidget({ products, onRestock }) {
  const lowStock = products
    .filter(p => p.status === "active" && (p.quantity || 0) <= (p.low_stock_threshold || 10))
    .sort((a, b) => (a.quantity || 0) - (b.quantity || 0));

  const outOfStock = lowStock.filter(p => (p.quantity || 0) === 0);
  const critical = lowStock.filter(p => (p.quantity || 0) > 0 && (p.quantity || 0) <= 3);

  if (lowStock.length === 0) return null;

  return (
    <Card className="water-breathing-card rounded-2xl overflow-hidden shadow-xl">
      <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-slate-800/60">
        <CardTitle className="text-base font-bold text-white flex items-center gap-2.5">
          <div className={`${DESIGN_TOKENS.icons.amberGlass} animate-icon-glow-amber !w-7 !h-7 !rounded-lg shrink-0`}>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-cyan-300 font-mono tracking-wide">Low Stock Alert</span>
          <Badge className="bg-amber-950/80 text-amber-300 border border-amber-500/40 text-xs ml-1 font-mono">{lowStock.length}</Badge>
        </CardTitle>
        <Link to="/alerts" className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono font-bold transition-colors">
          View All <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        {/* Summary badges */}
        {outOfStock.length > 0 && (
          <div className="flex items-center gap-2 p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl shadow-inner">
            <PackageX className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="text-xs text-rose-200 font-medium font-mono">
              {outOfStock.length} item{outOfStock.length > 1 ? "s" : ""} completely OUT OF STOCK
            </span>
          </div>
        )}

        {/* Item list — show top 5 */}
        <div className="space-y-2">
          {lowStock.slice(0, 5).map(p => {
            const qty = p.quantity || 0;
            const threshold = p.low_stock_threshold || 10;
            const isOut = qty === 0;
            const isCritical = qty > 0 && qty <= 3;
            const pct = Math.min(100, (qty / threshold) * 100);

            return (
              <div key={p.id} className="flex items-center gap-3 py-2.5 border-b border-slate-800/60 last:border-0">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-100 truncate">{p.name}</p>
                    <Badge className={`text-[10px] font-mono border shrink-0 uppercase tracking-wider ${
                      isOut ? "bg-rose-950/80 text-rose-300 border-rose-500/40" :
                      isCritical ? "bg-orange-950/80 text-orange-300 border-orange-500/40" :
                      "bg-amber-950/80 text-amber-300 border-amber-500/40"
                    }`}>
                      {isOut ? "Out" : isCritical ? "Critical" : "Low"}
                    </Badge>
                  </div>
                  {/* Stock progress bar — Deep Frosted Dark Track */}
                  <div className="mt-1.5 flex items-center gap-3">
                    <div className="flex-1 h-2 bg-[#071322]/90 border border-slate-800/80 rounded-full overflow-hidden p-0.5 shadow-inner">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOut ? "w-0" :
                          isCritical ? "bg-gradient-to-r from-rose-500 to-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" : "bg-gradient-to-r from-amber-400 to-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400 font-mono font-bold shrink-0">
                      {qty} / {threshold} {p.unit || "pcs"}
                    </span>
                  </div>
                </div>
                <Link to="/purchase-orders">
                  <button className="h-8 px-3 text-xs gap-1.5 shrink-0 flex items-center justify-center bg-[#071322] border border-slate-700/80 hover:border-[#00E5FF]/60 text-slate-200 hover:text-white hover:bg-[#0E1E36] transition-all duration-300 rounded-xl font-mono font-bold shadow-md active:scale-95">
                    <RefreshCw className="w-3 h-3 text-cyan-400" />
                    Restock
                  </button>
                </Link>
              </div>
            );
          })}
        </div>

        {lowStock.length > 5 && (
          <Link to="/alerts" className="block text-center text-xs text-cyan-400 hover:text-cyan-300 font-mono pt-1">
            + {lowStock.length - 5} more items need attention ➔
          </Link>
        )}
      </CardContent>
    </Card>
  );
}