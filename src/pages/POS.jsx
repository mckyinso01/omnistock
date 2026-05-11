import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Search, ShoppingCart, Plus, Minus, Trash2, CheckCircle2, Package,
  RotateCcw, User, CreditCard, Smartphone, Building2, Banknote, SplitSquareHorizontal
} from "lucide-react";
import ReceiptModal from "@/components/pos/ReceiptModal";
import RefundModal from "@/components/pos/RefundModal";

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
  const [activeCategory, setActiveCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  // Split payment
  const [splitPayments, setSplitPayments] = useState([{ method: "cash", amount: "" }]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const [p, c, cats] = await Promise.all([
      base44.entities.Product.filter({ status: "active" }),
      base44.entities.Customer.filter({ status: "active" }),
      base44.entities.Category.list("name", 50),
    ]);
    setProducts(p.filter((x) => (x.quantity || 0) > 0));
    setCustomers(c);
    setCategories(cats);
    setLoading(false);
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
    const txn = await base44.entities.Transaction.create({
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

    // Deduct stock
    await Promise.all(cart.map((item) => {
      const prod = products.find((p) => p.id === item.product_id);
      if (!prod) return Promise.resolve();
      return base44.entities.Product.update(item.product_id, { quantity: Math.max(0, (prod.quantity || 0) - item.quantity) });
    }));

    // Update customer loyalty
    if (selectedCustomer) {
      const pts = Math.floor(total / 10); // 1 point per ₱10
      await base44.entities.Customer.update(selectedCustomer.id, {
        loyalty_points: (selectedCustomer.loyalty_points || 0) + pts,
        total_spent: (selectedCustomer.total_spent || 0) + total,
        visit_count: (selectedCustomer.visit_count || 0) + 1,
      });
    }

    setLastTransaction({ ...txn, items: cart, total, change: Math.max(0, change), paymentMethod, customerName: selectedCustomer?.name });
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
    <div className="flex flex-col lg:flex-row h-full min-h-screen">
      {/* Product Grid */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Search + Category Filter */}
        <div className="p-3 space-y-2 bg-white border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Search product, SKU, barcode..." value={search}
              onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categoryNames.map(cat => (
              <button key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors
                  ${activeCategory === cat ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                {cat === "all" ? "All" : cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {[1,2,3,4,5,6].map(i => <div key={i} className="h-32 rounded-xl bg-slate-200 animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredProducts.map((p) => (
                <button key={p.id} onClick={() => addToCart(p)}
                  className="bg-white border border-slate-200 rounded-xl p-3 text-left hover:border-emerald-400 hover:shadow-md transition-all active:scale-95"
                >
                  {p.photo_url ? (
                    <img src={p.photo_url} alt={p.name} className="w-full h-20 object-cover rounded-lg mb-2" />
                  ) : (
                    <div className="w-full h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg mb-2 flex items-center justify-center">
                      <Package className="w-7 h-7 text-slate-300" />
                    </div>
                  )}
                  <p className="text-sm font-semibold text-slate-800 truncate">{p.name}</p>
                  <p className="text-emerald-600 font-bold text-sm">₱{(p.price || 0).toLocaleString()}</p>
                  <p className="text-xs text-slate-400">{p.quantity} {p.unit || "pcs"} left</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Refund button */}
        <div className="p-3 border-t border-slate-100 bg-white">
          <Button variant="outline" onClick={() => setShowRefund(true)} className="gap-2 text-orange-600 border-orange-200 hover:bg-orange-50 w-full sm:w-auto">
            <RotateCcw className="w-4 h-4" /> Process Refund
          </Button>
        </div>
      </div>

      {/* Cart / Checkout Panel */}
      <div className="w-full lg:w-80 xl:w-96 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-emerald-600" />
          <h2 className="font-semibold text-slate-800">Cart ({cart.length})</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {cart.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-20" />
              <p className="text-sm">Cart is empty</p>
              <p className="text-xs">Tap a product to add</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.product_id} className="flex items-center gap-2 bg-slate-50 rounded-xl p-2.5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{item.product_name}</p>
                  <p className="text-xs text-emerald-600">₱{item.unit_price.toLocaleString()} · ₱{item.subtotal.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => updateQty(item.product_id, -1)} className="w-6 h-6 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                  <button onClick={() => updateQty(item.product_id, 1)} className="w-6 h-6 rounded-full bg-emerald-100 hover:bg-emerald-200 flex items-center justify-center text-emerald-700">
                    <Plus className="w-3 h-3" />
                  </button>
                  <button onClick={() => removeFromCart(item.product_id)} className="w-6 h-6 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-400 ml-1">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Payment Section */}
        <div className="border-t border-slate-100 p-4 space-y-3">
          {/* Customer */}
          <div className="relative">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400 shrink-0" />
              {selectedCustomer ? (
                <div className="flex-1 flex items-center justify-between bg-emerald-50 rounded-lg px-3 py-1.5">
                  <div>
                    <p className="text-sm font-medium text-emerald-800">{selectedCustomer.name}</p>
                    <p className="text-xs text-emerald-600">{selectedCustomer.loyalty_points || 0} pts</p>
                  </div>
                  <button onClick={() => setSelectedCustomer(null)} className="text-slate-400 hover:text-red-500 ml-2 text-xs">✕</button>
                </div>
              ) : (
                <Input placeholder="Search customer..." value={customerSearch}
                  onChange={e => { setCustomerSearch(e.target.value); setShowCustomerSearch(true); }}
                  onFocus={() => setShowCustomerSearch(true)}
                  className="text-sm flex-1" />
              )}
            </div>
            {showCustomerSearch && customerSearch && !selectedCustomer && (
              <div className="absolute top-full left-0 right-0 z-20 bg-white border border-slate-200 rounded-xl shadow-lg mt-1 max-h-40 overflow-y-auto">
                {filteredCustomers.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-3">No customers found</p>
                ) : (
                  filteredCustomers.map(c => (
                    <button key={c.id} onClick={() => { setSelectedCustomer(c); setCustomerSearch(""); setShowCustomerSearch(false); }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 text-sm">
                      <p className="font-medium text-slate-800">{c.name}</p>
                      <p className="text-xs text-slate-400">{c.phone} · {c.loyalty_points || 0} pts</p>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Discount */}
          <div className="flex gap-2">
            <Select value={discountType} onValueChange={setDiscountType}>
              <SelectTrigger className="w-28 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="amount">₱ Discount</SelectItem>
                <SelectItem value="percent">% Discount</SelectItem>
              </SelectContent>
            </Select>
            <Input type="number" placeholder={discountType === "percent" ? "0%" : "₱0"} value={discount || ""}
              onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} className="text-sm" />
          </div>

          {/* Payment Method */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-500">Payment Method</Label>
            <div className="grid grid-cols-3 gap-1.5">
              {PAYMENT_METHODS.map(pm => {
                const Icon = pm.icon;
                return (
                  <button key={pm.value} onClick={() => setPaymentMethod(pm.value)}
                    className={`flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl border text-xs font-medium transition-all
                      ${paymentMethod === pm.value ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                    <Icon className="w-4 h-4" />
                    <span className="truncate w-full text-center">{pm.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cash tendered */}
          {paymentMethod === "cash" && (
            <Input type="number" placeholder="Amount tendered" value={amountTendered}
              onChange={(e) => setAmountTendered(e.target.value)} className="text-sm" />
          )}

          {/* E-wallet / card ref */}
          {["gcash", "maya", "shopee_pay", "grab_pay", "card_debit", "card_credit", "bank_transfer", "instapay", "pesonet", "paypal"].includes(paymentMethod) && (
            <Input placeholder="Reference / approval code (optional)" value={paymentRef}
              onChange={e => setPaymentRef(e.target.value)} className="text-sm" />
          )}

          {/* Split payment inputs */}
          {paymentMethod === "split" && (
            <div className="space-y-2">
              {splitPayments.map((sp, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <Select value={sp.method} onValueChange={v => {
                    const arr = [...splitPayments]; arr[idx].method = v; setSplitPayments(arr);
                  }}>
                    <SelectTrigger className="w-28 text-xs h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SPLIT_METHODS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input type="number" placeholder="₱0" value={sp.amount}
                    onChange={e => {
                      const arr = [...splitPayments]; arr[idx].amount = e.target.value; setSplitPayments(arr);
                    }} className="flex-1 h-8 text-sm" />
                  {splitPayments.length > 1 && (
                    <button onClick={() => setSplitPayments(splitPayments.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <Button size="sm" variant="outline" onClick={() => setSplitPayments([...splitPayments, { method: "cash", amount: "" }])}
                className="w-full text-xs gap-1 text-emerald-600">
                <Plus className="w-3 h-3" /> Add Payment
              </Button>
              {splitRemaining !== 0 && (
                <p className={`text-xs font-medium ${splitRemaining > 0 ? "text-orange-600" : "text-emerald-600"}`}>
                  {splitRemaining > 0 ? `Still needs: ₱${splitRemaining.toFixed(2)}` : `Overpaid by: ₱${Math.abs(splitRemaining).toFixed(2)}`}
                </p>
              )}
            </div>
          )}

          {/* Totals */}
          <div className="bg-slate-50 rounded-xl p-3 space-y-1.5 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>₱{subtotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</span>
            </div>
            {discountAmt > 0 && (
              <div className="flex justify-between text-red-500">
                <span>Discount {discountType === "percent" ? `(${discount}%)` : ""}</span>
                <span>-₱{discountAmt.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-slate-800 text-base border-t border-slate-200 pt-1.5">
              <span>TOTAL</span>
              <span>₱{total.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</span>
            </div>
            {paymentMethod === "cash" && parseFloat(amountTendered) >= total && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Change</span>
                <span>₱{change.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            {selectedCustomer && (
              <div className="flex justify-between text-violet-600 text-xs border-t border-slate-200 pt-1.5">
                <span>Loyalty points earned</span>
                <span>+{Math.floor(total / 10)} pts</span>
              </div>
            )}
          </div>

          <Button onClick={processPayment} disabled={cart.length === 0 || processing}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-11 gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {processing ? "Processing..." : "Confirm Payment"}
          </Button>
        </div>
      </div>

      {lastTransaction && (
        <ReceiptModal transaction={lastTransaction} onClose={() => setLastTransaction(null)} />
      )}
      {showRefund && (
        <RefundModal onClose={() => { setShowRefund(false); loadData(); }} />
      )}
    </div>
  );
}