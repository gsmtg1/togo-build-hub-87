
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Package, 
  ShoppingCart, 
  FileText, 
  Users, 
  Calculator, 
  Target, 
  Settings, 
  TrendingUp,
  ClipboardList,
  Truck
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Production', href: '/production', icon: Package },
  { name: 'Ordres de Production', href: '/ordres-production', icon: ClipboardList },
  { name: 'Livraisons', href: '/livraisons', icon: Truck },
  { name: 'Stock', href: '/stock', icon: Package },
  { name: 'Ventes', href: '/ventes', icon: ShoppingCart },
  { name: 'Devis', href: '/devis', icon: FileText },
  { name: 'Factures', href: '/factures', icon: FileText },
  { name: 'Employés', href: '/employes', icon: Users },
  { name: 'Comptabilité', href: '/comptabilite', icon: Calculator },
  { name: 'Objectifs', href: '/objectifs', icon: Target },
  { name: 'Paramètres', href: '/parametres', icon: Settings },
];

export const Sidebar = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={cn(
      "bg-card border-r border-border transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Package className="h-8 w-8 text-primary" />
            {!collapsed && <span className="text-xl font-bold">BriqueApp</span>}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-accent rounded-lg"
          >
            <TrendingUp className="h-4 w-4" />
          </button>
        </div>
        
        <nav className="flex-1 space-y-1 px-2 py-4">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
