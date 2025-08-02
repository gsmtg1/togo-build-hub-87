
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Truck, 
  FileText, 
  Calculator,
  Users,
  Target,
  Settings,
  Factory,
  ClipboardList,
  AlertTriangle,
  BarChart3
} from 'lucide-react';

const navigation = [
  { name: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Gestion Stock', href: '/stock', icon: Package },
  { name: 'Production', href: '/production', icon: Factory },
  { name: 'Ordres Production', href: '/ordres-production', icon: ClipboardList },
  { name: 'Ventes', href: '/ventes', icon: ShoppingCart },
  { name: 'Livraisons', href: '/livraisons', icon: Truck },
  { name: 'Devis', href: '/devis', icon: FileText },
  { name: 'Factures', href: '/factures', icon: FileText },
  { name: 'Pertes Quotidiennes', href: '/pertes', icon: AlertTriangle },
  { name: 'Rapports', href: '/rapports', icon: BarChart3 },
  { name: 'Comptabilité', href: '/comptabilite', icon: Calculator },
  { name: 'Employés', href: '/employes', icon: Users },
  { name: 'Objectifs', href: '/objectifs', icon: Target },
  { name: 'Paramètres', href: '/parametres', icon: Settings },
];

export const Sidebar = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={cn(
      "flex flex-col h-full bg-white border-r transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <Package className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-bold text-lg">Cornerstone</h1>
              <p className="text-xs text-muted-foreground">Briques & Construction</p>
            </div>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Button
                key={item.name}
                asChild
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-2 h-10",
                  collapsed && "justify-center px-0"
                )}
              >
                <Link to={item.href}>
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  {!collapsed && <span className="truncate">{item.name}</span>}
                </Link>
              </Button>
            );
          })}
        </div>
      </ScrollArea>

      <div className="p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full"
        >
          {collapsed ? '→' : '←'}
        </Button>
      </div>
    </div>
  );
};
