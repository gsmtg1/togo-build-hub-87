
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useStockMovements, useProductsWithStock } from '@/hooks/useSupabaseDatabase';

interface StockMovementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedProduct?: any;
  onClose: () => void;
}

export const StockMovementDialog = ({ open, onOpenChange, selectedProduct, onClose }: StockMovementDialogProps) => {
  const { create } = useStockMovements();
  const { products } = useProductsWithStock();
  const [formData, setFormData] = useState({
    product_id: '',
    type: '',
    quantite: '',
    motif: '',
    commentaire: ''
  });

  useEffect(() => {
    if (selectedProduct) {
      setFormData(prev => ({ ...prev, product_id: selectedProduct.id }));
    }
  }, [selectedProduct]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await create({
        product_id: formData.product_id,
        type: formData.type,
        quantite: parseInt(formData.quantite),
        motif: formData.motif,
        commentaire: formData.commentaire,
        date_mouvement: new Date().toISOString()
      });
      
      setFormData({
        product_id: '',
        type: '',
        quantite: '',
        motif: '',
        commentaire: ''
      });
      onClose();
    } catch (error) {
      console.error('Erreur lors de la création du mouvement:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Mouvement de stock</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="product_id">Produit</Label>
            <Select 
              value={formData.product_id} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, product_id: value }))}
              disabled={!!selectedProduct}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un produit" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.nom} - Stock: {product.stock_actuel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="type">Type de mouvement</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entree">➕ Entrée (ajout stock)</SelectItem>
                <SelectItem value="sortie">➖ Sortie (retrait stock)</SelectItem>
                <SelectItem value="ajustement">🔄 Ajustement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="quantite">Quantité</Label>
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
            <Label htmlFor="motif">Motif</Label>
            <Input
              id="motif"
              value={formData.motif}
              onChange={(e) => setFormData(prev => ({ ...prev, motif: e.target.value }))}
              placeholder="Raison du mouvement"
            />
          </div>

          <div>
            <Label htmlFor="commentaire">Commentaire</Label>
            <Textarea
              id="commentaire"
              value={formData.commentaire}
              onChange={(e) => setFormData(prev => ({ ...prev, commentaire: e.target.value }))}
              placeholder="Détails supplémentaires..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              Enregistrer mouvement
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
