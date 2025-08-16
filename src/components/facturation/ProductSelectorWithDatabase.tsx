
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, Package } from 'lucide-react';
import { useProductsManager } from '@/hooks/useProductsManager';

interface ProductItem {
  id: string;
  nom: string;
  quantite: number;
  prix_unitaire: number;
  total_ligne: number;
  isCustom?: boolean;
  product_id?: string;
}

interface ProductSelectorWithDatabaseProps {
  products: ProductItem[];
  onProductsChange: (products: ProductItem[]) => void;
}

export const ProductSelectorWithDatabase = ({ products, onProductsChange }: ProductSelectorWithDatabaseProps) => {
  const { products: availableProducts, loading } = useProductsManager();
  const [selectedProductId, setSelectedProductId] = useState('');

  const addProductFromDatabase = () => {
    if (!selectedProductId) return;
    
    const selectedProduct = availableProducts.find(p => p.id === selectedProductId);
    if (!selectedProduct) return;

    const newProduct: ProductItem = {
      id: crypto.randomUUID(),
      nom: `${selectedProduct.name} (${selectedProduct.dimensions})`,
      quantite: 1,
      prix_unitaire: selectedProduct.price,
      total_ligne: selectedProduct.price,
      isCustom: false,
      product_id: selectedProduct.id
    };

    onProductsChange([...products, newProduct]);
    setSelectedProductId('');
  };

  const addCustomProduct = () => {
    const newProduct: ProductItem = {
      id: crypto.randomUUID(),
      nom: '',
      quantite: 1,
      prix_unitaire: 0,
      total_ligne: 0,
      isCustom: true
    };

    onProductsChange([...products, newProduct]);
  };

  const updateProduct = (id: string, field: keyof ProductItem, value: any) => {
    const updatedProducts = products.map(product => {
      if (product.id === id) {
        const updated = { ...product, [field]: value };
        if (field === 'quantite' || field === 'prix_unitaire') {
          updated.total_ligne = updated.quantite * updated.prix_unitaire;
        }
        return updated;
      }
      return product;
    });
    onProductsChange(updatedProducts);
  };

  const removeProduct = (id: string) => {
    onProductsChange(products.filter(p => p.id !== id));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardTitle className="text-primary flex items-center gap-2">
          <Package className="h-5 w-5" />
          Produits de la facture
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Sélection depuis la base de données */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <div className="md:col-span-2">
            <Label htmlFor="product-select" className="text-primary font-medium">
              Ajouter un produit existant
            </Label>
            <Select value={selectedProductId} onValueChange={setSelectedProductId}>
              <SelectTrigger className="border-primary/30 focus:border-primary">
                <SelectValue placeholder="Choisir un produit..." />
              </SelectTrigger>
              <SelectContent>
                {loading ? (
                  <SelectItem value="loading" disabled>Chargement...</SelectItem>
                ) : availableProducts.length === 0 ? (
                  <SelectItem value="empty" disabled>Aucun produit disponible</SelectItem>
                ) : (
                  availableProducts.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} ({product.dimensions}) - {formatCurrency(product.price)}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button 
              onClick={addProductFromDatabase}
              disabled={!selectedProductId || loading}
              className="w-full bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </div>
        </div>

        {/* Bouton pour ajouter un produit personnalisé */}
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            onClick={addCustomProduct}
            className="border-primary/30 text-primary hover:bg-primary/10"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un produit personnalisé
          </Button>
        </div>

        {/* Liste des produits ajoutés */}
        {products.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-semibold text-primary">Produits ajoutés ({products.length})</h4>
            {products.map((product, index) => (
              <Card key={product.id} className="border-primary/10">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                    <div className="md:col-span-2">
                      <Label htmlFor={`nom-${product.id}`} className="text-sm text-muted-foreground">
                        Nom du produit *
                      </Label>
                      <Input
                        id={`nom-${product.id}`}
                        value={product.nom}
                        onChange={(e) => updateProduct(product.id, 'nom', e.target.value)}
                        placeholder="Nom du produit"
                        required
                        className="border-primary/30 focus:border-primary"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`quantite-${product.id}`} className="text-sm text-muted-foreground">
                        Quantité *
                      </Label>
                      <Input
                        id={`quantite-${product.id}`}
                        type="number"
                        value={product.quantite}
                        onChange={(e) => updateProduct(product.id, 'quantite', parseInt(e.target.value) || 0)}
                        min="1"
                        required
                        className="border-primary/30 focus:border-primary"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`prix-${product.id}`} className="text-sm text-muted-foreground">
                        Prix unitaire (FCFA) *
                      </Label>
                      <Input
                        id={`prix-${product.id}`}
                        type="number"
                        value={product.prix_unitaire}
                        onChange={(e) => updateProduct(product.id, 'prix_unitaire', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                        required
                        className="border-primary/30 focus:border-primary"
                      />
                    </div>

                    <div>
                      <Label className="text-sm text-muted-foreground">Total ligne</Label>
                      <div className="font-bold text-primary text-lg">
                        {formatCurrency(product.total_ligne)}
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeProduct(product.id)}
                        className="text-destructive hover:bg-destructive/10 border-destructive/30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Récapitulatif */}
            <div className="bg-gradient-to-r from-primary/5 to-accent/5 p-4 rounded-lg border border-primary/20">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-primary">
                  Sous-total des produits:
                </span>
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(products.reduce((sum, p) => sum + p.total_ligne, 0))}
                </span>
              </div>
            </div>
          </div>
        )}

        {products.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>Aucun produit ajouté pour le moment</p>
            <p className="text-sm">Utilisez les boutons ci-dessus pour ajouter des produits</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
