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
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B1C30] border-t border-slate-800 flex select-none shadow-2xl backdrop-blur-md"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {tabs.map(({ path, label, icon: Icon }) => {
        const active = location.pathname === path;
        return (
          <Link
            key={path}
            to={path}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs font-medium transition-all duration-200
              ${active ? "text-cyan-400 font-bold" : "text-slate-400 hover:text-slate-200"}`}
          >
            <Icon className={`w-5 h-5 ${active ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" : "text-slate-400"}`} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}