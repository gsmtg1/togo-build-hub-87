
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ProductSelector } from '@/components/invoices/ProductSelector';
import { Quote, QuoteProduct } from '@/lib/database';

interface QuoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote: Quote | null;
  onSubmit: (data: Partial<Quote>) => void;
  isEditing: boolean;
}

export const QuoteDialog = ({ open, onOpenChange, quote, onSubmit, isEditing }: QuoteDialogProps) => {
  const [formData, setFormData] = useState({
    client_nom: '',
    client_telephone: '',
    client_adresse: '',
    date_devis: new Date().toISOString().split('T')[0],
    date_validite: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    statut: 'brouillon' as Quote['statut'],
    products: [] as QuoteProduct[],
  });

  useEffect(() => {
    if (quote && isEditing) {
      setFormData({
        client_nom: quote.client_nom,
        client_telephone: quote.client_telephone || '',
        client_adresse: quote.client_adresse || '',
        date_devis: quote.date_devis,
        date_validite: quote.date_validite || '',
        statut: quote.statut,
        products: (quote as any).products || [],
      });
    } else {
      setFormData({
        client_nom: '',
        client_telephone: '',
        client_adresse: '',
        date_devis: new Date().toISOString().split('T')[0],
        date_validite: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        statut: 'brouillon',
        products: [],
      });
    }
  }, [quote, isEditing, open]);

  const montant_total = formData.products.reduce((sum, product) => sum + product.totalPrice, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      montant_total,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Modifier le devis' : 'Nouveau devis'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client_nom">Nom du client</Label>
              <Input
                id="client_nom"
                value={formData.client_nom}
                onChange={(e) => setFormData(prev => ({ ...prev, client_nom: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="client_telephone">Téléphone</Label>
              <Input
                id="client_telephone"
                value={formData.client_telephone}
                onChange={(e) => setFormData(prev => ({ ...prev, client_telephone: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="client_adresse">Adresse</Label>
            <Textarea
              id="client_adresse"
              value={formData.client_adresse}
              onChange={(e) => setFormData(prev => ({ ...prev, client_adresse: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="date_devis">Date</Label>
              <Input
                id="date_devis"
                type="date"
                value={formData.date_devis}
                onChange={(e) => setFormData(prev => ({ ...prev, date_devis: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="date_validite">Valide jusqu'à</Label>
              <Input
                id="date_validite"
                type="date"
                value={formData.date_validite}
                onChange={(e) => setFormData(prev => ({ ...prev, date_validite: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="statut">Statut</Label>
              <Select value={formData.statut} onValueChange={(value) => setFormData(prev => ({ ...prev, statut: value as Quote['statut'] }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brouillon">Brouillon</SelectItem>
                  <SelectItem value="envoye">Envoyé</SelectItem>
                  <SelectItem value="accepte">Accepté</SelectItem>
                  <SelectItem value="refuse">Refusé</SelectItem>
                  <SelectItem value="expire">Expiré</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <ProductSelector 
            products={formData.products}
            onProductsChange={(products) => setFormData(prev => ({ ...prev, products }))}
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">
              {isEditing ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
