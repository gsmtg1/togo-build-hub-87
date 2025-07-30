
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import type { Sale, SaleItem } from '@/types/database';

interface SaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sale: Sale | null;
  onSubmit: (data: Partial<Sale>) => void;
  isEditing: boolean;
}

interface SaleProductLocal {
  id: string;
  nom: string;
  quantite: number;
  prix_unitaire: number;
  total: number;
}

export const SaleDialog = ({ open, onOpenChange, sale, onSubmit, isEditing }: SaleDialogProps) => {
  const [formData, setFormData] = useState({
    client_nom: '',
    client_telephone: '',
    client_adresse: '',
    date_vente: new Date().toISOString().split('T')[0],
    statut: 'en_attente' as Sale['statut'],
    products: [] as SaleProductLocal[],
    commentaires: '',
  });

  useEffect(() => {
    if (sale && isEditing) {
      setFormData({
        client_nom: sale.client_nom,
        client_telephone: sale.client_telephone || '',
        client_adresse: sale.client_adresse || '',
        date_vente: sale.date_vente.split('T')[0],
        statut: sale.statut,
        products: [],
        commentaires: sale.commentaires || '',
      });
    } else {
      setFormData({
        client_nom: '',
        client_telephone: '',
        client_adresse: '',
        date_vente: new Date().toISOString().split('T')[0],
        statut: 'en_attente',
        products: [],
        commentaires: '',
      });
    }
  }, [sale, isEditing, open]);

  const addProduct = () => {
    setFormData(prev => ({
      ...prev,
      products: [...prev.products, {
        id: crypto.randomUUID(),
        nom: '',
        quantite: 1,
        prix_unitaire: 0,
        total: 0,
      }],
    }));
  };

  const removeProduct = (id: string) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== id),
    }));
  };

  const updateProduct = (id: string, updates: Partial<SaleProductLocal>) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.map(p => {
        if (p.id === id) {
          const updated = { ...p, ...updates };
          updated.total = updated.quantite * updated.prix_unitaire;
          return updated;
        }
        return p;
      }),
    }));
  };

  const totalAmount = formData.products.reduce((sum, product) => sum + product.total, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      client_nom: formData.client_nom,
      client_telephone: formData.client_telephone,
      client_adresse: formData.client_adresse,
      date_vente: formData.date_vente,
      statut: formData.statut,
      montant_total: totalAmount,
      commentaires: formData.commentaires,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Modifier la vente' : 'Nouvelle vente'}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date_vente">Date</Label>
              <Input
                id="date_vente"
                type="date"
                value={formData.date_vente}
                onChange={(e) => setFormData(prev => ({ ...prev, date_vente: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="statut">Statut</Label>
              <Select value={formData.statut} onValueChange={(value) => setFormData(prev => ({ ...prev, statut: value as Sale['statut'] }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en_attente">En attente</SelectItem>
                  <SelectItem value="confirmee">Confirmée</SelectItem>
                  <SelectItem value="annulee">Annulée</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="commentaires">Commentaires</Label>
            <Textarea
              id="commentaires"
              value={formData.commentaires}
              onChange={(e) => setFormData(prev => ({ ...prev, commentaires: e.target.value }))}
            />
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
                      value={product.nom}
                      onChange={(e) => updateProduct(product.id, { nom: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="Qté"
                      value={product.quantite}
                      onChange={(e) => updateProduct(product.id, { quantite: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="Prix unitaire"
                      value={product.prix_unitaire}
                      onChange={(e) => updateProduct(product.id, { prix_unitaire: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="Total"
                      value={product.total}
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
                Total: {totalAmount.toLocaleString()} FCFA
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
