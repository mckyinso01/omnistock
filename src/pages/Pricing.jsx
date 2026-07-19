import { useState, useEffect } from "react";
import { entities } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp, Save, History, Layers, CheckSquare, Square } from "lucide-react";
import { useApiToast } from "@/hooks/useApiToast";
import HelpTip from "@/components/ui/HelpTip";

export default function Pricing() {
  const [products, setProducts] = useState([]);
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [edits, setEdits] = useState({});
  const [saving, setSaving] = useState(false);
  const [targetMargin, setTargetMargin] = useState(30);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkMarkup, setBulkMarkup] = useState(10);
  const [bulkSaving, setBulkSaving] = useState(false);
  const { toastSuccess, toastError } = useApiToast();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const [p, h] = await Promise.all([
      entities.Product.filter({ status: "active" }),
      entities.PriceHistory.list("-created_date", 50),
    ]);
    setProducts(p);
    setHistory(h);
    setLoading(false);
  };

  const getEdit = (product) => edits[product.id] || { price: product.price || 0, cost: product.cost || 0 };

  const setEdit = (productId, field, value) => {
    setEdits(prev => ({
      ...prev,
      [productId]: { ...(prev[productId] || {}), [field]: parseFloat(value) || 0 },
    }));
  };

  const getMargin = (price, cost) => {
    if (!price || price <= 0) return 0;
    return ((price - cost) / price * 100).toFixed(1);
  };

  const getSuggestedPrice = (cost) => {
    if (!cost) return 0;
    return (cost / (1 - targetMargin / 100)).toFixed(2);
  };

  const hasChanges = (product) => {
    const e = edits[product.id];
    if (!e) return false;
    return e.price !== product.price || e.cost !== product.cost;
  };

  const saveProduct = async (product) => {
    const e = edits[product.id];
    if (!e) return;
    setSaving(true);
    try {
    // Save price history
    if (e.price !== product.price || e.cost !== product.cost) {
      await entities.PriceHistory.create({
        product_id: product.id,
        product_name: product.name,
        old_price: product.price,
        new_price: e.price,
        old_cost: product.cost,
        new_cost: e.cost,
        reason: "Manual update",
      });
    }

      await entities.Product.update(product.id, { price: e.price, cost: e.cost });
      setEdits(prev => { const n = { ...prev }; delete n[product.id]; return n; });
      toastSuccess("Price updated", `${product.name} updated successfully.`);
    } catch (err) {
      toastError(err, "Could not save price");
    } finally {
      setSaving(false);
      loadData();
    }
  };

  const applyMarginToAll = () => {
    const newEdits = {};
    products.forEach(p => {
      const cost = p.cost || 0;
      newEdits[p.id] = { price: parseFloat(getSuggestedPrice(cost)), cost };
    });
    setEdits(newEdits);
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const toggleSelectAll = () => {
    if (filtered.length > 0 && filtered.every(p => selectedIds.has(p.id)) && selectedIds.size > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(p => p.id)));
    }
  };

  const applyBulkMarkup = () => {
    const newEdits = { ...edits };
    selectedIds.forEach(id => {
      const product = products.find(p => p.id === id);
      if (!product) return;
      const currentCost = newEdits[id]?.cost ?? product.cost ?? 0;
      const currentPrice = newEdits[id]?.price ?? product.price ?? 0;
      const newPrice = parseFloat((currentPrice * (1 + (bulkMarkup || 0) / 100)).toFixed(2));
      newEdits[id] = { price: newPrice, cost: currentCost };
    });
    setEdits(newEdits);
  };

  const saveAllSelected = async () => {
    setBulkSaving(true);
    let updated = 0;
    try {
      for (const id of Array.from(selectedIds)) {
        const e = edits[id];
        const product = products.find(p => p.id === id);
        if (!e || !product) continue;
        if (e.price !== product.price || e.cost !== product.cost) {
          await entities.PriceHistory.create({
            product_id: product.id,
            product_name: product.name,
            old_price: product.price,
            new_price: e.price,
            old_cost: product.cost,
            new_cost: e.cost,
            reason: `Bulk markup (${bulkMarkup}%)`,
          });
          await entities.Product.update(product.id, { price: e.price, cost: e.cost });
          updated++;
        }
      }
      toastSuccess("Bulk save complete", `${updated} product(s) updated.`);
    } catch (err) {
      toastError(err, "Bulk save failed");
    } finally {
      setBulkSaving(false);
      setEdits({});
      setSelectedIds(new Set());
      loadData();
    }
  };

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-6 text-slate-400">Loading pricing...</div>;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Margin Tool */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-100">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">Smart Margin Tool</p>
                <p className="text-xs text-slate-500">Set target margin and apply to all products</p>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:ml-auto">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700 flex items-center gap-1.5">Target Margin:<HelpTip>Margin = (price − cost) ÷ price. The Smart Margin Tool suggests a selling price for every product to hit this %.</HelpTip></span>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={targetMargin}
                  onChange={e => setTargetMargin(parseFloat(e.target.value) || 0)}
                  className="w-20 text-center"
                />
                <span className="text-sm text-slate-500">%</span>
              </div>
              <Button onClick={applyMarginToAll} className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm">
                Apply to All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Markup Tool */}
      <Card className={`border-0 shadow-sm ${selectedIds.size > 0 ? "bg-amber-50 ring-2 ring-amber-200" : "bg-slate-50"}`}>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">Bulk Markup Tool</p>
                <p className="text-xs text-slate-500">
                  {selectedIds.size > 0
                    ? `${selectedIds.size} product(s) selected — apply a % markup to selected items.`
                    : "Tick rows below to select products, then apply a percentage markup to all prices at once."}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:ml-auto flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700">Markup:</span>
                <Input
                  type="number"
                  value={bulkMarkup}
                  onChange={e => setBulkMarkup(parseFloat(e.target.value) || 0)}
                  className="w-20 text-center"
                />
                <span className="text-sm text-slate-500">%</span>
              </div>
              <Button
                onClick={applyBulkMarkup}
                disabled={selectedIds.size === 0}
                className="bg-amber-500 hover:bg-amber-600 text-white text-sm"
              >
                Apply Markup
              </Button>
              <Button
                onClick={saveAllSelected}
                disabled={selectedIds.size === 0 || bulkSaving}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm gap-2"
              >
                {bulkSaving ? "Saving..." : `Save${selectedIds.size > 0 ? ` ${selectedIds.size}` : ""} Selected`}
              </Button>
              <Button
                variant="ghost"
                onClick={() => { setSelectedIds(new Set()); setEdits({}); }}
                disabled={selectedIds.size === 0}
                className="text-sm"
              >
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {/* Pricing Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-center px-3 py-3 w-10">
                <button onClick={toggleSelectAll} className="inline-flex">
                  {filtered.length > 0 && filtered.every(p => selectedIds.has(p.id)) && selectedIds.size > 0
                    ? <CheckSquare className="w-5 h-5 text-emerald-600" />
                    : <Square className="w-5 h-5 text-slate-400" />
                  }
                </button>
              </th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Product</th>
              <th className="text-right px-3 py-3 font-semibold text-slate-600">Cost (₱)</th>
              <th className="text-right px-3 py-3 font-semibold text-slate-600">Price (₱)</th>
              <th className="text-right px-3 py-3 font-semibold text-slate-600">Suggested (₱)</th>
              <th className="text-center px-3 py-3 font-semibold text-slate-600">Margin</th>
              <th className="px-3 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(product => {
              const e = getEdit(product);
              const margin = getMargin(e.price, e.cost);
              const suggested = getSuggestedPrice(e.cost);
              const changed = hasChanges(product);
              const marginNum = parseFloat(margin);

              return (
                <tr key={product.id} className={`border-b border-slate-50 last:border-0 ${changed ? "bg-yellow-50" : selectedIds.has(product.id) ? "bg-amber-50" : "hover:bg-slate-50"}`}>
                  <td className="px-3 py-3 text-center">
                    <button onClick={() => toggleSelect(product.id)} className="inline-flex">
                      {selectedIds.has(product.id)
                        ? <CheckSquare className="w-5 h-5 text-emerald-600" />
                        : <Square className="w-5 h-5 text-slate-300" />
                      }
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{product.name}</p>
                    {product.category && <p className="text-xs text-slate-400">{product.category}</p>}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <Input
                      type="number"
                      value={e.cost}
                      onChange={ev => setEdit(product.id, "cost", ev.target.value)}
                      className="w-24 text-right ml-auto h-8 text-sm"
                    />
                  </td>
                  <td className="px-3 py-3 text-right">
                    <Input
                      type="number"
                      value={e.price}
                      onChange={ev => setEdit(product.id, "price", ev.target.value)}
                      className="w-24 text-right ml-auto h-8 text-sm"
                    />
                  </td>
                  <td className="px-3 py-3 text-right">
                    <button
                      onClick={() => setEdit(product.id, "price", suggested)}
                      className="text-emerald-600 hover:underline font-medium text-sm"
                    >
                      ₱{parseFloat(suggested).toLocaleString()}
                    </button>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <Badge className={
                      marginNum >= 30 ? "bg-green-100 text-green-700"
                      : marginNum >= 15 ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                    }>
                      {margin}%
                    </Badge>
                  </td>
                  <td className="px-3 py-3 text-right">
                    {changed && (
                      <Button
                        size="sm"
                        onClick={() => saveProduct(product)}
                        disabled={saving}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1 h-7 text-xs"
                      >
                        <Save className="w-3 h-3" />
                        Save
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Price History */}
      {history.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <History className="w-4 h-4 text-slate-400" />
              Recent Price Changes
            </h3>
            <div className="space-y-2">
              {history.slice(0, 8).map(h => (
                <div key={h.id} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium text-slate-700">{h.product_name}</span>
                    <span className="text-slate-400 ml-2 text-xs">{new Date(h.created_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400 line-through">₱{h.old_price}</span>
                    <span className="text-emerald-600 font-semibold">₱{h.new_price}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}