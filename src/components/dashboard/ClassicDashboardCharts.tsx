
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
      <Card className="bg-white border border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Évolution des ventes
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <p className="text-gray-500 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              Graphique des ventes à venir
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Résumé financier */}
      <Card className="bg-white border border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Calculator className="h-5 w-5 text-blue-500" />
            Résumé financier
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-6">
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600 font-medium">Chiffre d'affaires</span>
              <span className="font-bold text-xl text-gray-900">
                {totalRevenue.toLocaleString()} FCFA
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600 font-medium">Commandes en cours</span>
              <span className="font-bold text-xl text-gray-900">{ordersInProgress}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-600 font-medium">Livraisons en attente</span>
              <span className="font-bold text-xl text-gray-900">{pendingDeliveries}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
