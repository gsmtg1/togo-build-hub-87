
import { useState } from 'react';
import { CheckCircle, XCircle, Eye, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useProducts } from '@/hooks/useSupabaseDatabase';
import type { Database } from '@/integrations/supabase/types';

type ProductionOrder = Database['public']['Tables']['production_orders']['Row'];

interface ProductionOrderApprovalProps {
  orders: ProductionOrder[];
  onApprove: (order: ProductionOrder) => Promise<void>;
  onReject: (order: ProductionOrder, reason: string) => Promise<void>;
  getStatusBadge: (status: string) => React.ReactNode;
}

export const ProductionOrderApproval = ({ orders, onApprove, onReject, getStatusBadge }: ProductionOrderApprovalProps) => {
  const { data: products } = useProducts();
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const getProduct = (productId: string) => {
    return products.find(p => p.id === productId);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'normal': return 'text-blue-600';
      case 'low': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Élevée';
      case 'normal': return 'Normale';
      case 'low': return 'Basse';
      default: return priority;
    }
  };

  const handleApprove = async (order: ProductionOrder) => {
    if (window.confirm('Approuver cet ordre de production ?')) {
      await onApprove(order);
    }
  };

  const handleReject = async () => {
    if (selectedOrder && rejectionReason.trim()) {
      await onReject(selectedOrder, rejectionReason);
      setShowRejectDialog(false);
      setRejectionReason('');
      setSelectedOrder(null);
    }
  };

  const openRejectDialog = (order: ProductionOrder) => {
    setSelectedOrder(order);
    setShowRejectDialog(true);
  };

  const viewOrderDetails = (order: ProductionOrder) => {
    setSelectedOrder(order);
    setShowDetails(true);
  };

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">Aucun ordre en attente d'approbation</p>
            <p className="text-muted-foreground">Tous les ordres ont été traités</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4">
        {orders.map((order) => {
          const product = getProduct(order.product_id || '');
          
          return (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{order.order_number}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Par {order.initiator_name} • {new Date(order.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getPriorityColor(order.priority || 'normal')}>
                      {getPriorityLabel(order.priority || 'normal')}
                    </Badge>
                    {getStatusBadge(order.status || 'pending')}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="font-medium">Produit</p>
                    <p className="text-sm text-muted-foreground">
                      {product?.name || 'Produit inconnu'}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Quantité</p>
                    <p className="text-sm text-muted-foreground">
                      {order.quantity?.toLocaleString()} unités
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Montant total</p>
                    <p className="text-sm text-muted-foreground">
                      {order.total_amount?.toLocaleString()} FCFA
                    </p>
                  </div>
                </div>

                {order.notes && (
                  <div>
                    <p className="font-medium">Notes</p>
                    <p className="text-sm text-muted-foreground">{order.notes}</p>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => viewOrderDetails(order)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Détails
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openRejectDialog(order)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Rejeter
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleApprove(order)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approuver
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Dialog de détails */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de l'ordre {selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Initiateur</Label>
                  <p className="text-sm">{selectedOrder.initiator_name}</p>
                </div>
                <div>
                  <Label>Date de demande</Label>
                  <p className="text-sm">
                    {selectedOrder.requested_date 
                      ? new Date(selectedOrder.requested_date).toLocaleDateString('fr-FR')
                      : 'Non spécifiée'
                    }
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Produit</Label>
                  <p className="text-sm">{getProduct(selectedOrder.product_id || '')?.name}</p>
                </div>
                <div>
                  <Label>Quantité</Label>
                  <p className="text-sm">{selectedOrder.quantity?.toLocaleString()} unités</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Prix unitaire</Label>
                  <p className="text-sm">{selectedOrder.unit_price?.toLocaleString()} FCFA</p>
                </div>
                <div>
                  <Label>Montant total</Label>
                  <p className="text-sm font-medium">{selectedOrder.total_amount?.toLocaleString()} FCFA</p>
                </div>
              </div>

              {selectedOrder.notes && (
                <div>
                  <Label>Notes</Label>
                  <p className="text-sm">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de rejet */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter l'ordre {selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejection_reason">Raison du rejet</Label>
              <Textarea
                id="rejection_reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Expliquez pourquoi cet ordre est rejeté..."
                rows={4}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                Annuler
              </Button>
              <Button 
                onClick={handleReject}
                disabled={!rejectionReason.trim()}
                className="bg-red-600 hover:bg-red-700"
              >
                Rejeter
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
