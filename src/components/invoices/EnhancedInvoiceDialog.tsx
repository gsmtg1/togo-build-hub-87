
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Invoice, Product } from '@/lib/database';
import { ProductSelector } from './ProductSelector';
import { DeliverySection } from './DeliverySection';
import { useLocalStorage } from '@/hooks/useDatabase';

interface EnhancedInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice | null;
  onSubmit: (data: Partial<Invoice>) => void;
  isEditing: boolean;
}

export const EnhancedInvoiceDialog = ({ open, onOpenChange, invoice, onSubmit, isEditing }: EnhancedInvoiceDialogProps) => {
  const { data: predefinedProducts } = useLocalStorage('products');
  
  const [formData, setFormData] = useState({
    client_nom: '',
    client_telephone: '',
    client_adresse: '',
    date_facture: new Date().toISOString().split('T')[0],
    date_echeance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    statut: 'brouillon' as Invoice['statut'],
    products: [],
    deliveryType: 'pickup' as 'free' | 'paid' | 'pickup',
    deliveryFee: 0,
    notes: '',
    sale_id: undefined as string | undefined,
  });

  useEffect(() => {
    if (invoice && isEditing) {
      setFormData({
        client_nom: invoice.client_nom,
        client_telephone: invoice.client_telephone || '',
        client_adresse: invoice.client_adresse || '',
        date_facture: invoice.date_facture,
        date_echeance: invoice.date_echeance || '',
        statut: invoice.statut,
        products: (invoice as any).products || [],
        deliveryType: (invoice as any).deliveryType || 'pickup',
        deliveryFee: (invoice as any).deliveryFee || 0,
        notes: (invoice as any).notes || '',
        sale_id: invoice.sale_id,
      });
    } else {
      setFormData({
        client_nom: '',
        client_telephone: '',
        client_adresse: '',
        date_facture: new Date().toISOString().split('T')[0],
        date_echeance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        statut: 'brouillon',
        products: [],
        deliveryType: 'pickup',
        deliveryFee: 0,
        notes: '',
        sale_id: undefined,
      });
    }
  }, [invoice, isEditing, open]);

  const subtotal = formData.products.reduce((sum, product) => sum + product.totalPrice, 0);
  const deliveryAmount = formData.deliveryType === 'paid' ? formData.deliveryFee : 0;
  const montant_total = subtotal + deliveryAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Remove deliveryType and other extended properties from the Invoice object
    const { deliveryType, deliveryFee: _, products, notes, ...invoiceData } = formData;
    onSubmit({
      ...invoiceData,
      montant_total,
      montant_paye: 0,
      // Store extended properties as part of the invoice object but not in the type
      ...(formData as any)
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEditing ? '✏️ Modifier la facture' : '📄 Nouvelle facture'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations client */}
          <div className="border rounded-lg p-4 space-y-4">
            <Label className="text-base font-semibold">👤 Informations Client</Label>
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
                <Label htmlFor="client_telephone">Téléphone *</Label>
                <Input
                  id="client_telephone"
                  value={formData.client_telephone}
                  onChange={(e) => setFormData(prev => ({ ...prev, client_telephone: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="client_adresse">Adresse complète *</Label>
              <Textarea
                id="client_adresse"
                value={formData.client_adresse}
                onChange={(e) => setFormData(prev => ({ ...prev, client_adresse: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Dates et statut */}
          <div className="border rounded-lg p-4 space-y-4">
            <Label className="text-base font-semibold">📅 Informations Facture</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <Select value={formData.statut} onValueChange={(value) => setFormData(prev => ({ ...prev, statut: value as Invoice['statut'] }))}>
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
            </div>
          </div>

          {/* Sélection des produits */}
          <ProductSelector
            products={formData.products}
            predefinedProducts={(predefinedProducts || []) as Product[]}
            onProductsChange={(products) => setFormData(prev => ({ ...prev, products }))}
          />

          {/* Livraison */}
          <DeliverySection
            deliveryType={formData.deliveryType}
            deliveryFee={formData.deliveryFee}
            onDeliveryTypeChange={(type) => setFormData(prev => ({ ...prev, deliveryType: type }))}
            onDeliveryFeeChange={(fee) => setFormData(prev => ({ ...prev, deliveryFee: fee }))}
          />

          {/* Notes */}
          <div className="border rounded-lg p-4 space-y-3">
            <Label className="text-base font-semibold">📝 Notes et commentaires</Label>
            <Textarea
              placeholder="Informations supplémentaires, conditions particulières..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          {/* Résumé financier */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Sous-total produits:</span>
                <span className="font-medium">{subtotal.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Livraison:</span>
                <span className="font-medium">
                  {formData.deliveryType === 'free' ? 'Gratuite' : 
                   formData.deliveryType === 'pickup' ? 'Retrait' :
                   `${deliveryAmount.toLocaleString()} FCFA`}
                </span>
              </div>
              <hr />
              <div className="flex justify-between text-lg font-bold text-orange-600">
                <span>TOTAL:</span>
                <span>{montant_total.toLocaleString()} FCFA</span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
              {isEditing ? 'Mettre à jour' : 'Créer la facture'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
