
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Factory } from 'lucide-react';
import { useProducts, useProductionOrders } from '@/hooks/useSupabaseDatabase';

export const ClassicDashboardAlerts = () => {
  const { data: products = [] } = useProducts();
  const { data: orders = [] } = useProductionOrders();

  const inactiveProducts = products.filter(p => !p.is_active);
  const pendingOrders = orders.filter(o => o.status === 'planned');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Produits inactifs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Produits inactifs
          </CardTitle>
        </CardHeader>
        <CardContent>
          {inactiveProducts.length > 0 ? (
            <div className="space-y-3">
              {inactiveProducts.slice(0, 5).map((product) => (
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
              {inactiveProducts.length > 5 && (
                <p className="text-sm text-gray-500 text-center">
                  +{inactiveProducts.length - 5} autres produits
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
  );
};
