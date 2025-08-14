
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Factory,
  Truck,
  FileText,
  Receipt,
  Users,
  Calculator,
  Target,
  BarChart3,
  TrendingDown,
  Bell,
  Settings,
  Wrench,
  UserCheck,
  ClipboardList,
  Boxes
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

const menuItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Stock',
    href: '/stock',
    icon: Package,
  },
  {
    title: 'Ventes',
    href: '/ventes',
    icon: ShoppingCart,
  },
  {
    title: 'POS System',
    href: '/ventes-pos',
    icon: Receipt,
  },
  {
    title: 'Production Briques',
    href: '/production-briques',
    icon: Factory,
  },
  {
    title: 'Production',
    href: '/production',
    icon: Wrench,
  },
  {
    title: 'Ordres Production',
    href: '/ordres-production',
    icon: ClipboardList,
  },
  {
    title: 'Livraisons',
    href: '/livraisons',
    icon: Truck,
  },
  {
    title: 'Factures',
    href: '/factures',
    icon: FileText,
  },
  {
    title: 'Devis',
    href: '/devis',
    icon: Receipt,
  },
  {
    title: 'Clients',
    href: '/clients',
    icon: UserCheck,
  },
  {
    title: 'Employés',
    href: '/employes',
    icon: Users,
  },
  {
    title: 'Comptabilité',
    href: '/comptabilite',
    icon: Calculator,
  },
  {
    title: 'Objectifs',
    href: '/objectifs',
    icon: Target,
  },
  {
    title: 'Rapports',
    href: '/rapports',
    icon: BarChart3,
  },
  {
    title: 'Pertes',
    href: '/pertes',
    icon: TrendingDown,
  },
  {
    title: 'Notifications',
    href: '/notifications',
    icon: Bell,
  },
  {
    title: 'Paramètres',
    href: '/parametres',
    icon: Settings,
  },
];

export const Sidebar = ({ className }: SidebarProps) => {
  const location = useLocation();

  return (
    <div className={cn('pb-12 w-64', className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center mr-3">
              <Boxes className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-orange-600">
                Cornerstone
              </h2>
            </div>
          </div>
          <div className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors',
                  location.pathname === item.href
                    ? 'bg-orange-100 text-orange-600 border-r-2 border-orange-600'
                    : 'text-muted-foreground'
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
