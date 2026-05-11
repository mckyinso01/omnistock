import { Button } from "@/components/ui/button";
import { X, Printer, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

export default function ReceiptModal({ transaction, onClose }) {
  const items = transaction.items || [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
            <h2 className="font-bold">Payment Successful!</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt */}
        <div className="p-6 space-y-4" id="receipt-content">
          <div className="text-center">
            <h3 className="text-lg font-bold text-slate-800">StockMate</h3>
            <p className="text-xs text-slate-400">{format(new Date(), "MMM d, yyyy h:mm a")}</p>
            <p className="text-xs text-slate-400">Txn: {transaction.transaction_number || "—"}</p>
          </div>

          <div className="border-t border-dashed border-slate-200 pt-3 space-y-2">
            {items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <div>
                  <p className="text-slate-700">{item.product_name}</p>
                  <p className="text-xs text-slate-400">{item.quantity} × ₱{item.unit_price?.toLocaleString()}</p>
                </div>
                <p className="text-slate-800 font-medium">₱{item.subtotal?.toLocaleString()}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-slate-200 pt-3 space-y-1.5 text-sm">
            {transaction.discount_amount > 0 && (
              <div className="flex justify-between text-red-500">
                <span>Discount</span>
                <span>-₱{transaction.discount_amount?.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base text-slate-800">
              <span>TOTAL</span>
              <span>₱{transaction.total?.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>{transaction.paymentMethod?.toUpperCase()}</span>
              <span>₱{(transaction.amount_tendered || transaction.total)?.toLocaleString()}</span>
            </div>
            {transaction.change > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Change</span>
                <span>₱{transaction.change?.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</span>
              </div>
            )}
          </div>

          <div className="text-center text-xs text-slate-400 pt-2">
            Thank you for your purchase!
          </div>
        </div>

        <div className="border-t border-slate-100 p-4 flex gap-2">
          <Button variant="outline" className="flex-1 gap-2" onClick={handlePrint}>
            <Printer className="w-4 h-4" />
            Print
          </Button>
          <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={onClose}>
            New Sale
          </Button>
        </div>
      </div>
    </div>
  );
}