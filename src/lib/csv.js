// Lightweight CSV utility for product export/import

const PRODUCT_COLUMNS = [
  { key: "name", label: "name" },
  { key: "sku", label: "sku" },
  { key: "barcode", label: "barcode" },
  { key: "description", label: "description" },
  { key: "category", label: "category" },
  { key: "supplier_name", label: "supplier_name" },
  { key: "photo_url", label: "photo_url" },
  { key: "price", label: "price" },
  { key: "cost", label: "cost" },
  { key: "quantity", label: "quantity" },
  { key: "unit", label: "unit" },
  { key: "low_stock_threshold", label: "low_stock_threshold" },
  { key: "expiry_date", label: "expiry_date" },
  { key: "status", label: "status" },
];

function escapeCsv(value) {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes("\"") || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportProductsToCsv(products) {
  const header = PRODUCT_COLUMNS.map(c => c.label).join(",");
  const rows = products.map(p =>
    PRODUCT_COLUMNS.map(c => escapeCsv(p[c.key])).join(",")
  );
  return [header, ...rows].join("\n");
}

export function downloadCsv(filename, csvString) {
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Parse a CSV string into an array of row objects (uses first row as headers)
function parseCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        result.push(current);
        current = "";
      } else {
        current += char;
      }
    }
  }
  result.push(current);
  return result;
}

export function parseProductsCsv(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length < 2) return [];
  const headers = parseCsvLine(lines[0]).map(h => h.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = values[idx] ?? "";
    });
    rows.push(obj);
  }
  return rows;
}

// Convert parsed CSV rows into product records ready for create()
export function csvRowsToProducts(rows) {
  return rows.map(r => {
    const num = (v) => {
      const n = parseFloat(v);
      return isNaN(n) ? 0 : n;
    };
    return {
      name: (r.name || "").trim(),
      sku: (r.sku || "").trim(),
      barcode: (r.barcode || "").trim(),
      description: (r.description || "").trim(),
      category: (r.category || "").trim(),
      supplier_name: (r.supplier_name || "").trim(),
      photo_url: (r.photo_url || "").trim(),
      price: num(r.price),
      cost: num(r.cost),
      quantity: num(r.quantity),
      unit: (r.unit || "pcs").trim() || "pcs",
      low_stock_threshold: num(r.low_stock_threshold) || 10,
      expiry_date: (r.expiry_date || "").trim(),
      status: (r.status || "active").trim() || "active",
    };
  }).filter(p => p.name);
}