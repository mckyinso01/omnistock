import { useState, useEffect, useCallback } from "react";
import { getSyncQueueStatus, processSyncQueue, retryFailedSyncs, onSyncQueueChange } from "@/lib/syncQueue";

/**
 * React hook for sync queue status.
 * Returns { status, refresh, retryAll } where status is the counts object.
 */
export function useSyncQueue() {
  const [status, setStatus] = useState({
    pending: 0, processing: 0, failed: 0, synced: 0, conflict: 0,
  });

  const refresh = useCallback(async () => {
    const s = await getSyncQueueStatus();
    setStatus(s);
  }, []);

  useEffect(() => {
    refresh();
    const unsubscribe = onSyncQueueChange(refresh);
    return unsubscribe;
  }, [refresh]);

  const retryAll = useCallback(() => {
    retryFailedSyncs();
  }, []);

  return { status, refresh, retryAll, processQueue: processSyncQueue };
}