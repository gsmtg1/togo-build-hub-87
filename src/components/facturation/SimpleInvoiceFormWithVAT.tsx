import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon, Plus, Trash2, Calculator, FileText, Building2, User, MapPin, Phone, Mail, CreditCard, Truck, Percent, DollarSign, Package } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SimpleProductSelector } from './SimpleProductSelector';
import { useFacturesProfessionnelles } from '@/hooks/useFacturesProfessionnelles';
import { useDevisProfessionnels } from '@/hooks/useFacturationDatabase';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ProductItem {
  id: string;
  nom: string;
  quantite: number;
  prix_unitaire: number;
  total_ligne: number;
  product_id?: string | null;
}

interface SimpleInvoiceFormWithVATProps {
  onInvoiceCreated?: () => void;
  type?: 'facture' | 'devis';
  initialData?: any;
  onClose?: () => void;
}

export const SimpleInvoiceFormWithVAT = ({ 
  onInvoiceCreated, 
  type = 'facture',
  initialData,
  onClose 
}: SimpleInvoiceFormWithVATProps) => {
  const [numeroFacture, setNumeroFacture] = useState('');
  const [clientNom, setClientNom] = useState('');
  const [clientTelephone, setClientTelephone] = useState('');
  const [clientAdresse, setClientAdresse] = useState('');
  const [dateFacture, setDateFacture] = useState<Date>(new Date());
  const [dateEcheance, setDateEcheance] = useState<Date | undefined>();
  const [statut, setStatut] = useState('brouillon');
  const [commentaires, setCommentaires] = useState('');
  const [produits, setProduits] = useState<ProductItem[]>([]);
  const [modeLivraison, setModeLivraison] = useState('retrait_usine');
  const [fraisLivraison, setFraisLivraison] = useState(0);
  const [adresseLivraison, setAdresseLivraison] = useState('');
  const [remiseGlobaleMontant, setRemiseGlobaleMontant] = useState(0);
  const [tvaApplicable, setTvaApplicable] = useState(false);
  const [tauxTva, setTauxTva] = useState(18);
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();
  const facturesHook = useFacturesProfessionnelles();
  const devisHook = useDevisProfessionnels();

  // Use the appropriate hook based on type
  const dataHook = type === 'devis' ? devisHook : facturesHook;

  // Initialize form with initialData if provided
  useEffect(() => {
    if (initialData) {
      setNumeroFacture(initialData.numero_facture || initialData.numero_devis || '');
      setClientNom(initialData.client_nom || '');
      setClientTelephone(initialData.client_telephone || '');
      setClientAdresse(initialData.client_adresse || '');
      setDateFacture(initialData.date_facture ? new Date(initialData.date_facture) : initialData.date_devis ? new Date(initialData.date_devis) : new Date());
      setDateEcheance(initialData.date_echeance ? new Date(initialData.date_echeance) : undefined);
      setStatut(initialData.statut || 'brouillon');
      setCommentaires(initialData.commentaires || '');
      setModeLivraison(initialData.mode_livraison || 'retrait_usine');
      setFraisLivraison(initialData.frais_livraison || 0);
      setAdresseLivraison(initialData.adresse_livraison || '');
      setRemiseGlobaleMontant(initialData.remise_globale_montant || 0);
      setTvaApplicable(initialData.tva_applicable || false);
      setTauxTva(initialData.taux_tva || 18);

      // Load existing products/items
      if (type === 'devis' && initialData.devis_produits) {
        setProduits(initialData.devis_produits.map((p: any) => ({
          id: p.id,
          nom: p.nom_produit,
          quantite: p.quantite,
          prix_unitaire: p.prix_unitaire,
          total_ligne: p.total_ligne,
          product_id: p.product_id
        })));
      } else if (type === 'facture' && initialData.facture_items) {
        setProduits(initialData.facture_items.map((item: any) => ({
          id: item.id,
          nom: item.nom_produit,
          quantite: item.quantite,
          prix_unitaire: item.prix_unitaire,
          total_ligne: item.total_ligne,
          product_id: item.product_id
        })));
      }
    } else {
      // Generate new number for new documents
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const time = String(now.getHours()).padStart(2, '0') + String(now.getMinutes()).padStart(2, '0');
      
      const prefix = type === 'devis' ? 'DEV' : 'FAC';
      const newNumber = `${prefix}-${year}${month}${day}-${time}`;
      setNumeroFacture(newNumber);
    }
  }, [initialData, type]);

  const sousTotal = produits.reduce((sum, produit) => sum + produit.total_ligne, 0);
  const montantTva = tvaApplicable ? (sousTotal * tauxTva / 100) : 0;
  const montantTotal = sousTotal + montantTva + fraisLivraison - remiseGlobaleMontant;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleProduitsChange = (nouveauxProduits: ProductItem[]) => {
    console.log('Produits mis à jour:', nouveauxProduits);
    setProduits(nouveauxProduits);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      
      // Validation
      if (!numeroFacture.trim()) {
        toast({
          title: "Erreur",
          description: `Le numéro de ${type} est requis`,
          variant: "destructive",
        });
        return;
      }
      
      if (!clientNom.trim()) {
        toast({
          title: "Erreur",
          description: "Le nom du client est requis",
          variant: "destructive",
        });
        return;
      }
      
      if (produits.length === 0) {
        toast({
          title: "Erreur",
          description: "Au moins un produit doit être ajouté",
          variant: "destructive",
        });
        return;
      }

      // Prepare data with all required properties
      const documentData = {
        // Include the required properties for both facture and devis
        numero_facture: type === 'facture' ? numeroFacture : undefined,
        numero_devis: type === 'devis' ? numeroFacture : undefined,
        date_facture: type === 'facture' ? dateFacture.toISOString() : undefined,
        date_devis: type === 'devis' ? dateFacture.toISOString() : undefined,
        // Common properties
        client_nom: clientNom,
        client_telephone: clientTelephone,
        client_adresse: clientAdresse,
        date_echeance: dateEcheance?.toISOString() || null,
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
        description: `${type === 'devis' ? 'Devis' : 'Facture'} créé${type === 'devis' ? '' : 'e'} avec succès`,
      });
      
      if (onInvoiceCreated) {
        onInvoiceCreated();
      }

      if (onClose) {
        onClose();
      }
      
    } catch (error: any) {
      console.error(`Erreur création ${type}:`, error);
      toast({
        title: "Erreur",
        description: error.message || `Impossible de créer ${type === 'devis' ? 'le devis' : 'la facture'}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Header with document info */}
        <Card className="border-2 border-primary/10 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
            <CardTitle className="flex items-center gap-3 text-primary">
              <FileText className="h-6 w-6" />
              Informations {type === 'devis' ? 'du devis' : 'de la facture'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="numero" className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Numéro {type === 'devis' ? 'du devis' : 'de facture'}
                </Label>
                <Input
                  id="numero"
                  value={numeroFacture}
                  onChange={(e) => setNumeroFacture(e.target.value)}
                  placeholder={`${type === 'devis' ? 'DEV' : 'FAC'}-20240101-0001`}
                  className="font-mono text-primary font-semibold"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Date {type === 'devis' ? 'du devis' : 'de facturation'}
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateFacture && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFacture ? format(dateFacture, "PPP", { locale: fr }) : "Sélectionner une date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateFacture}
                      onSelect={(date) => date && setDateFacture(date)}
                      initialFocus
                      locale={fr}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Date d'échéance (optionnelle)
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateEcheance && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateEcheance ? format(dateEcheance, "PPP", { locale: fr }) : "Aucune échéance"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateEcheance}
                      onSelect={setDateEcheance}
                      initialFocus
                      locale={fr}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="statut" className="text-sm font-medium">Statut</Label>
                <Select value={statut} onValueChange={setStatut}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brouillon">Brouillon</SelectItem>
                    <SelectItem value="valide">{type === 'devis' ? 'Validé' : 'Validée'}</SelectItem>
                    <SelectItem value={type === 'devis' ? 'envoye' : 'envoyee'}>{type === 'devis' ? 'Envoyé' : 'Envoyée'}</SelectItem>
                    {type === 'devis' ? (
                      <>
                        <SelectItem value="accepte">Accepté</SelectItem>
                        <SelectItem value="refuse">Refusé</SelectItem>
                        <SelectItem value="expire">Expiré</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="payee">Payée</SelectItem>
                        <SelectItem value="annulee">Annulée</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Client info card */}
        <Card className="border-2 border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
            <CardTitle className="flex items-center gap-3 text-blue-700">
              <User className="h-6 w-6" />
              Informations Client
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientNom" className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Nom du client *
                </Label>
                <Input
                  id="clientNom"
                  value={clientNom}
                  onChange={(e) => setClientNom(e.target.value)}
                  placeholder="Nom complet ou raison sociale"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="clientTelephone" className="text-sm font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Téléphone
                </Label>
                <Input
                  id="clientTelephone"
                  value={clientTelephone}
                  onChange={(e) => setClientTelephone(e.target.value)}
                  placeholder="+225 XX XX XX XX"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="clientAdresse" className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
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

        {/* Products section */}
        <Card className="border-2 border-green-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
            <CardTitle className="flex items-center gap-3 text-green-700">
              <Package className="h-6 w-6" />
              Produits et Services
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <SimpleProductSelector
              products={produits}
              onProductsChange={handleProduitsChange}
            />
          </CardContent>
        </Card>

        {/* Tax section */}
        {tvaApplicable && (
          <Card className="border-2 border-purple-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100">
              <CardTitle className="flex items-center gap-3 text-purple-700">
                <Percent className="h-6 w-6" />
                Configuration TVA
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-2">
                <Label htmlFor="tauxTva" className="text-sm font-medium">Taux de TVA (%)</Label>
                <Input
                  id="tauxTva"
                  type="number"
                  value={tauxTva}
                  onChange={(e) => setTauxTva(Number(e.target.value))}
                  min="0"
                  max="100"
                  step="0.01"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Delivery section */}
        <Card className="border-2 border-amber-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-amber-100">
            <CardTitle className="flex items-center gap-3 text-amber-700">
              <Truck className="h-6 w-6" />
              Livraison
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="modeLivraison" className="text-sm font-medium">Mode de livraison</Label>
                <Select value={modeLivraison} onValueChange={setModeLivraison}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="retrait_usine">Retrait usine</SelectItem>
                    <SelectItem value="livraison_standard">Livraison standard</SelectItem>
                    <SelectItem value="livraison_express">Livraison express</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fraisLivraison" className="text-sm font-medium">Frais de livraison (XOF)</Label>
                <Input
                  id="fraisLivraison"
                  type="number"
                  value={fraisLivraison}
                  onChange={(e) => setFraisLivraison(Number(e.target.value))}
                  min="0"
                  step="1"
                />
              </div>
            </div>
            
            {modeLivraison !== 'retrait_usine' && (
              <div className="mt-4 space-y-2">
                <Label htmlFor="adresseLivraison" className="text-sm font-medium">Adresse de livraison</Label>
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

        {/* Summary and options */}
        <Card className="border-2 border-orange-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100">
            <CardTitle className="flex items-center gap-3 text-orange-700">
              <Calculator className="h-6 w-6" />
              Récapitulatif et Options
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* TVA toggle */}
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="space-y-1">
                <Label htmlFor="tvaApplicable" className="text-sm font-medium text-purple-700">
                  TVA applicable
                </Label>
                <p className="text-sm text-purple-600">
                  La TVA sera appliquée sur le sous-total
                </p>
              </div>
              <Switch
                id="tvaApplicable"
                checked={tvaApplicable}
                onCheckedChange={setTvaApplicable}
              />
            </div>

            {/* Discount */}
            <div className="space-y-2">
              <Label htmlFor="remiseGlobaleMontant" className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Remise globale (XOF)
              </Label>
              <Input
                id="remiseGlobaleMontant"
                type="number"
                value={remiseGlobaleMontant}
                onChange={(e) => setRemiseGlobaleMontant(Number(e.target.value))}
                min="0"
                step="1"
              />
            </div>

            {/* Comments */}
            <div className="space-y-2">
              <Label htmlFor="commentaires" className="text-sm font-medium">Commentaires</Label>
              <Textarea
                id="commentaires"
                value={commentaires}
                onChange={(e) => setCommentaires(e.target.value)}
                placeholder="Notes ou commentaires additionnels..."
                rows={3}
              />
            </div>

            <Separator />

            {/* Financial summary */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border-2 border-green-200">
              <h3 className="text-lg font-semibold text-green-700 mb-4 flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Résumé financier
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span>Sous-total :</span>
                  <span className="font-semibold">{formatCurrency(sousTotal)}</span>
                </div>
                
                {tvaApplicable && (
                  <div className="flex justify-between items-center text-sm text-purple-600">
                    <span>TVA ({tauxTva}%) :</span>
                    <span className="font-semibold">{formatCurrency(montantTva)}</span>
                  </div>
                )}
                
                {fraisLivraison > 0 && (
                  <div className="flex justify-between items-center text-sm text-amber-600">
                    <span>Frais de livraison :</span>
                    <span className="font-semibold">{formatCurrency(fraisLivraison)}</span>
                  </div>
                )}
                
                {remiseGlobaleMontant > 0 && (
                  <div className="flex justify-between items-center text-sm text-red-600">
                    <span>Remise :</span>
                    <span className="font-semibold">-{formatCurrency(remiseGlobaleMontant)}</span>
                  </div>
                )}
                
                <Separator />
                
                <div className="flex justify-between items-center text-lg font-bold text-green-700">
                  <span>Total :</span>
                  <span className="text-2xl">{formatCurrency(montantTotal)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            size="lg"
            disabled={isLoading || produits.length === 0}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-8"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Création en cours...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Créer {type === 'devis' ? 'le devis' : 'la facture'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
