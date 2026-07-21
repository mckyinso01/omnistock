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
let isSeeding = false;
export async function seedDefaultData() {
  if (isSeeding) return;
  isSeeding = true;
  try {
    const productCount = await db.products.count();
    if (productCount > 0) return;

    const catGroceries = { id: newId(), name: "Groceries & Food", created_date: now() };
    const catBeverages = { id: newId(), name: "Beverages & Drinks", created_date: now() };
    const catSnacks = { id: newId(), name: "Snacks & Sweets", created_date: now() };
    const catPersonal = { id: newId(), name: "Personal Care", created_date: now() };
    await db.categories.bulkAdd([catGroceries, catBeverages, catSnacks, catPersonal]);

    const supURC = { id: newId(), name: "Universal Robina Corp", status: "active", created_date: now() };
    const supNestle = { id: newId(), name: "Nestlé Philippines", status: "active", created_date: now() };
    const supMonde = { id: newId(), name: "Monde Nissin", status: "active", created_date: now() };
    await db.suppliers.bulkAdd([supURC, supNestle, supMonde]);

    const prod1 = {
      id: newId(),
      name: "Lucky Me! Instant Pancit Canton Chili-Mansi 80g",
      sku: "LKM-CANTON-CHILI",
      barcode: "4800016021112",
      category_id: catGroceries.id,
      supplier_id: supMonde.id,
      cost: 12.00,
      price: 16.00,
      quantity: 48,
      low_stock_threshold: 10,
      status: "active",
      created_date: now(),
      updated_date: now()
    };

    const prod2 = {
      id: newId(),
      name: "Bear Brand Fortified Powdered Milk Drink 33g",
      sku: "BBR-MILK-33G",
      barcode: "4800092002341",
      category_id: catGroceries.id,
      supplier_id: supNestle.id,
      cost: 14.50,
      price: 19.00,
      quantity: 35,
      low_stock_threshold: 10,
      status: "active",
      created_date: now(),
      updated_date: now()
    };

    const prod3 = {
      id: newId(),
      name: "Nescafé 3in1 Original Coffee Sachet 28g",
      sku: "NES-3IN1-ORIG",
      barcode: "4800092112233",
      category_id: catBeverages.id,
      supplier_id: supNestle.id,
      cost: 7.00,
      price: 10.00,
      quantity: 4,
      low_stock_threshold: 10,
      status: "active",
      created_date: now(),
      updated_date: now()
    };

    const prod4 = {
      id: newId(),
      name: "C2 Cool & Clean Green Tea Apple 500ml",
      sku: "C2-TEA-500ML",
      barcode: "4800016055544",
      category_id: catBeverages.id,
      supplier_id: supURC.id,
      cost: 22.00,
      price: 30.00,
      quantity: 3,
      low_stock_threshold: 10,
      status: "active",
      created_date: now(),
      updated_date: now()
    };

    const prod5 = {
      id: newId(),
      name: "Piattos Cheese Flavored Potato Chips 85g",
      sku: "PTS-CHEESE-85G",
      barcode: "4800016088899",
      category_id: catSnacks.id,
      supplier_id: supURC.id,
      cost: 32.00,
      price: 42.00,
      quantity: 20,
      low_stock_threshold: 10,
      status: "active",
      created_date: now(),
      updated_date: now()
    };

    await db.products.bulkAdd([prod1, prod2, prod3, prod4, prod5]);

    const cust1 = {
      id: newId(),
      name: "Juan Dela Cruz",
      phone: "09171234567",
      email: "juan@example.com",
      loyalty_points: 620,
      status: "active",
      created_date: now()
    };

    const cust2 = {
      id: newId(),
      name: "Maria Clara Santos",
      phone: "09189876543",
      email: "maria@example.com",
      loyalty_points: 350,
      status: "active",
      created_date: now()
    };

    await db.customers.bulkAdd([cust1, cust2]);

    const nowTs = new Date();
    const txns = [];
    for (let i = 6; i >= 0; i--) {
      const txnDate = new Date(nowTs.getTime() - i * 24 * 60 * 60 * 1000);
      const amount = 1200 + (i * 350) + Math.floor(Math.random() * 400);
      txns.push({
        id: newId(),
        transaction_number: `TXN-202607${10 + i}`,
        type: "sale",
        status: "completed",
        payment_method: i % 2 === 0 ? "cash" : "gcash",
        total_amount: amount,
        customer_name: i % 2 === 0 ? "Juan Dela Cruz" : "Maria Clara Santos",
        created_date: txnDate.toISOString()
      });
    }
    await db.transactions.bulkAdd(txns);

    await db.stockAlerts.bulkAdd([
      {
        id: newId(),
        product_id: prod3.id,
        product_name: prod3.name,
        alert_type: "low_stock",
        status: "active",
        message: `${prod3.name} is low on stock (4 remaining)`,
        created_date: now()
      },
      {
        id: newId(),
        product_id: prod4.id,
        product_name: prod4.name,
        alert_type: "low_stock",
        status: "active",
        message: `${prod4.name} is low on stock (3 remaining)`,
        created_date: now()
      }
    ]);
  } catch (err) {
    console.error("Error seeding default data:", err);
  } finally {
    isSeeding = false;
  }
}

function makeStore(table) {
  return {
    async list(sortBy = 'created_date', limit = 500) {
      await seedDefaultData();
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
      await seedDefaultData();
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