import { Button } from "@/components/ui/button";
import { X, Printer, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

export default function ReceiptModal({ transaction, onClose }) {
  const items = transaction.items || [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0B1C30] border border-slate-800 rounded-2xl shadow-2xl w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
            <h2 className="font-bold text-white">Payment Successful!</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt */}
        <div className="p-6 space-y-4 bg-[#071322] m-4 rounded-xl border border-slate-800/80" id="receipt-content">
          <div className="text-center">
            <h3 className="text-lg font-bold text-white tracking-wide">OmniStock POS</h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{format(new Date(), "MMM d, yyyy h:mm a")}</p>
            <p className="text-xs text-cyan-400 font-mono">Txn: {transaction.transaction_number || "—"}</p>
          </div>

          <div className="border-t border-dashed border-slate-700 pt-3 space-y-2">
            {items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <div>
                  <p className="text-slate-200 font-medium">{item.product_name}</p>
                  <p className="text-xs text-slate-400 font-mono">{item.quantity} × ₱{item.unit_price?.toLocaleString()}</p>
                </div>
                <p className="text-cyan-300 font-mono font-medium">₱{item.subtotal?.toLocaleString()}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-slate-700 pt-3 space-y-1.5 text-sm">
            {transaction.discount_amount > 0 && (
              <div className="flex justify-between text-rose-400 font-mono">
                <span>Discount</span>
                <span>-₱{transaction.discount_amount?.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base text-white pt-1">
              <span>TOTAL</span>
              <span className="text-cyan-300 font-mono">₱{transaction.total?.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-slate-400 font-mono text-xs">
              <span>{transaction.paymentMethod?.toUpperCase()}</span>
              <span>₱{(transaction.amount_tendered || transaction.total)?.toLocaleString()}</span>
            </div>
            {transaction.change > 0 && (
              <div className="flex justify-between text-emerald-400 font-medium font-mono">
                <span>Change</span>
                <span>₱{transaction.change?.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</span>
              </div>
            )}
          </div>

          <div className="text-center text-xs text-slate-400 pt-2 border-t border-dashed border-slate-700/60">
            Thank you for your business!
          </div>
        </div>

        <div className="border-t border-slate-800 p-4 flex gap-2">
          <Button variant="outline" className="flex-1 gap-2 bg-[#071322] border-slate-700 text-slate-200 hover:text-white" onClick={handlePrint}>
            <Printer className="w-4 h-4" />
            Print
          </Button>
          <Button className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-md" onClick={onClose}>
            New Sale
          </Button>
        </div>
      </div>
    </div>
  );
}