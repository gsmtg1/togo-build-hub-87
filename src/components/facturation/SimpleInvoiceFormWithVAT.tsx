import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { FileText, Save, Eye, Calculator, AlertCircle, CreditCard, Truck, MapPin, User, Phone, Building, MessageSquare } from 'lucide-react';
import { ProductSelectorWithDatabase } from './ProductSelectorWithDatabase';
import { ClientSelector } from '@/components/clients/ClientSelector';
import { useFacturesProfessionnelles } from '@/hooks/useFacturesProfessionnelles';
import { useToast } from '@/hooks/use-toast';

interface ProductItem {
  id: string;
  nom: string;
  quantite: number;
  prix_unitaire: number;
  total_ligne: number;
  isCustom?: boolean;
  product_id?: string;
}

interface SimpleInvoiceFormWithVATProps {
  onInvoiceCreated?: () => void;
  type?: 'facture' | 'devis';
  initialData?: any;
}

export const SimpleInvoiceFormWithVAT = ({ 
  onInvoiceCreated, 
  type = 'facture',
  initialData 
}: SimpleInvoiceFormWithVATProps) => {

  const [loading, setLoading] = useState(false);
  const [produits, setProduits] = useState<ProductItem[]>([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedClientName, setSelectedClientName] = useState('');
  const [clientTelephone, setClientTelephone] = useState('');
  const [clientAdresse, setClientAdresse] = useState('');
  const [dateDocument, setDateDocument] = useState(new Date().toISOString().split('T')[0]);
  const [dateEcheance, setDateEcheance] = useState('');
  const [tvaApplicable, setTvaApplicable] = useState(false);
  const [tauxTva, setTauxTva] = useState(18);
  const [fraisLivraison, setFraisLivraison] = useState(0);
  const [modeLivraison, setModeLivraison] = useState('retrait_usine');
  const [adresseLivraison, setAdresseLivraison] = useState('');
  const [remiseGlobale, setRemiseGlobale] = useState(0);
  const [commentaires, setCommentaires] = useState('');
  const [statut, setStatut] = useState('brouillon');
  const [numeroDocument, setNumeroDocument] = useState('');

  const { create } = useFacturesProfessionnelles();
  const { toast } = useToast();

  // Générer le numéro de document
  useEffect(() => {
    if (!numeroDocument) {
      const prefix = type === 'facture' ? 'FAC-' : 'DEV-';
      const timestamp = Date.now().toString().slice(-6);
      setNumeroDocument(`${prefix}${timestamp}`);
    }
  }, [type, numeroDocument]);

  // Calculs
  const sousTotal = produits.reduce((sum, produit) => sum + produit.total_ligne, 0);
  const montantTva = tvaApplicable ? (sousTotal * tauxTva) / 100 : 0;
  const fraisLivraisonActuels = modeLivraison === 'livraison_payante' ? fraisLivraison : 0;
  const montantTotal = sousTotal + montantTva + fraisLivraisonActuels - remiseGlobale;

  // Validation simplifiée - TVA vraiment optionnelle
  const estValide = () => {
    const erreurs = [];
    
    if (!selectedClientName.trim()) {
      erreurs.push('Le nom du client est requis');
    }
    
    if (produits.length === 0) {
      erreurs.push('Au moins un produit doit être ajouté');
    }
    
    // Validation des produits
    produits.forEach((produit, index) => {
      if (!produit.nom.trim()) {
        erreurs.push(`Le produit ${index + 1} doit avoir un nom`);
      }
      if (produit.quantite <= 0) {
        erreurs.push(`Le produit ${index + 1} doit avoir une quantité > 0`);
      }
      if (produit.prix_unitaire < 0) {
        erreurs.push(`Le produit ${index + 1} ne peut pas avoir un prix négatif`);
      }
    });

    if (erreurs.length > 0) {
      toast({
        title: "Erreurs de validation",
        description: erreurs.join(', '),
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!estValide()) {
      return;
    }

    setLoading(true);

    try {
      // Créer l'objet de données avec les propriétés correctes selon le type
      let documentData: any;
      
      if (type === 'facture') {
        documentData = {
          numero_facture: numeroDocument,
          date_facture: dateDocument,
          client_id: selectedClientId || null,
          client_nom: selectedClientName,
          client_telephone: clientTelephone,
          client_adresse: clientAdresse,
          date_echeance: dateEcheance || null,
          statut,
          commentaires,
          montant_total: montantTotal,
          sous_total: sousTotal,
          tva_applicable: tvaApplicable,
          taux_tva: tauxTva,
          montant_tva: montantTva,
          frais_livraison: fraisLivraisonActuels,
          remise_globale_montant: remiseGlobale,
          mode_livraison: modeLivraison,
          adresse_livraison: adresseLivraison
        };
      } else {
        documentData = {
          numero_devis: numeroDocument,
          date_devis: dateDocument,
          client_id: selectedClientId || null,
          client_nom: selectedClientName,
          client_telephone: clientTelephone,
          client_adresse: clientAdresse,
          date_echeance: dateEcheance || null,
          statut,
          commentaires,
          montant_total: montantTotal,
          sous_total: sousTotal,
          tva_applicable: tvaApplicable,
          taux_tva: tauxTva,
          montant_tva: montantTva,
          frais_livraison: fraisLivraisonActuels,
          remise_globale_montant: remiseGlobale,
          mode_livraison: modeLivraison,
          adresse_livraison: adresseLivraison
        };
      }

      console.log(`Création ${type}:`, documentData);
      console.log('Produits:', produits);

      // Convertir les produits au format attendu
      const produitsFormates = produits.map(p => ({
        nom_produit: p.nom,
        quantite: p.quantite,
        prix_unitaire: p.prix_unitaire,
        total_ligne: p.total_ligne,
        product_id: p.product_id || null
      }));

      await create(documentData, produitsFormates);

      toast({
        title: "Succès",
        description: `${type === 'facture' ? 'Facture' : 'Devis'} créé(e) avec succès !`,
      });

      // Réinitialiser le formulaire
      setProduits([]);
      setSelectedClientId('');
      setSelectedClientName('');
      setClientTelephone('');
      setClientAdresse('');
      setCommentaires('');
      setRemiseGlobale(0);
      setFraisLivraison(0);
      setTvaApplicable(false);
      
      // Générer un nouveau numéro
      const prefix = type === 'facture' ? 'FAC-' : 'DEV-';
      const timestamp = Date.now().toString().slice(-6);
      setNumeroDocument(`${prefix}${timestamp}`);

      if (onInvoiceCreated) {
        onInvoiceCreated();
      }

    } catch (error: any) {
      console.error('Erreur création document:', error);
      toast({
        title: "Erreur",
        description: error.message || `Impossible de créer ${type === 'facture' ? 'la facture' : 'le devis'}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-primary flex items-center justify-center gap-3">
          <FileText className="h-8 w-8" />
          {type === 'facture' ? 'Nouvelle Facture' : 'Nouveau Devis'}
        </h1>
        <p className="text-muted-foreground">
          Créez {type === 'facture' ? 'une facture' : 'un devis'} professionnel en quelques clics
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations de base */}
        <Card className="border-primary/20">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
            <CardTitle className="text-primary flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Informations générales
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="numero_document" className="text-muted-foreground">
                  Numéro de {type === 'facture' ? 'facture' : 'devis'} *
                </Label>
                <Input
                  id="numero_document"
                  value={numeroDocument}
                  onChange={(e) => setNumeroDocument(e.target.value)}
                  required
                  className="border-primary/30 focus:border-primary"
                />
              </div>

              <div>
                <Label htmlFor="date_document" className="text-muted-foreground">
                  Date *
                </Label>
                <Input
                  id="date_document"
                  type="date"
                  value={dateDocument}
                  onChange={(e) => setDateDocument(e.target.value)}
                  required
                  className="border-primary/30 focus:border-primary"
                />
              </div>

              <div>
                <Label htmlFor="date_echeance" className="text-muted-foreground">
                  Date d'échéance
                </Label>
                <Input
                  id="date_echeance"
                  type="date"
                  value={dateEcheance}
                  onChange={(e) => setDateEcheance(e.target.value)}
                  className="border-primary/30 focus:border-primary"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sélection du client */}
        <ClientSelector
          selectedClientId={selectedClientId}
          selectedClientName={selectedClientName}
          clientTelephone={clientTelephone}
          clientAdresse={clientAdresse}
          onClientSelect={(client) => {
            if (client) {
              setSelectedClientId(client.id);
              setSelectedClientName(client.nom_complet);
              setClientTelephone(client.telephone || '');
              setClientAdresse(client.adresse || '');
            }
          }}
          onManualClientChange={(nom, telephone, adresse) => {
            setSelectedClientName(nom);
            setClientTelephone(telephone);
            setClientAdresse(adresse);
            setSelectedClientId('');
          }}
        />

        {/* Sélection des produits */}
        <ProductSelectorWithDatabase
          products={produits}
          onProductsChange={setProduits}
        />

        {/* Options de facturation */}
        {produits.length > 0 && (
          <Card className="border-secondary/20">
            <CardHeader className="bg-gradient-to-r from-secondary/10 to-secondary/5">
              <CardTitle className="text-secondary-foreground flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Options de facturation
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* TVA - Optionnelle */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">TVA (Taxe sur la Valeur Ajoutée)</Label>
                    <p className="text-sm text-muted-foreground">
                      Activez si votre entreprise est assujettie à la TVA
                    </p>
                  </div>
                  <Switch
                    checked={tvaApplicable}
                    onCheckedChange={setTvaApplicable}
                  />
                </div>

                {tvaApplicable && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-secondary/10 rounded-lg">
                    <div>
                      <Label htmlFor="taux_tva">Taux de TVA (%)</Label>
                      <Input
                        id="taux_tva"
                        type="number"
                        value={tauxTva}
                        onChange={(e) => setTauxTva(Number(e.target.value))}
                        min="0"
                        max="100"
                        step="0.1"
                        className="border-secondary/30 focus:border-secondary"
                      />
                    </div>
                    <div className="flex items-end">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Montant TVA: </span>
                        <span className="font-semibold text-secondary-foreground">
                          {formatCurrency(montantTva)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Livraison */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-accent" />
                  <Label className="text-base font-medium">Mode de livraison</Label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Select value={modeLivraison} onValueChange={setModeLivraison}>
                      <SelectTrigger className="border-accent/30 focus:border-accent">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="retrait_usine">Retrait à l'usine</SelectItem>
                        <SelectItem value="livraison_gratuite">Livraison gratuite</SelectItem>
                        <SelectItem value="livraison_payante">Livraison payante</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {modeLivraison === 'livraison_payante' && (
                    <div>
                      <Label htmlFor="frais_livraison">Frais de livraison (FCFA)</Label>
                      <Input
                        id="frais_livraison"
                        type="number"
                        value={fraisLivraison}
                        onChange={(e) => setFraisLivraison(Number(e.target.value))}
                        min="0"
                        className="border-accent/30 focus:border-accent"
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="remise_globale">Remise globale (FCFA)</Label>
                    <Input
                      id="remise_globale"
                      type="number"
                      value={remiseGlobale}
                      onChange={(e) => setRemiseGlobale(Number(e.target.value))}
                      min="0"
                      className="border-accent/30 focus:border-accent"
                    />
                  </div>
                </div>

                {(modeLivraison === 'livraison_gratuite' || modeLivraison === 'livraison_payante') && (
                  <div>
                    <Label htmlFor="adresse_livraison" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Adresse de livraison
                    </Label>
                    <Input
                      id="adresse_livraison"
                      value={adresseLivraison}
                      onChange={(e) => setAdresseLivraison(e.target.value)}
                      placeholder="Adresse complète de livraison"
                      className="border-accent/30 focus:border-accent"
                    />
                  </div>
                )}
              </div>

              {/* Résumé des totaux */}
              <div className="bg-gradient-to-r from-primary/5 to-accent/5 p-6 rounded-lg border border-primary/20">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sous-total (HT):</span>
                    <span className="font-medium">{formatCurrency(sousTotal)}</span>
                  </div>
                  
                  {tvaApplicable && montantTva > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">TVA ({tauxTva}%):</span>
                      <span className="text-secondary-foreground font-medium">{formatCurrency(montantTva)}</span>
                    </div>
                  )}
                  
                  {fraisLivraisonActuels > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Frais de livraison:</span>
                      <span className="font-medium">{formatCurrency(fraisLivraisonActuels)}</span>
                    </div>
                  )}
                  
                  {remiseGlobale > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Remise globale:</span>
                      <span className="text-destructive font-medium">-{formatCurrency(remiseGlobale)}</span>
                    </div>
                  )}
                  
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-primary">TOTAL:</span>
                    <span className="text-2xl font-bold text-primary">{formatCurrency(montantTotal)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Commentaires */}
        <Card className="border-muted/50">
          <CardHeader>
            <CardTitle className="text-muted-foreground flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Commentaires et Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={commentaires}
              onChange={(e) => setCommentaires(e.target.value)}
              placeholder="Notes supplémentaires, conditions de paiement, etc..."
              rows={3}
              className="border-muted/50 focus:border-primary"
            />
          </CardContent>
        </Card>

        {/* Boutons d'action */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="submit"
            disabled={loading || produits.length === 0}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                Création...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Créer {type === 'facture' ? 'la facture' : 'le devis'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
