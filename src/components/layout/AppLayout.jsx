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
    loadAlerts();
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
      <div className="flex h-screen bg-[#f6fbf9] text-[#103e3c] overflow-hidden font-sans">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#f6fbf9]">
          <TopBar onMenuClick={() => setSidebarOpen(true)} alertCount={alertCount} />
          <main
            className="flex-1 overflow-y-auto bg-[#f6fbf9] text-[#103e3c] p-4 md:p-6"
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