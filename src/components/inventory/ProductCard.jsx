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
    <Card className={`border-0 shadow-sm hover:shadow-md transition-all ${isOut ? "ring-2 ring-red-200" : isLow ? "ring-1 ring-orange-200" : ""}`}>
      <CardContent className="p-0">
        {/* Image */}
        {product.photo_url ? (
          <img
            src={product.photo_url}
            alt={product.name}
            className="w-full h-36 object-cover rounded-t-xl"
          />
        ) : (
          <div className="w-full h-36 bg-gradient-to-br from-slate-100 to-slate-200 rounded-t-xl flex items-center justify-center">
            <Package className="w-10 h-10 text-slate-300" />
          </div>
        )}

        <div className="p-4 space-y-3">
          {/* Name + Status */}
          <div>
            <p className="font-semibold text-slate-800 truncate">{product.name}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {product.category && (
                <Badge variant="outline" className="text-xs">{product.category}</Badge>
              )}
              {product.sku && (
                <span className="text-xs text-slate-400">SKU: {product.sku}</span>
              )}
            </div>
          </div>

          {/* Price + Stock */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-emerald-600">₱{(product.price || 0).toLocaleString()}</p>
              {margin !== null && (
                <p className="text-xs text-slate-400">
                  Cost: ₱{(product.cost || 0).toLocaleString()} · {margin}% margin
                </p>
              )}
            </div>
            <div className="text-right">
              <p className={`text-sm font-bold ${isOut ? "text-red-500" : isLow ? "text-orange-500" : "text-slate-700"}`}>
                {qty} {product.unit || "pcs"}
              </p>
              {isOut && (
                <Badge className="bg-red-100 text-red-600 text-xs mt-0.5">Out of Stock</Badge>
              )}
              {isLow && !isOut && (
                <Badge className="bg-orange-100 text-orange-600 text-xs mt-0.5">Low Stock</Badge>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 border-t border-slate-100 pt-3">
            <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={onEdit}>
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </Button>
            <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-600" onClick={onDelete}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}