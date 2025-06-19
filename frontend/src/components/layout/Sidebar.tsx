import {
  Home,
  Users,
  Package,
  ShoppingCart,
  HandCoins,
  BarChart3,
  Settings,
  Tags,
  ContactIcon,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { to: "/dashboard", icon: <Home size={18} />, label: "Dashboard" },
  { to: "/customers", icon: <ContactIcon size={18} />, label: "Customers" },
  { to: "/products", icon: <Package size={18} />, label: "Products" },
  { to: "/categories", icon: <Tags size={18} />, label: "Categories" },
  { to: "/orders", icon: <ShoppingCart size={18} />, label: "Orders" },
  { to: "/debts", icon: <HandCoins size={18} />, label: "Debts" },
  { to: "/reports", icon: <BarChart3 size={18} />, label: "Reports" },
  { to: "/users", icon: <Users size={18} />, label: "Users" },
  { to: "/settings", icon: <Settings size={18} />, label: "Settings" },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-background border-r p-4 flex-shrink-0">
      <div className="font-bold text-xl mb-6">🧠 AdminPanel</div>
      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent transition ${
              location.pathname.startsWith(item.to)
                ? "bg-accent text-primary"
                : "text-muted-foreground"
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
