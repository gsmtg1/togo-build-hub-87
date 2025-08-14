
import { Card, CardContent } from '@/components/ui/card';
import { 
  Package, 
  Factory, 
  Truck, 
  ShoppingCart, 
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProducts, useProductionOrders, useDeliveries, useSales, useEmployees } from '@/hooks/useSupabaseDatabase';

export const ClassicDashboardStats = () => {
  const navigate = useNavigate();
  const { data: products = [] } = useProducts();
  const { data: orders = [] } = useProductionOrders();
  const { data: deliveries = [] } = useDeliveries();
  const { data: sales = [] } = useSales();
  const { data: employees = [] } = useEmployees();

  // Calculer les statistiques
  const totalProducts = products.length;
  const inactiveProducts = products.filter(p => !p.is_active).length;
  
  const ordersInProgress = orders.filter(o => o.status === 'in_progress').length;
  const ordersPlanned = orders.filter(o => o.status === 'planned').length;
  
  const deliveriesInProgress = deliveries.filter(d => d.status === 'in_progress').length;
  const deliveriesCompleted = deliveries.filter(d => d.status === 'delivered').length;
  
  // Ventes du mois actuel
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlySales = sales.filter(s => {
    const saleDate = new Date(s.sale_date);
    return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
  });
  const monthlyRevenue = monthlySales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
  
  const activeEmployees = employees.filter(e => e.is_active).length;
  const totalEmployees = employees.length;

  const stats = [
    {
      title: 'Produits',
      value: totalProducts,
      detail: `${inactiveProducts} inactifs`,
      icon: Package,
      color: 'bg-blue-500',
      route: '/stock'
    },
    {
      title: 'Ordres en cours',
      value: ordersInProgress,
      detail: `${ordersPlanned} en attente`,
      icon: Factory,
      color: 'bg-orange-500',
      route: '/ordres-production'
    },
    {
      title: 'Livraisons',
      value: deliveriesInProgress,
      detail: `${deliveriesCompleted} livrées`,
      icon: Truck,
      color: 'bg-green-500',
      route: '/livraisons'
    },
    {
      title: 'Ventes du mois',
      value: monthlySales.length,
      detail: `${monthlyRevenue.toLocaleString()} FCFA`,
      icon: ShoppingCart,
      color: 'bg-purple-500',
      route: '/ventes'
    },
    {
      title: 'Employés actifs',
      value: activeEmployees,
      detail: `${totalEmployees} au total`,
      icon: Users,
      color: 'bg-indigo-500',
      route: '/employes'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
      {stats.map((stat, index) => (
        <Card 
          key={index} 
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => navigate(stat.route)}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.detail}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
