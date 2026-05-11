import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Search, RotateCcw, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

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
    base44.entities.Transaction.filter({ status: "completed", type: "sale" }).then(t => {
      setTransactions(t.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
      setLoading(false);
    });
  }, []);

  const selectTransaction = (txn) => {
    setSelected(txn);
    setRefundItems((txn.items || []).map(item => ({ ...item, refund_qty: 0 })));
  };

  const processRefund = async () => {
    const itemsToRefund = refundItems.filter(i => i.refund_qty > 0);
    if (itemsToRefund.length === 0) return alert("Select items to refund.");
    setProcessing(true);

    const refundTotal = itemsToRefund.reduce((s, i) => s + i.refund_qty * i.unit_price, 0);

    await base44.entities.Transaction.create({
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
    const products = await base44.entities.Product.list();
    await Promise.all(itemsToRefund.map(item => {
      const prod = products.find(p => p.id === item.product_id);
      if (!prod) return Promise.resolve();
      return base44.entities.Product.update(item.product_id, { quantity: (prod.quantity || 0) + item.refund_qty });
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
      <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center space-y-4">
          <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-800">Refund Processed!</h2>
          <p className="text-slate-500 text-sm">Items have been restocked successfully.</p>
          <Button onClick={onClose} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">Done</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-2 text-orange-600">
            <RotateCcw className="w-5 h-5" />
            <h2 className="font-bold text-slate-800">Process Refund</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-4">
          {!selected ? (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input placeholder="Search transaction #, customer..." value={search}
                  onChange={e => setSearch(e.target.value)} className="pl-9" />
              </div>
              {loading ? (
                <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}</div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filtered.slice(0, 20).map(txn => (
                    <button key={txn.id} onClick={() => selectTransaction(txn)}
                      className="w-full text-left p-3 border border-slate-200 rounded-xl hover:border-emerald-400 hover:bg-emerald-50 transition-all">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{txn.transaction_number}</p>
                          <p className="text-xs text-slate-500">
                            {txn.customer_name || "Walk-in"} · {format(new Date(txn.created_date), "MMM d, h:mm a")}
                          </p>
                        </div>
                        <p className="text-sm font-bold text-slate-700">₱{(txn.total_amount || 0).toLocaleString()}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800">{selected.transaction_number}</p>
                  <p className="text-xs text-slate-500">{selected.customer_name || "Walk-in"} · {format(new Date(selected.created_date), "MMM d, h:mm a")}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-xs text-blue-600 hover:underline">Change</button>
              </div>

              <div className="space-y-2">
                <Label>Select Items to Refund</Label>
                {refundItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{item.product_name}</p>
                      <p className="text-xs text-slate-500">₱{item.unit_price} × {item.quantity} purchased</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Label className="text-xs text-slate-500">Qty:</Label>
                      <Input type="number" min="0" max={item.quantity} value={item.refund_qty}
                        onChange={e => {
                          const arr = [...refundItems];
                          arr[idx].refund_qty = Math.min(Number(e.target.value), item.quantity);
                          setRefundItems(arr);
                        }} className="w-16 h-8 text-sm text-center" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-1.5">
                <Label>Reason for Refund</Label>
                <Input placeholder="Damaged, wrong item, etc." value={refundReason}
                  onChange={e => setRefundReason(e.target.value)} />
              </div>

              {refundItems.some(i => i.refund_qty > 0) && (
                <div className="bg-orange-50 rounded-xl p-3 text-sm">
                  <p className="font-semibold text-orange-800">
                    Refund Total: ₱{refundItems.reduce((s, i) => s + i.refund_qty * i.unit_price, 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-orange-600 mt-0.5">Items will be returned to inventory</p>
                </div>
              )}

              <Button onClick={processRefund} disabled={processing} className="w-full bg-orange-600 hover:bg-orange-700 text-white gap-2">
                <RotateCcw className="w-4 h-4" />
                {processing ? "Processing..." : "Process Refund"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}