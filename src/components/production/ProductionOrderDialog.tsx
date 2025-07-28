
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProducts } from '@/hooks/useTypedDatabase';
import type { ProductionOrder } from '@/types/database';

interface ProductionOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: ProductionOrder | null;
  onSubmit: (orderData: Partial<ProductionOrder>) => Promise<void>;
}

export const ProductionOrderDialog = ({ open, onOpenChange, order, onSubmit }: ProductionOrderDialogProps) => {
  const { data: products } = useProducts();
  const [formData, setFormData] = useState({
    product_id: '',
    quantite: '',
    cout_prevu: '',
    date_demande: '',
    demandeur_id: '',
    commentaires: ''
  });

  useEffect(() => {
    if (order) {
      setFormData({
        product_id: order.product_id || '',
        quantite: order.quantite?.toString() || '',
        cout_prevu: order.cout_prevu?.toString() || '',
        date_demande: order.date_demande || '',
        demandeur_id: order.demandeur_id || '',
        commentaires: order.commentaires || ''
      });
    } else {
      setFormData({
        product_id: '',
        quantite: '',
        cout_prevu: '',
        date_demande: '',
        demandeur_id: '',
        commentaires: ''
      });
    }
  }, [order]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const orderData: Partial<ProductionOrder> = {
      product_id: formData.product_id,
      quantite: parseInt(formData.quantite),
      cout_prevu: parseFloat(formData.cout_prevu),
      date_demande: formData.date_demande,
      demandeur_id: formData.demandeur_id,
      commentaires: formData.commentaires
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
                      {product.nom} - {product.prix_unitaire} FCFA
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="quantite">Quantité</Label>
              <Input
                id="quantite"
                type="number"
                value={formData.quantite}
                onChange={(e) => setFormData({ ...formData, quantite: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cout_prevu">Coût prévu (FCFA)</Label>
              <Input
                id="cout_prevu"
                type="number"
                step="0.01"
                value={formData.cout_prevu}
                onChange={(e) => setFormData({ ...formData, cout_prevu: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="date_demande">Date de demande</Label>
              <Input
                id="date_demande"
                type="date"
                value={formData.date_demande}
                onChange={(e) => setFormData({ ...formData, date_demande: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="demandeur_id">Demandeur</Label>
            <Input
              id="demandeur_id"
              value={formData.demandeur_id}
              onChange={(e) => setFormData({ ...formData, demandeur_id: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="commentaires">Commentaires</Label>
            <Textarea
              id="commentaires"
              value={formData.commentaires}
              onChange={(e) => setFormData({ ...formData, commentaires: e.target.value })}
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
