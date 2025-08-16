
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Package, ShoppingCart, Edit2 } from 'lucide-react';
import { useProducts } from '@/hooks/useSupabaseDatabase';
import { Badge } from '@/components/ui/badge';

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
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  
  const { data: availableProducts, loading } = useProducts();

  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
    const product = availableProducts?.find(p => p.id === productId);
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

    const selectedProduct = availableProducts?.find(p => p.id === selectedProductId);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Chargement des produits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Formulaire d'ajout de produit - Design moderne */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/20">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-t-lg">
          <CardTitle className="flex items-center gap-3 text-foreground">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-semibold">Ajouter un produit</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label htmlFor="productSelect" className="text-sm font-medium text-foreground">
                Produit disponible
              </Label>
              <Select value={selectedProductId} onValueChange={handleProductSelect}>
                <SelectTrigger className="h-11 border-2 focus:border-primary/50 transition-colors">
                  <SelectValue placeholder="Sélectionnez un produit" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {availableProducts?.map((product) => (
                    <SelectItem key={product.id} value={product.id} className="py-3">
                      <div className="flex flex-col space-y-1">
                        <span className="font-medium">{product.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {formatCurrency(product.price || 0)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-sm font-medium text-foreground">
                Quantité
              </Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="h-11 border-2 focus:border-primary/50 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unitPrice" className="text-sm font-medium text-foreground">
                Prix unitaire (FCFA)
              </Label>
              <Input
                id="unitPrice"
                type="number"
                min="0"
                step="1"
                value={unitPrice}
                onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                className="h-11 border-2 focus:border-primary/50 transition-colors"
              />
            </div>

            <div className="flex items-end">
              <Button 
                type="button"
                onClick={addProduct} 
                className="w-full h-11 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des produits sélectionnés - Design amélioré */}
      {products.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-accent/10 to-secondary/10 rounded-t-lg">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/20 rounded-lg">
                  <ShoppingCart className="h-5 w-5 text-accent-foreground" />
                </div>
                <span className="text-xl font-semibold">Produits sélectionnés</span>
                <Badge variant="secondary" className="ml-2">
                  {products.length} article{products.length > 1 ? 's' : ''}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="font-semibold text-foreground">Produit</TableHead>
                    <TableHead className="w-32 font-semibold text-foreground">Quantité</TableHead>
                    <TableHead className="w-40 font-semibold text-foreground">Prix unitaire</TableHead>
                    <TableHead className="w-40 font-semibold text-foreground">Total</TableHead>
                    <TableHead className="w-20 font-semibold text-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product, index) => (
                    <TableRow key={product.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell className="font-medium py-4">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          {product.nom}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          value={product.quantite}
                          onChange={(e) => updateProductQuantity(product.id, parseInt(e.target.value) || 1)}
                          className="w-20 text-center border-2 focus:border-primary/50"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          value={product.prix_unitaire}
                          onChange={(e) => updateProductPrice(product.id, parseFloat(e.target.value) || 0)}
                          className="w-32 border-2 focus:border-primary/50"
                        />
                      </TableCell>
                      <TableCell className="font-bold text-primary">
                        {formatCurrency(product.total_ligne)}
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeProduct(product.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Total général - Design amélioré */}
            <div className="p-6 bg-gradient-to-r from-primary/5 to-accent/5 border-t">
              <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
                <div className="flex items-center gap-2">
                  <Edit2 className="h-5 w-5 text-muted-foreground" />
                  <span className="text-lg font-semibold text-foreground">Total général:</span>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {formatCurrency(totalGeneral)}
                  </span>
                  <p className="text-sm text-muted-foreground mt-1">
                    {products.reduce((sum, product) => sum + product.quantite, 0)} articles au total
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* État vide - Design moderne */}
      {products.length === 0 && (
        <Card className="border-2 border-dashed border-muted-foreground/20">
          <CardContent className="py-12">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mb-4">
                <Package className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Aucun produit sélectionné</h3>
              <p className="text-muted-foreground mb-4">
                Utilisez le formulaire ci-dessus pour ajouter des produits à votre facture
              </p>
              <div className="flex items-center justify-center text-sm text-muted-foreground">
                <Plus className="h-4 w-4 mr-1" />
                Commencez par sélectionner un produit
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
