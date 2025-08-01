
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
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

  const addProduct = () => {
    setFormData(prev => ({
      ...prev,
      products: [...prev.products, {
        id: crypto.randomUUID(),
        name: '',
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0,
      }],
    }));
  };

  const removeProduct = (id: string) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== id),
    }));
  };

  const updateProduct = (id: string, updates: Partial<QuoteProduct>) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.map(p => {
        if (p.id === id) {
          const updated = { ...p, ...updates };
          updated.totalPrice = updated.quantity * updated.unitPrice;
          return updated;
        }
        return p;
      }),
    }));
  };

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
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
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

          <div>
            <div className="flex justify-between items-center mb-4">
              <Label>Produits</Label>
              <Button type="button" onClick={addProduct} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un produit
              </Button>
            </div>

            <div className="space-y-2">
              {formData.products.map((product) => (
                <div key={product.id} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-4">
                    <Input
                      placeholder="Nom du produit"
                      value={product.name}
                      onChange={(e) => updateProduct(product.id, { name: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="Qté"
                      value={product.quantity}
                      onChange={(e) => updateProduct(product.id, { quantity: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="Prix unitaire"
                      value={product.unitPrice}
                      onChange={(e) => updateProduct(product.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="Total"
                      value={product.totalPrice}
                      readOnly
                    />
                  </div>
                  <div className="col-span-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeProduct(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-muted rounded-lg">
              <div className="text-lg font-semibold">
                Total: {montant_total.toLocaleString()} FCFA
              </div>
            </div>
          </div>

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
