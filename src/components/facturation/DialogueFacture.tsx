import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Plus, Minus, Trash2, UserPlus, Search, Truck, MapPin, Gift } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useProductsWithStock } from '@/hooks/useSupabaseDatabase';
import { useClientsComplets } from '@/hooks/useFacturationDatabase';

interface ProductItem {
  id: string;
  nom_produit: string;
  quantite: number;
  prix_unitaire: number;
  prix_original: number;
  remise_pourcentage: number;
  remise_montant: number;
  total_ligne: number;
  product_id?: string;
}

interface DialogueFactureProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (factureData: any, items: ProductItem[]) => Promise<void>;
  facture?: any;
  type: 'facture' | 'devis';
}

export const DialogueFacture = ({ 
  open, 
  onOpenChange, 
  onSubmit, 
  facture,
  type 
}: DialogueFactureProps) => {
  const { products: availableProducts, loading: productsLoading } = useProductsWithStock();
  const { data: clients, loading: clientsLoading, create: createClient } = useClientsComplets();

  const [formData, setFormData] = useState({
    client_nom: '',
    client_telephone: '',
    client_adresse: '',
    client_id: '',
    date_facture: new Date().toISOString().split('T')[0],
    date_echeance: '',
    commentaires: '',
    statut: 'brouillon',
    mode_livraison: 'retrait_usine', // retrait_usine, livraison_payante, livraison_gratuite
    frais_livraison: 0,
    adresse_livraison: '',
    remise_globale_pourcentage: 0,
    remise_globale_montant: 0
  });

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [newClientData, setNewClientData] = useState({
    nom_complet: '',
    telephone: '',
    adresse: '',
    email: '',
    notes: ''
  });

  useEffect(() => {
    if (facture) {
      setFormData({
        client_nom: facture.client_nom || '',
        client_telephone: facture.client_telephone || '',
        client_adresse: facture.client_adresse || '',
        client_id: facture.client_id || '',
        date_facture: facture.date_facture || new Date().toISOString().split('T')[0],
        date_echeance: facture.date_echeance || '',
        commentaires: facture.commentaires || '',
        statut: facture.statut || 'brouillon',
        mode_livraison: facture.mode_livraison || 'retrait_usine',
        frais_livraison: facture.frais_livraison || 0,
        adresse_livraison: facture.adresse_livraison || '',
        remise_globale_pourcentage: facture.remise_globale_pourcentage || 0,
        remise_globale_montant: facture.remise_globale_montant || 0
      });
      
      if (type === 'facture' && facture.facture_items) {
        setProducts(facture.facture_items.map((item: any) => ({
          ...item,
          prix_original: item.prix_original || item.prix_unitaire,
          remise_pourcentage: item.remise_pourcentage || 0,
          remise_montant: item.remise_montant || 0
        })));
      } else if (type === 'devis' && facture.devis_items) {
        setProducts(facture.devis_items.map((item: any) => ({
          ...item,
          prix_original: item.prix_original || item.prix_unitaire,
          remise_pourcentage: item.remise_pourcentage || 0,
          remise_montant: item.remise_montant || 0
        })));
      }
    } else {
      // Réinitialiser le formulaire
      setFormData({
        client_nom: '',
        client_telephone: '',
        client_adresse: '',
        client_id: '',
        date_facture: new Date().toISOString().split('T')[0],
        date_echeance: type === 'devis' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : '',
        commentaires: '',
        statut: 'brouillon',
        mode_livraison: 'retrait_usine',
        frais_livraison: 0,
        adresse_livraison: '',
        remise_globale_pourcentage: 0,
        remise_globale_montant: 0
      });
      setProducts([]);
    }
  }, [facture, type, open]);

  const handleClientSelect = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setFormData(prev => ({
        ...prev,
        client_id: client.id,
        client_nom: client.nom_complet,
        client_telephone: client.telephone || '',
        client_adresse: client.adresse || '',
        adresse_livraison: client.adresse || ''
      }));
    }
  };

  const handleCreateNewClient = async () => {
    try {
      const client = await createClient(newClientData);
      setFormData(prev => ({
        ...prev,
        client_id: client.id,
        client_nom: client.nom_complet,
        client_telephone: client.telephone || '',
        client_adresse: client.adresse || '',
        adresse_livraison: client.adresse || ''
      }));
      setNewClientData({
        nom_complet: '',
        telephone: '',
        adresse: '',
        email: '',
        notes: ''
      });
      setShowNewClientForm(false);
    } catch (error) {
      console.error('Error creating client:', error);
    }
  };

  const addProduct = () => {
    if (!selectedProductId) return;
    
    const product = availableProducts.find(p => p.id === selectedProductId);
    if (product) {
      const newProduct: ProductItem = {
        id: crypto.randomUUID(),
        nom_produit: `${product.name} (${product.dimensions})`,
        quantite: 1,
        prix_unitaire: product.price,
        prix_original: product.price,
        remise_pourcentage: 0,
        remise_montant: 0,
        total_ligne: product.price,
        product_id: product.id
      };
      setProducts([...products, newProduct]);
      setSelectedProductId('');
    }
  };

  const addCustomProduct = () => {
    const newProduct: ProductItem = {
      id: crypto.randomUUID(),
      nom_produit: '',
      quantite: 1,
      prix_unitaire: 0,
      prix_original: 0,
      remise_pourcentage: 0,
      remise_montant: 0,
      total_ligne: 0
    };
    setProducts([...products, newProduct]);
  };

  const updateProduct = (id: string, updates: Partial<ProductItem>) => {
    setProducts(products.map(p => {
      if (p.id === id) {
        const updated = { ...p, ...updates };
        
        // Recalculer les remises et totaux
        if (updated.remise_pourcentage > 0) {
          updated.remise_montant = (updated.prix_original * updated.remise_pourcentage) / 100;
          updated.prix_unitaire = updated.prix_original - updated.remise_montant;
        } else if (updated.remise_montant > 0) {
          updated.prix_unitaire = updated.prix_original - updated.remise_montant;
          updated.remise_pourcentage = (updated.remise_montant / updated.prix_original) * 100;
        } else {
          updated.prix_unitaire = updated.prix_original;
        }
        
        updated.total_ligne = updated.quantite * updated.prix_unitaire;
        return updated;
      }
      return p;
    }));
  };

  const removeProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  // Calculs des totaux
  const sousTotal = products.reduce((sum, product) => sum + product.total_ligne, 0);
  const remiseGlobale = formData.remise_globale_pourcentage > 0 
    ? (sousTotal * formData.remise_globale_pourcentage) / 100 
    : formData.remise_globale_montant;
  const sousApresRemise = sousTotal - remiseGlobale;
  const fraisLivraison = formData.mode_livraison === 'livraison_payante' ? formData.frais_livraison : 0;
  const totalFinal = sousApresRemise + fraisLivraison;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.client_nom || products.length === 0) {
      return;
    }

    const numero = type === 'facture' 
      ? `FAC-${Date.now().toString().slice(-6)}` 
      : `DEV-${Date.now().toString().slice(-6)}`;

    const baseData = {
      client_nom: formData.client_nom,
      client_telephone: formData.client_telephone,
      client_adresse: formData.client_adresse,
      client_id: formData.client_id || null,
      montant_total: totalFinal,
      commentaires: formData.commentaires,
      statut: formData.statut,
      mode_livraison: formData.mode_livraison,
      frais_livraison: fraisLivraison,
      adresse_livraison: formData.adresse_livraison,
      remise_globale_pourcentage: formData.remise_globale_pourcentage,
      remise_globale_montant: remiseGlobale,
      sous_total: sousTotal
    };

    const factureData = type === 'facture' 
      ? {
          ...baseData,
          numero_facture: numero,
          date_facture: formData.date_facture,
          date_echeance: formData.date_echeance || null
        }
      : {
          ...baseData,
          numero_devis: numero,
          date_devis: formData.date_facture,
          date_echeance: formData.date_echeance
        };

    await onSubmit(factureData, products);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-orange-600">
            {facture ? `Modifier ${type}` : `Nouveau ${type}`}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section Client */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Informations Client
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Client existant</Label>
                  <Select onValueChange={handleClientSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un client existant..." />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.nom_complet} - {client.telephone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowNewClientForm(!showNewClientForm)}
                    className="w-full"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Nouveau client
                  </Button>
                </div>
              </div>

              {showNewClientForm && (
                <Card className="border-orange-200">
                  <CardHeader>
                    <CardTitle className="text-lg">Créer un nouveau client</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Nom complet *</Label>
                        <Input
                          value={newClientData.nom_complet}
                          onChange={(e) => setNewClientData(prev => ({ ...prev, nom_complet: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label>Téléphone</Label>
                        <Input
                          value={newClientData.telephone}
                          onChange={(e) => setNewClientData(prev => ({ ...prev, telephone: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={newClientData.email}
                          onChange={(e) => setNewClientData(prev => ({ ...prev, email: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label>Adresse</Label>
                        <Input
                          value={newClientData.adresse}
                          onChange={(e) => setNewClientData(prev => ({ ...prev, adresse: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Notes</Label>
                      <Textarea
                        value={newClientData.notes}
                        onChange={(e) => setNewClientData(prev => ({ ...prev, notes: e.target.value }))}
                        rows={2}
                      />
                    </div>
                    <Button type="button" onClick={handleCreateNewClient}>
                      Créer le client
                    </Button>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Nom du client *</Label>
                  <Input
                    value={formData.client_nom}
                    onChange={(e) => setFormData(prev => ({ ...prev, client_nom: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label>Téléphone</Label>
                  <Input
                    value={formData.client_telephone}
                    onChange={(e) => setFormData(prev => ({ ...prev, client_telephone: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Adresse</Label>
                  <Input
                    value={formData.client_adresse}
                    onChange={(e) => setFormData(prev => ({ ...prev, client_adresse: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section Dates */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Date {type === 'facture' ? 'de facture' : 'de devis'} *</Label>
                  <Input
                    type="date"
                    value={formData.date_facture}
                    onChange={(e) => setFormData(prev => ({ ...prev, date_facture: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label>
                    {type === 'facture' ? 'Date d\'échéance' : 'Valide jusqu\'au'} *
                  </Label>
                  <Input
                    type="date"
                    value={formData.date_echeance}
                    onChange={(e) => setFormData(prev => ({ ...prev, date_echeance: e.target.value }))}
                    required={type === 'devis'}
                  />
                </div>
                <div>
                  <Label>Statut</Label>
                  <Select 
                    value={formData.statut} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, statut: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="brouillon">Brouillon</SelectItem>
                      <SelectItem value={type === 'facture' ? 'envoyee' : 'envoye'}>
                        {type === 'facture' ? 'Envoyée' : 'Envoyé'}
                      </SelectItem>
                      <SelectItem value={type === 'facture' ? 'payee' : 'accepte'}>
                        {type === 'facture' ? 'Payée' : 'Accepté'}
                      </SelectItem>
                      <SelectItem value={type === 'facture' ? 'en_retard' : 'refuse'}>
                        {type === 'facture' ? 'En retard' : 'Refusé'}
                      </SelectItem>
                      {type === 'devis' && <SelectItem value="expire">Expiré</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section Mode de Livraison */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Mode de Livraison
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Mode de livraison</Label>
                  <Select 
                    value={formData.mode_livraison} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, mode_livraison: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="retrait_usine">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Retrait à l'usine
                        </div>
                      </SelectItem>
                      <SelectItem value="livraison_payante">
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4" />
                          Livraison payante
                        </div>
                      </SelectItem>
                      <SelectItem value="livraison_gratuite">
                        <div className="flex items-center gap-2">
                          <Gift className="h-4 w-4" />
                          Livraison gratuite
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {formData.mode_livraison === 'livraison_payante' && (
                  <div>
                    <Label>Frais de livraison (FCFA)</Label>
                    <Input
                      type="number"
                      value={formData.frais_livraison}
                      onChange={(e) => setFormData(prev => ({ ...prev, frais_livraison: parseFloat(e.target.value) || 0 }))}
                      min="0"
                    />
                  </div>
                )}
                
                {(formData.mode_livraison === 'livraison_payante' || formData.mode_livraison === 'livraison_gratuite') && (
                  <div>
                    <Label>Adresse de livraison</Label>
                    <Input
                      value={formData.adresse_livraison}
                      onChange={(e) => setFormData(prev => ({ ...prev, adresse_livraison: e.target.value }))}
                      placeholder="Adresse complète de livraison"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Section Produits */}
          <Card>
            <CardHeader>
              <CardTitle>Produits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Ajouter des produits */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label>Sélectionner un produit</Label>
                  <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un produit..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} ({product.dimensions}) - {product.price.toLocaleString()} FCFA
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Button 
                    type="button" 
                    onClick={addProduct}
                    disabled={!selectedProductId}
                    className="mr-2 w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={addCustomProduct}
                    className="w-full"
                  >
                    Produit personnalisé
                  </Button>
                </div>
              </div>

              {/* Liste des produits */}
              {products.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Produits ajoutés ({products.length})</Label>
                  {products.map((product) => (
                    <Card key={product.id} className="p-4 bg-gray-50">
                      <div className="space-y-3">
                        {/* Ligne 1: Nom du produit */}
                        <div>
                          <Input
                            placeholder="Nom du produit"
                            value={product.nom_produit}
                            onChange={(e) => updateProduct(product.id, { nom_produit: e.target.value })}
                            required
                            className="bg-white"
                          />
                        </div>
                        
                        {/* Ligne 2: Quantité, Prix original, Remise */}
                        <div className="grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-3">
                            <Label className="text-xs">Quantité</Label>
                            <div className="flex items-center gap-1">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => updateProduct(product.id, { quantite: Math.max(1, product.quantite - 1) })}
                                className="h-8 w-8 p-0"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <Input
                                type="number"
                                value={product.quantite}
                                onChange={(e) => updateProduct(product.id, { quantite: parseInt(e.target.value) || 1 })}
                                min="1"
                                required
                                className="text-center bg-white"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => updateProduct(product.id, { quantite: product.quantite + 1 })}
                                className="h-8 w-8 p-0"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="col-span-3">
                            <Label className="text-xs">Prix unitaire original</Label>
                            <Input
                              type="number"
                              value={product.prix_original}
                              onChange={(e) => updateProduct(product.id, { prix_original: parseFloat(e.target.value) || 0 })}
                              min="0"
                              step="0.01"
                              required
                              className="bg-white"
                            />
                          </div>
                          
                          <div className="col-span-2">
                            <Label className="text-xs">Remise %</Label>
                            <Input
                              type="number"
                              value={product.remise_pourcentage}
                              onChange={(e) => updateProduct(product.id, { remise_pourcentage: parseFloat(e.target.value) || 0, remise_montant: 0 })}
                              min="0"
                              max="100"
                              step="0.1"
                              className="bg-white"
                            />
                          </div>
                          
                          <div className="col-span-2">
                            <Label className="text-xs">Remise FCFA</Label>
                            <Input
                              type="number"
                              value={product.remise_montant}
                              onChange={(e) => updateProduct(product.id, { remise_montant: parseFloat(e.target.value) || 0, remise_pourcentage: 0 })}
                              min="0"
                              step="0.01"
                              className="bg-white"
                            />
                          </div>
                          
                          <div className="col-span-1">
                            <Label className="text-xs">Prix final</Label>
                            <div className="text-sm font-medium text-green-600">
                              {product.prix_unitaire.toLocaleString()}
                            </div>
                          </div>
                          
                          <div className="col-span-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeProduct(product.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Ligne 3: Total de la ligne */}
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            Total ligne: {product.total_ligne.toLocaleString()} FCFA
                          </div>
                          {product.remise_pourcentage > 0 || product.remise_montant > 0 ? (
                            <div className="text-sm text-gray-500">
                              Économie: {(product.prix_original - product.prix_unitaire).toLocaleString()} FCFA par unité
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Remise globale */}
              {products.length > 0 && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Remise globale %</Label>
                        <Input
                          type="number"
                          value={formData.remise_globale_pourcentage}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            remise_globale_pourcentage: parseFloat(e.target.value) || 0,
                            remise_globale_montant: 0
                          }))}
                          min="0"
                          max="100"
                          step="0.1"
                        />
                      </div>
                      <div>
                        <Label>Remise globale FCFA</Label>
                        <Input
                          type="number"
                          value={formData.remise_globale_montant}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            remise_globale_montant: parseFloat(e.target.value) || 0,
                            remise_globale_pourcentage: 0
                          }))}
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Total final */}
              {products.length > 0 && (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Sous-total:</span>
                        <span className="font-medium">{sousTotal.toLocaleString()} FCFA</span>
                      </div>
                      {remiseGlobale > 0 && (
                        <div className="flex justify-between text-sm text-red-600">
                          <span>Remise globale:</span>
                          <span>-{remiseGlobale.toLocaleString()} FCFA</span>
                        </div>
                      )}
                      {fraisLivraison > 0 && (
                        <div className="flex justify-between text-sm text-blue-600">
                          <span>Frais de livraison:</span>
                          <span>+{fraisLivraison.toLocaleString()} FCFA</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total final:</span>
                        <span className="text-green-600">{totalFinal.toLocaleString()} FCFA</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Commentaires */}
          <Card>
            <CardContent className="pt-6">
              <div>
                <Label>Commentaires</Label>
                <Textarea
                  value={formData.commentaires}
                  onChange={(e) => setFormData(prev => ({ ...prev, commentaires: e.target.value }))}
                  placeholder="Commentaires ou notes supplémentaires..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={!formData.client_nom || products.length === 0}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {facture ? `Mettre à jour ${type}` : `Créer ${type}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
