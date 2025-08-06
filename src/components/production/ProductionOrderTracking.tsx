
import { Play, Pause, CheckCircle, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useProducts } from '@/hooks/useTypedDatabase';
import type { ProductionOrder } from '@/types/database';

interface ProductionOrderTrackingProps {
  orders: ProductionOrder[];
  onUpdate: (id: string, item: Partial<ProductionOrder>) => Promise<void>;
  getStatusBadge: (status: string) => React.ReactNode;
}

export const ProductionOrderTracking = ({ orders, onUpdate, getStatusBadge }: ProductionOrderTrackingProps) => {
  const { data: products } = useProducts();

  const getProduct = (productId: string) => {
    return products.find(p => p.id === productId);
  };

  const handleStartProduction = async (orderId: string) => {
    await onUpdate(orderId, {
      status: 'in_progress',
      start_date: new Date().toISOString().split('T')[0]
    });
  };

  const handleCompleteProduction = async (orderId: string) => {
    await onUpdate(orderId, {
      status: 'completed',
      end_date: new Date().toISOString().split('T')[0]
    });
  };

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Package className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <p className="text-lg font-medium">Aucune production en cours</p>
            <p className="text-muted-foreground">Les ordres approuvés apparaîtront ici</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const product = getProduct(order.product_id || '');
        
        return (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Ordre de production
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {product?.name || product?.nom || 'Produit inconnu'} - {order.planned_quantity?.toLocaleString()} unités
                  </p>
                </div>
                {getStatusBadge(order.status || 'planned')}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Créé le</p>
                  <p className="text-muted-foreground">{new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <p className="font-medium">Quantité prévue</p>
                  <p className="text-muted-foreground">{order.planned_quantity?.toLocaleString()} unités</p>
                </div>
                <div>
                  <p className="font-medium">Date de début</p>
                  <p className="text-muted-foreground">
                    {order.start_date 
                      ? new Date(order.start_date).toLocaleDateString('fr-FR')
                      : 'Non commencé'
                    }
                  </p>
                </div>
                <div>
                  <p className="font-medium">Priorité</p>
                  <Badge variant="outline">Normal</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="font-medium">Progression</p>
                  <span className="text-sm text-muted-foreground">
                    {order.status === 'completed' ? '100' : order.status === 'in_progress' ? '50' : '0'}%
                  </span>
                </div>
                <Progress 
                  value={order.status === 'completed' ? 100 : order.status === 'in_progress' ? 50 : 0} 
                  className="w-full" 
                />
              </div>

              <div className="flex gap-2">
                {order.status === 'planned' && (
                  <Button
                    onClick={() => handleStartProduction(order.id)}
                    className="flex items-center gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Démarrer production
                  </Button>
                )}
                
                {order.status === 'in_progress' && (
                  <Button
                    onClick={() => handleCompleteProduction(order.id)}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Marquer comme terminé
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
