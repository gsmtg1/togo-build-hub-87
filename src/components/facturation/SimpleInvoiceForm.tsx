
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SimpleProductSelector } from './SimpleProductSelector';
import { useClientsComplets } from '@/hooks/useFacturationDatabase';

interface Product {
  id: string;
  nom: string;
  quantite: number;
  prix_unitaire: number;
  total_ligne: number;
}

interface SimpleInvoiceFormProps {
  onSubmit: (formData: any, products: Product[]) => void;
  onPreview?: (formData: any, products: Product[]) => void;
  isLoading: boolean;
  initialData?: any;
  type?: 'facture' | 'devis';
}

export const SimpleInvoiceForm = ({ 
  onSubmit, 
  onPreview, 
  isLoading, 
  initialData,
  type = 'facture'
}: SimpleInvoiceFormProps) => {
  const { data: clients } = useClientsComplets();
  const [products, setProducts] = useState<Product[]>([]);
  
  const [formData, setFormData] = useState({
    numero_facture: '',
    client_id: '',
    client_nom: '',
    client_telephone: '',
    client_adresse: '',
    date_facture: new Date().toISOString().split('T')[0],
    date_echeance: '',
    remise_pourcentage: 0,
    remise_montant: 0,
    mode_livraison: 'retrait_usine',
    frais_livraison: 0,
    adresse_livraison: '',
    commentaires: '',
    statut: 'brouillon' as const
  });

  // Initialize form data
  useEffect(() => {
    if (initialData) {
      setFormData({
        numero_facture: initialData.numero_facture || '',
        client_id: initialData.client_id || '',
        client_nom: initialData.client_nom || '',
        client_telephone: initialData.client_telephone || '',
        client_adresse: initialData.client_adresse || '',
        date_facture: initialData.date_facture || new Date().toISOString().split('T')[0],
        date_echeance: initialData.date_echeance || '',
        remise_pourcentage: initialData.remise_globale_pourcentage || 0,
        remise_montant: initialData.remise_globale_montant || 0,
        mode_livraison: initialData.mode_livraison || 'retrait_usine',
        frais_livraison: initialData.frais_livraison || 0,
        adresse_livraison: initialData.adresse_livraison || '',
        commentaires: initialData.commentaires || '',
        statut: initialData.statut || 'brouillon'
      });
      
      if (initialData.facture_items || initialData.devis_items) {
        const items = type === 'facture' ? initialData.facture_items : initialData.devis_items;
        if (items) {
          const mappedProducts = items.map((item: any) => ({
            id: item.product_id || `item-${item.id}`,
            nom: item.nom_produit,
            quantite: item.quantite,
            prix_unitaire: item.prix_unitaire,
            total_ligne: item.total_ligne
          }));
          setProducts(mappedProducts);
        }
      }
    } else {
      const prefix = type === 'facture' ? 'FAC' : 'DEV';
      const numeroDocument = `${prefix}-${Date.now().toString().slice(-6)}`;
      setFormData(prev => ({ ...prev, numero_facture: numeroDocument }));
    }
  }, [initialData, type]);

  const calculateTotals = () => {
    const sousTotal = products.reduce((sum, p) => sum + p.total_ligne, 0);
    const montantRemise = formData.remise_pourcentage > 0 
      ? (sousTotal * formData.remise_pourcentage) / 100 
      : formData.remise_montant;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const totals = calculateTotals();
    
    const documentData = {
      ...formData,
      montant_total: totals.totalFinal,
      sous_total: totals.sousTotal,
      remise_globale_montant: totals.montantRemise,
      remise_globale_pourcentage: formData.remise_pourcentage,
      frais_livraison: totals.fraisLivraison
    };

    onSubmit(documentData, products);
  };

  const handlePreview = () => {
    if (onPreview) {
      const totals = calculateTotals();
      
      const documentData = {
        ...formData,
        montant_total: totals.totalFinal,
        sous_total: totals.sousTotal,
        remise_globale_montant: totals.montantRemise,
        remise_globale_pourcentage: formData.remise_pourcentage,
        frais_livraison: totals.fraisLivraison
      };

      onPreview(documentData, products);
    }
  };

  const totals = calculateTotals();
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const documentLabel = type === 'facture' ? 'facture' : 'devis';
  const documentTitle = type === 'facture' ? 'Facture' : 'Devis';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="numero_facture">Numéro de {documentLabel} *</Label>
          <Input
            id="numero_facture"
            value={formData.numero_facture}
            onChange={(e) => setFormData(prev => ({ ...prev, numero_facture: e.target.value }))}
            required
          />
        </div>

        <div>
          <Label htmlFor="date_facture">Date de {documentLabel} *</Label>
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
      </div>

      {/* Client information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-orange-600">Informations client</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>
      </div>

      {/* Products */}
      <SimpleProductSelector
        products={products}
        onProductsChange={setProducts}
      />

      {/* Billing options */}
      {products.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-orange-600">Options de facturation</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="remise_pourcentage">Remise (%)</Label>
              <Input
                id="remise_pourcentage"
                type="number"
                value={formData.remise_pourcentage}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  remise_pourcentage: parseFloat(e.target.value) || 0,
                  remise_montant: 0
                }))}
                min="0"
                max="100"
                step="0.1"
              />
            </div>

            <div>
              <Label htmlFor="remise_montant">Remise (montant)</Label>
              <Input
                id="remise_montant"
                type="number"
                value={formData.remise_montant}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  remise_montant: parseFloat(e.target.value) || 0,
                  remise_pourcentage: 0
                }))}
                min="0"
              />
            </div>

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

          {/* Totals summary */}
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
        </div>
      )}

      {/* Comments */}
      <div>
        <Label htmlFor="commentaires">Commentaires</Label>
        <Textarea
          id="commentaires"
          value={formData.commentaires}
          onChange={(e) => setFormData(prev => ({ ...prev, commentaires: e.target.value }))}
          placeholder="Notes supplémentaires..."
          rows={3}
        />
      </div>

      {/* Submit buttons */}
      <div className="flex justify-between pt-4">
        {onPreview && (
          <Button 
            type="button" 
            variant="outline"
            onClick={handlePreview}
            disabled={isLoading}
          >
            Aperçu
          </Button>
        )}
        
        <Button 
          type="submit" 
          disabled={isLoading}
          className="bg-orange-500 hover:bg-orange-600 ml-auto"
        >
          {isLoading ? 'Création...' : `Créer ${documentTitle.toLowerCase()}`}
        </Button>
      </div>
    </form>
  );
};
