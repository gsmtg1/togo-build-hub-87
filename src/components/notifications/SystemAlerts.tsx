
import { useState, useEffect } from 'react';
import { AlertTriangle, Clock, Package, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSystemAlerts } from '@/hooks/useSupabaseDatabase';
import { useToast } from '@/hooks/use-toast';

export const SystemAlerts = () => {
  const { stockAlerts, pendingOrders, loading } = useSystemAlerts();
  const { toast } = useToast();
  const [showAlerts, setShowAlerts] = useState(true);

  // Notifications automatiques pour les alertes critiques
  useEffect(() => {
    if (stockAlerts.length > 0) {
      const criticalAlerts = stockAlerts.filter(alert => alert.current_stock === 0);
      if (criticalAlerts.length > 0) {
        toast({
          title: "🚨 Rupture de stock critique!",
          description: `${criticalAlerts.length} produit(s) en rupture totale`,
          variant: "destructive",
        });
      }
    }

    if (pendingOrders.length > 0) {
      const urgentOrders = pendingOrders.filter(order => order.hours_pending > 24);
      if (urgentOrders.length > 0) {
        toast({
          title: "⏰ Commandes urgentes!",
          description: `${urgentOrders.length} commande(s) en attente depuis plus de 24h`,
          variant: "destructive",
        });
      }
    }
  }, [stockAlerts, pendingOrders, toast]);

  if (loading) return null;

  const totalAlerts = stockAlerts.length + pendingOrders.length;

  if (totalAlerts === 0) return null;

  if (!showAlerts) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          onClick={() => setShowAlerts(true)}
          variant="destructive"
          className="rounded-full h-12 w-12 p-0"
        >
          <AlertTriangle className="h-5 w-5" />
          <Badge 
            variant="secondary" 
            className="absolute -top-2 -right-2 h-6 w-6 p-0 flex items-center justify-center"
          >
            {totalAlerts}
          </Badge>
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="border-red-200 bg-red-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alertes Système ({totalAlerts})
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowAlerts(false)}
              className="text-red-600 hover:text-red-800"
            >
              ×
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 max-h-64 overflow-y-auto">
          {/* Alertes de stock */}
          {stockAlerts.map((alert) => (
            <div key={alert.product_id} className="flex items-center gap-3 p-2 bg-white rounded border-l-4 border-red-400">
              <Package className="h-4 w-4 text-red-500" />
              <div className="flex-1">
                <p className="font-medium text-sm">{alert.product_name}</p>
                <p className="text-xs text-gray-600">
                  Stock: {alert.current_stock} / Min: {alert.minimum_stock}
                </p>
              </div>
              <Badge variant={alert.current_stock === 0 ? 'destructive' : 'secondary'}>
                {alert.current_stock === 0 ? 'Rupture' : 'Faible'}
              </Badge>
            </div>
          ))}

          {/* Commandes en attente */}
          {pendingOrders.map((order) => (
            <div key={order.id} className="flex items-center gap-3 p-2 bg-white rounded border-l-4 border-orange-400">
              <Clock className="h-4 w-4 text-orange-500" />
              <div className="flex-1">
                <p className="font-medium text-sm">{order.product_name}</p>
                <p className="text-xs text-gray-600">
                  En attente depuis {Math.floor(order.hours_pending)}h
                </p>
              </div>
              <Badge variant={order.hours_pending > 48 ? 'destructive' : 'secondary'}>
                {order.hours_pending > 48 ? 'Urgent' : 'Attente'}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
