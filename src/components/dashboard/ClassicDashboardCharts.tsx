
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Calculator } from 'lucide-react';
import { useSales, useProductionOrders, useDeliveries } from '@/hooks/useSupabaseDatabase';

export const ClassicDashboardCharts = () => {
  const { data: sales = [] } = useSales();
  const { data: orders = [] } = useProductionOrders();
  const { data: deliveries = [] } = useDeliveries();

  const totalRevenue = sales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
  const ordersInProgress = orders.filter(o => o.status === 'in_progress').length;
  const pendingDeliveries = deliveries.filter(d => d.status === 'pending').length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Évolution des ventes */}
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

      {/* Résumé financier */}
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
                {totalRevenue.toLocaleString()} FCFA
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Commandes en cours</span>
              <span className="font-semibold">{ordersInProgress}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Livraisons en attente</span>
              <span className="font-semibold">{pendingDeliveries}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
