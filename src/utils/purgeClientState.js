/**
 * StockMate Enterprise Sanitization & Client State Purge Utility
 * Wipes IndexedDB (Dexie.js), LocalStorage, and SessionStorage for clean Self-Host deployments.
 */
export const purgeClientState = async () => {
  try {
    localStorage.clear();
    sessionStorage.clear();

    if (typeof indexedDB !== "undefined" && indexedDB.databases) {
      const dbs = await indexedDB.databases();
      for (const db of dbs) {
        if (db.name) {
          indexedDB.deleteDatabase(db.name);
        }
      }
    }

    console.log("[StockMate Purge] LocalStorage, IndexedDB POS data, and mock caches purged successfully.");
  } catch (err) {
    console.error("[StockMate Purge Error] Failed to purge client state:", err);
  }
};
