import { useState, useEffect } from "react";
import { entities } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Search, RotateCcw, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { DESIGN_TOKENS } from "@/lib/designSystem";

export default function RefundModal({ onClose }) {
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [refundItems, setRefundItems] = useState([]);
  const [refundReason, setRefundReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    try {
      entities.Transaction.filter({ status: "completed", type: "sale" })
        .then(t => {
          setTransactions((t || []).sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
        })
        .catch(() => setTransactions([]))
        .finally(() => setLoading(false));
    } catch (err) {
      console.error("RefundModal load exception:", err);
      setLoading(false);
    }
  }, []);

  const selectTransaction = (txn) => {
    setSelected(txn);
    setRefundItems((txn.items || []).map(item => ({ ...item, refund_qty: 0 })));
  };

  const updateRefundQty = (idx, qty) => {
    const maxQty = refundItems[idx]?.quantity || 0;
    const clampedQty = Math.max(0, Math.min(qty, maxQty));
    setRefundItems(refundItems.map((item, i) => i === idx ? { ...item, refund_qty: clampedQty } : item));
  };

  const totalRefund = refundItems.reduce((s, i) => s + (i.refund_qty || 0) * (i.unit_price || 0), 0);

  const processRefund = async () => {
    const itemsToRefund = refundItems.filter(i => i.refund_qty > 0);
    if (itemsToRefund.length === 0) return alert("Select items to refund.");
    setProcessing(true);

    const refundTotal = itemsToRefund.reduce((s, i) => s + i.refund_qty * i.unit_price, 0);

    await entities.Transaction.create({
      transaction_number: `REF-${Date.now()}`,
      type: "refund",
      items: itemsToRefund.map(i => ({
        product_id: i.product_id, product_name: i.product_name,
        quantity: i.refund_qty, unit_price: i.unit_price, unit_cost: i.unit_cost,
        subtotal: i.refund_qty * i.unit_price, discount: 0,
      })),
      subtotal: refundTotal, discount_amount: 0, tax_amount: 0,
      total_amount: refundTotal, payment_method: selected.payment_method,
      notes: refundReason || `Refund for ${selected.transaction_number}`,
      status: "completed",
    });

    // Restock
    const products = await entities.Product.list();
    await Promise.all(itemsToRefund.map(item => {
      const prod = products.find(p => p.id === item.product_id);
      if (!prod) return Promise.resolve();
      return entities.Product.update(item.product_id, { quantity: (prod.quantity || 0) + item.refund_qty });
    }));

    setProcessing(false);
    setDone(true);
  };

  const filtered = transactions.filter(t =>
    t.transaction_number?.toLowerCase().includes(search.toLowerCase()) ||
    t.customer_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (done) {
    return (
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-[#0B1C30] border border-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center space-y-4">
          <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Refund Processed!</h2>
          <p className="text-slate-400 text-sm">Items have been restocked successfully.</p>
          <Button onClick={onClose} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium">Done</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0B1C30] border border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#0B1C30] border-b border-slate-800 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-2 text-orange-400">
            <RotateCcw className="w-5 h-5" />
            <h2 className="font-bold text-white">Process Refund</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-4">
          {!selected ? (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search transaction #, customer..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9 bg-[#071322] border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500"
                />
              </div>
              {loading ? (
                <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 bg-slate-800/50 border border-slate-800 rounded-xl animate-pulse" />)}</div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filtered.slice(0, 20).map(txn => (
                    <button key={txn.id} onClick={() => selectTransaction(txn)}
                      className="w-full text-left p-3.5 border border-slate-800 rounded-xl hover:border-cyan-500 hover:bg-[#071322] transition-all">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-white">{txn.transaction_number}</p>
                          <p className="text-xs text-slate-400">
                            {txn.customer_name || "Walk-in"} · {format(new Date(txn.created_date), "MMM d, h:mm a")}
                          </p>
                        </div>
                        <p className="text-sm font-bold text-cyan-300 font-mono">₱{(txn.total_amount || 0).toLocaleString()}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center justify-between p-3 bg-[#071322] rounded-xl border border-slate-800">
                <div>
                  <p className="font-semibold text-white">{selected.transaction_number}</p>
                  <p className="text-xs text-slate-400">{selected.customer_name || "Walk-in"} · {format(new Date(selected.created_date), "MMM d, h:mm a")}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-xs text-cyan-400 hover:underline">Change</button>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-200">Select Items to Refund</Label>
                {refundItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-[#071322] border border-slate-800 rounded-xl">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{item.product_name}</p>
                      <p className="text-xs text-slate-400 font-mono">₱{item.unit_price} × {item.quantity} purchased</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-slate-400">Refund Qty:</span>
                      <Input
                        type="number"
                        min="0"
                        max={item.quantity}
                        value={item.refund_qty}
                        onChange={e => updateRefundQty(idx, Number(e.target.value))}
                        className="w-16 h-8 text-center bg-[#050811] border-slate-700 text-cyan-300 font-mono text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-200">Refund Reason</Label>
                <select
                  value={refundReason}
                  onChange={e => setRefundReason(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-slate-700 bg-[#071322] px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="returned" className="bg-[#071322] text-white">Customer Returned</option>
                  <option value="damaged" className="bg-[#071322] text-white">Item Damaged</option>
                  <option value="wrong_item" className="bg-[#071322] text-white">Wrong Item Sold</option>
                  <option value="other" className="bg-[#071322] text-white">Other</option>
                </select>
              </div>

              <div className="p-3 bg-[#071322] rounded-xl border border-slate-800 flex justify-between items-center text-sm font-bold">
                <span className="text-slate-300">Total Refund:</span>
                <span className="text-rose-400 font-mono text-base">₱{totalRefund.toFixed(2)}</span>
              </div>
            </>
          )}
        </div>

        {selected && (
          <div className="sticky bottom-0 bg-[#0B1C30] border-t border-slate-800 px-6 py-4 flex gap-2 justify-end rounded-b-2xl">
            <Button variant="ghost" className={DESIGN_TOKENS.buttons.secondary} onClick={onClose}>Cancel</Button>
            <Button
              onClick={processRefund}
              disabled={processing || totalRefund <= 0}
              className={DESIGN_TOKENS.buttons.danger + " text-xs font-bold gap-1 cursor-pointer"}
            >
              {processing ? "Processing..." : `Refund ₱${totalRefund.toFixed(2)}`}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}