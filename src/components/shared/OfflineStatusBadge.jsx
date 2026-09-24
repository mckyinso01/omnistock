import { useEffect, useState } from "react";
import { Wifi, WifiOff, CloudUpload, RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useSyncQueue } from "@/hooks/useSyncQueue";

/**
 * Dynamic offline/sync status badge for the TopBar.
 * Shows online/offline state + pending sync count.
 * When offline, displays "Offline — Queued" in amber.
 * When online with pending items, shows "Syncing X..." in cyan.
 * When online and all synced, shows "All Synced" in emerald.
 * When failures exist, shows a retry button.
 */
export default function OfflineStatusBadge() {
  const isOnline = useOnlineStatus();
  const { status, retryAll } = useSyncQueue();
  const [isSyncing, setIsSyncing] = useState(false);

  const pendingTotal = status.pending + status.processing;
  const hasFailures = status.failed > 0 || status.conflict > 0;

  useEffect(() => {
    if (pendingTotal > 0 && isOnline) {
      setIsSyncing(true);
      const t = setTimeout(() => setIsSyncing(false), 1500);
      return () => clearTimeout(t);
    }
    setIsSyncing(false);
  }, [pendingTotal, isOnline]);

  // Offline state
  if (!isOnline) {
    return (
      <div
        className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-amber-950/40 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-mono shadow-[0_0_12px_rgba(245,158,11,0.2)]"
        title="You are offline. Sales will be queued and synced automatically when connection returns."
      >
        <WifiOff className="w-3.5 h-3.5 text-amber-400" />
        <span className="font-bold">Offline{pendingTotal > 0 ? ` — ${pendingTotal} Queued` : ""}</span>
      </div>
    );
  }

  // Online with failures — show retry
  if (hasFailures) {
    return (
      <button
        onClick={retryAll}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-rose-950/40 border border-rose-500/40 text-rose-300 rounded-xl text-xs font-mono shadow-[0_0_12px_rgba(225,29,72,0.2)] hover:bg-rose-900/40 transition-all cursor-pointer"
        title={`${status.failed} failed, ${status.conflict} conflict. Click to retry.`}
      >
        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
        <span className="font-bold">Sync Error — Retry</span>
      </button>
    );
  }

  // Online and syncing
  if (pendingTotal > 0 || isSyncing) {
    return (
      <div
        className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 rounded-xl text-xs font-mono shadow-[0_0_12px_rgba(0,229,255,0.2)]"
        title={`Syncing ${pendingTotal} item(s) to cloud...`}
      >
        <CloudUpload className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
        <span className="font-bold">Syncing{pendingTotal > 0 ? ` ${pendingTotal}` : ""}...</span>
      </div>
    );
  }

  // Online and all synced
  return (
    <div
      className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#071322] border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-mono shadow-[0_0_12px_rgba(16,185,129,0.2)]"
      title="All data synced to cloud"
    >
      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
      <span className="font-bold">All Synced</span>
    </div>
  );
}