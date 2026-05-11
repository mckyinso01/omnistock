import Dexie from 'dexie';

// ─── Database Definition ───────────────────────────────────────────────────
export const db = new Dexie('StockMateDB');

db.version(1).stores({
  products:        '++id, name, sku, barcode, category_id, supplier_id, status, created_date, updated_date',
  categories:      '++id, name, created_date',
  suppliers:       '++id, name, status, created_date',
  customers:       '++id, name, phone, email, status, created_date',
  transactions:    '++id, transaction_number, type, status, payment_method, created_date',
  stockAdjustments:'++id, product_id, created_date',
  priceHistory:    '++id, product_id, created_date',
  purchaseOrders:  '++id, supplier_id, status, created_date',
  stockAlerts:     '++id, product_id, alert_type, status, created_date',
  recipes:         '++id, name, product_id, status, created_date',
});

// ─── Helper: Generate IDs ──────────────────────────────────────────────────
const newId = () => crypto.randomUUID();
const now = () => new Date().toISOString();

// ─── Generic CRUD Factory ─────────────────────────────────────────────────
function makeStore(table) {
  return {
    async list(sortBy = 'created_date', limit = 500) {
      let items = await table.toArray();
      items.sort((a, b) => {
        const aVal = a[sortBy.replace('-', '')];
        const bVal = b[sortBy.replace('-', '')];
        return sortBy.startsWith('-')
          ? String(bVal).localeCompare(String(aVal))
          : String(aVal).localeCompare(String(bVal));
      });
      return limit ? items.slice(0, limit) : items;
    },

    async filter(query = {}, sortBy = '-created_date', limit = 500) {
      let items = await table.toArray();
      items = items.filter(item =>
        Object.entries(query).every(([key, val]) => item[key] === val)
      );
      items.sort((a, b) => {
        const key = sortBy.replace('-', '');
        const aVal = a[key] ?? '';
        const bVal = b[key] ?? '';
        return sortBy.startsWith('-')
          ? String(bVal).localeCompare(String(aVal))
          : String(aVal).localeCompare(String(bVal));
      });
      return limit ? items.slice(0, limit) : items;
    },

    async get(id) {
      return await table.get(id);
    },

    async create(data) {
      const record = {
        ...data,
        id: newId(),
        created_date: now(),
        updated_date: now(),
      };
      await table.add(record);
      return record;
    },

    async bulkCreate(dataArray) {
      if (!Array.isArray(dataArray) || dataArray.length === 0) return [];
      const records = dataArray.map(data => ({
        ...data,
        id: data.id || newId(),
        created_date: data.created_date || now(),
        updated_date: now(),
      }));
      await table.bulkAdd(records);
      return records;
    },

    async update(id, data) {
      const updated = { ...data, updated_date: now() };
      await table.update(id, updated);
      return await table.get(id);
    },

    async delete(id) {
      await table.delete(id);
    },

    async schema() {
      return {};
    },
  };
}

// ─── Exported Entity Stores ───────────────────────────────────────────────
export const entities = {
  Product:          makeStore(db.products),
  Category:         makeStore(db.categories),
  Supplier:         makeStore(db.suppliers),
  Customer:         makeStore(db.customers),
  Transaction:      makeStore(db.transactions),
  StockAdjustment:  makeStore(db.stockAdjustments),
  PriceHistory:     makeStore(db.priceHistory),
  PurchaseOrder:    makeStore(db.purchaseOrders),
  StockAlert:       makeStore(db.stockAlerts),
  Recipe:           makeStore(db.recipes),
};

// ─── Backup & Restore ─────────────────────────────────────────────────────
export async function exportBackup() {
  const backup = {};
  for (const [name, store] of Object.entries(entities)) {
    backup[name] = await store.list('-created_date', 99999);
  }
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `stockmate-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importBackup(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = JSON.parse(e.target.result);
      for (const [name, records] of Object.entries(data)) {
        if (entities[name] && Array.isArray(records)) {
          await db[name.toLowerCase() === 'stockadjustment' ? 'stockAdjustments'
            : name.toLowerCase() === 'pricehistory' ? 'priceHistory'
            : name.toLowerCase() === 'purchaseorder' ? 'purchaseOrders'
            : name.toLowerCase() === 'stockalert' ? 'stockAlerts'
            : name.toLowerCase() + 's'].bulkPut(records);
        }
      }
      resolve();
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}