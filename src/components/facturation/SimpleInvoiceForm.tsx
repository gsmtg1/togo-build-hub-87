
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SimpleProductSelector } from './SimpleProductSelector';
import { Loader2, FileText, Eye, AlertCircle } from 'lucide-react';

interface ProductItem {
  id: string;
  nom: string;
  quantite: number;
  prix_unitaire: number;
  total_ligne: number;
}

interface SimpleInvoiceFormProps {
  onSubmit: (formData: any, products: any[]) => Promise<void>;
  onPreview?: (formData: any, products: any[]) => void;
  isLoading: boolean;
  initialData?: any;
}

export const SimpleInvoiceForm = ({ onSubmit, onPreview, isLoading, initialData }: SimpleInvoiceFormProps) => {
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
  const [formErrors, setFormErrors] = useState<string[]>([]);

  useEffect(() => {
    if (initialData) {
      setFormData({ ...formData, ...initialData });
    }
  }, [initialData]);

  const calculateTotals = () => {
    const sousTotal = products.reduce((sum, product) => sum + Number(product.total_ligne || 0), 0);
    const fraisLivraison = Number(formData.frais_livraison) || 0;
    const montantTotal = sousTotal + fraisLivraison;
    
    return { sousTotal, montantTotal };
  };

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!formData.client_nom.trim()) {
      errors.push('Le nom du client est obligatoire');
    }
    
    if (!formData.numero_facture.trim()) {
      errors.push('Le numéro de facture est obligatoire');
    }
    
    if (products.length === 0) {
      errors.push('Veuillez ajouter au moins un produit à la facture');
    }

    // Vérifier que tous les produits ont des données valides
    products.forEach((product, index) => {
      if (!product.nom.trim()) {
        errors.push(`Le produit ${index + 1} doit avoir un nom`);
      }
      if (product.quantite <= 0) {
        errors.push(`Le produit ${index + 1} doit avoir une quantité supérieure à 0`);
      }
      if (product.prix_unitaire < 0) {
        errors.push(`Le produit ${index + 1} ne peut pas avoir un prix négatif`);
      }
    });

    setFormErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      console.log('❌ Validation échouée:', formErrors);
      return;
    }

    const { sousTotal, montantTotal } = calculateTotals();
    
    const finalFormData = {
      ...formData,
      sous_total: sousTotal,
      montant_total: montantTotal
    };

    // Transformer les produits pour l'API avec nom de champ correct
    const transformedProducts = products.map(product => ({
      nom_produit: product.nom,
      quantite: product.quantite,
      prix_unitaire: product.prix_unitaire,
      total_ligne: product.total_ligne,
      product_id: product.id.startsWith('stock-') ? product.id.replace('stock-', '').split('-')[0] : null
    }));

    console.log('📋 Données finales pour soumission:', finalFormData);
    console.log('🛍️ Produits transformés pour API:', transformedProducts);

    try {
      await onSubmit(finalFormData, transformedProducts);
    } catch (error) {
      console.error('❌ Erreur lors de la soumission:', error);
    }
  };

  const handlePreview = () => {
    if (!validateForm()) {
      console.log('❌ Validation aperçu échouée:', formErrors);
      return;
    }

    const { sousTotal, montantTotal } = calculateTotals();
    
    const finalFormData = {
      ...formData,
      sous_total: sousTotal,
      montant_total: montantTotal
    };

    // Pour l'aperçu, utiliser le format attendu par le template
    const transformedProducts = products.map(product => ({
      nom_produit: product.nom,
      quantite: product.quantite,
      prix_unitaire: product.prix_unitaire,
      total_ligne: product.total_ligne
    }));

    console.log('👁️ Données aperçu:', finalFormData, transformedProducts);
    onPreview?.(finalFormData, transformedProducts);
  };

  const { sousTotal, montantTotal } = calculateTotals();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Affichage des erreurs */}
      {formErrors.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800 mb-2">Veuillez corriger les erreurs suivantes :</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                  {formErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
              className={formErrors.some(e => e.includes('numéro de facture')) ? 'border-red-300' : ''}
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
              className={formErrors.some(e => e.includes('nom du client')) ? 'border-red-300' : ''}
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
            <div className="space-y-3">
              <div className="flex justify-between text-lg">
                <span>Sous-total:</span>
                <span className="font-semibold">{sousTotal.toLocaleString()} FCFA</span>
              </div>
              
              {formData.frais_livraison > 0 && (
                <div className="flex justify-between text-lg">
                  <span>Frais de livraison:</span>
                  <span className="font-semibold">{Number(formData.frais_livraison).toLocaleString()} FCFA</span>
                </div>
              )}
              
              <div className="flex justify-between text-2xl font-bold text-orange-600 border-t pt-3">
                <span>TOTAL GÉNÉRAL:</span>
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

      {/* Boutons d'action */}
      <div className="flex justify-end gap-3">
        {onPreview && (
          <Button 
            type="button"
            onClick={handlePreview}
            disabled={products.length === 0}
            variant="outline"
            className="px-6"
          >
            <Eye className="mr-2 h-4 w-4" />
            Aperçu PDF
          </Button>
        )}
        
        <Button 
          type="submit" 
          disabled={isLoading || products.length === 0}
          className="px-8 bg-orange-600 hover:bg-orange-700"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? 'Création en cours...' : 'Créer la facture'}
        </Button>
      </div>
    </form>
  );
};
