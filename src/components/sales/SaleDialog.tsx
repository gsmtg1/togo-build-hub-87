
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import { Sale, SaleProduct } from '@/lib/database';

interface SaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sale: Sale | null;
  onSubmit: (data: Partial<Sale>) => void;
  isEditing: boolean;
}

export const SaleDialog = ({ open, onOpenChange, sale, onSubmit, isEditing }: SaleDialogProps) => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    date: new Date().toISOString().split('T')[0],
    status: 'pending' as Sale['status'],
    products: [] as SaleProduct[],
  });

  useEffect(() => {
    if (sale && isEditing) {
      setFormData({
        customerName: sale.customerName,
        customerPhone: sale.customerPhone,
        customerAddress: sale.customerAddress,
        date: sale.date,
        status: sale.status,
        products: sale.products,
      });
    } else {
      setFormData({
        customerName: '',
        customerPhone: '',
        customerAddress: '',
        date: new Date().toISOString().split('T')[0],
        status: 'pending',
        products: [],
      });
    }
  }, [sale, isEditing, open]);

  const addProduct = () => {
    setFormData(prev => ({
      ...prev,
      products: [...prev.products, {
        id: crypto.randomUUID(),
        name: '',
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0,
      }],
    }));
  };

  const removeProduct = (id: string) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== id),
    }));
  };

  const updateProduct = (id: string, updates: Partial<SaleProduct>) => {
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

  const totalAmount = formData.products.reduce((sum, product) => sum + product.totalPrice, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      totalAmount,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Modifier la vente' : 'Nouvelle vente'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customerName">Nom du client</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="customerPhone">Téléphone</Label>
              <Input
                id="customerPhone"
                value={formData.customerPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="customerAddress">Adresse</Label>
            <Textarea
              id="customerAddress"
              value={formData.customerAddress}
              onChange={(e) => setFormData(prev => ({ ...prev, customerAddress: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="status">Statut</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as Sale['status'] }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="completed">Terminée</SelectItem>
                  <SelectItem value="cancelled">Annulée</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <Label>Produits</Label>
              <Button type="button" onClick={addProduct} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un produit
              </Button>
            </div>

            <div className="space-y-2">
              {formData.products.map((product) => (
                <div key={product.id} className="grid grid-cols-12 gap-2 items-center">
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
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="Prix unitaire"
                      value={product.unitPrice}
                      onChange={(e) => updateProduct(product.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="Total"
                      value={product.totalPrice}
                      readOnly
                    />
                  </div>
                  <div className="col-span-2">
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

            <div className="mt-4 p-4 bg-muted rounded-lg">
              <div className="text-lg font-semibold">
                Total: {totalAmount.toLocaleString()} FCFA
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">
              {isEditing ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
