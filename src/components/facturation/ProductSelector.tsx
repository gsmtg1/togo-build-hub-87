
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus } from 'lucide-react';
import { useProductsWithStock } from '@/hooks/useSupabaseDatabase';

interface Product {
  id: string;
  nom: string;
  quantite: number;
  prix_unitaire: number;
  total_ligne: number;
}

interface ProductSelectorProps {
  products: Product[];
  onProductsChange: (products: Product[]) => void;
}

export const ProductSelector = ({ products, onProductsChange }: ProductSelectorProps) => {
  const { products: stockProducts } = useProductsWithStock();
  const [newProduct, setNewProduct] = useState({
    id: '',
    nom: '',
    quantite: 1,
    prix_unitaire: 0
  });

  const addProduct = () => {
    if (!newProduct.nom && !newProduct.id) return;

    let name = newProduct.nom;
    let price = newProduct.prix_unitaire;

    if (newProduct.id) {
      const stockProduct = stockProducts.find(p => p.id === newProduct.id);
      if (stockProduct) {
        name = stockProduct.name;
        price = stockProduct.price || 0;
      }
    }

    const product: Product = {
      id: newProduct.id || `custom-${Date.now()}`,
      nom: name,
      quantite: newProduct.quantite,
      prix_unitaire: price,
      total_ligne: newProduct.quantite * price
    };

    onProductsChange([...products, product]);
    
    // Reset form
    setNewProduct({
      id: '',
      nom: '',
      quantite: 1,
      prix_unitaire: 0
    });
  };

  const removeProduct = (index: number) => {
    const updatedProducts = products.filter((_, i) => i !== index);
    onProductsChange(updatedProducts);
  };

  const updateQuantity = (index: number, quantity: number) => {
    const updatedProducts = [...products];
    updatedProducts[index].quantite = quantity;
    updatedProducts[index].total_ligne = quantity * updatedProducts[index].prix_unitaire;
    onProductsChange(updatedProducts);
  };

  const updatePrice = (index: number, price: number) => {
    const updatedProducts = [...products];
    updatedProducts[index].prix_unitaire = price;
    updatedProducts[index].total_ligne = updatedProducts[index].quantite * price;
    onProductsChange(updatedProducts);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Produits</h3>
      
      {/* Add product form */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
        <div>
          <Label>Produit du stock</Label>
          <Select 
            value={newProduct.id} 
            onValueChange={(value) => setNewProduct(prev => ({ ...prev, id: value, nom: '' }))}
          >
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
        </div>

        <div>
          <Label>Ou produit personnalisé</Label>
          <Input
            value={newProduct.nom}
            onChange={(e) => setNewProduct(prev => ({ ...prev, nom: e.target.value, id: '' }))}
            placeholder="Nom du produit"
          />
        </div>

        <div>
          <Label>Quantité</Label>
          <Input
            type="number"
            value={newProduct.quantite}
            onChange={(e) => setNewProduct(prev => ({ ...prev, quantite: parseInt(e.target.value) || 1 }))}
            min="1"
          />
        </div>

        <div>
          <Label>Prix unitaire</Label>
          <Input
            type="number"
            value={newProduct.prix_unitaire}
            onChange={(e) => setNewProduct(prev => ({ ...prev, prix_unitaire: parseFloat(e.target.value) || 0 }))}
            placeholder="Prix"
          />
        </div>

        <div className="md:col-span-4">
          <Button onClick={addProduct} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Ajouter le produit
          </Button>
        </div>
      </div>

      {/* Products list */}
      {products.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Produits ajoutés:</h4>
          {products.map((product, index) => (
            <div key={index} className="grid grid-cols-5 gap-4 items-center p-3 bg-white border rounded">
              <div>
                <p className="font-medium">{product.nom}</p>
              </div>
              
              <div>
                <Label className="text-xs">Quantité</Label>
                <Input
                  type="number"
                  value={product.quantite}
                  onChange={(e) => updateQuantity(index, parseInt(e.target.value) || 1)}
                  min="1"
                  className="h-8"
                />
              </div>
              
              <div>
                <Label className="text-xs">Prix unitaire</Label>
                <Input
                  type="number"
                  value={product.prix_unitaire}
                  onChange={(e) => updatePrice(index, parseFloat(e.target.value) || 0)}
                  className="h-8"
                />
              </div>
              
              <div>
                <Label className="text-xs">Total</Label>
                <p className="text-sm font-medium">{formatCurrency(product.total_ligne)}</p>
              </div>
              
              <div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeProduct(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          
          <div className="text-right pt-4 border-t">
            <p className="text-lg font-bold">
              Total: {formatCurrency(products.reduce((sum, p) => sum + p.total_ligne, 0))}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
