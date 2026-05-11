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
    const [a, p] = await Promise.all([
      entities.StockAlert.list("-created_date", 200),
      entities.Product.filter({ status: "active" }),
    ]);
    setAlerts(a);
    setProducts(p);
    setLoading(false);
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
    low_stock: { color: "bg-orange-100 text-orange-700 border-orange-200", icon: <AlertTriangle className="w-5 h-5 text-orange-500" />, label: "Low Stock" },
    out_of_stock: { color: "bg-red-100 text-red-700 border-red-200", icon: <XCircle className="w-5 h-5 text-red-500" />, label: "Out of Stock" },
    expiring_soon: { color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />, label: "Expiring Soon" },
    expired: { color: "bg-red-100 text-red-700 border-red-200", icon: <XCircle className="w-5 h-5 text-red-600" />, label: "Expired" },
  };

  const activeAlerts = alerts.filter(a => a.status === "active");
  const resolvedAlerts = alerts.filter(a => a.status !== "active");

  if (loading) return <div className="p-6 text-slate-400">Loading alerts...</div>;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{activeAlerts.length} active alerts</p>
        </div>
        <Button onClick={generateAlerts} disabled={refreshing} variant="outline" className="gap-2">
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Scanning..." : "Scan Inventory"}
        </Button>
      </div>

      {/* Active Alerts */}
      {activeAlerts.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-lg font-medium">All clear!</p>
          <p className="text-sm">No active alerts. Click "Scan Inventory" to check for issues.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Active Alerts</h3>
          {activeAlerts.map(alert => {
            const cfg = alertConfig[alert.alert_type] || alertConfig.low_stock;
            return (
              <Card key={alert.id} className={`border ${cfg.color} shadow-sm`}>
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {cfg.icon}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-slate-800">{alert.product_name}</p>
                        <Badge className={cfg.color}>{cfg.label}</Badge>
                      </div>
                      <p className="text-sm text-slate-500 mt-0.5">
                        {alert.alert_type === "low_stock" && `Stock: ${alert.current_quantity} (threshold: ${alert.threshold})`}
                        {alert.alert_type === "out_of_stock" && "Product is out of stock"}
                        {alert.alert_type === "expiring_soon" && alert.expiry_date && `Expires: ${format(new Date(alert.expiry_date), "MMM d, yyyy")}`}
                        {alert.alert_type === "expired" && alert.expiry_date && `Expired on: ${format(new Date(alert.expiry_date), "MMM d, yyyy")}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" variant="outline" onClick={() => resolveAlert(alert.id)} className="gap-1 text-emerald-600 border-emerald-300 hover:bg-emerald-50">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Resolve
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => dismissAlert(alert.id)} className="text-slate-400">
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