
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Package, 
  Factory, 
  Truck, 
  ShoppingCart, 
  FileText, 
  Receipt, 
  Users, 
  Calculator, 
  Target, 
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { icon: Home, label: 'Tableau de bord', path: '/dashboard' },
  { icon: Package, label: 'Produits', path: '/stock' },
  { icon: Factory, label: 'Ordres de production', path: '/ordres-production' },
  { icon: Truck, label: 'Livraisons', path: '/livraisons' },
  { icon: ShoppingCart, label: 'Ventes', path: '/ventes' },
  { icon: FileText, label: 'Devis', path: '/devis' },
  { icon: Receipt, label: 'Factures', path: '/factures' },
  { icon: Users, label: 'Employés', path: '/employes' },
  { icon: Calculator, label: 'Comptabilité', path: '/comptabilite' },
  { icon: Target, label: 'Objectifs', path: '/objectifs' },
  { icon: Settings, label: 'Paramètres', path: '/parametres' },
];

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  return (
    <>
      {/* Overlay pour mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-30 transition-all duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center gap-2">
                <img 
                  src="/lovable-uploads/88a45ebe-a412-4b63-9bc9-9ac71a9120cf.png" 
                  alt="Cornerstone Briques" 
                  className="h-8 w-8"
                />
                <span className="font-bold text-orange-600">Cornerstone</span>
              </div>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex"
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                        isActive 
                          ? "bg-orange-100 text-orange-700" 
                          : "text-gray-700 hover:bg-gray-100",
                        isCollapsed && "justify-center"
                      )
                    }
                    onClick={() => {
                      if (window.innerWidth < 768) {
                        onClose();
                      }
                    }}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {!isCollapsed && <span>{item.label}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            {!isCollapsed && (
              <div className="text-xs text-gray-500 text-center">
                © 2024 Cornerstone Briques
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
