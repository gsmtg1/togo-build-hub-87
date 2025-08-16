
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Package, Calculator, ShoppingCart, Database, Edit3 } from 'lucide-react';
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
  const { products: dbProducts, loading } = useProductsManager();
  const [selectedProductId, setSelectedProductId] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);
  
  const [nouveauProduit, setNouveauProduit] = useState({
    nom: '',
    quantite: 1,
    prix_unitaire: 0
  });

  // Ajouter un produit depuis la base de données
  const ajouterProduitDB = () => {
    if (!selectedProductId) return;

    const produitDB = dbProducts.find(p => p.id === selectedProductId);
    if (!produitDB) return;

    const produit: ProductItem = {
      id: `db-${Date.now()}`,
      nom: `${produitDB.name} (${produitDB.dimensions})`,
      quantite: 1,
      prix_unitaire: Number(produitDB.price),
      total_ligne: Number(produitDB.price),
      isCustom: false,
      product_id: produitDB.id
    };

    onProductsChange([...products, produit]);
    setSelectedProductId('');
  };

  // Ajouter un produit personnalisé
  const ajouterProduitPersonnalise = () => {
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
    setShowCustomForm(false);
  };

  const supprimerProduit = (id: string) => {
    onProductsChange(products.filter(p => p.id !== id));
  };

  const modifierProduit = (id: string, champ: keyof ProductItem, valeur: any) => {
    const nouveauxProduits = products.map(produit => {
      if (produit.id === id) {
        const produitModifie = { ...produit, [champ]: valeur };
        
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
      {/* Sélection depuis la base de données */}
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader className="pb-4">
          <CardTitle className="text-primary flex items-center gap-2 text-lg">
            <Database className="h-5 w-5" />
            Sélectionner depuis nos Produits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label className="text-sm font-medium text-muted-foreground">Choisir un produit existant</Label>
              <Select value={selectedProductId} onValueChange={setSelectedProductId} disabled={loading}>
                <SelectTrigger className="border-primary/30 focus:border-primary">
                  <SelectValue placeholder={loading ? "Chargement..." : "Sélectionner un produit"} />
                </SelectTrigger>
                <SelectContent>
                  {dbProducts.length === 0 ? (
                    <SelectItem value="empty" disabled>Aucun produit disponible</SelectItem>
                  ) : (
                    dbProducts.map((produit) => (
                      <SelectItem key={produit.id} value={produit.id}>
                        <div className="flex justify-between items-center w-full min-w-0">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{produit.name}</p>
                            <p className="text-xs text-muted-foreground">{produit.dimensions} • {produit.type}</p>
                          </div>
                          <div className="text-sm font-semibold text-primary ml-2">
                            {produit.price.toLocaleString()} FCFA
                          </div>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                onClick={ajouterProduitDB}
                disabled={!selectedProductId || loading}
                className="w-full bg-primary hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 border-t border-border"></div>
        <span className="text-sm text-muted-foreground font-medium">OU</span>
        <div className="flex-1 border-t border-border"></div>
      </div>

      {/* Produit personnalisé */}
      <Card className="border-2 border-secondary/20 bg-gradient-to-r from-secondary/5 to-secondary/10">
        <CardHeader className="pb-4">
          <CardTitle className="text-secondary-foreground flex items-center gap-2 text-lg">
            <Edit3 className="h-5 w-5" />
            Produit Personnalisé
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!showCustomForm ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCustomForm(true)}
              className="w-full border-secondary/50 hover:bg-secondary/10"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un produit personnalisé
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium text-muted-foreground">Nom du produit/service *</Label>
                  <Input
                    value={nouveauProduit.nom}
                    onChange={(e) => setNouveauProduit(prev => ({ ...prev, nom: e.target.value }))}
                    placeholder="Ex: Service de consultation"
                    className="border-secondary/30 focus:border-secondary"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Quantité *</Label>
                  <Input
                    type="number"
                    value={nouveauProduit.quantite}
                    onChange={(e) => setNouveauProduit(prev => ({ ...prev, quantite: Number(e.target.value) }))}
                    min="1"
                    className="border-secondary/30 focus:border-secondary"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Prix unitaire (FCFA) *</Label>
                  <Input
                    type="number"
                    value={nouveauProduit.prix_unitaire}
                    onChange={(e) => setNouveauProduit(prev => ({ ...prev, prix_unitaire: Number(e.target.value) }))}
                    min="0"
                    step="0.01"
                    className="border-secondary/30 focus:border-secondary"
                  />
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-2">
                <div className="text-sm text-muted-foreground">
                  Total ligne: <span className="font-semibold text-secondary-foreground">
                    {(nouveauProduit.quantite * nouveauProduit.prix_unitaire).toLocaleString()} FCFA
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCustomForm(false);
                      setNouveauProduit({ nom: '', quantite: 1, prix_unitaire: 0 });
                    }}
                    className="border-destructive/50 text-destructive hover:bg-destructive/10"
                  >
                    Annuler
                  </Button>
                  <Button
                    type="button"
                    onClick={ajouterProduitPersonnalise}
                    disabled={!nouveauProduit.nom.trim() || nouveauProduit.prix_unitaire < 0}
                    className="bg-secondary hover:bg-secondary/90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Liste des produits ajoutés */}
      {products.length > 0 && (
        <Card className="border-2 border-accent/20">
          <CardHeader className="bg-gradient-to-r from-accent/10 to-accent/20">
            <CardTitle className="text-accent-foreground flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Produits Sélectionnés ({products.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="text-left p-4 font-semibold text-muted-foreground">Produit/Service</th>
                    <th className="text-center p-4 font-semibold text-muted-foreground">Qté</th>
                    <th className="text-right p-4 font-semibold text-muted-foreground">Prix Unit.</th>
                    <th className="text-right p-4 font-semibold text-muted-foreground">Total</th>
                    <th className="text-center p-4 font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((produit, index) => (
                    <tr key={produit.id} className={`border-b hover:bg-muted/30 transition-colors ${index % 2 === 0 ? 'bg-background' : 'bg-muted/10'}`}>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-primary" />
                          <Input
                            value={produit.nom}
                            onChange={(e) => modifierProduit(produit.id, 'nom', e.target.value)}
                            className="border-0 bg-transparent focus:bg-background focus:border-border transition-all"
                          />
                          <div className="flex gap-1">
                            {produit.isCustom ? (
                              <Badge variant="outline" className="text-xs border-secondary text-secondary-foreground">
                                Personnalisé
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs border-primary text-primary">
                                Base de données
                              </Badge>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <Input
                          type="number"
                          value={produit.quantite}
                          onChange={(e) => modifierProduit(produit.id, 'quantite', Number(e.target.value))}
                          min="1"
                          className="w-20 text-center border-border focus:border-primary"
                        />
                      </td>
                      <td className="p-4 text-right">
                        <Input
                          type="number"
                          value={produit.prix_unitaire}
                          onChange={(e) => modifierProduit(produit.id, 'prix_unitaire', Number(e.target.value))}
                          min="0"
                          step="0.01"
                          className="w-32 text-right border-border focus:border-primary"
                        />
                      </td>
                      <td className="p-4 text-right font-semibold text-primary">
                        {produit.total_ligne.toLocaleString()} FCFA
                      </td>
                      <td className="p-4 text-center">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => supprimerProduit(produit.id)}
                          className="text-destructive hover:text-destructive-foreground border-destructive/20 hover:border-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gradient-to-r from-primary/10 to-accent/10">
                  <tr>
                    <td colSpan={3} className="p-4 text-right font-bold text-muted-foreground">
                      <div className="flex items-center justify-end gap-2">
                        <Calculator className="h-5 w-5 text-primary" />
                        SOUS-TOTAL :
                      </div>
                    </td>
                    <td className="p-4 text-right text-xl font-bold text-primary">
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
        <Card className="border-2 border-dashed border-muted-foreground/30 bg-muted/20">
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">Aucun produit ajouté</h3>
            <p className="text-muted-foreground">
              Sélectionnez un produit de notre base de données ou créez un produit personnalisé.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
