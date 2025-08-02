
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Package, 
  ShoppingCart, 
  FileText, 
  Truck, 
  Calculator, 
  Users, 
  Settings, 
  X,
  Target,
  AlertTriangle,
  BarChart3,
  Factory
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  const navigation = [
    { name: 'Tableau de bord', href: '/dashboard', icon: Home },
    { name: 'Stock', href: '/stock', icon: Package },
    { name: 'Ventes', href: '/ventes', icon: ShoppingCart },
    { name: 'Devis', href: '/devis', icon: FileText },
    { name: 'Factures', href: '/factures', icon: FileText },
    { name: 'Livraisons', href: '/livraisons', icon: Truck },
    { name: 'Production', href: '/production', icon: Factory },
    { name: 'Ordres Production', href: '/ordres-production', icon: Settings },
    { name: 'Pertes', href: '/pertes', icon: AlertTriangle },
    { name: 'Comptabilité', href: '/comptabilite', icon: Calculator },
    { name: 'Employés', href: '/employes', icon: Users },
    { name: 'Objectifs', href: '/objectifs', icon: Target },
    { name: 'Rapports', href: '/rapports', icon: BarChart3 },
    { name: 'Paramètres', href: '/parametres', icon: Settings },
  ];

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Briqueterie</h2>
          <button
            onClick={onClose}
            className="md:hidden p-2 rounded-md hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-6">
          <ul className="space-y-1 px-3">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;

              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      isActive
                        ? "bg-orange-100 text-orange-900 border-r-2 border-orange-500"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
};
