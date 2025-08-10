
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Package } from 'lucide-react';
import { useProductsWithStock } from '@/hooks/useSupabaseDatabase';

interface InvoiceProduct {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isCustom?: boolean;
}

interface ProductSelectorProps {
  products: InvoiceProduct[];
  onProductsChange: (products: InvoiceProduct[]) => void;
}

export const ProductSelector = ({ products, onProductsChange }: ProductSelectorProps) => {
  const { products: availableProducts, loading } = useProductsWithStock();
  const [selectedProductId, setSelectedProductId] = useState<string>('');

  const addPredefinedProduct = () => {
    if (!selectedProductId) return;
    
    const predefined = availableProducts.find((p: any) => p.id === selectedProductId);
    if (predefined) {
      const newProduct: InvoiceProduct = {
        id: crypto.randomUUID(),
        name: `${predefined.name} (${predefined.dimensions || ''})`.trim(),
        quantity: 1,
        unitPrice: predefined.price || 0,
        totalPrice: predefined.price || 0,
        isCustom: false,
      };
      onProductsChange([...products, newProduct]);
      setSelectedProductId('');
    }
  };

  const addCustomProduct = () => {
    const newProduct: InvoiceProduct = {
      id: crypto.randomUUID(),
      name: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      isCustom: true,
    };
    onProductsChange([...products, newProduct]);
  };

  const removeProduct = (id: string) => {
    onProductsChange(products.filter(p => p.id !== id));
  };

  const updateProduct = (id: string, updates: Partial<InvoiceProduct>) => {
    onProductsChange(products.map(p => {
      if (p.id === id) {
        const updated = { ...p, ...updates };
        updated.totalPrice = updated.quantity * updated.unitPrice;
        return updated;
      }
      return p;
    }));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Sélection des produits
          </CardTitle>
          <div className="flex gap-2">
            <Button type="button" onClick={addCustomProduct} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Produit personnalisé
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sélection de produits prédéfinis */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Label>Ajouter un produit existant</Label>
            <Select value={selectedProductId} onValueChange={setSelectedProductId}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un produit..." />
              </SelectTrigger>
              <SelectContent>
                {loading ? (
                  <SelectItem value="loading" disabled>Chargement...</SelectItem>
                ) : availableProducts.length === 0 ? (
                  <SelectItem value="empty" disabled>Aucun produit disponible</SelectItem>
                ) : (
                  availableProducts.map((product: any) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - {product.price?.toLocaleString()} FCFA
                      {product.dimensions && ` (${product.dimensions})`}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <Button 
            type="button" 
            onClick={addPredefinedProduct}
            disabled={!selectedProductId || loading}
            className="mt-6"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
        </div>

        {/* Liste des produits ajoutés */}
        {products.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Aucun produit ajouté. Sélectionnez un produit ou créez un produit personnalisé.
          </div>
        ) : (
          <div className="space-y-3">
            <Label className="text-base font-semibold">Produits ajoutés</Label>
            {products.map((product) => (
              <div key={product.id} className="grid grid-cols-12 gap-2 items-center p-3 border rounded-lg">
                <div className="col-span-5">
                  <Input
                    placeholder="Nom du produit"
                    value={product.name}
                    onChange={(e) => updateProduct(product.id, { name: e.target.value })}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    placeholder="Quantité"
                    value={product.quantity}
                    onChange={(e) => updateProduct(product.id, { quantity: parseInt(e.target.value) || 0 })}
                    min="1"
                    required
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
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    placeholder="Total"
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

        {/* Résumé */}
        {products.length > 0 && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total des produits:</span>
              <span className="text-lg font-bold">
                {products.reduce((sum, product) => sum + product.totalPrice, 0).toLocaleString()} FCFA
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
