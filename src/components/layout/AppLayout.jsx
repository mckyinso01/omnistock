import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { entities } from "@/lib/db";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    // Dark mode: sync with system prefers-color-scheme
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = (e) => document.documentElement.classList.toggle("dark", e.matches);
    apply(mq);
    mq.addEventListener("change", apply);

    loadAlerts();
    return () => mq.removeEventListener("change", apply);
  }, []);

  const loadAlerts = async () => {
    const alerts = await entities.StockAlert.filter({ status: "active" });
    setAlertCount(alerts.length);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar onMenuClick={() => setSidebarOpen(true)} alertCount={alertCount} />
        <main
          className="flex-1 overflow-y-auto"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 56px)" }}
        >
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}