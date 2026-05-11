import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ShoppingCart, Plus, Minus, Trash2, CheckCircle2, Package } from "lucide-react";
import ReceiptModal from "@/components/pos/ReceiptModal";

export default function POS() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [amountTendered, setAmountTendered] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    const p = await base44.entities.Product.filter({ status: "active" });
    setProducts(p.filter((x) => (x.quantity || 0) > 0));
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
      return [
        ...prev,
        {
          product_id: product.id,
          product_name: product.name,
          quantity: 1,
          unit_price: product.price || 0,
          unit_cost: product.cost || 0,
          subtotal: product.price || 0,
          discount: 0,
          max_quantity: product.quantity,
        },
      ];
    });
  };

  const updateQty = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.product_id !== productId) return i;
          const newQty = i.quantity + delta;
          if (newQty <= 0) return null;
          if (newQty > i.max_quantity) return i;
          return { ...i, quantity: newQty, subtotal: newQty * i.unit_price };
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((i) => i.product_id !== productId));
  };

  const subtotal = cart.reduce((sum, i) => sum + i.subtotal, 0);
  const discountAmt = Math.min(discount, subtotal);
  const total = subtotal - discountAmt;
  const change = paymentMethod === "cash" ? (parseFloat(amountTendered) || 0) - total : 0;

  const processPayment = async () => {
    if (cart.length === 0) return alert("Cart is empty.");
    if (paymentMethod === "cash" && (parseFloat(amountTendered) || 0) < total) {
      return alert("Insufficient amount tendered.");
    }

    setProcessing(true);

    const txnNumber = `TXN-${Date.now()}`;
    const txn = await base44.entities.Transaction.create({
      transaction_number: txnNumber,
      type: "sale",
      items: cart.map(({ product_id, product_name, quantity, unit_price, unit_cost, subtotal, discount }) => ({
        product_id, product_name, quantity, unit_price, unit_cost, subtotal, discount,
      })),
      subtotal,
      discount_amount: discountAmt,
      tax_amount: 0,
      total_amount: total,
      amount_tendered: parseFloat(amountTendered) || total,
      change_amount: Math.max(0, change),
      payment_method: paymentMethod,
      customer_name: customerName || null,
      status: "completed",
    });

    // Deduct stock
    await Promise.all(
      cart.map((item) => {
        const prod = products.find((p) => p.id === item.product_id);
        if (!prod) return Promise.resolve();
        const newQty = (prod.quantity || 0) - item.quantity;
        return base44.entities.Product.update(item.product_id, { quantity: Math.max(0, newQty) });
      })
    );

    setLastTransaction({ ...txn, items: cart, total, change: Math.max(0, change), paymentMethod });
    setCart([]);
    setAmountTendered("");
    setCustomerName("");
    setDiscount(0);
    setPaymentMethod("cash");
    loadProducts();
    setProcessing(false);
  };

  const filtered = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col lg:flex-row h-full min-h-screen">
      {/* Product Grid */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search product, SKU, barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-32 rounded-xl bg-slate-200 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
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

      {/* Cart / Checkout Panel */}
      <div className="w-full lg:w-80 xl:w-96 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-emerald-600" />
          <h2 className="font-semibold text-slate-800">Cart ({cart.length})</h2>
        </div>

        {/* Cart Items */}
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
                  <p className="text-xs text-emerald-600">₱{item.unit_price.toLocaleString()} each</p>
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
          <Input
            placeholder="Customer name (optional)"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="text-sm"
          />
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Discount (₱)"
              value={discount || ""}
              onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
              className="text-sm"
            />
          </div>
          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="gcash">GCash</SelectItem>
              <SelectItem value="maya">Maya</SelectItem>
              <SelectItem value="card">Card</SelectItem>
              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              <SelectItem value="split">Split Payment</SelectItem>
            </SelectContent>
          </Select>
          {paymentMethod === "cash" && (
            <Input
              type="number"
              placeholder="Amount tendered"
              value={amountTendered}
              onChange={(e) => setAmountTendered(e.target.value)}
              className="text-sm"
            />
          )}

          {/* Totals */}
          <div className="bg-slate-50 rounded-xl p-3 space-y-1.5 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>₱{subtotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</span>
            </div>
            {discountAmt > 0 && (
              <div className="flex justify-between text-red-500">
                <span>Discount</span>
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
          </div>

          <Button
            onClick={processPayment}
            disabled={cart.length === 0 || processing}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-11 gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            {processing ? "Processing..." : "Confirm Payment"}
          </Button>
        </div>
      </div>

      {lastTransaction && (
        <ReceiptModal
          transaction={lastTransaction}
          onClose={() => setLastTransaction(null)}
        />
      )}
    </div>
  );
}