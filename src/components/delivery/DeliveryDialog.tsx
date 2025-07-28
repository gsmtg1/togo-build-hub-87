
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProductionOrders } from '@/hooks/useTypedDatabase';
import type { Delivery } from '@/types/database';

interface DeliveryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  delivery: Delivery | null;
  onSubmit: (deliveryData: Partial<Delivery>) => Promise<void>;
}

export const DeliveryDialog = ({ open, onOpenChange, delivery, onSubmit }: DeliveryDialogProps) => {
  const { data: orders } = useProductionOrders();
  const [formData, setFormData] = useState({
    production_order_id: '',
    customer_name: '',
    customer_phone: '',
    customer_address: '',
    delivery_date: '',
    delivery_time: '',
    transport_method: '',
    transport_company: '',
    driver_name: '',
    driver_phone: '',
    vehicle_number: '',
    quantity_delivered: '',
    delivery_notes: ''
  });

  useEffect(() => {
    if (delivery) {
      setFormData({
        production_order_id: delivery.production_order_id || '',
        customer_name: delivery.customer_name || '',
        customer_phone: delivery.customer_phone || '',
        customer_address: delivery.customer_address || '',
        delivery_date: delivery.delivery_date || '',
        delivery_time: delivery.delivery_time || '',
        transport_method: delivery.transport_method || '',
        transport_company: delivery.transport_company || '',
        driver_name: delivery.driver_name || '',
        driver_phone: delivery.driver_phone || '',
        vehicle_number: delivery.vehicle_number || '',
        quantity_delivered: delivery.quantity_delivered?.toString() || '',
        delivery_notes: delivery.delivery_notes || ''
      });
    } else {
      setFormData({
        production_order_id: '',
        customer_name: '',
        customer_phone: '',
        customer_address: '',
        delivery_date: '',
        delivery_time: '',
        transport_method: '',
        transport_company: '',
        driver_name: '',
        driver_phone: '',
        vehicle_number: '',
        quantity_delivered: '',
        delivery_notes: ''
      });
    }
  }, [delivery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const deliveryData: Partial<Delivery> = {
      production_order_id: formData.production_order_id || null,
      customer_name: formData.customer_name,
      customer_phone: formData.customer_phone || null,
      customer_address: formData.customer_address,
      delivery_date: formData.delivery_date || null,
      delivery_time: formData.delivery_time || null,
      transport_method: formData.transport_method || null,
      transport_company: formData.transport_company || null,
      driver_name: formData.driver_name || null,
      driver_phone: formData.driver_phone || null,
      vehicle_number: formData.vehicle_number || null,
      quantity_delivered: parseInt(formData.quantity_delivered) || 0,
      delivery_notes: formData.delivery_notes || null
    };

    await onSubmit(deliveryData);
  };

  const completedOrders = orders.filter(order => order.status === 'completed');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {delivery ? 'Modifier la livraison' : 'Nouvelle livraison'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="production_order_id">Ordre de production</Label>
              <Select
                value={formData.production_order_id}
                onValueChange={(value) => setFormData({ ...formData, production_order_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un ordre" />
                </SelectTrigger>
                <SelectContent>
                  {completedOrders.map((order) => (
                    <SelectItem key={order.id} value={order.id}>
                      {order.order_number} - {order.quantity} unités
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="quantity_delivered">Quantité à livrer</Label>
              <Input
                id="quantity_delivered"
                type="number"
                value={formData.quantity_delivered}
                onChange={(e) => setFormData({ ...formData, quantity_delivered: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informations client</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customer_name">Nom du client</Label>
                <Input
                  id="customer_name"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="customer_phone">Téléphone</Label>
                <Input
                  id="customer_phone"
                  value={formData.customer_phone}
                  onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="customer_address">Adresse de livraison</Label>
              <Textarea
                id="customer_address"
                value={formData.customer_address}
                onChange={(e) => setFormData({ ...formData, customer_address: e.target.value })}
                rows={2}
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Planification</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="delivery_date">Date de livraison</Label>
                <Input
                  id="delivery_date"
                  type="date"
                  value={formData.delivery_date}
                  onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="delivery_time">Heure de livraison</Label>
                <Input
                  id="delivery_time"
                  type="time"
                  value={formData.delivery_time}
                  onChange={(e) => setFormData({ ...formData, delivery_time: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Transport</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="transport_method">Méthode de transport</Label>
                <Select
                  value={formData.transport_method}
                  onValueChange={(value) => setFormData({ ...formData, transport_method: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="truck">Camion</SelectItem>
                    <SelectItem value="van">Fourgon</SelectItem>
                    <SelectItem value="pickup">Pick-up</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="transport_company">Société de transport</Label>
                <Input
                  id="transport_company"
                  value={formData.transport_company}
                  onChange={(e) => setFormData({ ...formData, transport_company: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="driver_name">Nom du chauffeur</Label>
                <Input
                  id="driver_name"
                  value={formData.driver_name}
                  onChange={(e) => setFormData({ ...formData, driver_name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="driver_phone">Téléphone chauffeur</Label>
                <Input
                  id="driver_phone"
                  value={formData.driver_phone}
                  onChange={(e) => setFormData({ ...formData, driver_phone: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="vehicle_number">Numéro de véhicule</Label>
                <Input
                  id="vehicle_number"
                  value={formData.vehicle_number}
                  onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="delivery_notes">Notes de livraison</Label>
            <Textarea
              id="delivery_notes"
              value={formData.delivery_notes}
              onChange={(e) => setFormData({ ...formData, delivery_notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">
              {delivery ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
