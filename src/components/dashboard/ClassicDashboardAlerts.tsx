
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
      <Card className="bg-white border border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Produits inactifs
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {inactiveProducts.length > 0 ? (
            <div className="space-y-3">
              {inactiveProducts.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.type}</p>
                  </div>
                  <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
                    Inactif
                  </Badge>
                </div>
              ))}
              {inactiveProducts.length > 5 && (
                <p className="text-sm text-gray-500 text-center pt-2">
                  +{inactiveProducts.length - 5} autres produits
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Tous les produits sont actifs</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ordres en attente */}
      <Card className="bg-white border border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Factory className="h-5 w-5 text-orange-500" />
            Ordres en attente
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {pendingOrders.length > 0 ? (
            <div className="space-y-3">
              {pendingOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                  <div>
                    <p className="font-medium text-gray-900">Ordre #{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.start_date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
                    {order.planned_quantity} unités
                  </Badge>
                </div>
              ))}
              {pendingOrders.length > 5 && (
                <p className="text-sm text-gray-500 text-center pt-2">
                  +{pendingOrders.length - 5} autres ordres
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucun ordre en attente</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
