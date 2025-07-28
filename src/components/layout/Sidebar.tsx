
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  BarChart3, 
  ShoppingCart, 
  Package, 
  Factory, 
  ClipboardList,
  Truck,
  Calculator, 
  FileText, 
  Users, 
  Target, 
  Settings,
  Receipt,
  FileCheck
} from 'lucide-react';

const navigation = [
  { name: 'Accueil', href: '/', icon: Home },
  { name: 'Tableau de bord', href: '/dashboard', icon: BarChart3 },
  { name: 'Ventes', href: '/ventes', icon: ShoppingCart },
  { name: 'Stock', href: '/stock', icon: Package },
  { name: 'Production', href: '/production', icon: Factory },
  { name: 'Ordres de Production', href: '/ordres-production', icon: ClipboardList },
  { name: 'Livraisons', href: '/livraisons', icon: Truck },
  { name: 'Comptabilité', href: '/comptabilite', icon: Calculator },
  { name: 'Factures', href: '/factures', icon: FileText },
  { name: 'Devis', href: '/devis', icon: FileCheck },
  { name: 'Employés', href: '/employes', icon: Users },
  { name: 'Objectifs', href: '/objectifs', icon: Target },
  { name: 'Paramètres', href: '/parametres', icon: Settings },
];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="flex h-full w-64 flex-col bg-white shadow-lg">
      <div className="flex h-16 items-center justify-center border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">CornerstoneGESCO</h1>
      </div>
      
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`${
                isActive
                  ? 'bg-orange-50 border-r-2 border-orange-500 text-orange-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              } group flex items-center px-3 py-2 text-sm font-medium rounded-l-md transition-colors`}
            >
              <item.icon
                className={`${
                  isActive ? 'text-orange-500' : 'text-gray-400 group-hover:text-gray-500'
                } mr-3 h-5 w-5 flex-shrink-0`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
