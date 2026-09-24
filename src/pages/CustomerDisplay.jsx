import { useState, useEffect } from "react";
import { ShoppingCart, CheckCircle2, Sparkles } from "lucide-react";

/**
 * CustomerDisplay — Full-screen customer-facing display page.
 * Opens in a popup window; listens to BroadcastChannel for cart updates.
 * Shows large running total, item list, and a thank-you animation on checkout.
 */
export default function CustomerDisplay() {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [showThankYou, setShowThankYou] = useState(false);
  const [paidAmount, setPaidAmount] = useState(0);

  useEffect(() => {
    const channel = new BroadcastChannel("omnistock-customer-display");

    channel.onmessage = (event) => {
      const msg = event.data;
      if (msg.type === "cart-update") {
        setCart(msg.cart || []);
        setTotal(msg.total || 0);
        setSubtotal(msg.subtotal || 0);
        setDiscount(msg.discount || 0);
        setShowThankYou(false);
      }
      if (msg.type === "thank-you") {
        setPaidAmount(msg.total || 0);
        setShowThankYou(true);
        setCart([]);
        setTotal(0);
        setSubtotal(0);
        setDiscount(0);
        setTimeout(() => setShowThankYou(false), 5000);
      }
    };

    // Notify main window that display is ready
    channel.postMessage({ type: "display-ready" });

    window.addEventListener("beforeunload", () => {
      channel.postMessage({ type: "display-closed" });
    });

    return () => channel.close();
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#050811] via-[#0B1C30] to-[#071322] text-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 border-b border-cyan-900/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="w-7 h-7 text-cyan-400" />
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
            OmniStock
          </h1>
        </div>
        <div className="text-sm text-slate-400 font-mono">
          {new Date().toLocaleDateString("en-PH", { weekday: "long", month: "long", day: "numeric" })}
        </div>
      </div>

      {/* Thank You Overlay */}
      {showThankYou && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <div className="w-28 h-28 rounded-full bg-emerald-500/20 border-4 border-emerald-400 flex items-center justify-center animate-pulse">
            <CheckCircle2 className="w-16 h-16 text-emerald-400" />
          </div>
          <div className="text-center">
            <h2 className="text-4xl font-bold text-emerald-300 mb-2">Thank You!</h2>
            <p className="text-2xl font-mono text-cyan-300">
              ₱{paidAmount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-slate-400 mt-3">Please come again</p>
          </div>
        </div>
      )}

      {/* Cart Display */}
      {!showThankYou && (
        <>
          <div className="flex-1 overflow-y-auto px-8 py-6">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-500">
                <ShoppingCart className="w-20 h-20 opacity-20" />
                <p className="text-xl font-medium">Scan or select items to begin</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Your Order
                </div>
                {cart.map((item) => (
                  <div
                    key={item.product_id}
                    className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl px-5 py-4"
                  >
                    <div className="flex items-center gap-4">
                      <span className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-bold text-lg">
                        {item.quantity}
                      </span>
                      <span className="text-lg font-medium text-slate-100">{item.product_name}</span>
                    </div>
                    <span className="text-lg font-mono font-bold text-cyan-300">
                      ₱{item.subtotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Total Footer */}
          <div className="px-8 py-8 bg-black/40 border-t border-cyan-900/40">
            {discount > 0 && (
              <div className="flex justify-between text-slate-400 text-lg mb-2">
                <span>Subtotal</span>
                <span className="font-mono">₱{subtotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            {discount > 0 && (
              <div className="flex justify-between text-rose-400 text-lg mb-3">
                <span>Discount</span>
                <span className="font-mono">-₱{discount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="flex justify-between items-end">
              <span className="text-2xl font-bold text-slate-300">TOTAL</span>
              <span className="text-5xl font-mono font-bold bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                ₱{total.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}