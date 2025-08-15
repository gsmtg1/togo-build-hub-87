
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SimpleProductSelector } from './SimpleProductSelector';
import { Loader2, FileText } from 'lucide-react';

interface ProductItem {
  id: string;
  nom: string;
  quantite: number;
  prix_unitaire: number;
  total_ligne: number;
}

interface SimpleInvoiceFormProps {
  onSubmit: (formData: any, products: any[]) => Promise<void>;
  isLoading: boolean;
  initialData?: any;
}

export const SimpleInvoiceForm = ({ onSubmit, isLoading, initialData }: SimpleInvoiceFormProps) => {
  const [formData, setFormData] = useState({
    numero_facture: `FAC-${Date.now().toString().slice(-6)}`,
    client_nom: '',
    client_telephone: '',
    client_adresse: '',
    date_facture: new Date().toISOString().split('T')[0],
    date_echeance: '',
    statut: 'brouillon',
    commentaires: '',
    mode_livraison: 'retrait_usine',
    frais_livraison: 0,
    adresse_livraison: ''
  });

  const [products, setProducts] = useState<ProductItem[]>([]);

  useEffect(() => {
    if (initialData) {
      setFormData({ ...formData, ...initialData });
    }
  }, [initialData]);

  const calculateTotals = () => {
    const sousTotal = products.reduce((sum, product) => sum + product.total_ligne, 0);
    const fraisLivraison = Number(formData.frais_livraison) || 0;
    const montantTotal = sousTotal + fraisLivraison;
    
    return { sousTotal, montantTotal };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.client_nom.trim()) {
      alert('Le nom du client est obligatoire');
      return;
    }
    
    if (products.length === 0) {
      alert('Veuillez ajouter au moins un produit');
      return;
    }

    const { sousTotal, montantTotal } = calculateTotals();
    
    const finalFormData = {
      ...formData,
      sous_total: sousTotal,
      montant_total: montantTotal
    };

    try {
      await onSubmit(finalFormData, products);
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    }
  };

  const { sousTotal, montantTotal } = calculateTotals();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informations de la facture */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Informations de la facture
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="numero_facture">Numéro de facture *</Label>
            <Input
              id="numero_facture"
              value={formData.numero_facture}
              onChange={(e) => setFormData({ ...formData, numero_facture: e.target.value })}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="date_facture">Date de facture</Label>
            <Input
              id="date_facture"
              type="date"
              value={formData.date_facture}
              onChange={(e) => setFormData({ ...formData, date_facture: e.target.value })}
            />
          </div>
          
          <div>
            <Label htmlFor="date_echeance">Date d'échéance</Label>
            <Input
              id="date_echeance"
              type="date"
              value={formData.date_echeance}
              onChange={(e) => setFormData({ ...formData, date_echeance: e.target.value })}
            />
          </div>
          
          <div>
            <Label htmlFor="statut">Statut</Label>
            <select
              id="statut"
              value={formData.statut}
              onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
              className="w-full p-2 border rounded-md"
            >
              <option value="brouillon">Brouillon</option>
              <option value="envoye">Envoyé</option>
              <option value="paye">Payé</option>
              <option value="annule">Annulé</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Informations client */}
      <Card>
        <CardHeader>
          <CardTitle>Informations client</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="client_nom">Nom du client *</Label>
            <Input
              id="client_nom"
              value={formData.client_nom}
              onChange={(e) => setFormData({ ...formData, client_nom: e.target.value })}
              required
              placeholder="Nom complet du client"
            />
          </div>
          
          <div>
            <Label htmlFor="client_telephone">Téléphone</Label>
            <Input
              id="client_telephone"
              value={formData.client_telephone}
              onChange={(e) => setFormData({ ...formData, client_telephone: e.target.value })}
              placeholder="+228 XX XX XX XX"
            />
          </div>
          
          <div>
            <Label htmlFor="mode_livraison">Mode de livraison</Label>
            <select
              id="mode_livraison"
              value={formData.mode_livraison}
              onChange={(e) => setFormData({ ...formData, mode_livraison: e.target.value })}
              className="w-full p-2 border rounded-md"
            >
              <option value="retrait_usine">Retrait à l'usine</option>
              <option value="livraison_gratuite">Livraison gratuite</option>
              <option value="livraison_payante">Livraison payante</option>
            </select>
          </div>
          
          <div className="md:col-span-2">
            <Label htmlFor="client_adresse">Adresse client</Label>
            <Textarea
              id="client_adresse"
              value={formData.client_adresse}
              onChange={(e) => setFormData({ ...formData, client_adresse: e.target.value })}
              rows={2}
              placeholder="Adresse complète du client"
            />
          </div>
          
          {formData.mode_livraison === 'livraison_payante' && (
            <>
              <div>
                <Label htmlFor="frais_livraison">Frais de livraison (FCFA)</Label>
                <Input
                  id="frais_livraison"
                  type="number"
                  value={formData.frais_livraison}
                  onChange={(e) => setFormData({ ...formData, frais_livraison: Number(e.target.value) })}
                  min="0"
                />
              </div>
              
              <div>
                <Label htmlFor="adresse_livraison">Adresse de livraison</Label>
                <Input
                  id="adresse_livraison"
                  value={formData.adresse_livraison}
                  onChange={(e) => setFormData({ ...formData, adresse_livraison: e.target.value })}
                  placeholder="Si différente de l'adresse client"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Sélection des produits */}
      <SimpleProductSelector
        products={products}
        onProductsChange={setProducts}
      />

      {/* Totaux */}
      {products.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Sous-total:</span>
                <span className="font-semibold">{sousTotal.toLocaleString()} FCFA</span>
              </div>
              
              {formData.frais_livraison > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Frais de livraison:</span>
                  <span className="font-semibold">{Number(formData.frais_livraison).toLocaleString()} FCFA</span>
                </div>
              )}
              
              <div className="flex justify-between text-lg font-bold text-green-600 border-t pt-2">
                <span>TOTAL:</span>
                <span>{montantTotal.toLocaleString()} FCFA</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Commentaires */}
      <Card>
        <CardHeader>
          <CardTitle>Commentaires</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.commentaires}
            onChange={(e) => setFormData({ ...formData, commentaires: e.target.value })}
            rows={3}
            placeholder="Commentaires ou notes additionnelles..."
          />
        </CardContent>
      </Card>

      {/* Bouton de soumission */}
      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={isLoading || products.length === 0}
          className="px-8"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Créer la facture
        </Button>
      </div>
    </form>
  );
};
