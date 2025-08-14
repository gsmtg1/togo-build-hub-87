
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Minus, Trash2, Package, Loader2, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useProductsWithStock } from '@/hooks/useSupabaseDatabase';

interface InvoiceProduct {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isCustom?: boolean;
}

interface EnhancedProductSelectorProps {
  products: InvoiceProduct[];
  onProductsChange: (products: InvoiceProduct[]) => void;
}

export const EnhancedProductSelector = ({ products, onProductsChange }: EnhancedProductSelectorProps) => {
  const { products: availableProducts, loading } = useProductsWithStock();
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredProducts = availableProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.dimensions.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addPredefinedProduct = () => {
    if (!selectedProductId) return;
    
    const predefined = availableProducts.find((p: any) => p.id === selectedProductId);
    if (predefined) {
      const newProduct: InvoiceProduct = {
        id: crypto.randomUUID(),
        name: `${predefined.name}${predefined.dimensions ? ` (${predefined.dimensions})` : ''}`,
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

  const quickAddProduct = (product: any) => {
    const newProduct: InvoiceProduct = {
      id: crypto.randomUUID(),
      name: `${product.name}${product.dimensions ? ` (${product.dimensions})` : ''}`,
      quantity: 1,
      unitPrice: product.price || 0,
      totalPrice: product.price || 0,
      isCustom: false,
    };
    onProductsChange([...products, newProduct]);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Chargement des produits...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Sélection des produits
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recherche de produits */}
        <div>
          <Label htmlFor="search">Rechercher un produit</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="search"
              placeholder="Rechercher par nom, type ou dimensions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Liste rapide des produits */}
        {searchTerm && (
          <div className="max-h-60 overflow-y-auto border rounded-lg">
            <div className="p-2 space-y-1">
              {filteredProducts.map((product) => (
                <div 
                  key={product.id}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                  onClick={() => quickAddProduct(product)}
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{product.name}</p>
                    <p className="text-xs text-gray-600">{product.dimensions}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">{product.type}</Badge>
                      <Badge variant={product.stock_quantity > 0 ? 'default' : 'destructive'} className="text-xs">
                        Stock: {product.stock_quantity}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">{product.price.toLocaleString()} FCFA</p>
                    <Button size="sm" variant="outline">
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sélection traditionnelle */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-3">📦 Sélection par liste</h3>
            <div className="space-y-3">
              <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un produit..." />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg z-50 max-h-60">
                  {availableProducts.length === 0 ? (
                    <SelectItem value="empty" disabled>Aucun produit disponible</SelectItem>
                  ) : (
                    availableProducts.map((product: any) => (
                      <SelectItem key={product.id} value={product.id}>
                        <div className="flex justify-between items-center w-full">
                          <div>
                            <span className="font-medium">{product.name}</span>
                            <div className="text-xs text-gray-500">
                              {product.dimensions} • {product.type}
                            </div>
                          </div>
                          <div className="text-sm text-right ml-4">
                            <div className="font-semibold text-green-600">
                              {product.price?.toLocaleString()} FCFA
                            </div>
                            <div className={`text-xs ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              Stock: {product.stock_quantity || 0}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <Button 
                type="button" 
                onClick={addPredefinedProduct}
                disabled={!selectedProductId}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter ce produit
              </Button>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-3">✏️ Produit personnalisé</h3>
            <p className="text-sm text-gray-600 mb-3">
              Pour un produit non listé ou une prestation spéciale
            </p>
            <Button 
              type="button" 
              onClick={addCustomProduct}
              variant="outline"
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un produit personnalisé
            </Button>
          </Card>
        </div>

        {/* Liste des produits ajoutés */}
        {products.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
            <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 font-medium">Aucun produit ajouté</p>
            <p className="text-sm text-gray-400">Recherchez et sélectionnez des produits ci-dessus</p>
          </div>
        ) : (
          <div className="space-y-3">
            <Label className="text-base font-semibold">Produits ajoutés ({products.length})</Label>
            {products.map((product) => (
              <div key={product.id} className="grid grid-cols-12 gap-2 items-center p-3 border rounded-lg bg-gray-50">
                <div className="col-span-4">
                  <Input
                    placeholder="Nom du produit"
                    value={product.name}
                    onChange={(e) => updateProduct(product.id, { name: e.target.value })}
                    required
                    className="bg-white"
                  />
                  {product.isCustom && (
                    <span className="text-xs text-orange-600">✏️ Personnalisé</span>
                  )}
                </div>
                <div className="col-span-3">
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => updateProduct(product.id, { quantity: Math.max(1, product.quantity - 1) })}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Input
                      type="number"
                      placeholder="Qté"
                      value={product.quantity}
                      onChange={(e) => updateProduct(product.id, { quantity: parseInt(e.target.value) || 1 })}
                      min="1"
                      required
                      className="bg-white text-center"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => updateProduct(product.id, { quantity: product.quantity + 1 })}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
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
                    className="bg-white"
                  />
                </div>
                <div className="col-span-2">
                  <div className="text-right">
                    <div className="font-semibold text-green-600">
                      {product.totalPrice.toLocaleString()} FCFA
                    </div>
                    <div className="text-xs text-gray-500">
                      {product.quantity} × {product.unitPrice.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="col-span-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeProduct(product.id)}
                    className="text-red-600 hover:text-red-700"
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
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-4">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium">Total des produits:</span>
                  <div className="text-sm text-gray-600">
                    {products.reduce((sum, product) => sum + product.quantity, 0)} articles
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-green-600">
                    {products.reduce((sum, product) => sum + product.totalPrice, 0).toLocaleString()} FCFA
                  </span>
                  <div className="text-sm text-gray-600">Sous-total HT</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};
