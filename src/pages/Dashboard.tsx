
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { useProducts, useProductionOrders, useDeliveries, useSales, useEmployees } from '@/hooks/useSupabaseDatabase';

export default function Dashboard() {
  const { data: products = [] } = useProducts();
  const { data: orders = [] } = useProductionOrders();
  const { data: deliveries = [] } = useDeliveries();
  const { data: sales = [] } = useSales();
  const { data: employees = [] } = useEmployees();

  const stats = [
    {
      title: 'Produits',
      value: products.length,
      icon: Package,
      color: 'bg-blue-500',
      detail: `${products.filter(p => !p.is_active).length} inactifs`
    },
    {
      title: 'Ordres en cours',
      value: orders.filter(o => o.status === 'in_progress').length,
      icon: Factory,
      color: 'bg-orange-500',
      detail: `${orders.filter(o => o.status === 'planned').length} en attente`
    },
    {
      title: 'Livraisons',
      value: deliveries.filter(d => d.status === 'in_progress').length,
      icon: Truck,
      color: 'bg-green-500',
      detail: `${deliveries.filter(d => d.status === 'delivered').length} livrées`
    },
    {
      title: 'Ventes du mois',
      value: sales.filter(s => {
        const saleDate = new Date(s.sale_date);
        const now = new Date();
        return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
      }).length,
      icon: ShoppingCart,
      color: 'bg-purple-500',
      detail: `${sales.reduce((sum, s) => sum + s.total_amount, 0).toLocaleString()} FCFA`
    },
    {
      title: 'Employés actifs',
      value: employees.filter(e => e.is_active).length,
      icon: Users,
      color: 'bg-indigo-500',
      detail: `${employees.length} au total`
    }
  ];

  const lowStockProducts = products.filter(p => !p.is_active);
  const pendingOrders = orders.filter(o => o.status === 'planned');

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-600">Vue d'ensemble de votre activité</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
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

      {/* Alertes et notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock faible */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Produits inactifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length > 0 ? (
              <div className="space-y-3">
                {lowStockProducts.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.type}</p>
                    </div>
                    <Badge variant="destructive">
                      Inactif
                    </Badge>
                  </div>
                ))}
                {lowStockProducts.length > 5 && (
                  <p className="text-sm text-gray-500 text-center">
                    +{lowStockProducts.length - 5} autres produits
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Tous les produits sont actifs</p>
            )}
          </CardContent>
        </Card>

        {/* Ordres en attente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Factory className="h-5 w-5 text-orange-500" />
              Ordres en attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingOrders.length > 0 ? (
              <div className="space-y-3">
                {pendingOrders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div>
                      <p className="font-medium">Ordre #{order.id.slice(0, 8)}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(order.start_date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {order.planned_quantity} unités
                    </Badge>
                  </div>
                ))}
                {pendingOrders.length > 5 && (
                  <p className="text-sm text-gray-500 text-center">
                    +{pendingOrders.length - 5} autres ordres
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Aucun ordre en attente</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Graphiques et analyses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Évolution des ventes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Graphique des ventes à venir</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-500" />
              Résumé financier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Chiffre d'affaires</span>
                <span className="font-semibold">
                  {sales.reduce((sum, s) => sum + s.total_amount, 0).toLocaleString()} FCFA
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Commandes en cours</span>
                <span className="font-semibold">{orders.filter(o => o.status === 'in_progress').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Livraisons en attente</span>
                <span className="font-semibold">{deliveries.filter(d => d.status === 'pending').length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
