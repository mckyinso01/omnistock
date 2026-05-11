import { useEffect, useRef } from "react";
import { entities } from "@/lib/db";

/**
 * Polls inventory every `intervalMs` ms and fires browser notifications
 * for items that drop below their low_stock_threshold.
 * Also creates/resolves StockAlert records automatically.
 */
export function useStockNotifications(intervalMs = 5 * 60 * 1000) {
  const notifiedIds = useRef(new Set());

  useEffect(() => {
    // Request browser notification permission on first run
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    const check = async () => {
      const products = await entities.Product.list("-created_date", 500);
      const existingAlerts = await entities.StockAlert.filter({ status: "active" });
      const alertedProductIds = new Set(existingAlerts.map(a => a.product_id));

      for (const p of products) {
        if (p.status !== "active") continue;
        const qty = p.quantity || 0;
        const threshold = p.low_stock_threshold || 10;
        const isLow = qty <= threshold;
        const isOut = qty === 0;

        if (isLow && !alertedProductIds.has(p.id)) {
          // Create a new StockAlert record
          await entities.StockAlert.create({
            product_id: p.id,
            product_name: p.name,
            alert_type: isOut ? "out_of_stock" : "low_stock",
            current_quantity: qty,
            threshold,
            status: "active",
          });

          // Fire browser notification (only once per session per product)
          if (!notifiedIds.current.has(p.id)) {
            notifiedIds.current.add(p.id);
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("⚠️ StockMate — Low Stock Alert", {
                body: isOut
                  ? `${p.name} is OUT OF STOCK!`
                  : `${p.name} is running low — only ${qty} ${p.unit || "pcs"} left (min: ${threshold})`,
                icon: "/favicon.ico",
                tag: `stockmate-alert-${p.id}`,
              });
            }
          }
        }

        // Auto-resolve alerts when stock is replenished
        if (!isLow) {
          const alertsForProduct = existingAlerts.filter(a => a.product_id === p.id);
          for (const alert of alertsForProduct) {
            await entities.StockAlert.update(alert.id, { status: "resolved" });
          }
          notifiedIds.current.delete(p.id);
        }
      }
    };

    // Run immediately, then on interval
    check();
    const timer = setInterval(check, intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
}