
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useProducts } from '@/hooks/useSupabaseDatabase';

interface ProductionOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  order?: any;
  isEditing?: boolean;
}

export const ProductionOrderDialog = ({ open, onOpenChange, onSubmit, order, isEditing = false }: ProductionOrderDialogProps) => {
  const { data: products } = useProducts();
  
  const [formData, setFormData] = useState({
    product_id: '',
    planned_quantity: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    status: 'planned' as const,
    notes: ''
  });

  useEffect(() => {
    if (order && isEditing) {
      setFormData({
        product_id: order.product_id,
        planned_quantity: order.planned_quantity.toString(),
        start_date: order.start_date,
        end_date: order.end_date || '',
        status: order.status,
        notes: order.notes || ''
      });
    } else if (!isEditing) {
      setFormData({
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
    onSubmit({
      ...formData,
      planned_quantity: parseInt(formData.planned_quantity)
    });
  };

  // Grouper les produits par type pour un meilleur affichage
  const groupedProducts = products.reduce((acc, product) => {
    const type = product.type || 'Autres';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(product);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Modifier l\'ordre de production' : 'Nouvel ordre de production'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="product_id">Produit</Label>
            <Select value={formData.product_id} onValueChange={(value) => setFormData(prev => ({ ...prev, product_id: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un produit" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(groupedProducts).map(([type, typeProducts]) => (
                  <div key={type}>
                    <div className="px-2 py-1 text-sm font-semibold text-gray-500 bg-gray-50">
                      {type}
                    </div>
                    {typeProducts.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{product.name || product.nom}</span>
                          <span className="text-xs text-gray-500">{product.dimensions}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Label htmlFor="status">Statut</Label>
              <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Label htmlFor="end_date">Date de fin prévue</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Notes sur la production..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">
              {isEditing ? 'Mettre à jour' : 'Créer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
