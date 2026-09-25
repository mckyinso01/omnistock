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
      className="bg-white/90 backdrop-blur-md border-b border-[#e2efeb] px-5 py-3 flex items-center justify-between sticky top-0 z-10 select-none text-[#103e3c]"
      style={{ paddingTop: "calc(env(safe-area-inset-top) + 12px)" }}
    >
      <div className="flex items-center gap-3">
        {/* Back button on mobile for non-root routes */}
        {!isRoot && (
          <button
            onClick={() => navigate(-1)}
            className="lg:hidden p-2 rounded-xl hover:bg-[#f4f8f6] text-[#557875] hover:text-[#123c35] transition-colors -ml-1"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        {/* Hamburger only on root on mobile */}
        {isRoot && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl hover:bg-[#f4f8f6] text-[#557875] hover:text-[#123c35] transition-colors -ml-1"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        {/* Always show hamburger on desktop */}
        <button
          onClick={onMenuClick}
          className="hidden lg:block p-2 rounded-xl hover:bg-[#f4f8f6] text-[#557875] hover:text-[#123c35] transition-colors -ml-1"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-[#123c35] tracking-tight">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        {/* Branch Selector */}
        {showBranchSelector && <BranchSelector />}

        {/* Offline/Sync Status Badge */}
        <OfflineStatusBadge />

        <a href="/alerts" className="relative p-2.5 rounded-xl hover:bg-[#f4f8f6] text-[#557875] hover:text-[#16785f] transition-all">
          <Bell className="w-5 h-5 text-[#557875]" />
          {alertCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#146f5b] text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white">
              {alertCount > 9 ? "9+" : alertCount}
            </span>
          )}
        </a>

        {/* User Account Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#f4f8f6] border border-[#dcebe6] rounded-xl text-xs text-[#557875]">
          <User className="w-3.5 h-3.5 text-[#16785f]" />
          <span className="max-w-[140px] truncate">{userEmail}</span>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          title="Sign Out of Session"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-xl text-xs font-semibold transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}