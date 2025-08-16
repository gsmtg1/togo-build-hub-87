
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { SimpleProductSelector } from './SimpleProductSelector';
import { useFacturesProfessionnelles } from '@/hooks/useFacturesProfessionnelles';
import { useDevisProfessionnels } from '@/hooks/useFacturationDatabase';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, FileText, Calculator, Truck, CreditCard, Percent } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ClientSelector } from '@/components/clients/ClientSelector';

interface ProductItem {
  id: string;
  nom: string;
  quantite: number;
  prix_unitaire: number;
  total_ligne: number;
  isCustom?: boolean;
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
  const facturesHook = useFacturesProfessionnelles();
  const devisHook = useDevisProfessionnels();
  const dataHook = type === 'facture' ? facturesHook : devisHook;
  
  const { toast } = useToast();

  // États principaux
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedClientName, setSelectedClientName] = useState<string>('');
  const [clientTelephone, setClientTelephone] = useState<string>('');
  const [clientAdresse, setClientAdresse] = useState<string>('');
  
  const [numeroDocument, setNumeroDocument] = useState<string>('');
  const [dateDocument, setDateDocument] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dateEcheance, setDateEcheance] = useState<string>('');
  const [statut, setStatut] = useState<string>('brouillon');
  const [commentaires, setCommentaires] = useState<string>('');
  
  // États TVA et calculs
  const [tvaApplicable, setTvaApplicable] = useState<boolean>(false);
  const [tauxTva, setTauxTva] = useState<number>(18);
  const [fraisLivraison, setFraisLivraison] = useState<number>(0);
  const [remiseGlobale, setRemiseGlobale] = useState<number>(0);
  const [modeLivraison, setModeLivraison] = useState<string>('retrait_usine');
  const [adresseLivraison, setAdresseLivraison] = useState<string>('');
  
  const [produits, setProduits] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Calculs automatiques
  const sousTotal = produits.reduce((sum, produit) => sum + produit.total_ligne, 0);
  const montantTva = tvaApplicable ? (sousTotal * tauxTva / 100) : 0;
  const montantTotal = sousTotal + montantTva + fraisLivraison - remiseGlobale;

  // Chargement des données initiales pour édition
  useEffect(() => {
    if (initialData) {
      console.log('🔄 Chargement données initiales:', initialData);
      
      setSelectedClientId(initialData.client_id || '');
      setSelectedClientName(initialData.client_nom || '');
      setClientTelephone(initialData.client_telephone || '');
      setClientAdresse(initialData.client_adresse || '');
      
      setNumeroDocument(type === 'facture' ? initialData.numero_facture : initialData.numero_devis);
      setDateDocument(type === 'facture' ? initialData.date_facture : initialData.date_devis);
      setDateEcheance(initialData.date_echeance || '');
      setStatut(initialData.statut || 'brouillon');
      setCommentaires(initialData.commentaires || '');
      
      setTvaApplicable(initialData.tva_applicable || false);
      setTauxTva(initialData.taux_tva || 18);
      setFraisLivraison(initialData.frais_livraison || 0);
      setRemiseGlobale(initialData.remise_globale_montant || 0);
      setModeLivraison(initialData.mode_livraison || 'retrait_usine');
      setAdresseLivraison(initialData.adresse_livraison || '');
      
      // Charger les produits
      if (type === 'devis' && initialData.devis_produits) {
        setProduits(initialData.devis_produits.map((p: any) => ({
          id: p.id,
          nom: p.nom_produit,
          quantite: p.quantite,
          prix_unitaire: p.prix_unitaire,
          total_ligne: p.total_ligne,
          isCustom: false
        })));
      } else if (type === 'facture' && initialData.facture_items) {
        setProduits(initialData.facture_items.map((item: any) => ({
          id: item.id,
          nom: item.nom_produit,
          quantite: item.quantite,
          prix_unitaire: item.prix_unitaire,
          total_ligne: item.total_ligne,
          isCustom: false
        })));
      }
    } else {
      // Générer un numéro automatique pour nouveau document
      const prefix = type === 'facture' ? 'FAC' : 'DEV';
      const numero = `${prefix}-${Date.now().toString().slice(-6)}`;
      setNumeroDocument(numero);
    }
  }, [initialData, type]);

  // Gestion de la sélection client
  const handleClientSelect = (client: { id?: string; nom: string; telephone?: string; adresse?: string }) => {
    console.log('🎯 Client sélectionné:', client);
    setSelectedClientId(client.id || '');
    setSelectedClientName(client.nom);
    setClientTelephone(client.telephone || '');
    setClientAdresse(client.adresse || '');
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClientName.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner ou saisir un client",
        variant: "destructive",
      });
      return;
    }

    if (produits.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez ajouter au moins un produit",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const documentData = {
        [type === 'facture' ? 'numero_facture' : 'numero_devis']: numeroDocument,
        client_id: selectedClientId || null,
        client_nom: selectedClientName,
        client_telephone: clientTelephone,
        client_adresse: clientAdresse,
        [type === 'facture' ? 'date_facture' : 'date_devis']: dateDocument,
        date_echeance: dateEcheance || null,
        statut,
        commentaires,
        montant_total: montantTotal,
        sous_total: sousTotal,
        tva_applicable: tvaApplicable,
        taux_tva: tauxTva,
        montant_tva: montantTva,
        frais_livraison: fraisLivraison,
        remise_globale_montant: remiseGlobale,
        mode_livraison: modeLivraison,
        adresse_livraison: adresseLivraison
      };

      console.log(`Création ${type}:`, documentData);
      console.log('Produits:', produits);

      // Convert products to match the expected format for the database
      const produitsFormatted = produits.map(produit => ({
        ...produit,
        nom_produit: produit.nom // Map nom to nom_produit for database compatibility
      }));
      
      await dataHook.create(documentData, produitsFormatted);
      
      toast({
        title: "Succès",
        description: `${type === 'facture' ? 'Facture' : 'Devis'} créé${type === 'facture' ? 'e' : ''} avec succès !`,
      });

      if (onInvoiceCreated) {
        onInvoiceCreated();
      }

    } catch (error: any) {
      console.error(`Erreur création ${type}:`, error);
      toast({
        title: "Erreur",
        description: error.message || `Impossible de créer ${type === 'facture' ? 'la facture' : 'le devis'}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 p-4">
      <div className="max-w-5xl mx-auto">
        {/* En-tête */}
        <Card className="mb-6 border-2 border-orange-200 shadow-lg bg-gradient-to-r from-orange-500 to-amber-500">
          <CardHeader className="text-center py-6">
            <CardTitle className="text-3xl font-bold text-white flex items-center justify-center gap-3">
              <FileText className="h-8 w-8" />
              {type === 'facture' ? 'Nouvelle Facture' : 'Nouveau Devis'}
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                Cornerstone
              </Badge>
            </CardTitle>
          </CardHeader>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section Client */}
          <Card className="border-2 border-orange-200 shadow-md">
            <CardHeader className="bg-gradient-to-r from-orange-100 to-amber-100">
              <CardTitle className="text-orange-700 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Informations Client
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ClientSelector
                selectedClientId={selectedClientId}
                selectedClientName={selectedClientName}
                onClientSelect={handleClientSelect}
              />
              
              {/* Informations complémentaires client */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Téléphone</Label>
                  <Input
                    value={clientTelephone}
                    onChange={(e) => setClientTelephone(e.target.value)}
                    placeholder="Téléphone du client"
                    className="border-orange-100 focus:border-orange-400"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Adresse</Label>
                  <Input
                    value={clientAdresse}
                    onChange={(e) => setClientAdresse(e.target.value)}
                    placeholder="Adresse du client"
                    className="border-orange-100 focus:border-orange-400"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section Document */}
          <Card className="border-2 border-orange-200 shadow-md">
            <CardHeader className="bg-gradient-to-r from-orange-100 to-amber-100">
              <CardTitle className="text-orange-700 flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Détails du Document
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Numéro {type === 'facture' ? 'Facture' : 'Devis'} *
                  </Label>
                  <Input
                    value={numeroDocument}
                    onChange={(e) => setNumeroDocument(e.target.value)}
                    className="border-orange-100 focus:border-orange-400 font-mono"
                    required
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Date {type === 'facture' ? 'Facture' : 'Devis'} *
                  </Label>
                  <Input
                    type="date"
                    value={dateDocument}
                    onChange={(e) => setDateDocument(e.target.value)}
                    className="border-orange-100 focus:border-orange-400"
                    required
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Date d'échéance</Label>
                  <Input
                    type="date"
                    value={dateEcheance}
                    onChange={(e) => setDateEcheance(e.target.value)}
                    className="border-orange-100 focus:border-orange-400"
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Statut</Label>
                <Select value={statut} onValueChange={setStatut}>
                  <SelectTrigger className="border-orange-100 focus:border-orange-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brouillon">Brouillon</SelectItem>
                    <SelectItem value="valide">Validé</SelectItem>
                    <SelectItem value="envoye">Envoyé</SelectItem>
                    {type === 'devis' && (
                      <>
                        <SelectItem value="accepte">Accepté</SelectItem>
                        <SelectItem value="refuse">Refusé</SelectItem>
                      </>
                    )}
                    {type === 'facture' && <SelectItem value="payee">Payée</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Section Produits */}
          <Card className="border-2 border-orange-200 shadow-md">
            <CardHeader className="bg-gradient-to-r from-orange-100 to-amber-100">
              <CardTitle className="text-orange-700 flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Produits & Services
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <SimpleProductSelector
                products={produits}
                onProductsChange={setProduits}
              />
            </CardContent>
          </Card>

          {/* Section Calculs et TVA */}
          <Card className="border-2 border-orange-200 shadow-md">
            <CardHeader className="bg-gradient-to-r from-orange-100 to-amber-100">
              <CardTitle className="text-orange-700 flex items-center gap-2">
                <Percent className="h-5 w-5" />
                Calculs & TVA
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {/* TVA */}
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div>
                  <Label className="text-sm font-medium text-gray-700">TVA applicable</Label>
                  <p className="text-xs text-gray-500">Appliquer la TVA sur cette {type}</p>
                </div>
                <Switch
                  checked={tvaApplicable}
                  onCheckedChange={setTvaApplicable}
                />
              </div>
              
              {tvaApplicable && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Taux TVA (%)</Label>
                  <Input
                    type="number"
                    value={tauxTva}
                    onChange={(e) => setTauxTva(Number(e.target.value))}
                    className="border-orange-100 focus:border-orange-400"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
              )}
              
              {/* Frais et remises */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Frais de livraison (FCFA)</Label>
                  <Input
                    type="number"
                    value={fraisLivraison}
                    onChange={(e) => setFraisLivraison(Number(e.target.value))}
                    className="border-orange-100 focus:border-orange-400"
                    min="0"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Remise globale (FCFA)</Label>
                  <Input
                    type="number"
                    value={remiseGlobale}
                    onChange={(e) => setRemiseGlobale(Number(e.target.value))}
                    className="border-orange-100 focus:border-orange-400"
                    min="0"
                  />
                </div>
              </div>
              
              {/* Récapitulatif */}
              <div className="bg-gradient-to-r from-orange-100 to-amber-100 p-4 rounded-lg border-2 border-orange-200">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Sous-total :</span>
                    <span className="font-medium">{sousTotal.toLocaleString()} FCFA</span>
                  </div>
                  {tvaApplicable && (
                    <div className="flex justify-between text-orange-600">
                      <span>TVA ({tauxTva}%) :</span>
                      <span className="font-medium">{montantTva.toLocaleString()} FCFA</span>
                    </div>
                  )}
                  {fraisLivraison > 0 && (
                    <div className="flex justify-between">
                      <span>Frais de livraison :</span>
                      <span className="font-medium">{fraisLivraison.toLocaleString()} FCFA</span>
                    </div>
                  )}
                  {remiseGlobale > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Remise :</span>
                      <span className="font-medium">-{remiseGlobale.toLocaleString()} FCFA</span>
                    </div>
                  )}
                  <Separator className="my-2" />
                  <div className="flex justify-between text-lg font-bold text-orange-600">
                    <span>TOTAL :</span>
                    <span>{montantTotal.toLocaleString()} FCFA</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section Livraison */}
          <Card className="border-2 border-orange-200 shadow-md">
            <CardHeader className="bg-gradient-to-r from-orange-100 to-amber-100">
              <CardTitle className="text-orange-700 flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Modalités de Livraison
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Mode de livraison</Label>
                <Select value={modeLivraison} onValueChange={setModeLivraison}>
                  <SelectTrigger className="border-orange-100 focus:border-orange-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="retrait_usine">Retrait à l'usine</SelectItem>
                    <SelectItem value="livraison_domicile">Livraison à domicile</SelectItem>
                    <SelectItem value="livraison_chantier">Livraison sur chantier</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {modeLivraison !== 'retrait_usine' && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Adresse de livraison</Label>
                  <Textarea
                    value={adresseLivraison}
                    onChange={(e) => setAdresseLivraison(e.target.value)}
                    placeholder="Adresse complète de livraison..."
                    className="border-orange-100 focus:border-orange-400"
                    rows={3}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Commentaires */}
          <Card className="border-2 border-orange-200 shadow-md">
            <CardContent className="p-6">
              <Label className="text-sm font-medium text-gray-700">Commentaires & Notes</Label>
              <Textarea
                value={commentaires}
                onChange={(e) => setCommentaires(e.target.value)}
                placeholder="Commentaires, conditions particulières, informations additionnelles..."
                className="border-orange-100 focus:border-orange-400 mt-2"
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Boutons d'action */}
          <Card className="border-2 border-orange-200 shadow-md">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="border-2 border-gray-300 hover:border-gray-400"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={loading || produits.length === 0 || !selectedClientName}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold px-8 py-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Création en cours...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Créer {type === 'facture' ? 'la Facture' : 'le Devis'}
                    </div>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
};
