
import { useState } from 'react';
import { Truck, CheckCircle, Phone, MapPin, Clock, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useProductionOrders } from '@/hooks/useTypedDatabase';
import type { Delivery } from '@/types/database';

interface DeliveryTrackingProps {
  deliveries: Delivery[];
  onUpdate: (id: string, data: any) => Promise<void>;
  getStatusBadge: (status: string) => React.ReactNode;
}

export const DeliveryTracking = ({ deliveries, onUpdate, getStatusBadge }: DeliveryTrackingProps) => {
  const { data: orders } = useProductionOrders();
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [receivedBy, setReceivedBy] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  const getOrder = (orderId: string) => {
    return orders.find(order => order.id === orderId);
  };

  const confirmDelivery = async (delivery: Delivery) => {
    if (window.confirm('Confirmer cette livraison ?')) {
      await onUpdate(delivery.id, {
        status: 'confirmed'
      });
    }
  };

  const startTransit = async (delivery: Delivery) => {
    if (window.confirm('Marquer cette livraison comme en transit ?')) {
      await onUpdate(delivery.id, {
        status: 'in_transit'
      });
    }
  };

  const completeDelivery = async (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setReceivedBy('');
    setDeliveryNotes('');
    setShowUpdateDialog(true);
  };

  const handleCompleteDelivery = async () => {
    if (selectedDelivery) {
      await onUpdate(selectedDelivery.id, {
        status: 'delivered',
        received_by: receivedBy,
        delivery_notes: deliveryNotes,
        delivery_confirmation_date: new Date().toISOString()
      });
      setShowUpdateDialog(false);
      setSelectedDelivery(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'border-yellow-200 bg-yellow-50';
      case 'confirmed': return 'border-blue-200 bg-blue-50';
      case 'in_transit': return 'border-orange-200 bg-orange-50';
      case 'delivered': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  if (deliveries.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">Aucune livraison en cours</p>
            <p className="text-muted-foreground">Toutes les livraisons ont été traitées</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4">
        {deliveries.map((delivery) => {
          const order = getOrder(delivery.production_order_id || '');
          
          return (
            <Card key={delivery.id} className={`hover:shadow-md transition-shadow ${getStatusColor(delivery.status || 'pending')}`}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{delivery.delivery_number}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Ordre: {order?.order_number} • {delivery.quantity_delivered} unités
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(delivery.status || 'pending')}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4" />
                      <span className="font-medium">Client</span>
                    </div>
                    <p className="text-sm">{delivery.customer_name}</p>
                    {delivery.customer_phone && (
                      <div className="flex items-center gap-2 mt-1">
                        <Phone className="h-4 w-4" />
                        <span className="text-sm">{delivery.customer_phone}</span>
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">{delivery.customer_address}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">Planification</span>
                    </div>
                    {delivery.delivery_date && (
                      <p className="text-sm">
                        Date: {new Date(delivery.delivery_date).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                    {delivery.delivery_time && (
                      <p className="text-sm">Heure: {delivery.delivery_time}</p>
                    )}
                  </div>
                </div>

                {delivery.transport_method && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Truck className="h-4 w-4" />
                      <span className="font-medium">Transport</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p>Méthode: {delivery.transport_method}</p>
                        {delivery.transport_company && (
                          <p>Société: {delivery.transport_company}</p>
                        )}
                      </div>
                      {delivery.driver_name && (
                        <div>
                          <p>Chauffeur: {delivery.driver_name}</p>
                          {delivery.driver_phone && (
                            <p>Tél: {delivery.driver_phone}</p>
                          )}
                        </div>
                      )}
                      {delivery.vehicle_number && (
                        <div>
                          <p>Véhicule: {delivery.vehicle_number}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  {delivery.status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => confirmDelivery(delivery)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Confirmer
                    </Button>
                  )}
                  
                  {delivery.status === 'confirmed' && (
                    <Button
                      size="sm"
                      onClick={() => startTransit(delivery)}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      <Truck className="h-4 w-4 mr-1" />
                      En transit
                    </Button>
                  )}
                  
                  {delivery.status === 'in_transit' && (
                    <Button
                      size="sm"
                      onClick={() => completeDelivery(delivery)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Package className="h-4 w-4 mr-1" />
                      Livré
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finaliser la livraison</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="received_by">Reçu par</Label>
              <Input
                id="received_by"
                value={receivedBy}
                onChange={(e) => setReceivedBy(e.target.value)}
                placeholder="Nom de la personne qui a reçu"
              />
            </div>
            
            <div>
              <Label htmlFor="delivery_notes">Notes de livraison</Label>
              <Textarea
                id="delivery_notes"
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder="Commentaires sur la livraison..."
                rows={3}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowUpdateDialog(false)}>
                Annuler
              </Button>
              <Button onClick={handleCompleteDelivery} className="bg-green-600 hover:bg-green-700">
                Confirmer la livraison
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
