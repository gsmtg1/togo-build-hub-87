
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useProducts } from '@/hooks/useSupabaseDatabase';

interface DailyLossDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (lossData: any) => Promise<void>;
}

export const DailyLossDialog = ({ open, onOpenChange, onSubmit }: DailyLossDialogProps) => {
  const { data: products } = useProducts();
  
  const [formData, setFormData] = useState({
    product_id: '',
    quantity_lost: '',
    loss_date: new Date().toISOString().split('T')[0],
    loss_type: '',
    responsible: '',
    comments: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const selectedProduct = products.find(p => p.id === formData.product_id);
      const lossValue = selectedProduct ? selectedProduct.price * parseInt(formData.quantity_lost) : 0;
      
      await onSubmit({
        product_id: formData.product_id,
        quantity_lost: parseInt(formData.quantity_lost),
        loss_date: formData.loss_date,
        loss_type: formData.loss_type,
        loss_value: lossValue,
        responsible: formData.responsible,
        comments: formData.comments
      });
      
      // Reset form
      setFormData({
        product_id: '',
        quantity_lost: '',
        loss_date: new Date().toISOString().split('T')[0],
        loss_type: '',
        responsible: '',
        comments: ''
      });
    } catch (error) {
      console.error('Erreur lors de la création de la perte:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>📉 Nouvelle perte</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="product_id">Produit</Label>
            <Select value={formData.product_id} onValueChange={(value) => setFormData(prev => ({ ...prev, product_id: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un produit" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name || product.nom} - {product.dimensions}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="quantity_lost">Quantité perdue</Label>
            <Input
              id="quantity_lost"
              type="number"
              min="1"
              value={formData.quantity_lost}
              onChange={(e) => setFormData(prev => ({ ...prev, quantity_lost: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="loss_date">Date de la perte</Label>
            <Input
              id="loss_date"
              type="date"
              value={formData.loss_date}
              onChange={(e) => setFormData(prev => ({ ...prev, loss_date: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="loss_type">Type de perte</Label>
            <Select value={formData.loss_type} onValueChange={(value) => setFormData(prev => ({ ...prev, loss_type: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="casse">Casse</SelectItem>
                <SelectItem value="defaut_fabrication">Défaut de fabrication</SelectItem>
                <SelectItem value="transport">Dommage transport</SelectItem>
                <SelectItem value="stockage">Problème de stockage</SelectItem>
                <SelectItem value="autre">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="responsible">Responsable</Label>
            <Input
              id="responsible"
              value={formData.responsible}
              onChange={(e) => setFormData(prev => ({ ...prev, responsible: e.target.value }))}
              placeholder="Nom du responsable"
            />
          </div>

          <div>
            <Label htmlFor="comments">Commentaire</Label>
            <Textarea
              id="comments"
              value={formData.comments}
              onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
              placeholder="Détails supplémentaires..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">
              Enregistrer la perte
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
