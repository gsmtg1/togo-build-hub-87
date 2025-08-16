
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { SimpleProductSelector } from './SimpleProductSelector';
import { useFacturesProfessionnelles } from '@/hooks/useFacturesProfessionnelles';
import { useClients } from '@/hooks/useSupabaseDatabase';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  User, 
  Calendar, 
  CreditCard, 
  Truck, 
  Receipt,
  Calculator,
  Save,
  CheckCircle
} from 'lucide-react';

interface ProductItem {
  id: string;
  nom: string;
  quantite: number;
  prix_unitaire: number;
  total_ligne: number;
}

interface SimpleInvoiceFormWithVATProps {
  onInvoiceCreated?: () => void;
}

export const SimpleInvoiceFormWithVAT = ({ onInvoiceCreated }: SimpleInvoiceFormWithVATProps) => {
  // États du formulaire
  const [numeroFacture, setNumeroFacture] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientNom, setClientNom] = useState('');
  const [clientTelephone, setClientTelephone] = useState('');
  const [clientAdresse, setClientAdresse] = useState('');
  const [dateFacture, setDateFacture] = useState(new Date().toISOString().split('T')[0]);
  const [dateEcheance, setDateEcheance] = useState('');
  const [statut, setStatut] = useState('brouillon');
  const [commentaires, setCommentaires] = useState('');
  
  // États pour la livraison
  const [modeLivraison, setModeLivraison] = useState('retrait_usine');
  const [fraisLivraison, setFraisLivraison] = useState(0);
  const [adresseLivraison, setAdresseLivraison] = useState('');
  
  // États pour les calculs
  const [remiseGlobaleMontant, setRemiseGlobaleMontant] = useState(0);
  const [tvaApplicable, setTvaApplicable] = useState(false);
  const [tauxTva, setTauxTva] = useState(18);
  
  // Produits
  const [products, setProducts] = useState<ProductItem[]>([]);
  
  // État de soumission
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hooks
  const { create: createFacture } = useFacturesProfessionnelles();
  const { data: clients } = useClients();

  // Générer automatiquement le numéro de facture
  useEffect(() => {
    const generateInvoiceNumber = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const time = String(now.getHours()).padStart(2, '0') + String(now.getMinutes()).padStart(2, '0');
      return `FAC-${year}${month}${day}-${time}`;
    };

    if (!numeroFacture) {
      setNumeroFacture(generateInvoiceNumber());
    }
  }, [numeroFacture]);

  // Calculs
  const sousTotal = products.reduce((sum, product) => sum + product.total_ligne, 0);
  const montantTva = tvaApplicable ? (sousTotal * tauxTva / 100) : 0;
  const montantTotal = sousTotal + montantTva + fraisLivraison - remiseGlobaleMontant;

  const handleClientSelect = (selectedClientId: string) => {
    setClientId(selectedClientId);
    const client = clients?.find(c => c.id === selectedClientId);
    if (client) {
      setClientNom(client.name);
      setClientTelephone(client.phone || '');
      setClientAdresse(client.address || '');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (products.length === 0) {
      alert('Veuillez ajouter au moins un produit à la facture');
      return;
    }

    if (!clientNom.trim()) {
      alert('Veuillez renseigner le nom du client');
      return;
    }

    setIsSubmitting(true);

    try {
      const factureData = {
        numero_facture: numeroFacture,
        client_id: clientId || null,
        client_nom: clientNom,
        client_telephone: clientTelephone,
        client_adresse: clientAdresse,
        date_facture: dateFacture,
        date_echeance: dateEcheance || null,
        montant_total: montantTotal,
        statut,
        commentaires,
        mode_livraison: modeLivraison,
        frais_livraison: fraisLivraison,
        adresse_livraison: adresseLivraison,
        sous_total: sousTotal,
        remise_globale_montant: remiseGlobaleMontant,
        tva_applicable: tvaApplicable,
        taux_tva: tauxTva,
        montant_tva: montantTva
      };

      const items = products.map(product => ({
        nom_produit: product.nom,
        quantite: product.quantite,
        prix_unitaire: product.prix_unitaire,
        total_ligne: product.total_ligne,
        product_id: product.id
      }));

      console.log('Création de la facture avec les données:', { factureData, items });

      await createFacture(factureData, items);
      
      if (onInvoiceCreated) {
        onInvoiceCreated();
      }
    } catch (error) {
      console.error('Erreur lors de la création de la facture:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* En-tête de la facture */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/20">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
          <CardTitle className="flex items-center gap-3 text-xl">
            <Receipt className="h-6 w-6 text-primary" />
            <span>Informations de la facture</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="numeroFacture" className="text-sm font-medium">
                Numéro de facture
              </Label>
              <Input
                id="numeroFacture"
                value={numeroFacture}
                onChange={(e) => setNumeroFacture(e.target.value)}
                className="font-mono bg-muted/30"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="statut" className="text-sm font-medium">
                Statut
              </Label>
              <Select value={statut} onValueChange={setStatut}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brouillon">
                    <Badge variant="secondary">Brouillon</Badge>
                  </SelectItem>
                  <SelectItem value="envoye">
                    <Badge variant="default">Envoyé</Badge>
                  </SelectItem>
                  <SelectItem value="paye">
                    <Badge variant="default" className="bg-green-500">Payé</Badge>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="dateFacture" className="text-sm font-medium">
                Date de la facture
              </Label>
              <Input
                id="dateFacture"
                type="date"
                value={dateFacture}
                onChange={(e) => setDateFacture(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dateEcheance" className="text-sm font-medium">
                Date d'échéance
              </Label>
              <Input
                id="dateEcheance"
                type="date"
                value={dateEcheance}
                onChange={(e) => setDateEcheance(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informations client */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-accent/10 to-secondary/10">
          <CardTitle className="flex items-center gap-3 text-xl">
            <User className="h-6 w-6 text-accent-foreground" />
            <span>Informations du client</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="clientSelect" className="text-sm font-medium">
              Client existant (optionnel)
            </Label>
            <Select value={clientId} onValueChange={handleClientSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un client existant" />
              </SelectTrigger>
              <SelectContent>
                {clients?.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{client.name}</span>
                      <span className="text-sm text-muted-foreground">{client.phone}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="clientNom" className="text-sm font-medium">
                Nom du client *
              </Label>
              <Input
                id="clientNom"
                value={clientNom}
                onChange={(e) => setClientNom(e.target.value)}
                required
                placeholder="Nom complet du client"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="clientTelephone" className="text-sm font-medium">
                Téléphone
              </Label>
              <Input
                id="clientTelephone"
                value={clientTelephone}
                onChange={(e) => setClientTelephone(e.target.value)}
                placeholder="Numéro de téléphone"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientAdresse" className="text-sm font-medium">
              Adresse
            </Label>
            <Textarea
              id="clientAdresse"
              value={clientAdresse}
              onChange={(e) => setClientAdresse(e.target.value)}
              placeholder="Adresse complète du client"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sélection des produits */}
      <SimpleProductSelector 
        products={products} 
        onProductsChange={setProducts} 
      />

      {/* Options de livraison */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-secondary/10 to-muted/10">
          <CardTitle className="flex items-center gap-3 text-xl">
            <Truck className="h-6 w-6 text-secondary-foreground" />
            <span>Livraison et frais</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="modeLivraison" className="text-sm font-medium">
                Mode de livraison
              </Label>
              <Select value={modeLivraison} onValueChange={setModeLivraison}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="retrait_usine">Retrait à l'usine</SelectItem>
                  <SelectItem value="livraison_domicile">Livraison à domicile</SelectItem>
                  <SelectItem value="livraison_chantier">Livraison sur chantier</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fraisLivraison" className="text-sm font-medium">
                Frais de livraison (FCFA)
              </Label>
              <Input
                id="fraisLivraison"
                type="number"
                min="0"
                value={fraisLivraison}
                onChange={(e) => setFraisLivraison(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          {modeLivraison !== 'retrait_usine' && (
            <div className="space-y-2">
              <Label htmlFor="adresseLivraison" className="text-sm font-medium">
                Adresse de livraison
              </Label>
              <Textarea
                id="adresseLivraison"
                value={adresseLivraison}
                onChange={(e) => setAdresseLivraison(e.target.value)}
                placeholder="Adresse complète de livraison"
                rows={2}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Calculs et TVA */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
          <CardTitle className="flex items-center gap-3 text-xl">
            <Calculator className="h-6 w-6 text-primary" />
            <span>Calculs et taxes</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="remiseGlobaleMontant" className="text-sm font-medium">
                Remise globale (FCFA)
              </Label>
              <Input
                id="remiseGlobaleMontant"
                type="number"
                min="0"
                value={remiseGlobaleMontant}
                onChange={(e) => setRemiseGlobaleMontant(parseFloat(e.target.value) || 0)}
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="tvaApplicable"
                  checked={tvaApplicable}
                  onCheckedChange={setTvaApplicable}
                />
                <Label htmlFor="tvaApplicable" className="text-sm font-medium">
                  TVA applicable
                </Label>
              </div>
              
              {tvaApplicable && (
                <div className="space-y-2">
                  <Label htmlFor="tauxTva" className="text-sm font-medium">
                    Taux TVA (%)
                  </Label>
                  <Input
                    id="tauxTva"
                    type="number"
                    min="0"
                    max="100"
                    value={tauxTva}
                    onChange={(e) => setTauxTva(parseFloat(e.target.value) || 18)}
                  />
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Résumé financier */}
          <div className="bg-gradient-to-r from-primary/5 to-accent/5 p-6 rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">Sous-total:</span>
              <span className="font-semibold">{sousTotal.toLocaleString()} FCFA</span>
            </div>
            
            {remiseGlobaleMontant > 0 && (
              <div className="flex justify-between items-center text-red-600">
                <span className="font-medium">Remise:</span>
                <span className="font-semibold">-{remiseGlobaleMontant.toLocaleString()} FCFA</span>
              </div>
            )}
            
            {tvaApplicable && (
              <div className="flex justify-between items-center">
                <span className="font-medium">TVA ({tauxTva}%):</span>
                <span className="font-semibold">{montantTva.toLocaleString()} FCFA</span>
              </div>
            )}
            
            {fraisLivraison > 0 && (
              <div className="flex justify-between items-center">
                <span className="font-medium">Frais de livraison:</span>
                <span className="font-semibold">{fraisLivraison.toLocaleString()} FCFA</span>
              </div>
            )}
            
            <Separator />
            
            <div className="flex justify-between items-center text-lg">
              <span className="font-bold">TOTAL:</span>
              <span className="font-bold text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {montantTotal.toLocaleString()} FCFA
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Commentaires */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="space-y-2">
            <Label htmlFor="commentaires" className="text-sm font-medium">
              Commentaires ou notes
            </Label>
            <Textarea
              id="commentaires"
              value={commentaires}
              onChange={(e) => setCommentaires(e.target.value)}
              placeholder="Ajoutez des commentaires ou notes spéciales pour cette facture..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Bouton de soumission */}
      <div className="flex justify-end pt-6">
        <Button 
          type="submit" 
          disabled={isSubmitting || products.length === 0}
          size="lg"
          className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 px-8"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
              <span>Création en cours...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <span className="font-semibold">Créer la facture</span>
            </div>
          )}
        </Button>
      </div>
    </form>
  );
};
