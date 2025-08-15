
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SelectorProduitAmélioré } from './SelectorProduitAmélioré';
import { VueFactureComplete } from './VueFactureComplete';
import { useFacturesProfessionnelles } from '@/hooks/useFacturesProfessionnelles';
import { useClientsComplets } from '@/hooks/useFacturationDatabase';
import { useToast } from '@/hooks/use-toast';
import { FileText, Send, Download, Printer, Eye } from 'lucide-react';

interface ProduitFacture {
  id: string;
  nom: string;
  quantite: number;
  prix_unitaire: number;
  total_ligne: number;
  type_produit?: 'produit' | 'brique';
}

interface DialogueFactureCompleteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  facture?: any;
  onClose: () => void;
}

export const DialogueFactureComplete = ({ open, onOpenChange, facture, onClose }: DialogueFactureCompleteProps) => {
  const { create, update } = useFacturesProfessionnelles();
  const { data: clients } = useClientsComplets();
  const { toast } = useToast();
  
  const [produits, setProduits] = useState<ProduitFacture[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [savedFacture, setSavedFacture] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    numero_facture: '',
    client_id: '',
    client_nom: '',
    client_telephone: '',
    client_adresse: '',
    client_email: '',
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

  useEffect(() => {
    if (facture) {
      setFormData({
        numero_facture: facture.numero_facture || '',
        client_id: facture.client_id || '',
        client_nom: facture.client_nom || '',
        client_telephone: facture.client_telephone || '',
        client_adresse: facture.client_adresse || '',
        client_email: facture.client_email || '',
        date_facture: facture.date_facture || new Date().toISOString().split('T')[0],
        date_echeance: facture.date_echeance || '',
        remise_pourcentage: facture.remise_pourcentage || 0,
        remise_montant: facture.remise_globale_montant || 0,
        mode_livraison: facture.mode_livraison || 'retrait_usine',
        frais_livraison: facture.frais_livraison || 0,
        adresse_livraison: facture.adresse_livraison || '',
        commentaires: facture.commentaires || '',
        statut: facture.statut || 'brouillon'
      });
      
      if (facture.facture_items) {
        const produitsFacture = facture.facture_items.map((item: any) => ({
          id: item.product_id || `item-${item.id}`,
          nom: item.nom_produit,
          quantite: item.quantite,
          prix_unitaire: item.prix_unitaire,
          total_ligne: item.total_ligne
        }));
        setProduits(produitsFacture);
      }
    } else {
      const numeroFacture = `FAC-${Date.now().toString().slice(-6)}`;
      setFormData({
        numero_facture: numeroFacture,
        client_id: '',
        client_nom: '',
        client_telephone: '',
        client_adresse: '',
        client_email: '',
        date_facture: new Date().toISOString().split('T')[0],
        date_echeance: '',
        remise_pourcentage: 0,
        remise_montant: 0,
        mode_livraison: 'retrait_usine',
        frais_livraison: 0,
        adresse_livraison: '',
        commentaires: '',
        statut: 'brouillon'
      });
      setProduits([]);
    }
  }, [facture]);

  const calculerTotaux = () => {
    const sousTotal = produits.reduce((sum, p) => sum + p.total_ligne, 0);
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
        client_adresse: client.adresse || '',
        client_email: client.email || ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== DÉBUT CRÉATION FACTURE ===');
    console.log('Produits sélectionnés:', produits);
    console.log('Données du formulaire:', formData);
    
    if (produits.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez ajouter au moins un produit à la facture",
        variant: "destructive",
      });
      return;
    }

    if (!formData.client_nom.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir le nom du client",
        variant: "destructive",
      });
      return;
    }

    if (!formData.numero_facture.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir le numéro de facture",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const totaux = calculerTotaux();

    try {
      const factureData = {
        numero_facture: formData.numero_facture,
        client_id: formData.client_id || null,
        client_nom: formData.client_nom,
        client_telephone: formData.client_telephone || '',
        client_adresse: formData.client_adresse || '',
        date_facture: formData.date_facture,
        date_echeance: formData.date_echeance || null,
        montant_total: totaux.totalFinal,
        statut: formData.statut,
        commentaires: formData.commentaires || '',
        mode_livraison: formData.mode_livraison,
        frais_livraison: totaux.fraisLivraison,
        adresse_livraison: formData.adresse_livraison || '',
        sous_total: totaux.sousTotal,
        remise_globale_montant: totaux.montantRemise
      };

      const produitsData = produits.map(p => ({
        nom_produit: p.nom,
        quantite: p.quantite,
        prix_unitaire: p.prix_unitaire,
        total_ligne: p.total_ligne,
        product_id: p.id.startsWith('custom-') ? null : p.id
      }));

      console.log('Données facture à sauvegarder:', factureData);
      console.log('Items à sauvegarder:', produitsData);

      let result;
      if (facture) {
        result = await update(facture.id, factureData);
        result.facture_items = produitsData;
      } else {
        result = await create(factureData, produitsData);
        result.facture_items = produitsData;
      }
      
      console.log('Résultat de sauvegarde:', result);
      setSavedFacture({
        ...result,
        ...factureData,
        facture_items: produitsData
      });
      
      toast({
        title: "Succès",
        description: facture ? "Facture mise à jour avec succès" : "Facture créée avec succès",
      });

      // Fermer le dialogue principal et ouvrir l'aperçu
      onOpenChange(false);
      setShowPreview(true);
      
    } catch (error) {
      console.error('=== ERREUR CRÉATION FACTURE ===');
      console.error('Erreur complète:', error);
      console.error('Stack trace:', error);
      
      toast({
        title: "Erreur",
        description: `Impossible de sauvegarder la facture: ${error.message || 'Erreur inconnue'}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = () => {
    if (produits.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez ajouter au moins un produit pour voir l'aperçu",
        variant: "destructive",
      });
      return;
    }

    const totaux = calculerTotaux();
    const previewData = {
      ...formData,
      montant_total: totaux.totalFinal,
      sous_total: totaux.sousTotal,
      remise_globale_montant: totaux.montantRemise,
      frais_livraison: totaux.fraisLivraison,
      facture_items: produits.map(p => ({
        nom_produit: p.nom,
        quantite: p.quantite,
        prix_unitaire: p.prix_unitaire,
        total_ligne: p.total_ligne
      }))
    };
    
    setSavedFacture(previewData);
    setShowPreview(true);
  };

  const totaux = calculerTotaux();
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-orange-600">
              {facture ? 'Modifier la facture' : 'Nouvelle facture'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations générales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            </div>

            {/* Informations client */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-orange-600">Informations client</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="client_id">Client existant</Label>
                  <Select value={formData.client_id} onValueChange={handleClientChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un client existant" />
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
                  <Label htmlFor="client_email">Email</Label>
                  <Input
                    id="client_email"
                    type="email"
                    value={formData.client_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, client_email: e.target.value }))}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="client_adresse">Adresse</Label>
                  <Input
                    id="client_adresse"
                    value={formData.client_adresse}
                    onChange={(e) => setFormData(prev => ({ ...prev, client_adresse: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Sélection des produits */}
            <SelectorProduitAmélioré
              produits={produits}
              onProduitsChange={setProduits}
            />

            {/* Options de remise et livraison */}
            {produits.length > 0 && (
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

                {/* Résumé des totaux */}
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Sous-total:</span>
                      <span className="font-semibold">{formatCurrency(totaux.sousTotal)}</span>
                    </div>
                    
                    {totaux.montantRemise > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>Remise:</span>
                        <span>-{formatCurrency(totaux.montantRemise)}</span>
                      </div>
                    )}
                    
                    {totaux.fraisLivraison > 0 && (
                      <div className="flex justify-between">
                        <span>Frais de livraison:</span>
                        <span>{formatCurrency(totaux.fraisLivraison)}</span>
                      </div>
                    )}
                    
                    <hr className="border-orange-300" />
                    <div className="flex justify-between font-bold text-lg text-orange-600">
                      <span>Total:</span>
                      <span>{formatCurrency(totaux.totalFinal)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Commentaires */}
            <div>
              <Label htmlFor="commentaires">Commentaires</Label>
              <Textarea
                id="commentaires"
                value={formData.commentaires}
                onChange={(e) => setFormData(prev => ({ ...prev, commentaires: e.target.value }))}
                placeholder="Notes supplémentaires pour la facture..."
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 justify-between pt-4 border-t">
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={onClose}>
                  Annuler
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handlePreview}
                  disabled={produits.length === 0}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Aperçu
                </Button>
              </div>

              <Button 
                type="submit" 
                disabled={produits.length === 0 || !formData.numero_facture || !formData.client_nom || isLoading}
                className="bg-orange-500 hover:bg-orange-600"
              >
                {isLoading ? 'Sauvegarde...' : (facture ? 'Mettre à jour' : 'Créer la facture')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {savedFacture && (
        <VueFactureComplete
          open={showPreview}
          onOpenChange={setShowPreview}
          facture={savedFacture}
        />
      )}
    </>
  );
};
