import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil, Trash2, Package, AlertTriangle } from "lucide-react";

export default function ProductCard({ product, onEdit, onDelete }) {
  const qty = product.quantity || 0;
  const threshold = product.low_stock_threshold || 10;
  const isLow = qty <= threshold && qty > 0;
  const isOut = qty <= 0;
  const margin = product.price && product.cost
    ? (((product.price - product.cost) / product.price) * 100).toFixed(0)
    : null;

  return (
    <Card className={`water-breathing-card app-card-hover rounded-2xl shadow-xl transition-all overflow-hidden ${isOut ? "ring-2 ring-rose-500/80" : isLow ? "ring-2 ring-amber-500/80" : ""}`}>
      <CardContent className="p-0 flex flex-col h-full justify-between">
        <div>
          {/* Image */}
          {product.photo_url ? (
            <img
              src={product.photo_url}
              alt={product.name}
              className="w-full h-40 object-cover border-b border-slate-800/80"
            />
          ) : (
            <div className="w-full h-40 bg-gradient-to-br from-[#071322] to-[#0B1C30] border-b border-slate-800/80 flex items-center justify-center">
              <Package className="w-12 h-12 text-slate-400" />
            </div>
          )}

          <div className="p-4 space-y-3">
            {/* Name + Status */}
            <div>
              <p className="font-bold text-white text-base truncate">{product.name}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {product.category && (
                  <Badge variant="outline" className="text-xs border-slate-700 bg-slate-900/80 text-blue-300 font-medium">{product.category}</Badge>
                )}
                {product.sku && (
                  <span className="text-xs font-mono text-slate-400">SKU: {product.sku}</span>
                )}
              </div>
            </div>

            {/* Price + Stock */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-xl font-bold font-mono text-cyan-400">₱{(product.price || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</p>
                {margin !== null && (
                  <p className="text-xs font-mono text-slate-400">
                    Cost: ₱{(product.cost || 0).toLocaleString()} · <span className="text-emerald-400 font-bold">{margin}% margin</span>
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold font-mono ${isOut ? "text-rose-400" : isLow ? "text-amber-400" : "text-slate-200"}`}>
                  {qty} {product.unit || "pcs"}
                </p>
                {isOut && (
                  <Badge className="bg-rose-950/80 text-rose-300 border border-rose-800/80 text-[11px] mt-1 font-mono">Out of Stock</Badge>
                )}
                {isLow && !isOut && (
                  <Badge className="bg-amber-950/80 text-amber-300 border border-amber-800/80 text-[11px] mt-1 font-mono">Low Stock</Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 pt-0">
          <div className="flex gap-2 border-t border-slate-800/80 pt-3">
            <Button size="sm" variant="outline" className="flex-1 gap-1 text-slate-200 border-slate-700 bg-[#071322] hover:bg-slate-800 hover:text-white" onClick={onEdit}>
              <Pencil className="w-3.5 h-3.5 text-blue-400" />
              Edit
            </Button>
            <Button size="sm" variant="ghost" className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/40" onClick={onDelete}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}