import { Menu, Bell } from "lucide-react";
import { useLocation } from "react-router-dom";

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
};

export default function TopBar({ onMenuClick, alertCount = 0 }) {
  const location = useLocation();
  const title = pageTitles[location.pathname] || "StockMate";

  return (
    <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600"
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