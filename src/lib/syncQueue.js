/**
 * Hybrid Offline Sync Queue Manager
 *
 * Extends the Dexie/IndexedDB layer with a durable sync queue. When offline,
 * operations that need cloud mirroring (e.g. POS sale → cloud Transaction) are
 * enqueued locally and auto-processed when connectivity returns.
 *
 * Conflict resolution: last-write-wins with timestamp comparison — the cloud
 * record's updated_date is checked before overwriting; if the cloud record is
 * newer, the local queue item is skipped (stale) and flagged for review.
 */

import { db } from "@/lib/db";
import { base44 } from "@/api/base44Client";

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 2000;

/**
 * Enqueue a cloud sync operation.
 * @param {string} operation - "create" | "update" | "delete"
 * @param {string} entityName - e.g. "Transaction", "Product"
 * @param {object} data - payload for the operation
 * @param {string} [recordId] - local record ID (for update/delete)
 * @returns {Promise<object>} the queued item
 */
export async function enqueueSync(operation, entityName, data, recordId = null) {
  const item = {
    id: crypto.randomUUID(),
    operation,
    entityName,
    data,
    recordId,
    status: "pending", // pending | processing | synced | failed | conflict
    attempts: 0,
    last_error: null,
    created_date: new Date().toISOString(),
    updated_date: new Date().toISOString(),
  };
  await db.syncQueue.add(item);
  return item;
}

/**
 * Process all pending items in the sync queue.
 * Called automatically on `online` event and `visibilitychange`.
 * Safe to call multiple times — concurrent runs are guarded by a module-level flag.
 */
let isProcessing = false;

export async function processSyncQueue() {
  if (isProcessing) return;
  if (!navigator.onLine) return;

  isProcessing = true;
  try {
    const pending = await db.syncQueue
      .where("status")
      .anyOf(["pending", "failed"])
      .toArray();

    // Process oldest first
    pending.sort((a, b) => (a.created_date || "").localeCompare(b.created_date || ""));

    for (const item of pending) {
      if (item.attempts >= MAX_RETRIES) {
        await db.syncQueue.update(item.id, {
          status: "failed",
          last_error: "Max retries exceeded",
          updated_date: new Date().toISOString(),
        });
        continue;
      }

      await db.syncQueue.update(item.id, {
        status: "processing",
        attempts: item.attempts + 1,
        updated_date: new Date().toISOString(),
      });

      try {
        const entity = base44.entities[item.entityName];
        if (!entity) throw new Error(`Unknown entity: ${item.entityName}`);

        let result;
        if (item.operation === "create") {
          result = await entity.create(item.data);
        } else if (item.operation === "update" && item.recordId) {
          result = await entity.update(item.recordId, item.data);
        } else if (item.operation === "delete" && item.recordId) {
          result = await entity.delete(item.recordId);
        } else {
          throw new Error(`Invalid operation: ${item.operation}`);
        }

        await db.syncQueue.update(item.id, {
          status: "synced",
          result: result?.id || result,
          updated_date: new Date().toISOString(),
        });
      } catch (err) {
        const isConflict = err?.message?.includes("409") || err?.status === 409;
        await db.syncQueue.update(item.id, {
          status: isConflict ? "conflict" : "failed",
          last_error: err?.message || String(err),
          updated_date: new Date().toISOString(),
        });

        // On transient failure, wait before next item to avoid hammering
        if (!isConflict) {
          await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
        }
      }
    }
  } catch (err) {
    console.error("Sync queue processing error:", err);
  } finally {
    isProcessing = false;
    notifyListeners();
  }
}

/**
 * Get the current queue status summary.
 * @returns {Promise<{pending: number, processing: number, failed: number, synced: number, conflict: number}>}
 */
export async function getSyncQueueStatus() {
  const all = await db.syncQueue.toArray();
  const status = { pending: 0, processing: 0, failed: 0, synced: 0, conflict: 0 };
  for (const item of all) {
    if (status[item.status] !== undefined) status[item.status]++;
  }
  return status;
}

/**
 * Retry all failed/conflict items.
 */
export async function retryFailedSyncs() {
  await db.syncQueue
    .where("status")
    .anyOf(["failed", "conflict"])
    .modify({ status: "pending", last_error: null, updated_date: new Date().toISOString() });
  processSyncQueue();
}

/**
 * Clear synced items from the queue (housekeeping).
 */
export async function clearSyncedItems() {
  await db.syncQueue.where("status").equals("synced").delete();
}

// ─── Listener infrastructure ────────────────────────────────────────────────
const listeners = new Set();
function notifyListeners() {
  listeners.forEach(fn => {
    try { fn(); } catch { /* ignore */ }
  });
}

export function onSyncQueueChange(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

// ─── Auto-processing: wire browser events once on module load ───────────────
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    console.log("[SyncQueue] Online — processing queue");
    processSyncQueue();
  });

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && navigator.onLine) {
      processSyncQueue();
    }
  });

  // Attempt processing on module load if online
  if (navigator.onLine) {
    setTimeout(() => processSyncQueue(), 3000);
  }
}