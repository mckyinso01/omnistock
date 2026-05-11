import { Link } from "react-router-dom";
import { AlertTriangle, PackageX, ArrowRight, X } from "lucide-react";
import { useState } from "react";

export default function LowStockBanner({ products }) {
  const [dismissed, setDismissed] = useState(false);

  const lowStock = products.filter(
    (p) => p.status === "active" && (p.quantity || 0) <= (p.low_stock_threshold || 10)
  );
  const outOfStock = lowStock.filter((p) => (p.quantity || 0) === 0);

  if (lowStock.length === 0 || dismissed) return null;

  const isUrgent = outOfStock.length > 0;

  return (
    <div className={`rounded-2xl p-4 flex items-start gap-3 ${
      isUrgent
        ? "bg-red-50 border border-red-200"
        : "bg-amber-50 border border-amber-200"
    }`}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
        isUrgent ? "bg-red-100" : "bg-amber-100"
      }`}>
        {isUrgent
          ? <PackageX className="w-5 h-5 text-red-600" />
          : <AlertTriangle className="w-5 h-5 text-amber-600" />
        }
      </div>

      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm ${isUrgent ? "text-red-800" : "text-amber-800"}`}>
          {isUrgent
            ? `${outOfStock.length} item${outOfStock.length > 1 ? "s" : ""} OUT OF STOCK${lowStock.length > outOfStock.length ? ` + ${lowStock.length - outOfStock.length} low` : ""}`
            : `${lowStock.length} item${lowStock.length > 1 ? "s" : ""} running low on stock`
          }
        </p>
        <p className={`text-xs mt-0.5 truncate ${isUrgent ? "text-red-600" : "text-amber-600"}`}>
          {lowStock.slice(0, 3).map((p) => p.name).join(", ")}
          {lowStock.length > 3 ? ` +${lowStock.length - 3} more` : ""}
        </p>
      </div>

      <Link
        to="/alerts"
        className={`shrink-0 flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
          isUrgent
            ? "bg-red-100 text-red-700 hover:bg-red-200"
            : "bg-amber-100 text-amber-700 hover:bg-amber-200"
        }`}
      >
        View <ArrowRight className="w-3 h-3" />
      </Link>

      <button
        onClick={() => setDismissed(true)}
        className={`shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors ${
          isUrgent ? "text-red-400" : "text-amber-400"
        }`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}