import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Package, ShoppingCart, BarChart2, Tag, Truck,
  ChefHat, Bell, Users, ClipboardList, Sliders, DollarSign, X
} from "lucide-react";

const navGroups = [
  {
    label: "Main",
    items: [
      { path: "/", label: "Dashboard", icon: LayoutDashboard },
      { path: "/pos", label: "Point of Sale", icon: ShoppingCart },
      { path: "/analytics", label: "Analytics", icon: BarChart2 },
    ],
  },
  {
    label: "Inventory",
    items: [
      { path: "/inventory", label: "Products", icon: Package },
      { path: "/categories", label: "Categories", icon: Tag },
      { path: "/pricing", label: "Pricing", icon: DollarSign },
      { path: "/recipes", label: "Recipes", icon: ChefHat },
      { path: "/stock-adjustments", label: "Stock Adjustments", icon: Sliders },
      { path: "/alerts", label: "Alerts", icon: Bell },
    ],
  },
  {
    label: "CRM",
    items: [
      { path: "/customers", label: "Customers", icon: Users },
      { path: "/suppliers", label: "Suppliers", icon: Truck },
      { path: "/purchase-orders", label: "Purchase Orders", icon: ClipboardList },
    ],
  },
];

export default function Sidebar({ open, onClose }) {
  const location = useLocation();

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:relative lg:translate-x-0 lg:flex lg:z-auto
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-800 text-lg">StockMate</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map(({ path, label, icon: Icon }) => {
                  const active = location.pathname === path;
                  return (
                    <Link
                      key={path}
                      to={path}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                        ${active
                          ? "bg-emerald-50 text-emerald-700"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                        }`}
                    >
                      <Icon className={`w-4 h-4 ${active ? "text-emerald-600" : "text-slate-400"}`} />
                      {label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}