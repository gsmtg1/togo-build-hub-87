
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { useProducts } from '@/hooks/useTypedDatabase';
import type { ProductionOrder } from '@/types/database';

interface ProductionOrderApprovalProps {
  orders: ProductionOrder[];
  onUpdate: (id: string, item: Partial<ProductionOrder>) => Promise<void>;
  getStatusBadge: (status: string) => React.ReactNode;
}

export const ProductionOrderApproval = ({ orders, onUpdate, getStatusBadge }: ProductionOrderApprovalProps) => {
  const { data: products } = useProducts();
  const [rejectionReason, setRejectionReason] = useState<{ [key: string]: string }>({});

  const getProduct = (productId: string) => {
    return products.find(p => p.id === productId);
  };

  const handleApprove = async (orderId: string) => {
    await onUpdate(orderId, {
      status: 'in_progress',
      start_date: new Date().toISOString().split('T')[0],
      notes: (rejectionReason[orderId] || '') + ' - Approuvé par utilisateur actuel'
    });
  };

  const handleReject = async (orderId: string) => {
    const reason = rejectionReason[orderId];
    if (!reason) {
      alert('Veuillez fournir une raison pour le rejet');
      return;
    }

    await onUpdate(orderId, {
      status: 'cancelled',
      notes: reason,
      end_date: new Date().toISOString().split('T')[0]
    });

    setRejectionReason({ ...rejectionReason, [orderId]: '' });
  };

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-lg font-medium">Aucun ordre en attente d'approbation</p>
            <p className="text-muted-foreground">Tous les ordres ont été traités</p>
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
                    <Clock className="h-5 w-5" />
                    Ordre de production
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Créé le {new Date(order.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                {getStatusBadge(order.status || 'planned')}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Produit</p>
                  <p className="text-muted-foreground">{product?.name || product?.nom || 'Produit inconnu'}</p>
                </div>
                <div>
                  <p className="font-medium">Quantité</p>
                  <p className="text-muted-foreground">{order.planned_quantity?.toLocaleString()} unités</p>
                </div>
                <div>
                  <p className="font-medium">Date de début prévue</p>
                  <p className="text-muted-foreground">
                    {order.start_date 
                      ? new Date(order.start_date).toLocaleDateString('fr-FR')
                      : 'Non définie'
                    }
                  </p>
                </div>
                <div>
                  <p className="font-medium">Priorité</p>
                  <Badge variant="outline">Normal</Badge>
                </div>
              </div>

              {order.notes && (
                <div>
                  <p className="font-medium mb-2">Notes</p>
                  <p className="text-muted-foreground text-sm bg-gray-50 p-2 rounded">
                    {order.notes}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Textarea
                  placeholder="Raison du rejet (optionnel pour approbation, obligatoire pour rejet)"
                  value={rejectionReason[order.id] || ''}
                  onChange={(e) => setRejectionReason({
                    ...rejectionReason,
                    [order.id]: e.target.value
                  })}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleApprove(order.id)}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Approuver
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleReject(order.id)}
                  className="flex items-center gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  Rejeter
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
