import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { entities } from "@/lib/db";
import { BranchProvider } from "@/lib/BranchContext";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";
import LicensingDeploymentTierBar from "./LicensingDeploymentTierBar";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    // Ensure dark mode is active by default for Stitch Midnight Logic Variation B
    document.documentElement.classList.add("dark");

    loadAlerts();

    // Mouse Spotlight Cursor Tracking Listener for Tier 2 Trademark
    const handleMouseMove = (e) => {
      const cards = document.querySelectorAll(".spotlight-card");
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty("--mouse-x", `${x}px`);
        card.style.setProperty("--mouse-y", `${y}px`);
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const loadAlerts = async () => {
    try {
      const alerts = await entities.StockAlert.filter({ status: "active" });
      setAlertCount(alerts ? alerts.length : 0);
    } catch {
      setAlertCount(0);
    }
  };

  return (
    <BranchProvider>
      <div className="flex h-screen bg-[#050811] text-slate-100 overflow-hidden font-sans">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#050811]">
          <TopBar onMenuClick={() => setSidebarOpen(true)} alertCount={alertCount} />
          <main
            className="flex-1 overflow-y-auto bg-[#050811] text-slate-100 p-4 md:p-6"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 56px)" }}
          >
            <Outlet />
          </main>
        </div>
        <BottomNav />
        <LicensingDeploymentTierBar />
      </div>
    </BranchProvider>
  );
}