
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
      statut: 'en_cours',
      date_prevue: new Date().toISOString()
    });
  };

  const handleCompleteProduction = async (orderId: string) => {
    await onUpdate(orderId, {
      statut: 'termine',
      date_completion: new Date().toISOString()
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
                    Ordre #{order.numero_ordre}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {product?.nom || 'Produit inconnu'} - {order.quantite?.toLocaleString()} unités
                  </p>
                </div>
                {getStatusBadge(order.statut || 'approuve')}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Demandeur</p>
                  <p className="text-muted-foreground">{order.demandeur_id}</p>
                </div>
                <div>
                  <p className="font-medium">Montant</p>
                  <p className="text-muted-foreground">{order.cout_prevu?.toLocaleString()} FCFA</p>
                </div>
                <div>
                  <p className="font-medium">Date de début</p>
                  <p className="text-muted-foreground">
                    {order.date_prevue 
                      ? new Date(order.date_prevue).toLocaleDateString('fr-FR')
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
                    {order.statut === 'termine' ? '100' : order.statut === 'en_cours' ? '50' : '0'}%
                  </span>
                </div>
                <Progress 
                  value={order.statut === 'termine' ? 100 : order.statut === 'en_cours' ? 50 : 0} 
                  className="w-full" 
                />
              </div>

              <div className="flex gap-2">
                {order.statut === 'approuve' && (
                  <Button
                    onClick={() => handleStartProduction(order.id)}
                    className="flex items-center gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Démarrer production
                  </Button>
                )}
                
                {order.statut === 'en_cours' && (
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
