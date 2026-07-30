import { Printer, X, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { DESIGN_TOKENS } from "@/lib/designSystem";

export default function ThermalReceiptModal({ open, transaction, onClose, onPrint }) {
  if (!open || !transaction) return null;

  const fmt = (val) => DESIGN_TOKENS.formatCurrency(val || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="water-breathing-card bg-[#0B1C30] border border-cyan-500/40 rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-5 text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-[#00E5FF]" />
            <h3 className="text-base font-bold text-white font-mono">80mm Thermal Receipt</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 80mm Receipt Paper Container */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 font-mono text-xs text-slate-300 shadow-inner space-y-3">
          <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-800">
            <p className="text-sm font-extrabold text-white uppercase tracking-wider">OMNISTOCK ENTERPRISE POS</p>
            <p className="text-[11px] text-slate-400">123 Cyberpunk Boulevard, Manila</p>
            <p className="text-[11px] text-slate-400">VAT Reg TIN: 009-876-543-000</p>
          </div>

          <div className="text-[11px] space-y-1 pb-2 border-b border-dashed border-slate-800 text-slate-400">
            <p>TXN #: <span className="text-white font-bold">{transaction.transaction_number || transaction.id}</span></p>
            <p>DATE: <span className="text-slate-300">{format(new Date(transaction.created_date || Date.now()), "yyyy-MM-dd HH:mm")}</span></p>
            <p>PAYMENT: <span className="text-cyan-300 uppercase font-bold">{transaction.payment_method || "CASH"}</span></p>
          </div>

          {/* Purchased Items List */}
          <div className="space-y-2 py-1">
            {Array.isArray(transaction.items) && transaction.items.map((it, idx) => (
              <div key={idx} className="flex justify-between items-start text-[11px]">
                <div className="pr-2">
                  <p className="text-white font-bold truncate max-w-[160px]">{it.name || "Item"}</p>
                  <p className="text-slate-500">{it.quantity} x {fmt(it.price)}</p>
                </div>
                <p className="text-cyan-300 font-bold text-right">{fmt((it.quantity || 1) * (it.price || 0))}</p>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="pt-3 border-t border-dashed border-slate-800 space-y-1 text-[11px]">
            <div className="flex justify-between text-slate-400">
              <span>SUBTOTAL</span>
              <span>{fmt(transaction.subtotal || transaction.total)}</span>
            </div>
            {transaction.discount > 0 && (
              <div className="flex justify-between text-amber-400">
                <span>DISCOUNT</span>
                <span>-{fmt(transaction.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-slate-800">
              <span>TOTAL DUE</span>
              <span className="text-[#00E5FF]">{fmt(transaction.total)}</span>
            </div>
          </div>

          <div className="text-center pt-3 text-[10px] text-slate-500 border-t border-dashed border-slate-800">
            <p>THANK YOU FOR YOUR PURCHASE!</p>
            <p className="text-[9px] mt-0.5 font-mono">POWERED BY OMNISTOCK AI POS</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 min-h-[44px] rounded-xl border border-slate-700 bg-[#071322] hover:bg-slate-800 text-slate-300 font-semibold text-xs transition-all"
          >
            Close
          </button>
          <button
            onClick={() => { onPrint?.(); onClose(); }}
            className="flex-1 min-h-[44px] rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-cyan-300" />
            Print Receipt
          </button>
        </div>

      </div>
    </div>
  );
}
