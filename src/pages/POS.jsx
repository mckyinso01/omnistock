import { useState, useEffect } from "react";
import { entities } from "@/lib/db";
import { base44 } from "@/api/base44Client";
import { convertQuantity } from "@/utils/costing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Search, ShoppingCart, Plus, Minus, Trash2, CheckCircle2, Package,
  RotateCcw, User, CreditCard, Smartphone, Building2, Banknote, SplitSquareHorizontal, Loader2
} from "lucide-react";
import ReceiptModal from "@/components/pos/ReceiptModal";
import RefundModal from "@/components/pos/RefundModal";
import ThermalReceiptModal from "@/components/pos/ThermalReceiptModal";
import BarcodeScanner from "@/components/shared/BarcodeScanner";
import { trackPriceChangesFromTransaction } from "@/lib/priceChangeTracker";
import DESIGN_TOKENS from "@/lib/designSystem";

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash", icon: Banknote },
  { value: "gcash", label: "GCash", icon: Smartphone },
  { value: "maya", label: "Maya", icon: Smartphone },
  { value: "shopee_pay", label: "ShopeePay", icon: Smartphone },
  { value: "grab_pay", label: "GrabPay", icon: Smartphone },
  { value: "card_debit", label: "Debit Card", icon: CreditCard },
  { value: "card_credit", label: "Credit Card", icon: CreditCard },
  { value: "bank_transfer", label: "Bank Transfer", icon: Building2 },
  { value: "instapay", label: "InstaPay", icon: Building2 },
  { value: "pesonet", label: "PESONet", icon: Building2 },
  { value: "paypal", label: "PayPal", icon: CreditCard },
  { value: "split", label: "Split Payment", icon: SplitSquareHorizontal },
];

const SPLIT_METHODS = PAYMENT_METHODS.filter(m => m.value !== "split");

export default function POS() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [amountTendered, setAmountTendered] = useState("");
  const [paymentRef, setPaymentRef] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState("amount"); // "amount" or "percent"
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);
  const [showRefund, setShowRefund] = useState(false);
  const [showThermalModal, setShowThermalModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
  // Split payment
  const [splitPayments, setSplitPayments] = useState([{ method: "cash", amount: "" }]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [p, c, cats, r] = await Promise.all([
        entities.Product.filter({ status: "active" }).catch(() => []),
        entities.Customer.filter({ status: "active" }).catch(() => []),
        entities.Category.list("name", 50).catch(() => []),
        entities.Recipe.filter({ status: "active" }).catch(() => []),
      ]);

      // Compute virtual stock for products with active recipes
      const hydratedProducts = (p || []).map(prod => {
        const recipe = (r || []).find(rec => rec.product_id === prod.id);
        if (!recipe || !recipe.ingredients?.length) return prod;

        // Compute max servings possible from current ingredient stock
        let minBatches = Infinity;
        for (const ing of recipe.ingredients) {
          const rawProd = (p || []).find(pItem => pItem.id === ing.product_id);
          if (!rawProd || !ing.quantity_per_batch) continue;

          // Convert units if raw product unit differs from recipe ingredient unit
          const convertedRawQty = convertQuantity(rawProd.quantity || 0, rawProd.unit, ing.unit);
          const possible = Math.floor(convertedRawQty / ing.quantity_per_batch);
          if (possible < minBatches) minBatches = possible;
        }

        const maxBatches = minBatches === Infinity ? 0 : minBatches;
        const maxServings = maxBatches * (recipe.yield_quantity || 1);

        return {
          ...prod,
          quantity: maxServings, // virtual stock quantity
          isRecipeLinked: true,
          recipe: recipe
        };
      });

      setProducts(hydratedProducts.filter((x) => (x.quantity || 0) > 0));
      setCustomers(c || []);
      setCategories(cats || []);
    } catch (err) {
      console.error("POS loadData Exception:", err);
      setProducts([]);
      setCustomers([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product_id === product.id);
      if (existing) {
        if (existing.quantity >= product.quantity) return prev;
        return prev.map((i) =>
          i.product_id === product.id
            ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.unit_price }
            : i
        );
      }
      return [...prev, {
        product_id: product.id, product_name: product.name,
        quantity: 1, unit_price: product.price || 0, unit_cost: product.cost || 0,
        subtotal: product.price || 0, discount: 0, max_quantity: product.quantity,
      }];
    });
  };

  const updateQty = (productId, delta) => {
    setCart((prev) =>
      prev.map((i) => {
        if (i.product_id !== productId) return i;
        const newQty = i.quantity + delta;
        if (newQty <= 0) return null;
        if (newQty > i.max_quantity) return i;
        return { ...i, quantity: newQty, subtotal: newQty * i.unit_price };
      }).filter(Boolean)
    );
  };

  const removeFromCart = (productId) => setCart((prev) => prev.filter((i) => i.product_id !== productId));

  const subtotal = cart.reduce((sum, i) => sum + i.subtotal, 0);
  const discountAmt = discountType === "percent"
    ? Math.min((discount / 100) * subtotal, subtotal)
    : Math.min(discount, subtotal);
  const total = subtotal - discountAmt;
  const change = paymentMethod === "cash" ? (parseFloat(amountTendered) || 0) - total : 0;

  const splitTotal = splitPayments.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
  const splitRemaining = total - splitTotal;

  const processPayment = async () => {
    if (cart.length === 0) return alert("Cart is empty.");
    if (paymentMethod === "cash" && (parseFloat(amountTendered) || 0) < total) {
      return alert("Insufficient amount tendered.");
    }
    if (paymentMethod === "split" && Math.abs(splitRemaining) > 0.01) {
      return alert(`Split payments don't add up. Remaining: ₱${splitRemaining.toFixed(2)}`);
    }

    setProcessing(true);
    const txnNumber = `TXN-${Date.now()}`;
    const txn = await entities.Transaction.create({
      transaction_number: txnNumber, type: "sale",
      items: cart.map(({ product_id, product_name, quantity, unit_price, unit_cost, subtotal, discount }) => ({
        product_id, product_name, quantity, unit_price, unit_cost, subtotal, discount,
      })),
      subtotal, discount_amount: discountAmt, tax_amount: 0, total_amount: total,
      amount_tendered: parseFloat(amountTendered) || total,
      change_amount: Math.max(0, change),
      payment_method: paymentMethod,
      payment_details: paymentMethod === "split"
        ? JSON.stringify(splitPayments)
        : (paymentRef || null),
      customer_name: selectedCustomer?.name || null,
      status: "completed",
    });

    try {
      await base44.entities.Transaction.create({
        transaction_number: txn.transaction_number,
        type: txn.type,
        items: txn.items,
        subtotal: txn.subtotal,
        discount_amount: txn.discount_amount,
        tax_amount: txn.tax_amount,
        total_amount: txn.total_amount,
        amount_tendered: txn.amount_tendered,
        change_amount: txn.change_amount,
        payment_method: txn.payment_method,
        payment_details: txn.payment_details,
        customer_name: txn.customer_name,
        status: "completed",
      });
    } catch (e) { /* best-effort: ignore cloud mirror failure */ }

    await Promise.all(cart.map(async (item) => {
      const prod = products.find((p) => p.id === item.product_id);
      if (!prod) return;

      if (prod.isRecipeLinked && prod.recipe) {
        const recipe = prod.recipe;
        const yieldQty = Number(recipe.yield_quantity) || 1;
        const batchesSold = item.quantity / yieldQty;

        for (const ing of recipe.ingredients) {
          const rawProd = products.find(pItem => pItem.id === ing.product_id) || 
                          await entities.Product.get(ing.product_id);
          if (!rawProd) continue;

          const qtyNeededInIngredientUnit = ing.quantity_per_batch * batchesSold;
          const qtyNeededInProductUnit = convertQuantity(qtyNeededInIngredientUnit, ing.unit, rawProd.unit);
          const newQty = Math.max(0, (rawProd.quantity || 0) - qtyNeededInProductUnit);

          await entities.Product.update(ing.product_id, { quantity: newQty });
        }
      } else {
        await entities.Product.update(item.product_id, { quantity: Math.max(0, (prod.quantity || 0) - item.quantity) });
      }
    }));

    if (selectedCustomer) {
      const pts = Math.floor(total / 10);
      await entities.Customer.update(selectedCustomer.id, {
        loyalty_points: (selectedCustomer.loyalty_points || 0) + pts,
        total_spent: (selectedCustomer.total_spent || 0) + total,
        visit_count: (selectedCustomer.visit_count || 0) + 1,
      });
    }

    trackPriceChangesFromTransaction(txn, selectedCustomer?.name ? `POS - ${selectedCustomer.name}` : "POS");

    setLastTransaction({ ...txn, items: cart, total, change: Math.max(0, change), paymentMethod, customerName: selectedCustomer?.name });
    setShowThermalModal(true);
    setCart([]); setAmountTendered(""); setPaymentRef(""); setSelectedCustomer(null);
    setCustomerSearch(""); setDiscount(0); setPaymentMethod("cash");
    setSplitPayments([{ method: "cash", amount: "" }]);
    loadData();
    setProcessing(false);
  };

  const filteredProducts = products.filter((p) => {
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode?.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "all" || p.category === activeCategory;
    return matchSearch && matchCat;
  });

  const filteredCustomers = customers.filter(c =>
    c.name?.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phone?.includes(customerSearch)
  ).slice(0, 5);

  const categoryNames = ["all", ...categories.map(c => c.name)];

  return (
    <div className="flex flex-col lg:flex-row h-full min-h-screen bg-[#050811] text-slate-100 font-sans">
      {/* Product Grid */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Search + Category Filter */}
        <div className="p-3.5 space-y-2.5 bg-[#0B1C30]/90 border-b border-slate-800/80 backdrop-blur-md">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
            <input
              type="text"
              placeholder="Search product, SKU, or scan barcode (Press Enter to quick-add)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && search.trim()) {
                  const match = products.find(
                    (p) =>
                      p.barcode === search.trim() ||
                      p.sku?.toLowerCase() === search.trim().toLowerCase() ||
                      p.name?.toLowerCase() === search.trim().toLowerCase()
                  );
                  if (match) {
                    addToCart(match);
                    setSearch("");
                  }
                }
              }}
              className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-slate-700/80 bg-[#071322] text-slate-100 placeholder:text-slate-500 focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF] outline-none text-base sm:text-sm font-medium transition-all"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categoryNames.map(cat => (
              <button key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer
                  ${activeCategory === cat
                    ? "bg-[#2563EB] text-white border border-[#00E5FF] shadow-[0_0_12px_rgba(0,229,255,0.3)]"
                    : "bg-[#071322] text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white"}`}
              >
                {cat === "all" ? "All Categories" : cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-36 rounded-xl bg-[#0B1C30] border border-slate-800 animate-pulse" />)}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <Package className="w-12 h-12 mx-auto mb-3 text-slate-500" />
              <p className={DESIGN_TOKENS.typography.h2}>No active products found</p>
              <p className={DESIGN_TOKENS.typography.muted + " mt-1"}>Try adjusting search query or category filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {filteredProducts.map((p) => (
                <button key={p.id} onClick={() => addToCart(p)}
                  className="bg-[#0B1C30]/90 border border-slate-800/80 rounded-xl p-3 text-left hover:border-cyan-500/80 transition-all duration-200 active:scale-[0.98] cursor-pointer group flex flex-col justify-between shadow-[0_4px_20px_rgba(5,8,17,0.45)] hover:shadow-[0_8px_30px_rgba(0,229,255,0.25)]"
                >
                  <div>
                    {p.photo_url ? (
                      <img src={p.photo_url} alt={p.name} className="w-full h-24 object-cover rounded-lg mb-2.5 border border-slate-700/50" />
                    ) : (
                      <div className="w-full h-24 bg-gradient-to-br from-[#071322] to-[#0B1C30] border border-slate-800 rounded-lg mb-2.5 flex items-center justify-center group-hover:border-cyan-500/30 transition-colors">
                        <Package className="w-8 h-8 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                      </div>
                    )}
                    <p className="text-sm font-bold text-slate-100 truncate group-hover:text-cyan-300 transition-colors">{p.name}</p>
                    {p.sku && <p className="text-[11px] font-mono text-slate-400 truncate">SKU: {p.sku}</p>}
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between">
                    <p className="text-cyan-300 font-mono font-bold text-sm">{DESIGN_TOKENS.formatCurrency(p.price)}</p>
                    <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-[#071322] border border-slate-800 text-slate-300">
                      {p.quantity} {p.unit || "pcs"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action Toolbar */}
        <div className="p-3.5 border-t border-slate-800/80 bg-[#0B1C30]/90 backdrop-blur-md flex gap-3 flex-wrap">
          <Button variant="outline" onClick={() => setShowRefund(true)} className="gap-2 text-amber-400 border-amber-500/40 bg-amber-950/20 hover:bg-amber-900/40 hover:text-amber-300 font-medium">
            <RotateCcw className="w-4 h-4" /> Process Refund
          </Button>
          <Button variant="outline" onClick={() => setShowScanner(true)} className="gap-2 text-cyan-400 border-cyan-500/40 bg-cyan-950/20 hover:bg-cyan-900/40 hover:text-cyan-300 font-medium shadow-[0_0_20px_rgba(0,229,255,0.3)] cursor-pointer">
            <Search className="w-4 h-4" /> Camera Scan Barcode
          </Button>
        </div>
      </div>

      {/* Cart / Checkout Panel */}
      <div className="w-full lg:w-80 xl:w-96 bg-[#0B1C30] border-t lg:border-t-0 lg:border-l border-slate-800/80 flex flex-col shadow-2xl">
        <div className="px-4 py-3.5 border-b border-slate-800/80 flex items-center justify-between bg-[#071322]">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-cyan-400" />
            <h2 className={DESIGN_TOKENS.typography.h2}>Active Cart ({cart.length})</h2>
          </div>
          {cart.length > 0 && (
            <button onClick={() => setCart([])} className="text-xs text-rose-400 hover:text-rose-300 font-mono transition-colors cursor-pointer">
              Clear All
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
          {cart.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30 text-cyan-400" />
              <p className={DESIGN_TOKENS.typography.h2}>Cart is empty</p>
              <p className={DESIGN_TOKENS.typography.muted + " mt-1"}>Click products or scan barcodes to build an order</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.product_id} className="flex items-center gap-3 bg-[#071322] border border-slate-800/80 rounded-xl p-3 shadow-md">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-100 truncate">{item.product_name}</p>
                  <p className="text-xs font-mono text-cyan-400 mt-0.5">
                    {DESIGN_TOKENS.formatCurrency(item.unit_price)} × {item.quantity} = <span className="font-bold text-cyan-300">{DESIGN_TOKENS.formatCurrency(item.subtotal)}</span>
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => updateQty(item.product_id, -1)} className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white flex items-center justify-center transition-colors cursor-pointer">
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-7 text-center text-sm font-bold font-mono text-white">{item.quantity}</span>
                  <button onClick={() => updateQty(item.product_id, 1)} className="w-7 h-7 rounded-lg bg-blue-900/60 border border-blue-700/60 hover:bg-blue-800 text-blue-200 flex items-center justify-center transition-colors cursor-pointer">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => removeFromCart(item.product_id)} className="w-7 h-7 rounded-lg bg-rose-950/40 border border-rose-800/60 hover:bg-rose-900 text-rose-300 flex items-center justify-center ml-1 transition-colors cursor-pointer">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Checkout Controls */}
        <div className="border-t border-slate-800/80 p-4 space-y-3.5 bg-[#071322]/80">
          {/* Customer */}
          <div className="relative">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-400 shrink-0" />
              {selectedCustomer ? (
                <div className="flex-1 flex items-center justify-between bg-blue-950/40 border border-blue-700/60 rounded-xl px-3 py-2">
                  <div>
                    <p className="text-sm font-bold text-blue-200">{selectedCustomer.name}</p>
                    <p className="text-xs font-mono text-blue-400">{selectedCustomer.loyalty_points || 0} loyalty pts</p>
                  </div>
                  <button onClick={() => setSelectedCustomer(null)} className="text-slate-400 hover:text-rose-400 ml-2 text-xs font-bold">✕</button>
                </div>
              ) : (
                <Input placeholder="Assign customer for loyalty points..." value={customerSearch}
                  onChange={e => { setCustomerSearch(e.target.value); setShowCustomerSearch(true); }}
                  onFocus={() => setShowCustomerSearch(true)}
                  className="text-sm flex-1 bg-[#050811] border-slate-700 text-white placeholder:text-slate-500" />
              )}
            </div>
            {showCustomerSearch && customerSearch && !selectedCustomer && (
              <div className="absolute top-full left-0 right-0 z-30 bg-[#071322] border border-slate-700 rounded-xl shadow-2xl mt-1 max-h-48 overflow-y-auto">
                {filteredCustomers.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-3">No matching customers found</p>
                ) : (
                  filteredCustomers.map(c => (
                    <button key={c.id} onClick={() => { setSelectedCustomer(c); setCustomerSearch(""); setShowCustomerSearch(false); }}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-slate-800/80 border-b border-slate-800/50 last:border-0 transition-colors text-sm">
                      <p className="font-bold text-white">{c.name}</p>
                      <p className="text-xs font-mono text-slate-400">{c.phone || "No phone"} · {c.loyalty_points || 0} pts</p>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Discount */}
          <div className="flex gap-2">
            <Select value={discountType} onValueChange={setDiscountType}>
              <SelectTrigger className="w-32 text-xs bg-[#050811] border-slate-700 text-slate-200"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[#071322] border-slate-700 text-slate-200">
                <SelectItem value="amount">₱ Discount</SelectItem>
                <SelectItem value="percent">% Discount</SelectItem>
              </SelectContent>
            </Select>
            <Input type="number" placeholder={discountType === "percent" ? "0%" : "₱0"} value={discount || ""}
              onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} className="text-sm bg-[#050811] border-slate-700 text-white font-mono" />
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Payment Method</Label>
            <div className="grid grid-cols-3 gap-1.5 max-h-36 overflow-y-auto pr-1">
              {PAYMENT_METHODS.map(pm => {
                const Icon = pm.icon;
                const isSelected = paymentMethod === pm.value;
                return (
                  <button key={pm.value} onClick={() => setPaymentMethod(pm.value)}
                    className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl border text-[11px] font-bold transition-all duration-200
                      ${isSelected
                        ? "border-blue-500 bg-blue-950/60 text-blue-200 shadow-md shadow-blue-600/20"
                        : "border-slate-800/80 bg-[#050811] text-slate-400 hover:border-slate-700 hover:text-slate-200"}`}>
                    <Icon className={`w-4 h-4 ${isSelected ? "text-blue-400" : "text-slate-400"}`} />
                    <span className="truncate w-full text-center">{pm.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cash Tendered */}
          {paymentMethod === "cash" && (
            <Input type="number" placeholder="Enter Cash Tendered Amount (₱)" value={amountTendered}
              onChange={(e) => setAmountTendered(e.target.value)} className="text-sm bg-[#050811] border-slate-700 text-emerald-400 font-mono font-bold placeholder:text-slate-500" />
          )}

          {/* E-wallet / Card Ref */}
          {["gcash", "maya", "shopee_pay", "grab_pay", "card_debit", "card_credit", "bank_transfer", "instapay", "pesonet", "paypal"].includes(paymentMethod) && (
            <Input placeholder="Ref / Approval Code (e.g. TXN98124)" value={paymentRef}
              onChange={e => setPaymentRef(e.target.value)} className="text-sm bg-[#050811] border-slate-700 text-white font-mono placeholder:text-slate-500" />
          )}

          {/* Split Payment */}
          {paymentMethod === "split" && (
            <div className="space-y-2 bg-[#050811] p-2.5 rounded-xl border border-slate-800">
              {splitPayments.map((sp, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <Select value={sp.method} onValueChange={v => {
                    const arr = [...splitPayments]; arr[idx].method = v; setSplitPayments(arr);
                  }}>
                    <SelectTrigger className="w-28 text-xs h-8 bg-[#071322] border-slate-700 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#071322] border-slate-700 text-white">
                      {SPLIT_METHODS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input type="number" placeholder="₱0" value={sp.amount}
                    onChange={e => {
                      const arr = [...splitPayments]; arr[idx].amount = e.target.value; setSplitPayments(arr);
                    }} className="flex-1 h-8 text-sm bg-[#071322] border-slate-700 text-white font-mono" />
                  {splitPayments.length > 1 && (
                    <button onClick={() => setSplitPayments(splitPayments.filter((_, i) => i !== idx))} className="text-rose-400 hover:text-rose-300">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <Button size="sm" variant="outline" onClick={() => setSplitPayments([...splitPayments, { method: "cash", amount: "" }])}
                className="w-full text-xs gap-1 text-blue-400 border-blue-800/60 bg-blue-950/30 hover:bg-blue-900/40">
                <Plus className="w-3 h-3" /> Add Split Line
              </Button>
              {splitRemaining !== 0 && (
                <p className={`text-xs font-mono font-bold ${splitRemaining > 0 ? "text-amber-400" : "text-cyan-400"}`}>
                  {splitRemaining > 0 ? `Remaining: ₱${splitRemaining.toFixed(2)}` : `Overpaid: ₱${Math.abs(splitRemaining).toFixed(2)}`}
                </p>
              )}
            </div>
          )}

          {/* Bill Summary */}
          <div className="bg-[#050811] rounded-xl p-3.5 space-y-2 text-sm border border-slate-800/80 font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span className="text-slate-200">₱{subtotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</span>
            </div>
            {discountAmt > 0 && (
              <div className="flex justify-between text-rose-400">
                <span>Discount {discountType === "percent" ? `(${discount}%)` : ""}</span>
                <span>-₱{discountAmt.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-white text-base border-t border-slate-800 pt-2 font-sans">
              <span>NET TOTAL</span>
              <span className="text-cyan-300 font-mono">₱{total.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</span>
            </div>
            {paymentMethod === "cash" && parseFloat(amountTendered) >= total && (
              <div className="flex justify-between text-emerald-400 font-bold border-t border-slate-800 pt-1.5">
                <span>Change Due</span>
                <span>₱{change.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            {selectedCustomer && (
              <div className="flex justify-between text-blue-400 text-xs border-t border-slate-800 pt-1.5">
                <span>Points Earned</span>
                <span>+{Math.floor(total / 10)} pts</span>
              </div>
            )}
          </div>

          <Button onClick={processPayment} disabled={cart.length === 0 || processing}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-base h-12 gap-2 shadow-lg shadow-blue-600/30 rounded-xl app-card-hover">
            <CheckCircle2 className="w-5 h-5" />
            {processing ? "Processing Checkout..." : "CONFIRM SALE & PRINT RECEIPT"}
          </Button>
        </div>
      </div>

      {showScanner && (
        <BarcodeScanner
          onDetected={handleBarcodeDetected}
          onClose={() => setShowScanner(false)}
        />
      )}
      {lastTransaction && (
        <>
          <ReceiptModal transaction={lastTransaction} onClose={() => setLastTransaction(null)} />
          <ThermalReceiptModal open={showThermalModal} transaction={lastTransaction} onClose={() => setShowThermalModal(false)} onPrint={() => window.print()} />
        </>
      )}
      {showRefund && (
        <RefundModal onClose={() => { setShowRefund(false); loadData(); }} />
      )}
    </div>
  );
}