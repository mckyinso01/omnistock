import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageCircle, Smartphone, Loader2, CheckCircle2, X } from "lucide-react";

/**
 * ReceiptDeliveryModal — Send a receipt via WhatsApp or SMS after a sale.
 * Calls the sendReceiptSMS backend function with the transaction details
 * and customer phone number.
 */
export default function ReceiptDeliveryModal({ transaction, onClose }) {
  const [phone, setPhone] = useState("");
  const [channel, setChannel] = useState("whatsapp");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const handleSend = async () => {
    if (!phone.trim()) {
      setError("Enter a phone number.");
      return;
    }
    // Basic PH phone validation
    const cleanPhone = phone.replace(/[\s\-()]/g, "");
    if (!/^(\+?63|0)?9\d{9}$/.test(cleanPhone)) {
      setError("Enter a valid Philippine phone number (e.g. 09171234567).");
      return;
    }

    setSending(true);
    setError(null);

    try {
      await base44.functions.invoke("sendReceiptSMS", {
        phone: cleanPhone,
        channel,
        transaction,
      });
      setSent(true);
    } catch (err) {
      setError(err?.response?.data?.error || err.message || "Failed to send receipt.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="glass-fantasy-mystic rounded-2xl w-full max-w-md p-6 space-y-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {sent ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Receipt Sent!</h3>
              <p className="text-sm text-slate-400">
                Receipt sent via {channel === "whatsapp" ? "WhatsApp" : "SMS"} to {phone}
              </p>
            </div>
            <Button onClick={onClose} variant="outline" className="w-full">Done</Button>
          </div>
        ) : (
          <>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Send Digital Receipt</h3>
              <p className="text-sm text-slate-400">Deliver the receipt to your customer's phone</p>
            </div>

            {/* Channel Selector */}
            <div>
              <Label className="text-xs text-slate-400 mb-2 uppercase tracking-wider">Delivery Channel</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setChannel("whatsapp")}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-bold transition-all ${
                    channel === "whatsapp"
                      ? "border-emerald-500 bg-emerald-950/40 text-emerald-300"
                      : "border-slate-800 bg-[#050811] text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </button>
                <button
                  onClick={() => setChannel("sms")}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-bold transition-all ${
                    channel === "sms"
                      ? "border-blue-500 bg-blue-950/40 text-blue-300"
                      : "border-slate-800 bg-[#050811] text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  SMS
                </button>
              </div>
            </div>

            {/* Phone Input */}
            <div>
              <Label className="text-xs text-slate-400 mb-1">Customer Phone Number</Label>
              <Input
                type="tel"
                placeholder="09171234567"
                value={phone}
                onChange={e => { setPhone(e.target.value); setError(null); }}
                className="text-sm font-mono"
                autoFocus
              />
            </div>

            {error && (
              <div className="text-xs text-rose-400 bg-rose-950/30 border border-rose-800/40 rounded-lg p-2.5">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={onClose} variant="outline" className="flex-1">Cancel</Button>
              <Button
                onClick={handleSend}
                disabled={sending || !phone.trim()}
                className="flex-1 gap-2"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {sending ? "Sending..." : "Send Receipt"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}