
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
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
  predefinedProducts?: Array<{
    id: string;
    nom: string;
    categorie: string;
    longueur_cm: number;
    largeur_cm: number;
    hauteur_cm: number;
    prix_unitaire: number;
  }>;
  onProductsChange: (products: InvoiceProduct[]) => void;
}

export const ProductSelector = ({ products, onProductsChange }: ProductSelectorProps) => {
  const { products: supabaseProducts, loading } = useProductsWithStock();

  const addProduct = () => {
    const newProduct: InvoiceProduct = {
      id: crypto.randomUUID(),
      name: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      isCustom: false,
    };
    onProductsChange([...products, newProduct]);
  };

  const removeProduct = (id: string) => {
    onProductsChange(products.filter(p => p.id !== id));
  };

  const updateProduct = (id: string, updates: Partial<InvoiceProduct>) => {
    const updatedProducts = products.map(p => {
      if (p.id === id) {
        const updated = { ...p, ...updates };
        updated.totalPrice = updated.quantity * updated.unitPrice;
        return updated;
      }
      return p;
    });
    onProductsChange(updatedProducts);
  };

  const selectPredefinedProduct = (id: string, productId: string) => {
    if (productId === 'custom') {
      updateProduct(id, { 
        name: '', 
        unitPrice: 0, 
        isCustom: true 
      });
    } else {
      const predefined = supabaseProducts.find(p => p.id === productId);
      if (predefined) {
        updateProduct(id, {
          name: `${predefined.nom} (${predefined.longueur_cm}x${predefined.largeur_cm}x${predefined.hauteur_cm}cm)`,
          unitPrice: predefined.prix_unitaire,
          isCustom: false,
        });
      }
    }
  };

  if (loading) {
    return <div>Chargement des produits...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="text-base font-semibold">🧱 Produits</Label>
        <Button type="button" onClick={addProduct} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un produit
        </Button>
      </div>

      <div className="space-y-3">
        {products.map((product) => (
          <div key={product.id} className="border rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Type de produit</Label>
                <Select onValueChange={(value) => selectPredefinedProduct(product.id, value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un produit..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">⚡ Autre (personnalisé)</SelectItem>
                    {supabaseProducts.map((predefined) => (
                      <SelectItem key={predefined.id} value={predefined.id}>
                        🧱 {predefined.nom} - {predefined.longueur_cm}x{predefined.largeur_cm}x{predefined.hauteur_cm}cm
                        ({predefined.prix_unitaire.toLocaleString()} FCFA) - Stock: {predefined.stock_actuel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {product.isCustom && (
                <div>
                  <Label>Nom du produit</Label>
                  <Input
                    placeholder="Nom du produit personnalisé"
                    value={product.name}
                    onChange={(e) => updateProduct(product.id, { name: e.target.value })}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div>
                <Label>Quantité</Label>
                <Input
                  type="number"
                  min="1"
                  value={product.quantity}
                  onChange={(e) => updateProduct(product.id, { quantity: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Prix unitaire (FCFA)</Label>
                <Input
                  type="number"
                  min="0"
                  value={product.unitPrice}
                  onChange={(e) => updateProduct(product.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                  readOnly={!product.isCustom}
                />
              </div>
              <div>
                <Label>Total (FCFA)</Label>
                <Input
                  type="number"
                  value={product.totalPrice}
                  readOnly
                  className="bg-gray-50 font-bold"
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeProduct(product.id)}
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {products.length === 0 && (
          <div className="text-center p-6 bg-gray-50 rounded-lg border-2 border-dashed">
            <p className="text-muted-foreground">Aucun produit ajouté</p>
            <p className="text-sm text-muted-foreground">Cliquez sur "Ajouter un produit" pour commencer</p>
          </div>
        )}
      </div>
    </div>
  );
};
