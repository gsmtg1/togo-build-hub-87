
import { useState } from 'react';
import { Bell, AlertTriangle, Clock, Package, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useSystemAlerts } from '@/hooks/useSupabaseDatabase';

export const OptimizedSystemAlerts = () => {
  const { stockAlerts, pendingOrders, loading } = useSystemAlerts();
  const [isOpen, setIsOpen] = useState(false);
  
  if (loading) return null;

  const totalAlerts = stockAlerts.length + pendingOrders.length;
  
  if (totalAlerts === 0) return null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className={`h-5 w-5 ${totalAlerts > 0 ? 'animate-pulse text-red-500' : 'text-gray-600'}`} />
          {totalAlerts > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {totalAlerts}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Alertes système</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-3 max-h-96 overflow-y-auto">
            {/* Alertes de stock */}
            {stockAlerts.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium text-red-700">
                    Stock faible ({stockAlerts.length})
                  </span>
                </div>
                <div className="space-y-2">
                  {stockAlerts.slice(0, 3).map((alert) => (
                    <div key={alert.product_id} className="p-2 bg-red-50 rounded border-l-2 border-red-500">
                      <p className="text-xs font-medium">{alert.product_name}</p>
                      <p className="text-xs text-gray-600">
                        Stock: {alert.current_stock} (Min: {alert.minimum_stock})
                      </p>
                    </div>
                  ))}
                  {stockAlerts.length > 3 && (
                    <p className="text-xs text-gray-500 text-center">
                      +{stockAlerts.length - 3} autres alertes
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Commandes en attente */}
            {pendingOrders.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium text-orange-700">
                    Commandes en attente ({pendingOrders.length})
                  </span>
                </div>
                <div className="space-y-2">
                  {pendingOrders.slice(0, 3).map((order) => (
                    <div key={order.id} className="p-2 bg-orange-50 rounded border-l-2 border-orange-500">
                      <p className="text-xs font-medium">{order.product_name}</p>
                      <p className="text-xs text-gray-600">
                        {order.quantity} unités • {order.total_amount.toLocaleString()} FCFA
                      </p>
                      <p className="text-xs text-orange-600">
                        En attente depuis {order.hours_pending}h
                      </p>
                    </div>
                  ))}
                  {pendingOrders.length > 3 && (
                    <p className="text-xs text-gray-500 text-center">
                      +{pendingOrders.length - 3} autres commandes
                    </p>
                  )}
                </div>
              </div>
            )}

            {totalAlerts === 0 && (
              <div className="flex items-center justify-center py-8 text-gray-500">
                <Package className="h-8 w-8 mb-2" />
                <p className="text-sm">Aucune alerte</p>
              </div>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};
