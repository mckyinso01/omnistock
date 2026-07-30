import { useState, useEffect, useRef } from "react";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import PullToRefreshIndicator from "@/components/shared/PullToRefreshIndicator";
import { entities } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Package, AlertTriangle, Filter, ScanLine, Download, Upload, ScanText, Loader2, Scale } from "lucide-react";
import ProductFormModal from "@/components/inventory/ProductFormModal";
import CatalogueUploaderModal from "@/components/inventory/CatalogueUploaderModal";
import RecipeIngredientModal from "@/components/inventory/RecipeIngredientModal";
import ProductCard from "@/components/inventory/ProductCard";
import BarcodeScanner from "@/components/shared/BarcodeScanner";
import { exportProductsToCsv, downloadCsv, parseProductsCsv, csvRowsToProducts } from "@/lib/csv";
import DESIGN_TOKENS from "@/lib/designSystem";

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
  const [showCatalogue, setShowCatalogue] = useState(false);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [recipeProduct, setRecipeProduct] = useState(null);

  const scrollRef = useRef(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [p, c, s] = await Promise.all([
        entities.Product.list("-created_date", 300).catch(() => []),
        entities.Category.list("name", 100).catch(() => []),
        entities.Supplier.list("name", 100).catch(() => []),
      ]);
      setProducts(p || []);
      setCategories(c || []);
      setSuppliers(s || []);
    } catch (err) {
      console.error("Inventory loadData Exception:", err);
      setProducts([]);
      setCategories([]);
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
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
    try {
      await entities.Product.delete(id);
      loadData();
    } catch (err) {
      console.error("Product Delete Exception:", err);
    }
  };

  const handleSave = () => {
    setShowForm(false);
    setEditingProduct(null);
    loadData();
  };

  const handleCatalogueImport = async (records) => {
    try {
      await entities.Product.bulkCreate(records);
      alert(`Imported ${records.length} product${records.length > 1 ? "s" : ""} from catalogue scan.`);
      loadData();
    } catch (err) {
      console.error("Catalogue Import Exception:", err);
    }
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
    <div ref={scrollRef} className="min-h-screen overflow-y-auto bg-[#050811] text-slate-100 font-sans pb-10 app-card-hover">
      <PullToRefreshIndicator pulling={pulling} pullDistance={pullDistance} refreshing={refreshing} threshold={threshold} />
      {/* Header */}
      <div className="bg-[#0B1C30]/90 border-b border-slate-800/80 px-4 md:px-6 py-4 backdrop-blur-md sticky top-0 z-20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
          <div>
            <h1 className={DESIGN_TOKENS.typography.h1 + " flex items-center gap-2"}>
              <Package className="w-6 h-6 text-cyan-400" /> Inventory & Stock Registry
            </h1>
            <p className={DESIGN_TOKENS.typography.muted + " mt-0.5"}>
              {filtered.length} total items registered
              {lowStock > 0 && (
                <span className="ml-2 text-amber-400 font-bold font-mono">
                  · ⚠️ {lowStock} low stock alert{lowStock > 1 ? "s" : ""}
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <Button
              variant="outline"
              onClick={() => setShowRecipeModal(true)}
              className="bg-amber-950/80 text-amber-300 border border-amber-500/50 hover:bg-amber-900/90 shadow-[0_0_16px_rgba(245,158,11,0.3)] gap-1.5 text-xs h-9 cursor-pointer font-semibold"
              title="Configure Recipe & Portion Control"
            >
              <Scale className="w-3.5 h-3.5 text-amber-400" />
              Recipe & Portion Guard
            </Button>
            <Button
              variant="outline"
              onClick={handleExportCsv}
              className={DESIGN_TOKENS.buttons.secondary + " gap-1.5 text-xs h-9 cursor-pointer font-semibold"}
              title="Export products to CSV"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              Export
            </Button>
            <Button
              variant="outline"
              onClick={() => document.getElementById("csv-import-input")?.click()}
              className={DESIGN_TOKENS.buttons.secondary + " gap-1.5 text-xs h-9 cursor-pointer font-semibold"}
              title="Import products from CSV"
            >
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
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
              className="gap-1.5 text-cyan-300 border-cyan-500/50 bg-[#071322] hover:bg-[#0E1E36] hover:border-cyan-400 text-xs font-semibold shadow-[0_0_15px_rgba(0,229,255,0.25)] cursor-pointer h-9 transition-all"
            >
              <ScanLine className="w-3.5 h-3.5 text-cyan-400" />
              Barcode Scan
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowCatalogue(true)}
              className="gap-1.5 text-purple-300 border-purple-500/50 bg-[#071322] hover:bg-[#0E1E36] hover:border-purple-400 text-xs font-semibold shadow-[0_0_15px_rgba(192,132,252,0.25)] cursor-pointer h-9 transition-all"
              title="Scan a paper catalogue with AI"
            >
              <ScanText className="w-3.5 h-3.5 text-purple-400" />
              AI Catalogue
            </Button>
            <Button
              onClick={() => { setEditingProduct(null); setShowForm(true); }}
              className={DESIGN_TOKENS.buttons.glowingAction + " gap-2 text-xs font-bold h-9 cursor-pointer active:scale-[0.98] transition-all"}
            >
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 bg-[#0B1C30]/70 p-3.5 rounded-2xl border border-slate-800/80">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
            <input
              type="text"
              placeholder="Search by name, SKU, or barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-slate-700/80 bg-[#071322] text-slate-100 placeholder:text-slate-500 focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF] outline-none text-base sm:text-sm font-medium transition-all"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full sm:w-48 bg-[#071322] border-slate-700/80 text-slate-200 text-base sm:text-sm focus:border-[#00E5FF]">
              <Filter className="w-4 h-4 mr-1 text-cyan-400" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="bg-[#071322] border-slate-700 text-slate-200">
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-40 bg-[#071322] border-slate-700/80 text-slate-200 text-base sm:text-sm focus:border-[#00E5FF]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-[#071322] border-slate-700 text-slate-200">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="h-60 rounded-2xl bg-[#0B1C30] border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-slate-400 bg-[#0B1C30]/40 rounded-2xl border border-slate-800/80">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-30 text-blue-400" />
            <p className="text-lg font-bold text-white">No products found</p>
            <p className="text-xs text-slate-400 mt-1">Add your first product or import via CSV to populate inventory</p>
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
      {showCatalogue && (
        <CatalogueUploaderModal
          onImported={handleCatalogueImport}
          onClose={() => setShowCatalogue(false)}
        />
      )}
      {showRecipeModal && (
        <RecipeIngredientModal
          isOpen={showRecipeModal}
          product={recipeProduct}
          onClose={() => { setShowRecipeModal(false); setRecipeProduct(null); }}
        />
      )}
    </div>
  );
}