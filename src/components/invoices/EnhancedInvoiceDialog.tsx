
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EnhancedProductSelector } from './EnhancedProductSelector';
import { useInvoices, useSales } from '@/hooks/useSupabaseDatabase';

interface InvoiceProduct {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isCustom?: boolean;
}

interface EnhancedInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice?: any;
  onClose: () => void;
}

export const EnhancedInvoiceDialog = ({ open, onOpenChange, invoice, onClose }: EnhancedInvoiceDialogProps) => {
  const { create, update } = useInvoices();
  const { data: sales } = useSales();
  const [products, setProducts] = useState<InvoiceProduct[]>([]);
  const [formData, setFormData] = useState({
    sale_id: '',
    invoice_number: '',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: '',
    tax_rate: 18,
    notes: ''
  });

  useEffect(() => {
    if (invoice) {
      setFormData({
        sale_id: invoice.sale_id || '',
        invoice_number: invoice.invoice_number || '',
        issue_date: invoice.issue_date || new Date().toISOString().split('T')[0],
        due_date: invoice.due_date || '',
        tax_rate: invoice.tax_rate || 18,
        notes: invoice.notes || ''
      });
    } else {
      // Generate automatic invoice number
      const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
      setFormData({
        sale_id: '',
        invoice_number: invoiceNumber,
        issue_date: new Date().toISOString().split('T')[0],
        due_date: '',
        tax_rate: 18,
        notes: ''
      });
      setProducts([]);
    }
  }, [invoice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (products.length === 0) {
      return;
    }

    const subtotal = products.reduce((sum, product) => sum + product.totalPrice, 0);
    const taxAmount = (subtotal * formData.tax_rate) / 100;
    const totalAmount = subtotal + taxAmount;

    try {
      const invoiceData = {
        sale_id: formData.sale_id || null,
        invoice_number: formData.invoice_number,
        issue_date: formData.issue_date,
        due_date: formData.due_date,
        tax_rate: formData.tax_rate,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        status: 'draft' as const,
        notes: `${formData.notes}\n\nProduits: ${products.map(p => `${p.name} (${p.quantity}x${p.unitPrice})`).join(', ')}`
      };

      if (invoice) {
        await update(invoice.id, invoiceData);
      } else {
        await create(invoiceData);
      }
      
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{invoice ? 'Modifier la facture' : 'Nouvelle facture'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invoice_number">Numéro de facture *</Label>
              <Input
                id="invoice_number"
                value={formData.invoice_number}
                onChange={(e) => setFormData(prev => ({ ...prev, invoice_number: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="sale_id">Vente associée</Label>
              <Select 
                value={formData.sale_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, sale_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une vente (optionnel)" />
                </SelectTrigger>
                <SelectContent>
                  {sales.map((sale) => (
                    <SelectItem key={sale.id} value={sale.id}>
                      Vente #{sale.id.slice(0, 8)} - {sale.total_amount.toLocaleString()} FCFA
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="issue_date">Date d'émission *</Label>
              <Input
                id="issue_date"
                type="date"
                value={formData.issue_date}
                onChange={(e) => setFormData(prev => ({ ...prev, issue_date: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="due_date">Date d'échéance *</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="tax_rate">Taux de taxe (%)</Label>
              <Input
                id="tax_rate"
                type="number"
                value={formData.tax_rate}
                onChange={(e) => setFormData(prev => ({ ...prev, tax_rate: parseFloat(e.target.value) || 0 }))}
                min="0"
                max="100"
                step="0.1"
              />
            </div>
          </div>

          <EnhancedProductSelector
            products={products}
            onProductsChange={setProducts}
          />

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Notes supplémentaires pour la facture..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={products.length === 0 || !formData.invoice_number}>
              {invoice ? 'Mettre à jour' : 'Créer la facture'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
