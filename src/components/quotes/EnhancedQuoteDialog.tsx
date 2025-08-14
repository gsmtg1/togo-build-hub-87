
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EnhancedProductSelector } from '@/components/invoices/EnhancedProductSelector';
import { useQuotations, useClients } from '@/hooks/useSupabaseDatabase';

interface InvoiceProduct {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isCustom?: boolean;
}

interface EnhancedQuoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote?: any;
  onClose: () => void;
}

export const EnhancedQuoteDialog = ({ open, onOpenChange, quote, onClose }: EnhancedQuoteDialogProps) => {
  const { create, update } = useQuotations();
  const { data: clients } = useClients();
  const [products, setProducts] = useState<InvoiceProduct[]>([]);
  const [formData, setFormData] = useState({
    client_id: '',
    valid_until: '',
    notes: ''
  });

  useEffect(() => {
    if (quote) {
      setFormData({
        client_id: quote.client_id || '',
        valid_until: quote.valid_until || '',
        notes: quote.notes || ''
      });
      // Convert quote data to products format if needed
      if (quote.product_id && quote.quantity && quote.unit_price) {
        setProducts([{
          id: crypto.randomUUID(),
          name: quote.product_name || 'Produit',
          quantity: quote.quantity,
          unitPrice: quote.unit_price,
          totalPrice: quote.total_amount,
          isCustom: false
        }]);
      }
    } else {
      setFormData({
        client_id: '',
        valid_until: '',
        notes: ''
      });
      setProducts([]);
    }
  }, [quote]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (products.length === 0) {
      return;
    }

    const totalAmount = products.reduce((sum, product) => sum + product.totalPrice, 0);
    const totalQuantity = products.reduce((sum, product) => sum + product.quantity, 0);

    try {
      const quoteData = {
        client_id: formData.client_id,
        product_id: products[0]?.id || '', // For compatibility
        quantity: totalQuantity,
        unit_price: totalAmount / totalQuantity,
        total_amount: totalAmount,
        valid_until: formData.valid_until,
        status: 'draft' as const,
        notes: `${formData.notes}\n\nProduits: ${products.map(p => `${p.name} (${p.quantity}x${p.unitPrice})`).join(', ')}`
      };

      if (quote) {
        await update(quote.id, quoteData);
      } else {
        await create(quoteData);
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
          <DialogTitle>{quote ? 'Modifier le devis' : 'Nouveau devis'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client_id">Client *</Label>
              <Select 
                value={formData.client_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, client_id: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} {client.company && `(${client.company})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="valid_until">Valide jusqu'au *</Label>
              <Input
                id="valid_until"
                type="date"
                value={formData.valid_until}
                onChange={(e) => setFormData(prev => ({ ...prev, valid_until: e.target.value }))}
                required
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
              placeholder="Notes supplémentaires pour le devis..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={products.length === 0 || !formData.client_id}>
              {quote ? 'Mettre à jour' : 'Créer le devis'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
