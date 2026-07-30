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
    <div className={`rounded-2xl p-4 flex items-start gap-3 relative overflow-hidden ${
      isUrgent
        ? "flame-breathing-card border border-rose-500/60 shadow-[0_0_20px_rgba(225,29,72,0.3)]"
        : "moving-dotted-border-amber shadow-[0_0_20px_rgba(245,158,11,0.25)]"
    }`}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
        isUrgent ? "bg-rose-950/80 border border-rose-700/60" : "bg-amber-950/80 border border-amber-600/60"
      }`}>
        {isUrgent
          ? <PackageX className="w-5 h-5 text-rose-400" />
          : <AlertTriangle className="w-5 h-5 text-amber-400 animate-pulse" />
        }
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-sm text-cyan-300 font-mono tracking-wide">
            {isUrgent ? "CRITICAL INVENTORY ALERT" : "LOW STOCK WARNING"}
          </span>
          <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
            isUrgent ? "bg-rose-900/80 text-rose-200 border border-rose-600/80" : "bg-amber-900/80 text-amber-200 border border-amber-500/80"
          }`}>
            {isUrgent
              ? `${outOfStock.length} OUT OF STOCK`
              : `${lowStock.length} ITEMS RUNNING LOW`
            }
          </span>
        </div>
        <p className="text-xs mt-1 truncate text-slate-300 font-medium">
          {lowStock.slice(0, 3).map((p) => p.name).join(", ")}
          {lowStock.length > 3 ? ` +${lowStock.length - 3} more` : ""}
        </p>
      </div>

      <Link
        to="/alerts"
        className={`shrink-0 flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
          isUrgent
            ? "bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_12px_rgba(225,29,72,0.5)]"
            : "bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-[0_0_12px_rgba(245,158,11,0.5)]"
        }`}
      >
        View <ArrowRight className="w-3 h-3" />
      </Link>

      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 p-1 rounded-lg hover:bg-[#0B1C30]/10 text-slate-400 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}