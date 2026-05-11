import { Menu, Bell, ChevronLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const pageTitles = {
  "/": "Dashboard",
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
};

export default function TopBar({ onMenuClick, alertCount = 0 }) {
  const location = useLocation();
  const navigate = useNavigate();
  const title = pageTitles[location.pathname] || "StockMate";
  const isRoot = location.pathname === "/";

  return (
    <header
      className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10 select-none"
      style={{ paddingTop: "calc(env(safe-area-inset-top) + 12px)" }}
    >
      <div className="flex items-center gap-2">
        {/* Back button on mobile for non-root routes */}
        {!isRoot && (
          <button
            onClick={() => navigate(-1)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600 -ml-1"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        {/* Hamburger only on root on mobile */}
        {isRoot && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600 -ml-1"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        {/* Always show hamburger on desktop */}
        <button
          onClick={onMenuClick}
          className="hidden lg:block p-2 rounded-lg hover:bg-slate-100 text-slate-600 -ml-1"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <a href="/alerts" className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-600">
          <Bell className="w-5 h-5" />
          {alertCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {alertCount > 9 ? "9+" : alertCount}
            </span>
          )}
        </a>
      </div>
    </header>
  );
}