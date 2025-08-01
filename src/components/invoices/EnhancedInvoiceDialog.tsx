
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Invoice } from '@/lib/database';
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
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'draft' as Invoice['status'],
    products: [],
    deliveryType: 'pickup' as 'free' | 'paid' | 'pickup',
    deliveryFee: 0,
    notes: '',
    saleId: undefined as string | undefined,
  });

  useEffect(() => {
    if (invoice && isEditing) {
      setFormData({
        customerName: invoice.customerName,
        customerPhone: invoice.customerPhone,
        customerAddress: invoice.customerAddress,
        date: invoice.date,
        dueDate: invoice.dueDate,
        status: invoice.status,
        products: invoice.products,
        deliveryType: (invoice as any).deliveryType || 'pickup',
        deliveryFee: (invoice as any).deliveryFee || 0,
        notes: (invoice as any).notes || '',
        saleId: invoice.saleId,
      });
    } else {
      setFormData({
        customerName: '',
        customerPhone: '',
        customerAddress: '',
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'draft',
        products: [],
        deliveryType: 'pickup',
        deliveryFee: 0,
        notes: '',
        saleId: undefined,
      });
    }
  }, [invoice, isEditing, open]);

  const subtotal = formData.products.reduce((sum, product) => sum + product.totalPrice, 0);
  const deliveryAmount = formData.deliveryType === 'paid' ? formData.deliveryFee : 0;
  const totalAmount = subtotal + deliveryAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      totalAmount,
      deliveryType: formData.deliveryType,
      deliveryFee: deliveryAmount,
      notes: formData.notes,
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
                <Label htmlFor="customerName">Nom du client *</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="customerPhone">Téléphone *</Label>
                <Input
                  id="customerPhone"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="customerAddress">Adresse complète *</Label>
              <Textarea
                id="customerAddress"
                value={formData.customerAddress}
                onChange={(e) => setFormData(prev => ({ ...prev, customerAddress: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Dates et statut */}
          <div className="border rounded-lg p-4 space-y-4">
            <Label className="text-base font-semibold">📅 Informations Facture</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="date">Date d'émission</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="dueDate">Date d'échéance</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="status">Statut</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as Invoice['status'] }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">📝 Brouillon</SelectItem>
                    <SelectItem value="sent">📤 Envoyée</SelectItem>
                    <SelectItem value="paid">✅ Payée</SelectItem>
                    <SelectItem value="overdue">⏰ En retard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Sélection des produits */}
          <ProductSelector
            products={formData.products}
            predefinedProducts={predefinedProducts || []}
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
                <span>{totalAmount.toLocaleString()} FCFA</span>
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
