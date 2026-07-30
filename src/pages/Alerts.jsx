import { useState, useEffect } from "react";
import { entities } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, XCircle, RefreshCw, Bell, Package } from "lucide-react";
import { format, differenceInDays } from "date-fns";

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [a, p] = await Promise.all([
        entities.StockAlert.list("-created_date", 200).catch(() => []),
        entities.Product.filter({ status: "active" }).catch(() => []),
      ]);
      setAlerts(a || []);
      setProducts(p || []);
    } catch (err) {
      console.error("Alerts loadData Exception:", err);
      setAlerts([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const generateAlerts = async () => {
    setRefreshing(true);
    const today = new Date();
    const newAlerts = [];

    for (const p of products) {
      const qty = p.quantity || 0;
      const threshold = p.low_stock_threshold || 10;

      if (qty === 0) {
        newAlerts.push({ product_id: p.id, product_name: p.name, alert_type: "out_of_stock", current_quantity: qty, threshold, status: "active" });
      } else if (qty <= threshold) {
        newAlerts.push({ product_id: p.id, product_name: p.name, alert_type: "low_stock", current_quantity: qty, threshold, status: "active" });
      }

      if (p.expiry_date) {
        const daysLeft = differenceInDays(new Date(p.expiry_date), today);
        if (daysLeft < 0) {
          newAlerts.push({ product_id: p.id, product_name: p.name, alert_type: "expired", current_quantity: qty, expiry_date: p.expiry_date, status: "active" });
        } else if (daysLeft <= 30) {
          newAlerts.push({ product_id: p.id, product_name: p.name, alert_type: "expiring_soon", current_quantity: qty, expiry_date: p.expiry_date, status: "active" });
        }
      }
    }

    // Clear old active alerts and create new ones
    const activeAlerts = alerts.filter(a => a.status === "active");
    await Promise.all(activeAlerts.map(a => entities.StockAlert.update(a.id, { status: "resolved" })));
    if (newAlerts.length > 0) {
      await entities.StockAlert.bulkCreate(newAlerts);
    }

    setRefreshing(false);
    loadData();
  };

  const dismissAlert = async (id) => {
    await entities.StockAlert.update(id, { status: "dismissed" });
    loadData();
  };

  const resolveAlert = async (id) => {
    await entities.StockAlert.update(id, { status: "resolved" });
    loadData();
  };

  const alertConfig = {
    low_stock: {
      cardStyle: "bg-[#0B1C30]/80 border-amber-500/40 text-amber-200 shadow-lg shadow-amber-950/20",
      badgeStyle: "bg-amber-950/60 text-amber-300 border border-amber-500/50 font-mono text-xs",
      icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
      label: "Low Stock"
    },
    out_of_stock: {
      cardStyle: "bg-[#0B1C30]/80 border-rose-500/40 text-rose-200 shadow-lg shadow-rose-950/20",
      badgeStyle: "bg-rose-950/60 text-rose-300 border border-rose-500/50 font-mono text-xs",
      icon: <XCircle className="w-5 h-5 text-rose-400 shrink-0" />,
      label: "Out of Stock"
    },
    expiring_soon: {
      cardStyle: "bg-[#0B1C30]/80 border-yellow-500/40 text-yellow-200 shadow-lg shadow-yellow-950/20",
      badgeStyle: "bg-yellow-950/60 text-yellow-300 border border-yellow-500/50 font-mono text-xs",
      icon: <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0" />,
      label: "Expiring Soon"
    },
    expired: {
      cardStyle: "bg-[#0B1C30]/80 border-rose-600/60 text-rose-200 shadow-lg shadow-rose-950/20",
      badgeStyle: "bg-rose-950/60 text-rose-300 border border-rose-600/60 font-mono text-xs",
      icon: <XCircle className="w-5 h-5 text-rose-500 shrink-0" />,
      label: "Expired"
    },
  };

  const activeAlerts = alerts.filter(a => a.status === "active");
  const resolvedAlerts = alerts.filter(a => a.status !== "active");

  if (loading) return <div className="p-6 text-slate-400 font-mono text-sm">Loading alerts...</div>;

  return (
    <div className="p-4 md:p-6 space-y-6 bg-[#050811] min-h-screen text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-400 font-mono">{activeAlerts.length} active alerts</p>
        </div>
        <Button onClick={generateAlerts} disabled={refreshing} variant="outline" className="gap-2 text-cyan-400 border-cyan-500/40 bg-cyan-950/20 hover:bg-cyan-900/40 font-bold shadow-[0_0_15px_rgba(0,229,255,0.25)] cursor-pointer">
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Scanning..." : "Scan Inventory"}
        </Button>
      </div>

      {/* Active Alerts */}
      {activeAlerts.length === 0 ? (
        <div className="text-center py-16 text-slate-400 bg-[#0B1C30]/40 rounded-2xl border border-slate-800/80">
          <Bell className="w-12 h-12 mx-auto mb-3 opacity-20 text-cyan-400" />
          <p className="text-lg font-medium text-white">All clear!</p>
          <p className="text-sm text-slate-400">No active alerts. Click "Scan Inventory" to check for issues.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Active Alerts</h3>
          {activeAlerts.map(alert => {
            const cfg = alertConfig[alert.alert_type] || alertConfig.low_stock;
            const currentQty = alert.current_quantity ?? alert.quantity ?? alert.stock ?? 0;
            const thresholdVal = alert.threshold ?? alert.low_stock_threshold ?? 10;
            return (
              <Card key={alert.id} className={`water-breathing-card app-card-hover ${cfg.cardStyle}`}>
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {cfg.icon}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-white text-base tracking-tight">{alert.product_name || "Unmapped Product"}</p>
                        <Badge className={cfg.badgeStyle}>{cfg.label}</Badge>
                      </div>
                      <p className="text-xs text-slate-300 font-mono mt-1">
                        {alert.alert_type === "low_stock" && `Stock: ${currentQty} (threshold: ${thresholdVal})`}
                        {alert.alert_type === "out_of_stock" && "Product is out of stock"}
                        {alert.alert_type === "expiring_soon" && alert.expiry_date && `Expires: ${format(new Date(alert.expiry_date), "MMM d, yyyy")}`}
                        {alert.alert_type === "expired" && alert.expiry_date && `Expired on: ${format(new Date(alert.expiry_date), "MMM d, yyyy")}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" variant="outline" onClick={() => resolveAlert(alert.id)} className="gap-1 text-emerald-300 border-emerald-500/40 bg-emerald-950/40 hover:bg-emerald-900/60 hover:text-emerald-200 font-bold cursor-pointer">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Resolve
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => dismissAlert(alert.id)} className="text-slate-400 hover:text-slate-200 cursor-pointer">
                      Dismiss
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Resolved */}
      {resolvedAlerts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Resolved / Dismissed</h3>
          {resolvedAlerts.slice(0, 10).map(alert => (
            <div key={alert.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl text-sm text-slate-400">
              <Package className="w-4 h-4 shrink-0" />
              <span className="flex-1">{alert.product_name}</span>
              <Badge variant="outline" className="text-xs">{alert.status}</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}