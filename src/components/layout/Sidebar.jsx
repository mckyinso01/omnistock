import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Bell,
  Tag,
  Truck,
  ChefHat,
  TrendingUp,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/inventory", label: "Inventory", icon: Package },
  { path: "/pos", label: "POS / Sales", icon: ShoppingCart },
  { path: "/analytics", label: "Analytics", icon: BarChart3 },
  { path: "/pricing", label: "Smart Pricing", icon: TrendingUp },
  { path: "/categories", label: "Categories", icon: Tag },
  { path: "/suppliers", label: "Suppliers", icon: Truck },
  { path: "/recipes", label: "Recipes", icon: ChefHat },
  { path: "/alerts", label: "Stock Alerts", icon: Bell },
];

export default function Sidebar({ open, onClose }) {
  const location = useLocation();

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-30 h-full w-64 bg-[#0f172a] flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">StockMate</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-white/50 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {navItems.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  active
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/10">
          <p className="text-white/30 text-xs">StockMate v1.0</p>
          <p className="text-white/20 text-xs">© 2025 All rights reserved</p>
        </div>
      </aside>
    </>
  );
}