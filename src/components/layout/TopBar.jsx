import { Menu, Bell, ChevronLeft, User, LogOut } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import BranchSelector from "./BranchSelector";
import { useBranch } from "@/lib/BranchContext";
import OfflineStatusBadge from "@/components/shared/OfflineStatusBadge";

const pageTitles = {
  "/": "Dashboard",
  "/dashboard": "Dashboard",
  "/inventory": "Inventory",
  "/pos": "Point of Sale",
  "/analytics": "Analytics",
  "/pricing": "Smart Pricing",
  "/categories": "Categories",
  "/suppliers": "Suppliers",
  "/recipes": "Recipes",
  "/alerts": "Stock Alerts",
  "/customers": "Customers",
  "/purchase-orders": "Purchase Orders",
  "/stock-adjustments": "Stock Adjustments",
  "/sales-report": "Sales Report",
  "/monetization": "Plans & Pricing",
  "/settings": "Settings",
  "/organization": "Organization",
};

export default function TopBar({ onMenuClick, alertCount = 0 }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { showBranchSelector } = useBranch();
  const title = pageTitles[location.pathname] || "OmniStock POS";
  const isRoot = location.pathname === "/" || location.pathname === "/dashboard";
  const userEmail = sessionStorage.getItem('omnistock_user_email') || 'operator@omnistock.io';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header
      className="bg-[#0B1C30]/90 backdrop-blur-md border-b border-blue-900/40 px-5 py-3 flex items-center justify-between sticky top-0 z-10 select-none text-slate-100"
      style={{ paddingTop: "calc(env(safe-area-inset-top) + 12px)" }}
    >
      <div className="flex items-center gap-3">
        {/* Back button on mobile for non-root routes */}
        {!isRoot && (
          <button
            onClick={() => navigate(-1)}
            className="lg:hidden p-2 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors -ml-1"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        {/* Hamburger only on root on mobile */}
        {isRoot && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors -ml-1"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        {/* Always show hamburger on desktop */}
        <button
          onClick={onMenuClick}
          className="hidden lg:block p-2 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors -ml-1"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-white tracking-tight">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        {/* Branch Selector — only visible when multi-branch is enabled or multiple branches exist */}
        {showBranchSelector && <BranchSelector />}

        {/* Dynamic Offline/Sync Status Badge */}
        <OfflineStatusBadge />

        <a href="/alerts" className="relative p-2.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-all app-card-hover">
          <Bell className="w-5 h-5 text-slate-300" />
          {alertCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#2563EB] text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-[#0B1C30]">
              {alertCount > 9 ? "9+" : alertCount}
            </span>
          )}
        </a>

        {/* User Account Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 border border-blue-900/40 rounded-xl text-xs text-slate-300 font-mono">
          <User className="w-3.5 h-3.5 text-blue-400" />
          <span className="max-w-[140px] truncate">{userEmail}</span>
        </div>

        {/* Explicit Logout Action */}
        <button
          onClick={handleLogout}
          title="Sign Out of Session"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 rounded-xl text-xs font-semibold transition-all cursor-pointer app-card-hover"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}