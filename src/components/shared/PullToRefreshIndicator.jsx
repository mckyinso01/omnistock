import { Loader2, ArrowDown } from "lucide-react";

export default function PullToRefreshIndicator({ pulling, pullDistance, refreshing, threshold }) {
  if (!pulling && !refreshing) return null;

  const progress = Math.min(pullDistance / threshold, 1);
  const ready = pullDistance >= threshold;

  return (
    <div
      className="flex items-center justify-center transition-all duration-150 overflow-hidden"
      style={{ height: refreshing ? 48 : pullDistance }}
    >
      <div className={`flex items-center gap-2 text-sm text-slate-500 transition-all ${ready ? "text-emerald-400" : ""}`}>
        {refreshing ? (
          <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
        ) : (
          <ArrowDown
            className={`w-5 h-5 transition-transform duration-200 ${ready ? "rotate-180 text-emerald-400" : ""}`}
            style={{ transform: `rotate(${ready ? 180 : progress * 180}deg)` }}
          />
        )}
        <span className="text-xs font-medium">
          {refreshing ? "Refreshing..." : ready ? "Release to refresh" : "Pull to refresh"}
        </span>
      </div>
    </div>
  );
}