
import { useState } from 'react';
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
  onSubmit?: (orderData: any) => Promise<void>;
}

export const ProductionOrderDialog = ({ open, onOpenChange, onSubmit }: ProductionOrderDialogProps) => {
  const { data: products } = useProducts();
  
  const [formData, setFormData] = useState({
    product_id: '',
    quantite: '',
    date_demande: new Date().toISOString().split('T')[0],
    date_prevue: '',
    commentaires: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSubmit) return;
    
    try {
      await onSubmit({
        numero_ordre: `OP-${Date.now()}`,
        product_id: formData.product_id,
        quantite: parseInt(formData.quantite),
        date_demande: formData.date_demande,
        date_prevue: formData.date_prevue || null,
        statut: 'en_attente',
        commentaires: formData.commentaires
      });
      
      // Reset form
      setFormData({
        product_id: '',
        quantite: '',
        date_demande: new Date().toISOString().split('T')[0],
        date_prevue: '',
        commentaires: ''
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Erreur lors de la création de l\'ordre de production:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>🏭 Nouvel ordre de production</DialogTitle>
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
                    {product.nom} - {product.longueur_cm}x{product.largeur_cm}x{product.hauteur_cm}cm
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="quantite">Quantité à produire</Label>
            <Input
              id="quantite"
              type="number"
              min="1"
              value={formData.quantite}
              onChange={(e) => setFormData(prev => ({ ...prev, quantite: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="date_demande">Date de demande</Label>
            <Input
              id="date_demande"
              type="date"
              value={formData.date_demande}
              onChange={(e) => setFormData(prev => ({ ...prev, date_demande: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="date_prevue">Date prévue de fin</Label>
            <Input
              id="date_prevue"
              type="date"
              value={formData.date_prevue}
              onChange={(e) => setFormData(prev => ({ ...prev, date_prevue: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="commentaires">Commentaires</Label>
            <Textarea
              id="commentaires"
              value={formData.commentaires}
              onChange={(e) => setFormData(prev => ({ ...prev, commentaires: e.target.value }))}
              placeholder="Instructions spéciales, observations..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">
              Créer l'ordre
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
