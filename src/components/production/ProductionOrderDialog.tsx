
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProducts } from '@/hooks/useSupabaseDatabase';
import type { Database } from '@/integrations/supabase/types';

type ProductionOrder = Database['public']['Tables']['production_orders']['Row'];
type ProductionOrderInsert = Database['public']['Tables']['production_orders']['Insert'];

interface ProductionOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: ProductionOrder | null;
  onSubmit: (orderData: ProductionOrderInsert) => Promise<void>;
}

export const ProductionOrderDialog = ({ open, onOpenChange, order, onSubmit }: ProductionOrderDialogProps) => {
  const { data: products } = useProducts();
  const [formData, setFormData] = useState({
    product_id: '',
    quantity: '',
    unit_price: '',
    requested_date: '',
    initiator_name: '',
    notes: '',
    priority: 'normal'
  });

  useEffect(() => {
    if (order) {
      setFormData({
        product_id: order.product_id || '',
        quantity: order.quantity?.toString() || '',
        unit_price: order.unit_price?.toString() || '',
        requested_date: order.requested_date || '',
        initiator_name: order.initiator_name || '',
        notes: order.notes || '',
        priority: order.priority || 'normal'
      });
    } else {
      setFormData({
        product_id: '',
        quantity: '',
        unit_price: '',
        requested_date: '',
        initiator_name: '',
        notes: '',
        priority: 'normal'
      });
    }
  }, [order]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const orderData: ProductionOrderInsert = {
      product_id: formData.product_id,
      quantity: parseInt(formData.quantity),
      unit_price: parseFloat(formData.unit_price),
      total_amount: parseInt(formData.quantity) * parseFloat(formData.unit_price),
      requested_date: formData.requested_date,
      initiator_name: formData.initiator_name,
      notes: formData.notes,
      priority: formData.priority as 'low' | 'normal' | 'high' | 'urgent'
    };

    await onSubmit(orderData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {order ? 'Modifier l\'ordre de production' : 'Nouvel ordre de production'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="product_id">Produit</Label>
              <Select
                value={formData.product_id}
                onValueChange={(value) => setFormData({ ...formData, product_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un produit" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - {product.price} FCFA
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="quantity">Quantité</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="unit_price">Prix unitaire (FCFA)</Label>
              <Input
                id="unit_price"
                type="number"
                step="0.01"
                value={formData.unit_price}
                onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="requested_date">Date de demande</Label>
              <Input
                id="requested_date"
                type="date"
                value={formData.requested_date}
                onChange={(e) => setFormData({ ...formData, requested_date: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="initiator_name">Initiateur</Label>
              <Input
                id="initiator_name"
                value={formData.initiator_name}
                onChange={(e) => setFormData({ ...formData, initiator_name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="priority">Priorité</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Basse</SelectItem>
                  <SelectItem value="normal">Normale</SelectItem>
                  <SelectItem value="high">Élevée</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">
              {order ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
