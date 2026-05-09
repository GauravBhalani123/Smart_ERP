import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Boxes,
  Bot,
  FileText,
  Gauge,
  Package,
  Settings,
  ShoppingCart,
  Tags,
  TrendingUp,
  Truck,
  Users,
  UserRound,
  Warehouse,
} from "lucide-react";
import { sidebarModules } from "../../constants/modules";
import Logo from "../branding/Logo";

const iconMap = {
  Dashboard: Gauge,
  Users,
  Categories: Tags,
  Products: Package,
  Inventory: Warehouse,
  Sales: TrendingUp,
  Purchases: ShoppingCart,
  Production: Package,
  Customers: UserRound,
  Suppliers: Truck,
  Invoices: FileText,
  "AI Assistant": Bot,
  "Market Intelligence": BarChart3,
  Reports: Boxes,
  Settings,
};

export default function Sidebar() {
  return (
    <aside className="glass sticky top-4 flex h-[calc(100vh-2rem)] w-64 flex-col rounded-2xl border border-white/10 bg-slate-900/40 p-4 max-md:hidden backdrop-blur-xl overflow-hidden">
      <div className="mb-8 px-2">
        <Logo />
      </div>
      
      <div className="flex-1 overflow-y-auto pr-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <style>{`
          .flex-1::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        <nav className="space-y-1">
          {sidebarModules.map((item) => {
            const Icon = iconMap[item.label] || Boxes;
            return (
              <NavLink
                key={item.label}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? "bg-indigo-600/20 text-indigo-400 shadow-[inset_0_0_12px_rgba(79,70,229,0.2)] border border-indigo-500/30" 
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                  }`
                }
              >
                <Icon size={18} className="shrink-0" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
