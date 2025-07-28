
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Calculator,
  Package,
  Truck,
  ShoppingCart,
  FileText,
  Target,
  Users,
  ClipboardList,
  Settings,
  Receipt
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Tableau de bord', path: '/' },
  { icon: Calculator, label: 'Comptabilité', path: '/comptabilite' },
  { icon: ClipboardList, label: 'Ordres de production', path: '/production' },
  { icon: Package, label: 'Stock', path: '/stock' },
  { icon: ShoppingCart, label: 'Ventes', path: '/ventes' },
  { icon: FileText, label: 'Devis', path: '/devis' },
  { icon: Receipt, label: 'Factures', path: '/factures' },
  { icon: Truck, label: 'Livraison', path: '/livraison' },
  { icon: Target, label: 'Objectifs mensuels', path: '/objectifs' },
  { icon: Users, label: 'Employés', path: '/employes' },
  { icon: Settings, label: 'Paramètres', path: '/parametres' },
];

export const Sidebar = ({ collapsed }: SidebarProps) => {
  return (
    <aside className={cn(
      "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 transition-all duration-300 z-40 overflow-y-auto",
      collapsed ? "w-16" : "w-64"
    )}>
      <nav className="p-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-3 rounded-lg text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors",
                isActive && "bg-orange-100 text-orange-600 font-medium",
                collapsed && "justify-center"
              )
            }
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm">{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
