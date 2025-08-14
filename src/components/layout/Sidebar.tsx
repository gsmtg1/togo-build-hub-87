
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Package, ShoppingCart, FileText, Truck, 
  Users, Calculator, Target, TrendingUp, Settings,
  Factory, Receipt, X, ChevronDown, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { icon: Home, label: 'Tableau de bord', path: '/' },
  { icon: Package, label: 'Gestion Stock', path: '/stock' },
  { icon: ShoppingCart, label: 'Ventes', path: '/ventes' },
  { icon: FileText, label: 'Devis', path: '/devis' },
  { icon: Receipt, label: 'Factures', path: '/factures' },
  { icon: Truck, label: 'Livraisons', path: '/livraisons' },
  { 
    icon: Factory, 
    label: 'Production', 
    path: '/production',
    subItems: [
      { label: 'Ordres de production', path: '/ordres-production' }
    ]
  },
  { icon: Users, label: 'Employés', path: '/employes' },
  { icon: Calculator, label: 'Comptabilité', path: '/comptabilite' },
  { icon: Target, label: 'Objectifs', path: '/objectifs' },
  { icon: TrendingUp, label: 'Rapports', path: '/rapports' },
  { icon: Settings, label: 'Paramètres', path: '/parametres' },
];

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (path: string) => {
    setExpandedItems(prev => 
      prev.includes(path) 
        ? prev.filter(item => item !== path)
        : [...prev, path]
    );
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <aside className={cn(
        "fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out z-50",
        "w-64 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">BrickFlow</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="lg:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="p-4 space-y-2 overflow-y-auto h-full pb-20">
          {menuItems.map((item) => (
            <div key={item.path}>
              {item.subItems ? (
                <div>
                  <Button
                    variant="ghost"
                    onClick={() => toggleExpanded(item.path)}
                    className={cn(
                      "w-full justify-start gap-3 h-10",
                      location.pathname.startsWith(item.path) && "bg-gray-100"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {expandedItems.includes(item.path) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                  {expandedItems.includes(item.path) && (
                    <div className="ml-6 mt-1 space-y-1">
                      {item.subItems.map((subItem) => (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          onClick={onClose}
                          className={cn(
                            "block px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors",
                            location.pathname === subItem.path && "bg-gray-100 font-medium"
                          )}
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to={item.path}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors",
                    location.pathname === item.path && "bg-gray-100 font-medium"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};
