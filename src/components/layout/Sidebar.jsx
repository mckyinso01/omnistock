import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Package, ShoppingCart, BarChart2, Tag, Truck,
  ChefHat, Bell, Users, ClipboardList, Sliders, DollarSign, X,
  FileText, Crown, Settings, Zap, Building2
} from "lucide-react";

const navGroups = [
  {
    label: "Main",
    items: [
      { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { path: "/pos", label: "Point of Sale", icon: ShoppingCart },
      { path: "/analytics", label: "Analytics", icon: BarChart2 },
      { path: "/sales-report", label: "Sales Reports", icon: FileText },
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
  {
    label: "Monetization",
    items: [
      { path: "/monetization", label: "Plans & Pricing", icon: Crown },
    ],
  },
  {
    label: "Automation",
    items: [
      { path: "/automations", label: "Reports & Sync", icon: Zap },
    ],
  },
  {
    label: "Enterprise",
    items: [
      { path: "/organization", label: "Organization", icon: Building2 },
    ],
  },
  {
    label: "Account",
    items: [
      { path: "/settings", label: "Settings", icon: Settings },
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
          className="fixed inset-0 z-20 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-[#d8eae5] flex flex-col transition-transform duration-200 text-[#103e3c]
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:relative lg:translate-x-0 lg:flex lg:z-auto
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2efeb]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-[#e8f5ef] to-[#dcefe7] border border-[#c9eee8] rounded-lg flex items-center justify-center shadow-[inset_0_1px_0_#fff,0_3px_9px_rgba(20,111,91,0.06)]">
              <Package className="w-5 h-5 text-[#17775e]" />
            </div>
            <span className="font-bold text-[#123c35] text-lg tracking-tight">OmniStock</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-[#81948c] hover:text-[#123c35]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="text-[11px] font-semibold text-[#81948c] uppercase tracking-wider px-2 mb-1.5">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map(({ path, label, icon: Icon }) => {
                  const active = location.pathname === path || (path === "/dashboard" && location.pathname === "/");
                  return (
                    <Link
                      key={path}
                      to={path}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200
                        ${active
                          ? "bg-[#146f5b]/10 text-[#146f5b] border border-[#a7d4c5]"
                          : "text-[#557875] hover:bg-[#f4f8f6] hover:text-[#123c35] border border-transparent"
                        }`}
                    >
                      <Icon className={`w-4 h-4 ${active ? "text-[#16785f]" : "text-[#81948c]"}`} />
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