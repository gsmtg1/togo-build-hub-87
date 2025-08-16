
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Package } from 'lucide-react';
import { useProductsWithStock } from '@/hooks/useSupabaseDatabase';

interface ProductItem {
  id: string;
  nom: string;
  quantite: number;
  prix_unitaire: number;
  total_ligne: number;
}

interface SimpleProductSelectorProps {
  products: ProductItem[];
  onProductsChange: (products: ProductItem[]) => void;
}

export const SimpleProductSelector = ({ products, onProductsChange }: SimpleProductSelectorProps) => {
  const { products: stockProducts, loading } = useProductsWithStock();
  const [selectedProductId, setSelectedProductId] = useState('');
  const [customProduct, setCustomProduct] = useState({
    nom: '',
    quantite: 1,
    prix_unitaire: 0
  });

  // Ajouter un produit du stock
  const addStockProduct = () => {
    if (!selectedProductId) return;
    
    const stockProduct = stockProducts.find(p => p.id === selectedProductId);
    if (!stockProduct) return;

    const newProduct: ProductItem = {
      id: `stock-${stockProduct.id}-${Date.now()}`,
      nom: stockProduct.name,
      quantite: 1,
      prix_unitaire: stockProduct.price || 0,
      total_ligne: stockProduct.price || 0
    };

    console.log('➕ Ajout produit stock:', newProduct);
    onProductsChange([...products, newProduct]);
    setSelectedProductId('');
  };

  // Ajouter un produit personnalisé
  const addCustomProduct = () => {
    if (!customProduct.nom.trim()) return;
    
    const totalLigne = customProduct.quantite * customProduct.prix_unitaire;
    const newProduct: ProductItem = {
      id: `custom-${Date.now()}`,
      nom: customProduct.nom.trim(),
      quantite: customProduct.quantite,
      prix_unitaire: customProduct.prix_unitaire,
      total_ligne: totalLigne
    };

    console.log('➕ Ajout produit personnalisé:', newProduct);
    onProductsChange([...products, newProduct]);
    setCustomProduct({ nom: '', quantite: 1, prix_unitaire: 0 });
  };

  // Supprimer un produit
  const removeProduct = (index: number) => {
    console.log('➖ Suppression produit index:', index);
    const updatedProducts = products.filter((_, i) => i !== index);
    onProductsChange(updatedProducts);
  };

  // Mettre à jour un produit
  const updateProduct = (index: number, field: string, value: number) => {
    console.log('🔄 Mise à jour produit:', index, field, value);
    const updatedProducts = [...products];
    const product = updatedProducts[index];
    
    if (field === 'quantite') {
      product.quantite = Math.max(1, value);
    } else if (field === 'prix_unitaire') {
      product.prix_unitaire = Math.max(0, value);
    }
    
    product.total_ligne = product.quantite * product.prix_unitaire;
    onProductsChange(updatedProducts);
  };

  // Calculer le total
  const total = products.reduce((sum, product) => sum + product.total_ligne, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + ' FCFA';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Produits de la facture
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Ajout de produits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Produit du stock */}
          <div className="p-4 border rounded-lg bg-blue-50">
            <h4 className="font-medium mb-3 text-blue-800">Produit du stock</h4>
            <div className="space-y-3">
              <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un produit" />
                </SelectTrigger>
                <SelectContent>
                  {stockProducts.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - {formatCurrency(product.price || 0)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={addStockProduct} 
                disabled={!selectedProductId || loading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter du stock
              </Button>
            </div>
          </div>

          {/* Produit personnalisé */}
          <div className="p-4 border rounded-lg bg-green-50">
            <h4 className="font-medium mb-3 text-green-800">Produit personnalisé</h4>
            <div className="space-y-3">
              <Input
                placeholder="Nom du produit"
                value={customProduct.nom}
                onChange={(e) => setCustomProduct(prev => ({ ...prev, nom: e.target.value }))}
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Quantité"
                  value={customProduct.quantite}
                  onChange={(e) => setCustomProduct(prev => ({ ...prev, quantite: parseInt(e.target.value) || 1 }))}
                  min="1"
                />
                <Input
                  type="number"
                  placeholder="Prix unitaire"
                  value={customProduct.prix_unitaire}
                  onChange={(e) => setCustomProduct(prev => ({ ...prev, prix_unitaire: parseFloat(e.target.value) || 0 }))}
                  min="0"
                />
              </div>
              <Button 
                onClick={addCustomProduct} 
                disabled={!customProduct.nom.trim()}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter produit personnalisé
              </Button>
            </div>
          </div>
        </div>

        {/* Liste des produits ajoutés */}
        {products.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
            <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 font-medium">Aucun produit ajouté</p>
            <p className="text-sm text-gray-400">Ajoutez des produits pour créer votre facture</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-lg font-semibold">
                Produits ajoutés ({products.length})
              </Label>
              <div className="text-sm text-gray-500">
                Total: {formatCurrency(total)}
              </div>
            </div>
            
            {products.map((product, index) => (
              <div key={product.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-4">
                    <Label className="text-xs text-gray-600">Produit</Label>
                    <p className="font-medium text-sm">{product.nom}</p>
                  </div>
                  
                  <div className="col-span-2">
                    <Label className="text-xs text-gray-600">Quantité</Label>
                    <Input
                      type="number"
                      value={product.quantite}
                      onChange={(e) => updateProduct(index, 'quantite', parseInt(e.target.value) || 1)}
                      min="1"
                      className="h-8 text-sm"
                    />
                  </div>
                  
                  <div className="col-span-3">
                    <Label className="text-xs text-gray-600">Prix unitaire</Label>
                    <Input
                      type="number"
                      value={product.prix_unitaire}
                      onChange={(e) => updateProduct(index, 'prix_unitaire', parseFloat(e.target.value) || 0)}
                      min="0"
                      className="h-8 text-sm"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <Label className="text-xs text-gray-600">Total</Label>
                    <p className="text-sm font-bold text-green-600">
                      {formatCurrency(product.total_ligne)}
                    </p>
                  </div>
                  
                  <div className="col-span-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeProduct(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Total final */}
            <div className="bg-orange-100 p-4 rounded-lg border-2 border-orange-200">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-orange-800">Total de la facture:</span>
                <span className="text-2xl font-bold text-orange-600">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
