
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Package } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useDatabase';

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
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  
  const { data: productsData } = useLocalStorage<any>('products');

  useEffect(() => {
    if (productsData) {
      setAvailableProducts(productsData);
    }
  }, [productsData]);

  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
    const product = availableProducts.find(p => p.id === productId);
    if (product) {
      setUnitPrice(product.price || 0);
    }
  };

  const addProduct = () => {
    if (!selectedProductId) {
      alert('Veuillez sélectionner un produit');
      return;
    }

    if (quantity <= 0) {
      alert('La quantité doit être supérieure à 0');
      return;
    }

    if (unitPrice <= 0) {
      alert('Le prix unitaire doit être supérieur à 0');
      return;
    }

    const selectedProduct = availableProducts.find(p => p.id === selectedProductId);
    if (!selectedProduct) return;

    // Vérifier si le produit existe déjà
    const existingIndex = products.findIndex(p => p.id === selectedProductId);
    
    const newProduct: ProductItem = {
      id: selectedProductId,
      nom: selectedProduct.name,
      quantite: quantity,
      prix_unitaire: unitPrice,
      total_ligne: quantity * unitPrice
    };

    let updatedProducts;
    if (existingIndex >= 0) {
      // Mettre à jour le produit existant
      updatedProducts = [...products];
      updatedProducts[existingIndex] = {
        ...updatedProducts[existingIndex],
        quantite: updatedProducts[existingIndex].quantite + quantity,
        total_ligne: (updatedProducts[existingIndex].quantite + quantity) * unitPrice
      };
    } else {
      // Ajouter le nouveau produit
      updatedProducts = [...products, newProduct];
    }

    console.log('Produits mis à jour dans SimpleProductSelector:', updatedProducts);
    onProductsChange(updatedProducts);

    // Reset du formulaire
    setSelectedProductId('');
    setQuantity(1);
    setUnitPrice(0);
  };

  const removeProduct = (productId: string) => {
    const updatedProducts = products.filter(p => p.id !== productId);
    onProductsChange(updatedProducts);
  };

  const updateProductQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) return;
    
    const updatedProducts = products.map(product => {
      if (product.id === productId) {
        return {
          ...product,
          quantite: newQuantity,
          total_ligne: newQuantity * product.prix_unitaire
        };
      }
      return product;
    });
    
    onProductsChange(updatedProducts);
  };

  const updateProductPrice = (productId: string, newPrice: number) => {
    if (newPrice < 0) return;
    
    const updatedProducts = products.map(product => {
      if (product.id === productId) {
        return {
          ...product,
          prix_unitaire: newPrice,
          total_ligne: product.quantite * newPrice
        };
      }
      return product;
    });
    
    onProductsChange(updatedProducts);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  const totalGeneral = products.reduce((sum, product) => sum + product.total_ligne, 0);

  return (
    <div className="space-y-6">
      {/* Formulaire d'ajout de produit */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Ajouter un produit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="productSelect">Produit</Label>
              <Select value={selectedProductId} onValueChange={handleProductSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un produit" />
                </SelectTrigger>
                <SelectContent>
                  {availableProducts.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - {formatCurrency(product.price)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="quantity">Quantité</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              />
            </div>

            <div>
              <Label htmlFor="unitPrice">Prix unitaire (FCFA)</Label>
              <Input
                id="unitPrice"
                type="number"
                min="0"
                step="1"
                value={unitPrice}
                onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="flex items-end">
              <Button onClick={addProduct} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des produits sélectionnés */}
      {products.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Produits sélectionnés ({products.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead className="w-32">Quantité</TableHead>
                    <TableHead className="w-40">Prix unitaire</TableHead>
                    <TableHead className="w-40">Total</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        {product.nom}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          value={product.quantite}
                          onChange={(e) => updateProductQuantity(product.id, parseInt(e.target.value) || 1)}
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          value={product.prix_unitaire}
                          onChange={(e) => updateProductPrice(product.id, parseFloat(e.target.value) || 0)}
                          className="w-32"
                        />
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(product.total_ligne)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeProduct(product.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Total général */}
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total général:</span>
                <span className="text-xl font-bold text-orange-600">
                  {formatCurrency(totalGeneral)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {products.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Aucun produit sélectionné</p>
          <p className="text-sm">Utilisez le formulaire ci-dessus pour ajouter des produits</p>
        </div>
      )}
    </div>
  );
};
