
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Plus, Minus, Trash2, UserPlus, Search } from 'lucide-react';
import { useProductsWithStock } from '@/hooks/useSupabaseDatabase';
import { useClientsComplets } from '@/hooks/useFacturationDatabase';

interface ProductItem {
  id: string;
  nom_produit: string;
  quantite: number;
  prix_unitaire: number;
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
    statut: 'brouillon'
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
        statut: facture.statut || 'brouillon'
      });
      
      if (type === 'facture' && facture.facture_items) {
        setProducts(facture.facture_items);
      } else if (type === 'devis' && facture.devis_items) {
        setProducts(facture.devis_items);
      }
    } else {
      // Générer numéro automatique
      const numero = type === 'facture' 
        ? `FAC-${Date.now().toString().slice(-6)}` 
        : `DEV-${Date.now().toString().slice(-6)}`;
      
      setFormData({
        client_nom: '',
        client_telephone: '',
        client_adresse: '',
        client_id: '',
        date_facture: new Date().toISOString().split('T')[0],
        date_echeance: '',
        commentaires: '',
        statut: 'brouillon'
      });
      setProducts([]);
    }
  }, [facture, type]);

  const handleClientSelect = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setFormData(prev => ({
        ...prev,
        client_id: client.id,
        client_nom: client.nom_complet,
        client_telephone: client.telephone || '',
        client_adresse: client.adresse || ''
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
        client_adresse: client.adresse || ''
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
      total_ligne: 0
    };
    setProducts([...products, newProduct]);
  };

  const updateProduct = (id: string, updates: Partial<ProductItem>) => {
    setProducts(products.map(p => {
      if (p.id === id) {
        const updated = { ...p, ...updates };
        updated.total_ligne = updated.quantite * updated.prix_unitaire;
        return updated;
      }
      return p;
    }));
  };

  const removeProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const totalAmount = products.reduce((sum, product) => sum + product.total_ligne, 0);

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
      montant_total: totalAmount,
      commentaires: formData.commentaires,
      statut: formData.statut
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
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-orange-600">
            {facture ? `Modifier ${type}` : `Nouvelle ${type}`}
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

              {/* Informations client manuelles */}
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
                    className="mr-2"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={addCustomProduct}
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
                    <div key={product.id} className="grid grid-cols-12 gap-2 items-center p-3 border rounded-lg bg-gray-50">
                      <div className="col-span-4">
                        <Input
                          placeholder="Nom du produit"
                          value={product.nom_produit}
                          onChange={(e) => updateProduct(product.id, { nom_produit: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-span-2">
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
                            className="text-center"
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
                      <div className="col-span-2">
                        <Input
                          type="number"
                          placeholder="Prix unitaire"
                          value={product.prix_unitaire}
                          onChange={(e) => updateProduct(product.id, { prix_unitaire: parseFloat(e.target.value) || 0 })}
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                      <div className="col-span-3 text-right">
                        <div className="font-semibold text-green-600">
                          {product.total_ligne.toLocaleString()} FCFA
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
                  ))}
                </div>
              )}

              {/* Total */}
              {products.length > 0 && (
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-orange-600">{totalAmount.toLocaleString()} FCFA</span>
                  </div>
                </div>
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
