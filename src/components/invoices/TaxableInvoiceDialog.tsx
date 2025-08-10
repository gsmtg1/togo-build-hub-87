
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Calculator } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InvoiceProduct {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxRate?: number;
}

interface TaxableInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice?: any;
  onSubmit: (data: any) => void;
  isEditing: boolean;
}

export const TaxableInvoiceDialog = ({ 
  open, 
  onOpenChange, 
  invoice, 
  onSubmit, 
  isEditing 
}: TaxableInvoiceDialogProps) => {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    client_nom: '',
    client_telephone: '',
    client_adresse: '',
    date_facture: new Date().toISOString().split('T')[0],
    date_echeance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    statut: 'brouillon' as const,
    notes: '',
    useTax: false,
    defaultTaxRate: 18,
    products: [] as InvoiceProduct[],
  });

  useEffect(() => {
    if (invoice && isEditing) {
      setFormData({
        client_nom: invoice.client_nom || '',
        client_telephone: invoice.client_telephone || '',
        client_adresse: invoice.client_adresse || '',
        date_facture: invoice.date_facture || new Date().toISOString().split('T')[0],
        date_echeance: invoice.date_echeance || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        statut: invoice.statut || 'brouillon',
        notes: invoice.notes || '',
        useTax: invoice.useTax || false,
        defaultTaxRate: invoice.defaultTaxRate || 18,
        products: invoice.products || [],
      });
    } else {
      setFormData({
        client_nom: '',
        client_telephone: '',
        client_adresse: '',
        date_facture: new Date().toISOString().split('T')[0],
        date_echeance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        statut: 'brouillon',
        notes: '',
        useTax: false,
        defaultTaxRate: 18,
        products: [],
      });
    }
  }, [invoice, isEditing, open]);

  const addProduct = () => {
    const newProduct: InvoiceProduct = {
      id: crypto.randomUUID(),
      name: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      taxRate: formData.useTax ? formData.defaultTaxRate : 0,
    };
    setFormData(prev => ({
      ...prev,
      products: [...prev.products, newProduct],
    }));
  };

  const removeProduct = (id: string) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== id),
    }));
  };

  const updateProduct = (id: string, updates: Partial<InvoiceProduct>) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.map(p => {
        if (p.id === id) {
          const updated = { ...p, ...updates };
          updated.totalPrice = updated.quantity * updated.unitPrice;
          return updated;
        }
        return p;
      }),
    }));
  };

  const calculateTotals = () => {
    const subtotal = formData.products.reduce((sum, product) => sum + product.totalPrice, 0);
    const totalTax = formData.useTax 
      ? formData.products.reduce((sum, product) => {
          const taxRate = product.taxRate || formData.defaultTaxRate;
          return sum + (product.totalPrice * (taxRate / 100));
        }, 0)
      : 0;
    const total = subtotal + totalTax;
    
    return { subtotal, totalTax, total };
  };

  const { subtotal, totalTax, total } = calculateTotals();

  const handleTaxToggle = (enabled: boolean) => {
    setFormData(prev => ({
      ...prev,
      useTax: enabled,
      products: prev.products.map(p => ({
        ...p,
        taxRate: enabled ? prev.defaultTaxRate : 0
      }))
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.products.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez ajouter au moins un produit",
        variant: "destructive",
      });
      return;
    }

    const invoiceData = {
      ...formData,
      montant_total: total,
      montant_paye: 0,
      subtotal,
      tax_amount: totalTax,
    };

    onSubmit(invoiceData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            {isEditing ? 'Modifier la facture' : 'Nouvelle facture avec TVA'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations client */}
          <Card>
            <CardHeader>
              <CardTitle>👤 Informations Client</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Textarea
                  id="client_adresse"
                  value={formData.client_adresse}
                  onChange={(e) => setFormData(prev => ({ ...prev, client_adresse: e.target.value }))}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Dates et statut */}
          <Card>
            <CardHeader>
              <CardTitle>📅 Informations Facture</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="date_facture">Date d'émission</Label>
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
                  required
                />
              </div>
              <div>
                <Label htmlFor="statut">Statut</Label>
                <Select value={formData.statut} onValueChange={(value: any) => setFormData(prev => ({ ...prev, statut: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brouillon">📝 Brouillon</SelectItem>
                    <SelectItem value="envoyee">📤 Envoyée</SelectItem>
                    <SelectItem value="payee">✅ Payée</SelectItem>
                    <SelectItem value="en_retard">⏰ En retard</SelectItem>
                    <SelectItem value="annulee">❌ Annulée</SelectItem>
                  </SelectContent>
                </Select>
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
                  id="useTax"
                  checked={formData.useTax}
                  onCheckedChange={handleTaxToggle}
                />
                <Label htmlFor="useTax">Appliquer la TVA sur cette facture</Label>
              </div>
              {formData.useTax && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="defaultTaxRate">Taux de TVA par défaut (%)</Label>
                    <Input
                      id="defaultTaxRate"
                      type="number"
                      value={formData.defaultTaxRate}
                      onChange={(e) => setFormData(prev => ({ ...prev, defaultTaxRate: parseFloat(e.target.value) || 0 }))}
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Produits */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>🛍️ Produits</CardTitle>
                <Button type="button" onClick={addProduct} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un produit
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.products.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Aucun produit ajouté. Cliquez sur "Ajouter un produit" pour commencer.
                </p>
              ) : (
                <div className="space-y-3">
                  {formData.products.map((product) => (
                    <div key={product.id} className="grid grid-cols-12 gap-2 items-center p-3 border rounded-lg">
                      <div className="col-span-4">
                        <Input
                          placeholder="Nom du produit"
                          value={product.name}
                          onChange={(e) => updateProduct(product.id, { name: e.target.value })}
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          placeholder="Qté"
                          value={product.quantity}
                          onChange={(e) => updateProduct(product.id, { quantity: parseInt(e.target.value) || 0 })}
                          min="1"
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          placeholder="Prix unitaire"
                          value={product.unitPrice}
                          onChange={(e) => updateProduct(product.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                          min="0"
                          step="0.01"
                        />
                      </div>
                      {formData.useTax && (
                        <div className="col-span-1">
                          <Input
                            type="number"
                            placeholder="TVA%"
                            value={product.taxRate || 0}
                            onChange={(e) => updateProduct(product.id, { taxRate: parseFloat(e.target.value) || 0 })}
                            min="0"
                            max="100"
                            step="0.1"
                          />
                        </div>
                      )}
                      <div className={`col-span-${formData.useTax ? '2' : '3'}`}>
                        <Input
                          type="number"
                          placeholder="Total HT"
                          value={product.totalPrice}
                          readOnly
                          className="bg-gray-50"
                        />
                      </div>
                      <div className="col-span-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeProduct(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                  <span className="font-medium">{subtotal.toLocaleString()} FCFA</span>
                </div>
                {formData.useTax && (
                  <div className="flex justify-between">
                    <span>TVA:</span>
                    <span className="font-medium">{totalTax.toLocaleString()} FCFA</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-bold text-primary">
                  <span>TOTAL {formData.useTax ? 'TTC' : ''}:</span>
                  <span>{total.toLocaleString()} FCFA</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>📝 Notes et commentaires</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Informations supplémentaires, conditions particulières..."
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </CardContent>
          </Card>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              {isEditing ? 'Mettre à jour' : 'Créer la facture'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
