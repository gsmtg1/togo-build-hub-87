
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon, Plus } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { SimpleProductSelector } from './SimpleProductSelector';
import { NumberGenerator } from '@/utils/numberGenerator';

interface ProductItem {
  id: string;
  nom: string;
  quantite: number;
  prix_unitaire: number;
  total_ligne: number;
}

interface SimpleInvoiceFormProps {
  onSubmit: (invoiceData: any, products: any[]) => void;
  initialData?: any;
  type?: 'facture' | 'devis';
}

export const SimpleInvoiceFormWithVAT = ({ 
  onSubmit, 
  initialData, 
  type = 'facture' 
}: SimpleInvoiceFormProps) => {
  const [formData, setFormData] = useState({
    numero_facture: initialData?.numero_facture || '',
    client_nom: initialData?.client_nom || '',
    client_telephone: initialData?.client_telephone || '',
    client_adresse: initialData?.client_adresse || '',
    date_facture: initialData?.date_facture ? new Date(initialData.date_facture) : new Date(),
    date_echeance: initialData?.date_echeance ? new Date(initialData.date_echeance) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    statut: initialData?.statut || 'brouillon',
    commentaires: initialData?.commentaires || '',
    mode_livraison: initialData?.mode_livraison || 'retrait_usine',
    frais_livraison: initialData?.frais_livraison || 0,
    adresse_livraison: initialData?.adresse_livraison || '',
    remise_globale_montant: initialData?.remise_globale_montant || 0,
    tva_applicable: initialData?.tva_applicable || false,
    taux_tva: initialData?.taux_tva || 18,
  });

  const [products, setProducts] = useState<ProductItem[]>(initialData?.products || []);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [isEcheanceOpen, setIsEcheanceOpen] = useState(false);

  // Generate invoice number on component mount if not provided
  useEffect(() => {
    const initializeInvoiceNumber = async () => {
      if (!formData.numero_facture) {
        try {
          const numero = await NumberGenerator.generateInvoiceNumber();
          setFormData(prev => ({ ...prev, numero_facture: numero }));
        } catch (error) {
          console.error('Erreur génération numéro facture:', error);
        }
      }
    };

    initializeInvoiceNumber();
  }, [formData.numero_facture]);

  // Calculs avec TVA
  const calculateTotals = () => {
    const sousTotal = products.reduce((sum, product) => sum + product.total_ligne, 0);
    const montantTva = formData.tva_applicable ? (sousTotal * formData.taux_tva / 100) : 0;
    const montantRemise = Number(formData.remise_globale_montant) || 0;
    const fraisLivraison = Number(formData.frais_livraison) || 0;
    const montantTotal = sousTotal + montantTva + fraisLivraison - montantRemise;

    return {
      sousTotal,
      montantTva,
      montantRemise,
      fraisLivraison,
      montantTotal
    };
  };

  const { sousTotal, montantTva, montantRemise, fraisLivraison, montantTotal } = calculateTotals();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (products.length === 0) {
      alert('Veuillez ajouter au moins un produit');
      return;
    }

    const invoiceData = {
      ...formData,
      date_facture: format(formData.date_facture, 'yyyy-MM-dd'),
      date_echeance: format(formData.date_echeance, 'yyyy-MM-dd'),
      sous_total: sousTotal,
      montant_tva: montantTva,
      montant_total: montantTotal,
    };

    const formattedProducts = products.map(product => ({
      nom_produit: product.nom,
      quantite: product.quantite,
      prix_unitaire: product.prix_unitaire,
      total_ligne: product.total_ligne,
      product_id: null
    }));

    onSubmit(invoiceData, formattedProducts);
  };

  // Convert ProductItem[] to the format expected by SimpleProductSelector
  const convertToSelectorProducts = (items: ProductItem[]) => {
    return items.map(item => ({
      id: item.id,
      name: item.nom,
      quantity: item.quantite,
      unitPrice: item.prix_unitaire,
      totalPrice: item.total_ligne
    }));
  };

  // Convert from SimpleProductSelector format back to ProductItem[]
  const convertFromSelectorProducts = (selectorProducts: any[]) => {
    return selectorProducts.map(product => ({
      id: product.id,
      nom: product.name,
      quantite: product.quantity,
      prix_unitaire: product.unitPrice,
      total_ligne: product.totalPrice
    }));
  };

  const handleProductsChange = (selectorProducts: any[]) => {
    const convertedProducts = convertFromSelectorProducts(selectorProducts);
    setProducts(convertedProducts);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* En-tête facture */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Informations {type === 'facture' ? 'Facture' : 'Devis'}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="numero">Numéro {type === 'facture' ? 'facture' : 'devis'}</Label>
            <Input
              id="numero"
              value={formData.numero_facture}
              onChange={(e) => setFormData(prev => ({ ...prev, numero_facture: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="statut">Statut</Label>
            <Select 
              value={formData.statut} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, statut: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="brouillon">📝 Brouillon</SelectItem>
                <SelectItem value="valide">✅ Validé</SelectItem>
                <SelectItem value="envoyee">📤 Envoyé</SelectItem>
                <SelectItem value="payee">💰 Payé</SelectItem>
                <SelectItem value="annulee">❌ Annulé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Informations client */}
      <Card>
        <CardHeader>
          <CardTitle>👤 Informations Client</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="client_nom">Nom du client *</Label>
            <Input
              id="client_nom"
              value={formData.client_nom}
              onChange={(e) => setFormData(prev => ({ ...prev, client_nom: e.target.value }))}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client_telephone">Téléphone</Label>
              <Input
                id="client_telephone"
                value={formData.client_telephone}
                onChange={(e) => setFormData(prev => ({ ...prev, client_telephone: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="client_adresse">Adresse</Label>
            <Textarea
              id="client_adresse"
              value={formData.client_adresse}
              onChange={(e) => setFormData(prev => ({ ...prev, client_adresse: e.target.value }))}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Dates */}
      <Card>
        <CardHeader>
          <CardTitle>📅 Dates</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Date d'émission</Label>
            <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.date_facture && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date_facture ? (
                    format(formData.date_facture, "dd MMMM yyyy", { locale: fr })
                  ) : (
                    <span>Choisir une date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.date_facture}
                  onSelect={(date) => {
                    if (date) {
                      setFormData(prev => ({ ...prev, date_facture: date }));
                      setIsDateOpen(false);
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label>Date d'échéance</Label>
            <Popover open={isEcheanceOpen} onOpenChange={setIsEcheanceOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.date_echeance && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date_echeance ? (
                    format(formData.date_echeance, "dd MMMM yyyy", { locale: fr })
                  ) : (
                    <span>Choisir une date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.date_echeance}
                  onSelect={(date) => {
                    if (date) {
                      setFormData(prev => ({ ...prev, date_echeance: date }));
                      setIsEcheanceOpen(false);
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Configuration TVA */}
      <Card>
        <CardHeader>
          <CardTitle>💰 Configuration TVA</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="tva_applicable"
              checked={formData.tva_applicable}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, tva_applicable: checked }))}
            />
            <Label htmlFor="tva_applicable">Appliquer la TVA sur cette {type}</Label>
          </div>
          {formData.tva_applicable && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="taux_tva">Taux de TVA (%)</Label>
                <Input
                  id="taux_tva"
                  type="number"
                  value={formData.taux_tva}
                  onChange={(e) => setFormData(prev => ({ ...prev, taux_tva: parseFloat(e.target.value) || 0 }))}
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
              <div>
                <Label>Montant TVA calculé</Label>
                <Input
                  value={`${montantTva.toLocaleString()} FCFA`}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Produits */}
      <Card>
        <CardHeader>
          <CardTitle>🛍️ Produits et Services</CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleProductSelector
            products={convertToSelectorProducts(products)}
            onProductsChange={handleProductsChange}
          />
        </CardContent>
      </Card>

      {/* Options de livraison */}
      <Card>
        <CardHeader>
          <CardTitle>🚚 Livraison et Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <SelectItem value="retrait_usine">🏭 Retrait à l'usine</SelectItem>
                  <SelectItem value="livraison_gratuite">🚚 Livraison gratuite</SelectItem>
                  <SelectItem value="livraison_payante">💰 Livraison payante</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="frais_livraison">Frais de livraison (FCFA)</Label>
              <Input
                id="frais_livraison"
                type="number"
                value={formData.frais_livraison}
                onChange={(e) => setFormData(prev => ({ ...prev, frais_livraison: parseFloat(e.target.value) || 0 }))}
                min="0"
              />
            </div>
          </div>
          {formData.mode_livraison !== 'retrait_usine' && (
            <div>
              <Label htmlFor="adresse_livraison">Adresse de livraison</Label>
              <Textarea
                id="adresse_livraison"
                value={formData.adresse_livraison}
                onChange={(e) => setFormData(prev => ({ ...prev, adresse_livraison: e.target.value }))}
                rows={2}
              />
            </div>
          )}
          <div>
            <Label htmlFor="remise_globale">Remise globale (FCFA)</Label>
            <Input
              id="remise_globale"
              type="number"
              value={formData.remise_globale_montant}
              onChange={(e) => setFormData(prev => ({ ...prev, remise_globale_montant: parseFloat(e.target.value) || 0 }))}
              min="0"
            />
          </div>
        </CardContent>
      </Card>

      {/* Résumé financier */}
      <Card>
        <CardHeader>
          <CardTitle>💵 Résumé Financier</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Sous-total HT:</span>
              <span className="font-medium">{sousTotal.toLocaleString()} FCFA</span>
            </div>
            {montantRemise > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Remise:</span>
                <span className="font-medium">-{montantRemise.toLocaleString()} FCFA</span>
              </div>
            )}
            {formData.tva_applicable && (
              <div className="flex justify-between">
                <span>TVA ({formData.taux_tva}%):</span>
                <span className="font-medium">{montantTva.toLocaleString()} FCFA</span>
              </div>
            )}
            {fraisLivraison > 0 && (
              <div className="flex justify-between">
                <span>Frais de livraison:</span>
                <span className="font-medium">{fraisLivraison.toLocaleString()} FCFA</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg font-bold text-primary">
              <span>TOTAL {formData.tva_applicable ? 'TTC' : ''}:</span>
              <span>{montantTotal.toLocaleString()} FCFA</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Commentaires */}
      <Card>
        <CardHeader>
          <CardTitle>📝 Commentaires</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Informations supplémentaires, conditions particulières..."
            value={formData.commentaires}
            onChange={(e) => setFormData(prev => ({ ...prev, commentaires: e.target.value }))}
            rows={3}
          />
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600">
          ✅ Créer la {type}
        </Button>
      </div>
    </form>
  );
};
