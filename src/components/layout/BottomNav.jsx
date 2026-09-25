import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, ShoppingCart, Package, BarChart2, MoreHorizontal } from "lucide-react";

const tabs = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/pos", label: "POS", icon: ShoppingCart },
  { path: "/inventory", label: "Inventory", icon: Package },
  { path: "/analytics", label: "Analytics", icon: BarChart2 },
  { path: "/settings", label: "More", icon: MoreHorizontal },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#e2efeb] flex select-none shadow-lg"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {tabs.map(({ path, label, icon: Icon }) => {
        const active = location.pathname === path;
        return (
          <Link
            key={path}
            to={path}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs font-medium transition-all duration-200
              ${active ? "text-[#146f5b] font-bold" : "text-[#81948c] hover:text-[#557875]"}`}
          >
            <Icon className={`w-5 h-5 ${active ? "text-[#146f5b]" : "text-[#81948c]"}`} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}