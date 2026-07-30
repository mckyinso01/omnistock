import { useState, useEffect } from "react";
import { entities } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp, Save, History, Layers, CheckSquare, Square } from "lucide-react";
import { useApiToast } from "@/hooks/useApiToast";
import HelpTip from "@/components/ui/HelpTip";
import { DESIGN_TOKENS } from "@/lib/designSystem";

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
    try {
      const [p, h] = await Promise.all([
        entities.Product.filter({ status: "active" }).catch(() => []),
        entities.PriceHistory.list("-created_date", 50).catch(() => []),
      ]);
      setProducts(p || []);
      setHistory(h || []);
    } catch (err) {
      console.error("Pricing loadData Exception:", err);
      setProducts([]);
      setHistory([]);
    } finally {
      setLoading(false);
    }
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

  const trackPriceChangesFromAdjustment = async (data) => {
    await entities.PriceHistory.create({
      product_id: data.productId,
      product_name: data.product_name,
      old_price: data.oldPrice,
      new_price: data.newPrice,
      old_cost: data.oldCost,
      new_cost: data.newCost,
      reason: data.reason,
    });
  };

  const saveProduct = async (product) => {
    const e = getEdit(product);
    if (!e) return;
    setSaving(true);
    try {
      await trackPriceChangesFromAdjustment({
        productId: product.id,
        product_name: product.name,
        oldCost: product.cost || 0,
        newCost: e.cost,
        oldPrice: product.price || 0,
        newPrice: e.price,
        adjustedBy: "Pricing Manager",
        reason: "Manual price adjustment",
      });
      await entities.Product.update(product.id, { price: e.price, cost: e.cost });
      toastSuccess("Price updated", `Updated ${product.name}`);
      setEdits(prev => {
        const next = { ...prev };
        delete next[product.id];
        return next;
      });
      loadData();
    } catch (err) {
      toastError(err, "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const applyMarginToAll = () => {
    const nextEdits = { ...edits };
    products.forEach(p => {
      const cost = nextEdits[p.id]?.cost ?? p.cost ?? 0;
      if (cost > 0) {
        const suggested = parseFloat(getSuggestedPrice(cost));
        nextEdits[p.id] = { cost, price: suggested };
      }
    });
    setEdits(nextEdits);
    toastSuccess("Suggested prices applied", `Margin set to ${targetMargin}% across all products.`);
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(p => p.id)));
    }
  };

  const applyBulkMarkup = () => {
    if (selectedIds.size === 0) return;
    const nextEdits = { ...edits };
    selectedIds.forEach(id => {
      const product = products.find(p => p.id === id);
      if (!product) return;
      const currentPrice = nextEdits[id]?.price ?? product.price ?? 0;
      const markupMultiplier = 1 + (bulkMarkup / 100);
      const newPrice = parseFloat((currentPrice * markupMultiplier).toFixed(2));
      const currentCost = nextEdits[id]?.cost ?? product.cost ?? 0;
      nextEdits[id] = { cost: currentCost, price: newPrice };
    });
    setEdits(nextEdits);
    toastSuccess("Markup applied", `Applied +${bulkMarkup}% to ${selectedIds.size} selected items.`);
  };

  const saveAllSelected = async () => {
    if (selectedIds.size === 0) return;
    setBulkSaving(true);
    let updated = 0;
    try {
      for (const id of selectedIds) {
        const product = products.find(p => p.id === id);
        if (!product) continue;
        const e = edits[id];
        if (e) {
          await trackPriceChangesFromAdjustment({
            productId: product.id,
            product_name: product.name,
            oldCost: product.cost || 0,
            newCost: e.cost,
            oldPrice: product.price || 0,
            newPrice: e.price,
            adjustedBy: "Bulk Markup Tool",
            reason: `Bulk markup (${bulkMarkup}%)`,
          });
          await entities.Product.update(product.id, { price: e.price, cost: e.cost });
          updated++;
        }
      }
      toastSuccess("Bulk save complete", `${updated} products updated.`);
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
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-6 text-slate-400">Loading pricing engine...</div>;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto bg-[#050811] text-slate-100 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0B1C30]/80 p-5 rounded-2xl border border-slate-800/80 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_16px_rgba(0,229,255,0.25)] shrink-0">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className={DESIGN_TOKENS.typography.h1 + " flex items-center gap-2"}>
              Smart Pricing & Margin Manager
            </h1>
            <p className={DESIGN_TOKENS.typography.muted + " mt-0.5"}>
              Configure target profit margins, bulk markup rules, and track price change logs
            </p>
          </div>
        </div>
      </div>

      {/* Smart Margin Tool */}
      <Card className="water-breathing-card bg-[#0B1C30]/90 border border-emerald-500/40 shadow-xl rounded-2xl app-card-hover">
        <CardContent className="p-4 md:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.25)] shrink-0">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="font-bold text-white text-base font-sans">Smart Margin Tool</p>
                <p className="text-xs text-slate-300 font-sans mt-0.5">Set target margin and apply auto-calculated suggested prices to all products</p>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:ml-auto flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-300 flex items-center gap-1.5 font-mono">
                  Target Margin:
                  <HelpTip>Margin = (price − cost) ÷ price. The Smart Margin Tool suggests a selling price for every product to hit this %.</HelpTip>
                </span>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={targetMargin}
                  onChange={e => setTargetMargin(parseFloat(e.target.value) || 0)}
                  className="w-20 text-center bg-[#071322] border-slate-700 text-cyan-300 font-mono text-sm font-bold focus:border-[#00E5FF] rounded-xl"
                />
                <span className="text-sm text-cyan-400 font-mono font-bold">%</span>
              </div>
              <Button onClick={applyMarginToAll} className={DESIGN_TOKENS.buttons.glowingAction + " text-xs font-bold px-5 py-2 cursor-pointer active:scale-95 transition-all"}>
                Apply to All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Markup Tool */}
      <Card className={`water-breathing-card border shadow-xl rounded-2xl transition-all app-card-hover ${selectedIds.size > 0 ? "bg-[#0B1C30]/90 border-amber-500/60 ring-1 ring-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.2)]" : "bg-[#0B1C30]/90 border-slate-800/80"}`}>
        <CardContent className="p-4 md:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.25)] shrink-0">
                <Layers className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="font-bold text-white text-base font-sans">Bulk Markup Tool</p>
                <p className="text-xs text-slate-300 font-sans mt-0.5">
                  {selectedIds.size > 0
                    ? `${selectedIds.size} product${selectedIds.size > 1 ? "s" : ""} selected — apply a % markup to selected items.`
                    : "Tick rows below to select products, then apply a percentage markup to all prices at once."}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:ml-auto flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-300 font-mono">Markup:</span>
                <Input
                  type="number"
                  value={bulkMarkup}
                  onChange={e => setBulkMarkup(parseFloat(e.target.value) || 0)}
                  className="w-20 text-center bg-[#071322] border-slate-700 text-amber-300 font-mono text-sm font-bold focus:border-amber-500 rounded-xl"
                />
                <span className="text-sm text-amber-400 font-mono font-bold">%</span>
              </div>
              <Button
                onClick={applyBulkMarkup}
                disabled={selectedIds.size === 0}
                className={DESIGN_TOKENS.buttons.glowingAction + " text-xs font-bold px-4 py-2.5 cursor-pointer disabled:opacity-40 transition-all"}
              >
                Apply Markup
              </Button>
              <Button
                onClick={saveAllSelected}
                disabled={selectedIds.size === 0 || bulkSaving}
                className={DESIGN_TOKENS.buttons.glowingAction + " text-xs font-bold px-4 py-2.5 cursor-pointer disabled:opacity-40 transition-all gap-1.5"}
              >
                {bulkSaving ? "Saving..." : `Save${selectedIds.size > 0 ? ` ${selectedIds.size}` : ""} Selected`}
              </Button>
              <Button
                variant="ghost"
                onClick={() => { setSelectedIds(new Set()); setEdits({}); }}
                disabled={selectedIds.size === 0}
                className={DESIGN_TOKENS.buttons.secondary + " text-xs cursor-pointer"}
              >
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
        <Input
          placeholder="Search products by name or category..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10 bg-[#071322] border-slate-700/80 text-white placeholder:text-slate-500 focus:border-[#00E5FF] rounded-xl text-base sm:text-sm"
        />
      </div>

      {/* Pricing Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800/80 bg-[#0B1C30]/90 shadow-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800 bg-[#071322]">
              <th className="text-center px-3 py-3.5 w-10">
                <button onClick={toggleSelectAll} className="inline-flex">
                  {filtered.length > 0 && filtered.every(p => selectedIds.has(p.id)) && selectedIds.size > 0
                    ? <CheckSquare className="w-5 h-5 text-emerald-400" />
                    : <Square className="w-5 h-5 text-slate-500 hover:text-slate-300" />
                  }
                </button>
              </th>
              <th className="text-left px-4 py-3.5 font-bold text-slate-300 uppercase tracking-wider font-mono text-xs">Product Name</th>
              <th className="text-right px-3 py-3.5 font-bold text-slate-300 uppercase tracking-wider font-mono text-xs">Cost (₱)</th>
              <th className="text-right px-3 py-3.5 font-bold text-slate-300 uppercase tracking-wider font-mono text-xs">Price (₱)</th>
              <th className="text-right px-3 py-3.5 font-bold text-slate-300 uppercase tracking-wider font-mono text-xs">Suggested (₱)</th>
              <th className="text-center px-3 py-3.5 font-bold text-slate-300 uppercase tracking-wider font-mono text-xs">Margin</th>
              <th className="px-3 py-3.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.map(product => {
              const e = getEdit(product);
              const margin = getMargin(e.price, e.cost);
              const suggested = getSuggestedPrice(e.cost);
              const changed = hasChanges(product);
              const marginNum = parseFloat(margin);

              return (
                <tr
                  key={product.id}
                  className={`transition-colors ${
                    changed
                      ? "bg-amber-950/30 text-amber-200"
                      : selectedIds.has(product.id)
                      ? "bg-blue-950/40 text-blue-200"
                      : "hover:bg-slate-800/40 text-slate-200"
                  }`}
                >
                  <td className="px-3 py-3.5 text-center">
                    <button onClick={() => toggleSelect(product.id)} className="inline-flex">
                      {selectedIds.has(product.id)
                        ? <CheckSquare className="w-5 h-5 text-emerald-400" />
                        : <Square className="w-5 h-5 text-slate-500 hover:text-slate-300" />
                      }
                    </button>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="font-bold text-white text-base font-sans">{product.name}</p>
                    {product.category && <p className="text-xs text-slate-400 mt-0.5 font-mono">{product.category}</p>}
                  </td>
                  <td className="px-3 py-3.5 text-right">
                    <Input
                      type="number"
                      value={e.cost}
                      onChange={ev => setEdit(product.id, "cost", ev.target.value)}
                      className="w-24 text-right ml-auto h-8 text-sm bg-[#071322] border-slate-700 text-cyan-300 font-mono focus:border-cyan-500 rounded-xl"
                    />
                  </td>
                  <td className="px-3 py-3.5 text-right">
                    <Input
                      type="number"
                      value={e.price}
                      onChange={ev => setEdit(product.id, "price", ev.target.value)}
                      className="w-24 text-right ml-auto h-8 text-sm bg-[#071322] border-slate-700 text-cyan-300 font-mono focus:border-cyan-500 rounded-xl"
                    />
                  </td>
                  <td className="px-3 py-3.5 text-right">
                    <button
                      onClick={() => setEdit(product.id, "price", suggested)}
                      className="text-cyan-400 hover:text-cyan-300 hover:underline font-mono font-bold text-sm transition-colors cursor-pointer"
                    >
                      ₱{parseFloat(suggested).toLocaleString()}
                    </button>
                  </td>
                  <td className="px-3 py-3.5 text-center">
                    <Badge className={
                      marginNum >= 30
                        ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 font-mono text-xs px-2.5 py-0.5"
                        : marginNum >= 15
                        ? "bg-amber-950/80 text-amber-300 border border-amber-500/50 font-mono text-xs px-2.5 py-0.5"
                        : "bg-rose-950/80 text-rose-300 border border-rose-500/50 font-mono text-xs px-2.5 py-0.5"
                    }>
                      {margin}%
                    </Badge>
                  </td>
                  <td className="px-3 py-3.5 text-right">
                    {changed && (
                      <Button
                        size="sm"
                        onClick={() => saveProduct(product)}
                        disabled={saving}
                        className={DESIGN_TOKENS.buttons.glowingAction + " gap-1 h-8 text-xs font-bold cursor-pointer"}
                      >
                        <Save className="w-3.5 h-3.5" />
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
        <Card className="water-breathing-card border border-slate-800/80 bg-[#0B1C30]/90 shadow-xl rounded-2xl app-card-hover">
          <CardContent className="p-5">
            <h3 className="font-bold text-white text-base mb-3.5 flex items-center gap-2 font-sans">
              <History className="w-4 h-4 text-cyan-400" />
              Recent Price Changes
            </h3>
            <div className="space-y-2">
              {history.slice(0, 8).map(h => (
                <div key={h.id} className="flex items-center justify-between text-sm py-2 border-b border-slate-800/60 last:border-0">
                  <div>
                    <span className="font-bold text-slate-200 font-sans">{h.product_name}</span>
                    <span className="text-slate-400 ml-2 text-xs font-mono">{new Date(h.created_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs font-mono">
                    <span className="text-slate-400 line-through">₱{h.old_price}</span>
                    <span className="text-cyan-400 font-bold">₱{h.new_price}</span>
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