
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Package, Calculator, ShoppingCart } from 'lucide-react';

interface ProductItem {
  id: string;
  nom: string;
  quantite: number;
  prix_unitaire: number;
  total_ligne: number;
  isCustom?: boolean;
}

interface SimpleProductSelectorProps {
  products: ProductItem[];
  onProductsChange: (products: ProductItem[]) => void;
}

export const SimpleProductSelector = ({ products, onProductsChange }: SimpleProductSelectorProps) => {
  const [nouveauProduit, setNouveauProduit] = useState({
    nom: '',
    quantite: 1,
    prix_unitaire: 0
  });

  const ajouterProduit = () => {
    if (!nouveauProduit.nom.trim() || nouveauProduit.prix_unitaire < 0) {
      return;
    }

    const produit: ProductItem = {
      id: `custom-${Date.now()}`,
      nom: nouveauProduit.nom.trim(),
      quantite: Number(nouveauProduit.quantite),
      prix_unitaire: Number(nouveauProduit.prix_unitaire),
      total_ligne: Number(nouveauProduit.quantite) * Number(nouveauProduit.prix_unitaire),
      isCustom: true
    };

    onProductsChange([...products, produit]);
    setNouveauProduit({ nom: '', quantite: 1, prix_unitaire: 0 });
  };

  const supprimerProduit = (id: string) => {
    onProductsChange(products.filter(p => p.id !== id));
  };

  const modifierProduit = (id: string, champ: keyof ProductItem, valeur: any) => {
    const nouveauxProduits = products.map(produit => {
      if (produit.id === id) {
        const produitModifie = { ...produit, [champ]: valeur };
        
        // Recalculer le total si quantité ou prix change
        if (champ === 'quantite' || champ === 'prix_unitaire') {
          produitModifie.total_ligne = Number(produitModifie.quantite) * Number(produitModifie.prix_unitaire);
        }
        
        return produitModifie;
      }
      return produit;
    });
    
    onProductsChange(nouveauxProduits);
  };

  const totalGeneral = products.reduce((sum, produit) => sum + produit.total_ligne, 0);

  return (
    <div className="space-y-6">
      {/* Formulaire d'ajout de produit */}
      <Card className="border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50">
        <CardHeader className="pb-4">
          <CardTitle className="text-orange-700 flex items-center gap-2 text-lg">
            <Plus className="h-5 w-5" />
            Ajouter un Produit/Service
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Label className="text-sm font-medium text-gray-700">Nom du produit/service *</Label>
              <Input
                value={nouveauProduit.nom}
                onChange={(e) => setNouveauProduit(prev => ({ ...prev, nom: e.target.value }))}
                placeholder="Ex: Brique rouge 15x10x20cm"
                className="border-orange-200 focus:border-orange-400"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Quantité *</Label>
              <Input
                type="number"
                value={nouveauProduit.quantite}
                onChange={(e) => setNouveauProduit(prev => ({ ...prev, quantite: Number(e.target.value) }))}
                min="1"
                className="border-orange-200 focus:border-orange-400"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Prix unitaire (FCFA) *</Label>
              <Input
                type="number"
                value={nouveauProduit.prix_unitaire}
                onChange={(e) => setNouveauProduit(prev => ({ ...prev, prix_unitaire: Number(e.target.value) }))}
                min="0"
                step="0.01"
                className="border-orange-200 focus:border-orange-400"
              />
            </div>
          </div>
          
          <div className="flex justify-between items-center pt-2">
            <div className="text-sm text-gray-600">
              Total ligne: <span className="font-semibold text-orange-600">
                {(nouveauProduit.quantite * nouveauProduit.prix_unitaire).toLocaleString()} FCFA
              </span>
            </div>
            <Button
              type="button"
              onClick={ajouterProduit}
              disabled={!nouveauProduit.nom.trim() || nouveauProduit.prix_unitaire < 0}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des produits ajoutés */}
      {products.length > 0 && (
        <Card className="border-2 border-orange-200">
          <CardHeader className="bg-gradient-to-r from-orange-100 to-amber-100">
            <CardTitle className="text-orange-700 flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Produits Sélectionnés ({products.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-orange-50 border-b border-orange-200">
                  <tr>
                    <th className="text-left p-4 font-semibold text-gray-700">Produit/Service</th>
                    <th className="text-center p-4 font-semibold text-gray-700">Qté</th>
                    <th className="text-right p-4 font-semibold text-gray-700">Prix Unit.</th>
                    <th className="text-right p-4 font-semibold text-gray-700">Total</th>
                    <th className="text-center p-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((produit, index) => (
                    <tr key={produit.id} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-orange-25'} hover:bg-orange-50 transition-colors`}>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-orange-500" />
                          <Input
                            value={produit.nom}
                            onChange={(e) => modifierProduit(produit.id, 'nom', e.target.value)}
                            className="border-0 bg-transparent focus:bg-white focus:border-orange-300 transition-all"
                          />
                          {produit.isCustom && (
                            <Badge variant="outline" className="text-xs border-orange-300 text-orange-600">
                              Personnalisé
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <Input
                          type="number"
                          value={produit.quantite}
                          onChange={(e) => modifierProduit(produit.id, 'quantite', Number(e.target.value))}
                          min="1"
                          className="w-20 text-center border-orange-200 focus:border-orange-400"
                        />
                      </td>
                      <td className="p-4 text-right">
                        <Input
                          type="number"
                          value={produit.prix_unitaire}
                          onChange={(e) => modifierProduit(produit.id, 'prix_unitaire', Number(e.target.value))}
                          min="0"
                          step="0.01"
                          className="w-32 text-right border-orange-200 focus:border-orange-400"
                        />
                      </td>
                      <td className="p-4 text-right font-semibold text-orange-600">
                        {produit.total_ligne.toLocaleString()} FCFA
                      </td>
                      <td className="p-4 text-center">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => supprimerProduit(produit.id)}
                          className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gradient-to-r from-orange-100 to-amber-100">
                  <tr>
                    <td colSpan={3} className="p-4 text-right font-bold text-gray-700">
                      <div className="flex items-center justify-end gap-2">
                        <Calculator className="h-5 w-5 text-orange-500" />
                        SOUS-TOTAL :
                      </div>
                    </td>
                    <td className="p-4 text-right text-xl font-bold text-orange-600">
                      {totalGeneral.toLocaleString()} FCFA
                    </td>
                    <td className="p-4"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Message si aucun produit */}
      {products.length === 0 && (
        <Card className="border-2 border-dashed border-orange-300 bg-orange-50">
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 text-orange-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucun produit ajouté</h3>
            <p className="text-gray-500">
              Utilisez le formulaire ci-dessus pour ajouter des produits ou services à votre {window.location.pathname.includes('devis') ? 'devis' : 'facture'}.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
