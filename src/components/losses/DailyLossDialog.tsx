
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
    quantite_cassee: '',
    date_perte: new Date().toISOString().split('T')[0],
    motif: '',
    responsable: '',
    commentaire: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const selectedProduct = products.find(p => p.id === formData.product_id);
      const valeurPerte = selectedProduct ? selectedProduct.prix_unitaire * parseInt(formData.quantite_cassee) : 0;
      
      await onSubmit({
        product_id: formData.product_id,
        quantite_cassee: parseInt(formData.quantite_cassee),
        date_perte: formData.date_perte,
        motif: formData.motif,
        valeur_perte: valeurPerte,
        responsable: formData.responsable,
        commentaire: formData.commentaire
      });
      
      // Reset form
      setFormData({
        product_id: '',
        quantite_cassee: '',
        date_perte: new Date().toISOString().split('T')[0],
        motif: '',
        responsable: '',
        commentaire: ''
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
                    {product.nom} - {product.longueur_cm}x{product.largeur_cm}x{product.hauteur_cm}cm
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="quantite_cassee">Quantité cassée</Label>
            <Input
              id="quantite_cassee"
              type="number"
              min="1"
              value={formData.quantite_cassee}
              onChange={(e) => setFormData(prev => ({ ...prev, quantite_cassee: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="date_perte">Date de la perte</Label>
            <Input
              id="date_perte"
              type="date"
              value={formData.date_perte}
              onChange={(e) => setFormData(prev => ({ ...prev, date_perte: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="motif">Motif de la perte</Label>
            <Input
              id="motif"
              value={formData.motif}
              onChange={(e) => setFormData(prev => ({ ...prev, motif: e.target.value }))}
              placeholder="Casse, défaut de fabrication..."
            />
          </div>

          <div>
            <Label htmlFor="responsable">Responsable</Label>
            <Input
              id="responsable"
              value={formData.responsable}
              onChange={(e) => setFormData(prev => ({ ...prev, responsable: e.target.value }))}
              placeholder="Nom du responsable"
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
