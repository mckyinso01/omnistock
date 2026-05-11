import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight, PackageX, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function LowStockWidget({ products, onRestock }) {
  const lowStock = products
    .filter(p => p.status === "active" && (p.quantity || 0) <= (p.low_stock_threshold || 10))
    .sort((a, b) => (a.quantity || 0) - (b.quantity || 0));

  const outOfStock = lowStock.filter(p => (p.quantity || 0) === 0);
  const critical = lowStock.filter(p => (p.quantity || 0) > 0 && (p.quantity || 0) <= 3);

  if (lowStock.length === 0) return null;

  return (
    <Card className="border-0 shadow-sm border-l-4 border-l-red-400">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          Low Stock Alert
          <Badge className="bg-red-100 text-red-700 border-0 text-xs ml-1">{lowStock.length}</Badge>
        </CardTitle>
        <Link to="/alerts" className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-medium">
          View All <ArrowRight className="w-3 h-3" />
        </Link>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Summary badges */}
        {outOfStock.length > 0 && (
          <div className="flex items-center gap-2 p-2.5 bg-red-50 rounded-lg">
            <PackageX className="w-4 h-4 text-red-500 shrink-0" />
            <span className="text-sm text-red-700 font-medium">
              {outOfStock.length} item{outOfStock.length > 1 ? "s" : ""} completely OUT OF STOCK
            </span>
          </div>
        )}

        {/* Item list — show top 5 */}
        <div className="space-y-1.5">
          {lowStock.slice(0, 5).map(p => {
            const qty = p.quantity || 0;
            const threshold = p.low_stock_threshold || 10;
            const isOut = qty === 0;
            const isCritical = qty > 0 && qty <= 3;
            const pct = Math.min(100, (qty / threshold) * 100);

            return (
              <div key={p.id} className="flex items-center gap-3 py-1.5 border-b border-slate-50 last:border-0">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-800 truncate">{p.name}</p>
                    <Badge className={`text-xs border-0 shrink-0 ${
                      isOut ? "bg-red-100 text-red-700" :
                      isCritical ? "bg-orange-100 text-orange-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>
                      {isOut ? "Out" : isCritical ? "Critical" : "Low"}
                    </Badge>
                  </div>
                  {/* Stock progress bar */}
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isOut ? "w-0" :
                          isCritical ? "bg-orange-400" : "bg-yellow-400"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500 shrink-0">
                      {qty} / {threshold} {p.unit || "pcs"}
                    </span>
                  </div>
                </div>
                <Link to="/purchase-orders">
                  <Button size="sm" variant="outline" className="h-7 px-2 text-xs gap-1 shrink-0">
                    <RefreshCw className="w-3 h-3" />
                    Restock
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>

        {lowStock.length > 5 && (
          <Link to="/alerts" className="block text-center text-xs text-slate-400 hover:text-slate-600 pt-1">
            + {lowStock.length - 5} more items need attention
          </Link>
        )}
      </CardContent>
    </Card>
  );
}