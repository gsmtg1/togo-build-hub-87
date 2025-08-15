
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
    <div className={cn('pb-12 w-64 lg:w-72', className)}>
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <div className="flex items-center mb-8">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center mr-3">
              <Boxes className="h-6 w-6 lg:h-7 lg:w-7 text-white" />
            </div>
            <div>
              <h2 className="mb-1 px-2 text-xl lg:text-2xl font-bold tracking-tight text-orange-600">
                Cornerstone
              </h2>
              <p className="px-2 text-xs lg:text-sm text-gray-500 font-medium">
                Briques Management
              </p>
            </div>
          </div>
          <div className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center rounded-lg px-4 py-3 text-sm lg:text-base font-medium hover:bg-accent hover:text-accent-foreground transition-all duration-200 ease-in-out group',
                  location.pathname === item.href
                    ? 'bg-orange-100 text-orange-700 border-r-4 border-orange-600 shadow-sm'
                    : 'text-muted-foreground hover:text-gray-900 hover:bg-gray-50'
                )}
              >
                <item.icon className="mr-3 h-5 w-5 lg:h-6 lg:w-6 group-hover:scale-110 transition-transform duration-200" />
                <span className="font-medium">{item.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
