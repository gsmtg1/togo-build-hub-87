
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Truck, Calculator } from 'lucide-react';
import { NumberGenerator } from '@/utils/numberGenerator';
import { SimpleProductSelector } from './SimpleProductSelector';

interface ProductItem {
  id: string;
  nom: string;
  quantite: number;
  prix_unitaire: number;
  total_ligne: number;
}

interface SimpleInvoiceFormProps {
  onSubmit: (invoiceData: any, products: any[]) => void;
  onCancel: () => void;
  initialData?: any;
}

export const SimpleInvoiceFormWithVAT = ({ onSubmit, onCancel, initialData }: SimpleInvoiceFormProps) => {
  const [numeroFacture, setNumeroFacture] = useState('');
  const [clientNom, setClientNom] = useState('');
  const [clientTelephone, setClientTelephone] = useState('');
  const [clientAdresse, setClientAdresse] = useState('');
  const [dateFacture, setDateFacture] = useState(new Date().toISOString().split('T')[0]);
  const [dateEcheance, setDateEcheance] = useState('');
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [commentaires, setCommentaires] = useState('');
  const [modeLivraison, setModeLivraison] = useState('retrait_usine');
  const [adresseLivraison, setAdresseLivraison] = useState('');
  const [fraisLivraison, setFraisLivraison] = useState(0);
  const [remiseGlobale, setRemiseGlobale] = useState(0);
  const [tvaApplicable, setTvaApplicable] = useState(false);
  const [tauxTva, setTauxTva] = useState(18);

  // Générer le numéro de facture au chargement
  useEffect(() => {
    if (!initialData) {
      setNumeroFacture(NumberGenerator.generateInvoiceNumber());
    }
  }, [initialData]);

  // Pré-remplir les données si on édite une facture
  useEffect(() => {
    if (initialData) {
      setNumeroFacture(initialData.numero_facture || '');
      setClientNom(initialData.client_nom || '');
      setClientTelephone(initialData.client_telephone || '');
      setClientAdresse(initialData.client_adresse || '');
      setDateFacture(initialData.date_facture || new Date().toISOString().split('T')[0]);
      setDateEcheance(initialData.date_echeance || '');
      setCommentaires(initialData.commentaires || '');
      setModeLivraison(initialData.mode_livraison || 'retrait_usine');
      setAdresseLivraison(initialData.adresse_livraison || '');
      setFraisLivraison(initialData.frais_livraison || 0);
      setRemiseGlobale(initialData.remise_globale_montant || 0);
      setTvaApplicable(initialData.tva_applicable || false);
      setTauxTva(initialData.taux_tva || 18);

      // Charger les produits existants
      if (initialData.facture_items && initialData.facture_items.length > 0) {
        const existingProducts = initialData.facture_items.map((item: any) => ({
          id: item.id || `product-${Date.now()}-${Math.random()}`,
          nom: item.nom_produit,
          quantite: item.quantite,
          prix_unitaire: item.prix_unitaire,
          total_ligne: item.total_ligne
        }));
        setProducts(existingProducts);
      }
    }
  }, [initialData]);

  // Calculs automatiques
  const sousTotal = products.reduce((sum, product) => sum + product.total_ligne, 0);
  const montantRemise = remiseGlobale;
  const montantApresRemise = sousTotal - montantRemise;
  const montantTva = tvaApplicable ? (montantApresRemise * tauxTva / 100) : 0;
  const montantTotal = montantApresRemise + montantTva + fraisLivraison;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientNom.trim()) {
      alert('Veuillez saisir le nom du client');
      return;
    }

    if (products.length === 0) {
      alert('Veuillez ajouter au moins un produit');
      return;
    }

    const invoiceData = {
      numero_facture: numeroFacture,
      date_facture: dateFacture,
      date_echeance: dateEcheance || null,
      client_nom: clientNom,
      client_telephone: clientTelephone,
      client_adresse: clientAdresse,
      sous_total: sousTotal,
      remise_globale_montant: montantRemise,
      frais_livraison: fraisLivraison,
      tva_applicable: tvaApplicable,
      taux_tva: tauxTva,
      montant_tva: montantTva,
      montant_total: montantTotal,
      statut: 'brouillon',
      commentaires: commentaires,
      mode_livraison: modeLivraison,
      adresse_livraison: adresseLivraison
    };

    // Formatage des produits pour la base de données
    const formattedProducts = products.map(product => ({
      nom_produit: product.nom,
      quantite: product.quantite,
      prix_unitaire: product.prix_unitaire,
      total_ligne: product.total_ligne
    }));

    console.log('Données de la facture:', invoiceData);
    console.log('Produits formatés:', formattedProducts);

    onSubmit(invoiceData, formattedProducts);
  };

  const handleProductsChange = (updatedProducts: ProductItem[]) => {
    console.log('Produits mis à jour dans le form:', updatedProducts);
    setProducts(updatedProducts);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* En-tête de la facture */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Informations générales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="numeroFacture">Numéro de facture *</Label>
              <Input
                id="numeroFacture"
                value={numeroFacture}
                onChange={(e) => setNumeroFacture(e.target.value)}
                placeholder="Auto-généré"
                required
              />
            </div>
            <div>
              <Label htmlFor="dateFacture">Date de facture *</Label>
              <Input
                id="dateFacture"
                type="date"
                value={dateFacture}
                onChange={(e) => setDateFacture(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="dateEcheance">Date d'échéance</Label>
            <Input
              id="dateEcheance"
              type="date"
              value={dateEcheance}
              onChange={(e) => setDateEcheance(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Informations client */}
      <Card>
        <CardHeader>
          <CardTitle>Informations client</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="clientNom">Nom du client *</Label>
            <Input
              id="clientNom"
              value={clientNom}
              onChange={(e) => setClientNom(e.target.value)}
              placeholder="Nom complet du client"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="clientTelephone">Téléphone</Label>
              <Input
                id="clientTelephone"
                value={clientTelephone}
                onChange={(e) => setClientTelephone(e.target.value)}
                placeholder="+228 XX XX XX XX"
              />
            </div>
            <div>
              <Label htmlFor="clientAdresse">Adresse</Label>
              <Input
                id="clientAdresse"
                value={clientAdresse}
                onChange={(e) => setClientAdresse(e.target.value)}
                placeholder="Adresse du client"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration TVA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Configuration TVA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="tvaApplicable">TVA applicable</Label>
              <p className="text-sm text-muted-foreground">
                Activer la TVA pour cette facture
              </p>
            </div>
            <Switch
              id="tvaApplicable"
              checked={tvaApplicable}
              onCheckedChange={setTvaApplicable}
            />
          </div>
          
          {tvaApplicable && (
            <div>
              <Label htmlFor="tauxTva">Taux de TVA (%)</Label>
              <Input
                id="tauxTva"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={tauxTva}
                onChange={(e) => setTauxTva(parseFloat(e.target.value) || 0)}
                placeholder="18"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sélection des produits */}
      <Card>
        <CardHeader>
          <CardTitle>Produits</CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleProductSelector
            products={products}
            onProductsChange={handleProductsChange}
          />
        </CardContent>
      </Card>

      {/* Livraison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Options de livraison
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="modeLivraison">Mode de livraison</Label>
            <Select value={modeLivraison} onValueChange={setModeLivraison}>
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

          {modeLivraison !== 'retrait_usine' && (
            <div>
              <Label htmlFor="adresseLivraison">Adresse de livraison</Label>
              <Textarea
                id="adresseLivraison"
                value={adresseLivraison}
                onChange={(e) => setAdresseLivraison(e.target.value)}
                placeholder="Adresse complète de livraison"
                rows={2}
              />
            </div>
          )}

          {modeLivraison === 'livraison_payante' && (
            <div>
              <Label htmlFor="fraisLivraison">Frais de livraison (FCFA)</Label>
              <Input
                id="fraisLivraison"
                type="number"
                min="0"
                value={fraisLivraison}
                onChange={(e) => setFraisLivraison(parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Remise globale */}
      <Card>
        <CardHeader>
          <CardTitle>Remise globale</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="remiseGlobale">Montant de la remise (FCFA)</Label>
            <Input
              id="remiseGlobale"
              type="number"
              min="0"
              value={remiseGlobale}
              onChange={(e) => setRemiseGlobale(parseFloat(e.target.value) || 0)}
              placeholder="0"
            />
          </div>
        </CardContent>
      </Card>

      {/* Récapitulatif des totaux */}
      <Card>
        <CardHeader>
          <CardTitle>Récapitulatif</CardTitle>
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
            
            {tvaApplicable && (
              <div className="flex justify-between">
                <span>TVA ({tauxTva}%):</span>
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
            <div className="flex justify-between text-lg font-bold">
              <span>Total {tvaApplicable ? 'TTC' : 'HT'}:</span>
              <span>{montantTotal.toLocaleString()} FCFA</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Commentaires */}
      <Card>
        <CardHeader>
          <CardTitle>Commentaires</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={commentaires}
            onChange={(e) => setCommentaires(e.target.value)}
            placeholder="Commentaires ou instructions spéciales..."
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
          {initialData ? 'Modifier la facture' : 'Créer la facture'}
        </Button>
      </div>
    </form>
  );
};
