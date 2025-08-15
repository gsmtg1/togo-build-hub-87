
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SimpleProductSelector } from './SimpleProductSelector';
import { useClientsComplets } from '@/hooks/useFacturationDatabase';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface ProductItem {
  id: string;
  nom: string;
  quantite: number;
  prix_unitaire: number;
  total_ligne: number;
}

interface SimpleInvoiceFormProps {
  onSubmit: (formData: any, products: ProductItem[]) => void;
  isLoading: boolean;
  initialData?: any;
}

export const SimpleInvoiceForm = ({ onSubmit, isLoading, initialData }: SimpleInvoiceFormProps) => {
  const { data: clients } = useClientsComplets();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    numero_facture: '',
    client_id: '',
    client_nom: '',
    client_telephone: '',
    client_adresse: '',
    date_facture: new Date().toISOString().split('T')[0],
    date_echeance: '',
    mode_livraison: 'retrait_usine',
    frais_livraison: 0,
    adresse_livraison: '',
    commentaires: '',
    statut: 'brouillon' as const,
    remise_montant: 0
  });

  // Initialiser les données si édition
  useEffect(() => {
    if (initialData) {
      console.log('🔄 Initialisation avec données existantes:', initialData);
      setFormData({
        numero_facture: initialData.numero_facture || '',
        client_id: initialData.client_id || '',
        client_nom: initialData.client_nom || '',
        client_telephone: initialData.client_telephone || '',
        client_adresse: initialData.client_adresse || '',
        date_facture: initialData.date_facture || new Date().toISOString().split('T')[0],
        date_echeance: initialData.date_echeance || '',
        mode_livraison: initialData.mode_livraison || 'retrait_usine',
        frais_livraison: initialData.frais_livraison || 0,
        adresse_livraison: initialData.adresse_livraison || '',
        commentaires: initialData.commentaires || '',
        statut: initialData.statut || 'brouillon',
        remise_montant: initialData.remise_globale_montant || 0
      });
      
      if (initialData.facture_items) {
        const mappedProducts = initialData.facture_items.map((item: any) => ({
          id: `item-${item.id}`,
          nom: item.nom_produit,
          quantite: item.quantite,
          prix_unitaire: item.prix_unitaire,
          total_ligne: item.total_ligne
        }));
        setProducts(mappedProducts);
      }
    } else {
      // Générer numéro de facture automatique
      const numeroFacture = `FAC-${Date.now().toString().slice(-6)}`;
      setFormData(prev => ({ ...prev, numero_facture: numeroFacture }));
    }
  }, [initialData]);

  // Calculer totaux
  const calculateTotals = () => {
    const sousTotal = products.reduce((sum, p) => sum + p.total_ligne, 0);
    const montantRemise = formData.remise_montant;
    const totalAvecRemise = sousTotal - montantRemise;
    const fraisLivraison = formData.mode_livraison === 'livraison_payante' ? formData.frais_livraison : 0;
    const totalFinal = totalAvecRemise + fraisLivraison;

    return {
      sousTotal,
      montantRemise,
      totalAvecRemise,
      fraisLivraison,
      totalFinal
    };
  };

  // Validation du formulaire
  const validateForm = (): string[] => {
    const newErrors: string[] = [];
    
    if (!formData.numero_facture.trim()) {
      newErrors.push('Le numéro de facture est requis');
    }
    
    if (!formData.client_nom.trim()) {
      newErrors.push('Le nom du client est requis');
    }
    
    if (!formData.date_facture) {
      newErrors.push('La date de facture est requise');
    }
    
    if (products.length === 0) {
      newErrors.push('Au moins un produit doit être ajouté');
    }
    
    products.forEach((product, index) => {
      if (!product.nom.trim()) {
        newErrors.push(`Le produit ${index + 1} doit avoir un nom`);
      }
      if (product.quantite <= 0) {
        newErrors.push(`Le produit ${index + 1} doit avoir une quantité > 0`);
      }
      if (product.prix_unitaire < 0) {
        newErrors.push(`Le produit ${index + 1} ne peut pas avoir un prix négatif`);
      }
    });
    
    return newErrors;
  };

  // Sélection client
  const handleClientChange = (clientId: string) => {
    const client = clients?.find(c => c.id === clientId);
    if (client) {
      setFormData(prev => ({
        ...prev,
        client_id: clientId,
        client_nom: client.nom_complet,
        client_telephone: client.telephone || '',
        client_adresse: client.adresse || ''
      }));
    }
  };

  // Soumission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('📝 Tentative de soumission...');
    console.log('Données formulaire:', formData);
    console.log('Produits:', products);
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      console.log('❌ Erreurs de validation:', validationErrors);
      setErrors(validationErrors);
      return;
    }
    
    setErrors([]);
    const totals = calculateTotals();
    
    const invoiceData = {
      ...formData,
      montant_total: totals.totalFinal,
      sous_total: totals.sousTotal,
      remise_globale_montant: totals.montantRemise,
      frais_livraison: totals.fraisLivraison
    };

    console.log('✅ Données finales:', invoiceData);
    onSubmit(invoiceData, products);
  };

  const totals = calculateTotals();
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Erreurs */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Informations de base */}
      <Card>
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="numero_facture">Numéro de facture *</Label>
            <Input
              id="numero_facture"
              value={formData.numero_facture}
              onChange={(e) => setFormData(prev => ({ ...prev, numero_facture: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="date_facture">Date de facture *</Label>
            <Input
              id="date_facture"
              type="date"
              value={formData.date_facture}
              onChange={(e) => setFormData(prev => ({ ...prev, date_facture: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="date_echeance">Date d'échéance</Label>
            <Input
              id="date_echeance"
              type="date"
              value={formData.date_echeance}
              onChange={(e) => setFormData(prev => ({ ...prev, date_echeance: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Informations client */}
      <Card>
        <CardHeader>
          <CardTitle>Informations client</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="client_id">Client existant</Label>
            <Select value={formData.client_id} onValueChange={handleClientChange}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un client" />
              </SelectTrigger>
              <SelectContent>
                {clients?.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.nom_complet}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="client_nom">Nom du client *</Label>
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
            />
          </div>

          <div>
            <Label htmlFor="client_adresse">Adresse</Label>
            <Input
              id="client_adresse"
              value={formData.client_adresse}
              onChange={(e) => setFormData(prev => ({ ...prev, client_adresse: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sélection des produits */}
      <SimpleProductSelector
        products={products}
        onProductsChange={setProducts}
      />

      {/* Options de livraison et totaux */}
      {products.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Options et totaux</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="mode_livraison">Mode de livraison</Label>
                <Select 
                  value={formData.mode_livraison} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, mode_livraison: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="retrait_usine">Retrait à l'usine</SelectItem>
                    <SelectItem value="livraison_gratuite">Livraison gratuite</SelectItem>
                    <SelectItem value="livraison_payante">Livraison payante</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="remise_montant">Remise (montant)</Label>
                <Input
                  id="remise_montant"
                  type="number"
                  value={formData.remise_montant}
                  onChange={(e) => setFormData(prev => ({ ...prev, remise_montant: parseFloat(e.target.value) || 0 }))}
                  min="0"
                />
              </div>

              {formData.mode_livraison === 'livraison_payante' && (
                <div>
                  <Label htmlFor="frais_livraison">Frais de livraison</Label>
                  <Input
                    id="frais_livraison"
                    type="number"
                    value={formData.frais_livraison}
                    onChange={(e) => setFormData(prev => ({ ...prev, frais_livraison: parseFloat(e.target.value) || 0 }))}
                    min="0"
                  />
                </div>
              )}
            </div>

            {(formData.mode_livraison === 'livraison_gratuite' || formData.mode_livraison === 'livraison_payante') && (
              <div>
                <Label htmlFor="adresse_livraison">Adresse de livraison</Label>
                <Input
                  id="adresse_livraison"
                  value={formData.adresse_livraison}
                  onChange={(e) => setFormData(prev => ({ ...prev, adresse_livraison: e.target.value }))}
                  placeholder="Adresse complète de livraison"
                />
              </div>
            )}

            {/* Récapitulatif des totaux */}
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Sous-total:</span>
                  <span className="font-semibold">{formatCurrency(totals.sousTotal)}</span>
                </div>
                
                {totals.montantRemise > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Remise:</span>
                    <span>-{formatCurrency(totals.montantRemise)}</span>
                  </div>
                )}
                
                {totals.fraisLivraison > 0 && (
                  <div className="flex justify-between">
                    <span>Frais de livraison:</span>
                    <span>{formatCurrency(totals.fraisLivraison)}</span>
                  </div>
                )}
                
                <hr className="border-orange-300" />
                <div className="flex justify-between font-bold text-lg text-orange-600">
                  <span>Total:</span>
                  <span>{formatCurrency(totals.totalFinal)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Commentaires */}
      <Card>
        <CardContent className="pt-6">
          <Label htmlFor="commentaires">Commentaires</Label>
          <Textarea
            id="commentaires"
            value={formData.commentaires}
            onChange={(e) => setFormData(prev => ({ ...prev, commentaires: e.target.value }))}
            placeholder="Notes supplémentaires..."
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Bouton de soumission */}
      <div className="flex justify-end pt-4">
        <Button 
          type="submit" 
          disabled={isLoading || products.length === 0}
          className="bg-orange-500 hover:bg-orange-600"
          size="lg"
        >
          {isLoading ? 'Création en cours...' : 'Créer la facture'}
        </Button>
      </div>
    </form>
  );
};
