import { useState, useEffect, useRef } from "react";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import PullToRefreshIndicator from "@/components/shared/PullToRefreshIndicator";
import { entities } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Package, AlertTriangle, Filter, ScanLine, Download, Upload } from "lucide-react";
import ProductFormModal from "@/components/inventory/ProductFormModal";
import ProductCard from "@/components/inventory/ProductCard";
import BarcodeScanner from "@/components/shared/BarcodeScanner";
import { exportProductsToCsv, downloadCsv, parseProductsCsv, csvRowsToProducts } from "@/lib/csv";

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [scannedProduct, setScannedProduct] = useState(null);

  const scrollRef = useRef(null);

  const loadData = async () => {
    setLoading(true);
    const [p, c, s] = await Promise.all([
      entities.Product.list("-created_date", 300),
      entities.Category.list("name", 100),
      entities.Supplier.list("name", 100),
    ]);
    setProducts(p);
    setCategories(c);
    setSuppliers(s);
    setLoading(false);
  };

  const { pulling, pullDistance, refreshing, threshold } = usePullToRefresh(loadData, scrollRef);

  useEffect(() => {
    loadData();
  }, []);

  const handleBarcodeDetected = (barcode) => {
    const found = products.find(
      (p) => p.barcode === barcode || p.sku === barcode
    );
    if (found) {
      setScannedProduct(found);
      setSearch(found.barcode || found.sku || found.name);
    } else {
      alert(`No product found for barcode: ${barcode}`);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    await entities.Product.delete(id);
    loadData();
  };

  const handleSave = () => {
    setShowForm(false);
    setEditingProduct(null);
    loadData();
  };

  const handleExportCsv = () => {
    const csv = exportProductsToCsv(products);
    const today = new Date().toISOString().slice(0, 10);
    downloadCsv(`inventory-export-${today}.csv`, csv);
  };

  const handleImportCsv = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    if (!confirm(`Import products from "${file.name}"? Existing products with matching SKUs will be skipped.`)) return;
    try {
      const text = await file.text();
      const rows = parseProductsCsv(text);
      const records = csvRowsToProducts(rows);
      if (records.length === 0) {
        alert("No valid product rows found in CSV.");
        return;
      }
      // Skip rows whose SKU already matches an existing product
      const existingSkus = new Set(products.map(p => p.sku).filter(Boolean));
      const toCreate = records.filter(r => !r.sku || !existingSkus.has(r.sku));
      if (toCreate.length === 0) {
        alert("All rows have SKUs that already exist. Nothing to import.");
        return;
      }
      await entities.Product.bulkCreate(toCreate);
      alert(`Imported ${toCreate.length} product(s). Skipped ${records.length - toCreate.length} existing SKU(s).`);
      loadData();
    } catch (err) {
      alert("Import failed: " + (err?.message || "Unknown error"));
    }
  };

  const filtered = products.filter((p) => {
    const matchSearch =
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode?.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === "all" || p.category_id === filterCategory;
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    return matchSearch && matchCat && matchStatus;
  });

  const lowStock = products.filter(
    (p) => p.status === "active" && (p.quantity || 0) <= (p.low_stock_threshold || 10)
  ).length;

  return (
    <div ref={scrollRef} className="min-h-screen overflow-y-auto">
      <PullToRefreshIndicator pulling={pulling} pullDistance={pullDistance} refreshing={refreshing} threshold={threshold} />
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 md:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm text-slate-500">
              {filtered.length} products
              {lowStock > 0 && (
                <span className="ml-2 text-orange-500 font-medium">
                  · {lowStock} low stock
                </span>
              )}
            </h2>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleExportCsv}
              className="gap-2 text-slate-600"
              title="Export products to CSV"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button
              variant="outline"
              onClick={() => document.getElementById("csv-import-input")?.click()}
              className="gap-2 text-slate-600"
              title="Import products from CSV"
            >
              <Upload className="w-4 h-4" />
              Import
            </Button>
            <input
              id="csv-import-input"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleImportCsv}
            />
            <Button
              variant="outline"
              onClick={() => setShowScanner(true)}
              className="gap-2 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
            >
              <ScanLine className="w-4 h-4" />
              Scan
            </Button>
            <Button
              onClick={() => { setEditingProduct(null); setShowForm(true); }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by name, SKU, or barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full sm:w-44">
              <Filter className="w-4 h-4 mr-1 text-slate-400" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-52 rounded-2xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium">No products found</p>
            <p className="text-sm mt-1">Add your first product to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={() => { setEditingProduct(product); setShowForm(true); }}
                onDelete={() => handleDelete(product.id)}
              />
            ))}
          </div>
        )}
      </div>

      {showScanner && (
        <BarcodeScanner
          onDetected={handleBarcodeDetected}
          onClose={() => setShowScanner(false)}
        />
      )}
      {showForm && (
        <ProductFormModal
          product={editingProduct}
          categories={categories}
          suppliers={suppliers}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditingProduct(null); }}
        />
      )}
    </div>
  );
}