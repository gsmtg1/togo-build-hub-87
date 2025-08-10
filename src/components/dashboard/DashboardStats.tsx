
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Package, 
  Factory, 
  Truck, 
  ShoppingCart, 
  Users, 
  Calculator,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProducts, useProductionOrders, useDeliveries, useSales, useEmployees } from '@/hooks/useSupabaseDatabase';

export const DashboardStats = () => {
  const navigate = useNavigate();
  const { data: products = [] } = useProducts();
  const { data: orders = [] } = useProductionOrders();
  const { data: deliveries = [] } = useDeliveries();
  const { data: sales = [] } = useSales();
  const { data: employees = [] } = useEmployees();

  // Calculer les vraies statistiques
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.is_active).length;
  
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
      unit: 'total',
      detail: `${activeProducts} actifs`,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      route: '/stock'
    },
    {
      title: 'Ordres en cours',
      value: ordersInProgress,
      unit: 'ordres',
      detail: `${ordersPlanned} planifiés`,
      icon: Factory,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      route: '/ordres-production'
    },
    {
      title: 'Livraisons',
      value: deliveriesInProgress,
      unit: 'en cours',
      detail: `${deliveriesCompleted} livrées`,
      icon: Truck,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      route: '/livraisons'
    },
    {
      title: 'CA du mois',
      value: monthlyRevenue.toLocaleString(),
      unit: 'FCFA',
      detail: `${monthlySales.length} ventes`,
      icon: ShoppingCart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      route: '/ventes'
    },
    {
      title: 'Employés actifs',
      value: activeEmployees,
      unit: 'personnes',
      detail: `${totalEmployees} au total`,
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      route: '/employes'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
      {stats.map((stat) => (
        <Card 
          key={stat.title} 
          className="hover:shadow-lg transition-all cursor-pointer hover:scale-105"
          onClick={() => navigate(stat.route)}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-full ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stat.value}
            </div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-500">{stat.unit}</p>
              <p className="text-xs text-gray-500">{stat.detail}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
