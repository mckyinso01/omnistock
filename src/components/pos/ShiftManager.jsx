import { useState, useEffect } from "react";
import { entities } from "@/lib/db";
import { enqueueSync } from "@/lib/syncQueue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Clock, Play, Square, Calculator, Wallet, TrendingUp, AlertTriangle } from "lucide-react";
import DESIGN_TOKENS from "@/lib/designSystem";

/**
 * ShiftManager — Staff shift tracking with cash drawer reconciliation.
 * Start shift with drawer float, end shift with cash count + variance calculation.
 */
export default function ShiftManager({ onShiftChange }) {
  const [activeShift, setActiveShift] = useState(null);
  const [cashierName, setCashierName] = useState("");
  const [startingCash, setStartingCash] = useState("");
  const [endingCash, setEndingCash] = useState("");
  const [closeNotes, setCloseNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showEndForm, setShowEndForm] = useState(false);

  useEffect(() => { loadActiveShift(); }, []);

  const loadActiveShift = async () => {
    try {
      const shifts = await entities.StaffShift.filter({ status: "open" });
      if (shifts.length > 0) {
        setActiveShift(shifts[0]);
        if (onShiftChange) onShiftChange(shifts[0]);
      }
    } catch (err) {
      console.error("ShiftManager load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const startShift = async () => {
    if (!cashierName.trim()) return alert("Enter cashier name.");
    setProcessing(true);
    try {
      const shift = await entities.StaffShift.create({
        cashier_name: cashierName.trim(),
        shift_start: new Date().toISOString(),
        starting_cash: parseFloat(startingCash) || 0,
        status: "open",
        transaction_count: 0,
        total_sales: 0,
        cash_sales: 0,
        cash_refunds: 0,
      });
      enqueueSync("create", "StaffShift", {
        cashier_name: shift.cashier_name,
        shift_start: shift.shift_start,
        starting_cash: shift.starting_cash,
        status: "open",
        transaction_count: 0,
        total_sales: 0,
        cash_sales: 0,
        cash_refunds: 0,
      });
      setActiveShift(shift);
      if (onShiftChange) onShiftChange(shift);
      setCashierName("");
      setStartingCash("");
    } catch (err) {
      alert("Failed to start shift: " + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const endShift = async () => {
    if (!activeShift) return;
    setProcessing(true);
    try {
      // Fetch transactions during this shift to compute expected cash
      const allTxns = await entities.Transaction.filter({ status: "completed" });
      const shiftStart = new Date(activeShift.shift_start);
      const shiftTxns = allTxns.filter(t =>
        new Date(t.created_date) >= shiftStart &&
        t.type === "sale"
      );
      const cashSales = shiftTxns
        .filter(t => t.payment_method === "cash")
        .reduce((s, t) => s + (t.total_amount || 0), 0);
      const totalSales = shiftTxns.reduce((s, t) => s + (t.total_amount || 0), 0);

      // Fetch refunds during shift
      const refunds = await entities.Transaction.filter({ type: "refund" });
      const shiftRefunds = refunds.filter(t => new Date(t.created_date) >= shiftStart);
      const cashRefunds = shiftRefunds
        .filter(t => t.payment_method === "cash")
        .reduce((s, t) => s + Math.abs(t.total_amount || 0), 0);

      const expectedCash = (activeShift.starting_cash || 0) + cashSales - cashRefunds;
      const endingCashNum = parseFloat(endingCash) || 0;
      const variance = endingCashNum - expectedCash;

      const updated = await entities.StaffShift.update(activeShift.id, {
        shift_end: new Date().toISOString(),
        ending_cash: endingCashNum,
        expected_cash: expectedCash,
        variance,
        status: "closed",
        transaction_count: shiftTxns.length,
        total_sales: totalSales,
        cash_sales: cashSales,
        cash_refunds: cashRefunds,
        notes: closeNotes || null,
      });

      enqueueSync("update", "StaffShift", {
        shift_end: updated.shift_end,
        ending_cash: endingCashNum,
        expected_cash: expectedCash,
        variance,
        status: "closed",
        transaction_count: shiftTxns.length,
        total_sales: totalSales,
        cash_sales: cashSales,
        cash_refunds: cashRefunds,
        notes: closeNotes || null,
      }, activeShift.id);

      setActiveShift(null);
      setShowEndForm(false);
      setEndingCash("");
      setCloseNotes("");
      if (onShiftChange) onShiftChange(null);
    } catch (err) {
      alert("Failed to end shift: " + err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-slate-400 text-sm">
        <Clock className="w-5 h-5 mx-auto mb-2 animate-pulse" />
        Loading shift status...
      </div>
    );
  }

  // No active shift — show start form
  if (!activeShift) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-slate-200">
          <Play className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-sm">Start New Shift</span>
        </div>
        <div>
          <Label className="text-xs text-slate-400 mb-1">Cashier Name</Label>
          <Input
            placeholder="Enter cashier name..."
            value={cashierName}
            onChange={e => setCashierName(e.target.value)}
            className="text-sm"
          />
        </div>
        <div>
          <Label className="text-xs text-slate-400 mb-1">Starting Cash (Drawer Float)</Label>
          <Input
            type="number"
            placeholder="₱0.00"
            value={startingCash}
            onChange={e => setStartingCash(e.target.value)}
            className="text-sm font-mono text-emerald-400"
          />
        </div>
        <Button
          onClick={startShift}
          disabled={processing || !cashierName.trim()}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white gap-2"
        >
          <Play className="w-4 h-4" />
          {processing ? "Starting..." : "Start Shift"}
        </Button>
      </div>
    );
  }

  // Active shift — show status + end form
  const shiftDuration = Math.round(
    (Date.now() - new Date(activeShift.shift_start).getTime()) / 60000
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-sm text-emerald-300">Shift Active</span>
        </div>
        <Badge variant="success" className="text-[10px]">{shiftDuration} min</Badge>
      </div>

      <div className="bg-[#050811] rounded-xl p-3 space-y-2 border border-slate-800/80 font-mono text-xs">
        <div className="flex justify-between">
          <span className="text-slate-400 flex items-center gap-1"><Wallet className="w-3 h-3" /> Cashier</span>
          <span className="text-white font-bold">{activeShift.cashier_name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Started</span>
          <span className="text-slate-200">{new Date(activeShift.shift_start).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" })}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Drawer Float</span>
          <span className="text-emerald-400 font-bold">{DESIGN_TOKENS.formatCurrency(activeShift.starting_cash)}</span>
        </div>
      </div>

      {!showEndForm ? (
        <Button
          onClick={() => setShowEndForm(true)}
          variant="destructive"
          className="w-full gap-2"
        >
          <Square className="w-4 h-4" />
          End Shift & Reconcile
        </Button>
      ) : (
        <div className="space-y-3 p-3 bg-rose-950/20 border border-rose-800/40 rounded-xl">
          <div className="flex items-center gap-2 text-rose-300">
            <Calculator className="w-4 h-4" />
            <span className="font-bold text-sm">Cash Reconciliation</span>
          </div>
          <div>
            <Label className="text-xs text-slate-400 mb-1">Counted Cash in Drawer</Label>
            <Input
              type="number"
              placeholder="₱0.00"
              value={endingCash}
              onChange={e => setEndingCash(e.target.value)}
              className="text-sm font-mono text-emerald-400"
              autoFocus
            />
          </div>
          <div>
            <Label className="text-xs text-slate-400 mb-1">Notes (optional)</Label>
            <Input
              placeholder="Any discrepancies or notes..."
              value={closeNotes}
              onChange={e => setCloseNotes(e.target.value)}
              className="text-sm"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowEndForm(false)}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={endShift}
              disabled={processing || !endingCash}
              variant="destructive"
              size="sm"
              className="flex-1 gap-2"
            >
              <Square className="w-3.5 h-3.5" />
              {processing ? "Closing..." : "Confirm Close"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}