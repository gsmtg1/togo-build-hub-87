
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, FileText, Printer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useProducts } from '@/hooks/useSupabaseDatabase';

interface ProfessionalInvoiceGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (saleData: any) => Promise<void>;
  editingSale?: any;
}

export const ProfessionalInvoiceGenerator = ({ 
  open, 
  onOpenChange, 
  onSubmit, 
  editingSale 
}: ProfessionalInvoiceGeneratorProps) => {
  const { data: products } = useProducts();
  
  const [formData, setFormData] = useState({
    client_nom: editingSale?.client_nom || '',
    client_telephone: editingSale?.client_telephone || '',
    client_adresse: editingSale?.client_adresse || '',
    items: editingSale?.items || [{ product_id: '', quantity: 1, unit_price: 0 }],
    use_tva: false,
    notes: ''
  });

  const [customProduct, setCustomProduct] = useState({ name: '', price: '' });

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { product_id: '', quantity: 1, unit_price: 0 }]
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const addCustomProduct = () => {
    if (customProduct.name && customProduct.price) {
      const newItem = {
        product_id: 'custom',
        custom_name: customProduct.name,
        quantity: 1,
        unit_price: parseFloat(customProduct.price)
      };
      setFormData(prev => ({
        ...prev,
        items: [...prev.items, newItem]
      }));
      setCustomProduct({ name: '', price: '' });
    }
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  };

  const calculateTVA = () => {
    return formData.use_tva ? calculateSubtotal() * 0.18 : 0;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTVA();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const saleData = {
      numero_vente: `VTE-${Date.now()}`,
      client_nom: formData.client_nom,
      client_telephone: formData.client_telephone,
      client_adresse: formData.client_adresse,
      items: JSON.stringify(formData.items),
      montant_ht: calculateSubtotal(),
      montant_tva: calculateTVA(),
      montant_total: calculateTotal(),
      use_tva: formData.use_tva,
      notes: formData.notes,
      statut: 'confirmee',
      date_vente: new Date().toISOString()
    };

    await onSubmit(saleData);
    onOpenChange(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {editingSale ? 'Modifier la facture' : 'Générer une facture professionnelle'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* En-tête facture */}
          <Card className="border-2">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-blue-900">CORNERSTONE BRIQUES</h2>
                  <p className="text-sm text-gray-600 mt-2">
                    21 Rue Be HEDJE, après les rails<br />
                    non loin de la station d'essence CM<br />
                    Akodésséwa, Lomé - Togo
                  </p>
                </div>
                <div className="text-right">
                  <h3 className="text-xl font-bold text-blue-900">FACTURE</h3>
                  <p className="text-sm text-gray-600">N° VTE-{Date.now()}</p>
                  <p className="text-sm text-gray-600">{new Date().toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Informations client */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div className="md:col-span-2">
                    <Label htmlFor="client_adresse">Adresse</Label>
                    <Input
                      id="client_adresse"
                      value={formData.client_adresse}
                      onChange={(e) => setFormData(prev => ({ ...prev, client_adresse: e.target.value }))}
                    />
                  </div>
                </div>

                <Separator />

                {/* Ajouter produit personnalisé */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Ajouter un produit personnalisé</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Nom du produit"
                        value={customProduct.name}
                        onChange={(e) => setCustomProduct(prev => ({ ...prev, name: e.target.value }))}
                      />
                      <Input
                        type="number"
                        placeholder="Prix unitaire"
                        value={customProduct.price}
                        onChange={(e) => setCustomProduct(prev => ({ ...prev, price: e.target.value }))}
                      />
                      <Button type="button" onClick={addCustomProduct}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Articles */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Articles</h3>
                    <Button type="button" onClick={addItem} variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter un article
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {formData.items.map((item, index) => (
                      <Card key={index} className="border">
                        <CardContent className="pt-4">
                          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                            <div>
                              <Label>Produit</Label>
                              {item.product_id === 'custom' ? (
                                <Input value={item.custom_name} disabled />
                              ) : (
                                <Select
                                  value={item.product_id}
                                  onValueChange={(value) => {
                                    const product = products.find(p => p.id === value);
                                    updateItem(index, 'product_id', value);
                                    if (product) {
                                      updateItem(index, 'unit_price', product.prix_unitaire);
                                    }
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Choisir un produit" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {products.map((product) => (
                                      <SelectItem key={product.id} value={product.id}>
                                        {product.nom}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                            <div>
                              <Label>Quantité</Label>
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                              />
                            </div>
                            <div>
                              <Label>Prix unitaire (FCFA)</Label>
                              <Input
                                type="number"
                                value={item.unit_price}
                                onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value))}
                              />
                            </div>
                            <div>
                              <Label>Total</Label>
                              <Input
                                value={`${(item.quantity * item.unit_price).toLocaleString()} FCFA`}
                                disabled
                              />
                            </div>
                            <div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeItem(index)}
                                disabled={formData.items.length === 1}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Totaux */}
                <Card className="bg-gray-50">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 mb-4">
                        <Switch
                          checked={formData.use_tva}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, use_tva: checked }))}
                        />
                        <Label>Inclure la TVA (18%)</Label>
                      </div>
                      
                      <div className="flex justify-between text-lg">
                        <span>Sous-total:</span>
                        <span className="font-semibold">{calculateSubtotal().toLocaleString()} FCFA</span>
                      </div>
                      
                      {formData.use_tva && (
                        <div className="flex justify-between text-lg">
                          <span>TVA (18%):</span>
                          <span className="font-semibold">{calculateTVA().toLocaleString()} FCFA</span>
                        </div>
                      )}
                      
                      <Separator />
                      
                      <div className="flex justify-between text-xl font-bold text-blue-900">
                        <span>Total:</span>
                        <span>{calculateTotal().toLocaleString()} FCFA</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Notes */}
                <div>
                  <Label htmlFor="notes">Notes / Commentaires</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Conditions de paiement, instructions spéciales..."
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    Annuler
                  </Button>
                  <Button type="button" variant="outline" onClick={handlePrint}>
                    <Printer className="h-4 w-4 mr-2" />
                    Imprimer
                  </Button>
                  <Button type="submit">
                    <FileText className="h-4 w-4 mr-2" />
                    {editingSale ? 'Mettre à jour' : 'Créer la facture'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
