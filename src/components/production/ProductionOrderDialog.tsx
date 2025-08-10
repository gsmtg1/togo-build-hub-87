
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useProducts } from '@/hooks/useSupabaseDatabase';
import type { ProductionOrder } from '@/types/database';

interface ProductionOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (orderData: Partial<ProductionOrder>) => void;
  order?: ProductionOrder | null;
  isEditing?: boolean;
}

export const ProductionOrderDialog = ({
  open,
  onOpenChange,
  onSubmit,
  order,
  isEditing = false
}: ProductionOrderDialogProps) => {
  const { data: products } = useProducts();
  const [formData, setFormData] = useState({
    numero_ordre: '',
    product_id: '',
    planned_quantity: '',
    start_date: '',
    end_date: '',
    status: 'planned' as ProductionOrder['status'],
    notes: ''
  });

  useEffect(() => {
    if (order && isEditing) {
      setFormData({
        numero_ordre: order.numero_ordre || '',
        product_id: order.product_id || '',
        planned_quantity: order.planned_quantity?.toString() || '',
        start_date: order.start_date || '',
        end_date: order.end_date || '',
        status: order.status || 'planned',
        notes: order.notes || ''
      });
    } else {
      // Reset form for new order
      setFormData({
        numero_ordre: `ORD-${Date.now()}`,
        product_id: '',
        planned_quantity: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        status: 'planned',
        notes: ''
      });
    }
  }, [order, isEditing, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      numero_ordre: formData.numero_ordre || `ORD-${Date.now()}`,
      product_id: formData.product_id,
      planned_quantity: parseInt(formData.planned_quantity) || 0,
      start_date: formData.start_date,
      end_date: formData.end_date || undefined,
      status: formData.status,
      notes: formData.notes || undefined,
      produced_quantity: order?.produced_quantity || 0
    };

    onSubmit(submitData);
  };

  // Ensure products is an array
  const productsList = Array.isArray(products) ? products : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Modifier l\'ordre de production' : 'Nouvel ordre de production'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="numero_ordre">Numéro d'ordre</Label>
            <Input
              id="numero_ordre"
              value={formData.numero_ordre}
              onChange={(e) => setFormData(prev => ({ ...prev, numero_ordre: e.target.value }))}
              placeholder="Généré automatiquement"
            />
          </div>

          <div>
            <Label htmlFor="product_id">Produit</Label>
            <Select 
              value={formData.product_id} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, product_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un produit" />
              </SelectTrigger>
              <SelectContent>
                {productsList.map((product: any) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name || product.nom} - {product.type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="planned_quantity">Quantité prévue</Label>
            <Input
              id="planned_quantity"
              type="number"
              min="1"
              value={formData.planned_quantity}
              onChange={(e) => setFormData(prev => ({ ...prev, planned_quantity: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="start_date">Date de début</Label>
            <Input
              id="start_date"
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="end_date">Date de fin (optionnelle)</Label>
            <Input
              id="end_date"
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="status">Statut</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value: ProductionOrder['status']) => setFormData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planned">Planifié</SelectItem>
                <SelectItem value="in_progress">En cours</SelectItem>
                <SelectItem value="completed">Terminé</SelectItem>
                <SelectItem value="cancelled">Annulé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Notes additionnelles..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">
              {isEditing ? 'Mettre à jour' : 'Créer l\'ordre'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
