
import { useState } from 'react';
import { Plus, Package, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useProducts } from '@/hooks/useSupabaseDatabase';
import type { Product } from '@/types/database';
import { PRODUCT_CATEGORIES, COMPANY_INFO } from '@/config/company';

export default function Stock() {
  const { data: products, loading, create, update, remove } = useProducts();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    nom: '',
    categorie: '',
    longueur_cm: '',
    largeur_cm: '',
    hauteur_cm: '',
    prix_unitaire: '',
    stock_actuel: '',
    stock_minimum: '',
    actif: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData = {
      nom: formData.nom,
      categorie: formData.categorie,
      longueur_cm: parseInt(formData.longueur_cm),
      largeur_cm: parseInt(formData.largeur_cm),
      hauteur_cm: parseInt(formData.hauteur_cm),
      prix_unitaire: parseFloat(formData.prix_unitaire),
      stock_actuel: parseInt(formData.stock_actuel),
      stock_minimum: parseInt(formData.stock_minimum),
      actif: formData.actif,
      date_creation: new Date().toISOString(),
      date_modification: new Date().toISOString()
    };

    try {
      if (editingProduct) {
        await update(editingProduct.id, productData);
      } else {
        await create(productData);
      }
      
      setDialogOpen(false);
      setEditingProduct(null);
      setFormData({
        nom: '',
        categorie: '',
        longueur_cm: '',
        largeur_cm: '',
        hauteur_cm: '',
        prix_unitaire: '',
        stock_actuel: '',
        stock_minimum: '',
        actif: true
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      nom: product.nom,
      categorie: product.categorie,
      longueur_cm: product.longueur_cm.toString(),
      largeur_cm: product.largeur_cm.toString(),
      hauteur_cm: product.hauteur_cm.toString(),
      prix_unitaire: product.prix_unitaire.toString(),
      stock_actuel: product.stock_actuel.toString(),
      stock_minimum: product.stock_minimum.toString(),
      actif: product.actif
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      await remove(id);
    }
  };

  const getStockStatus = (product: Product) => {
    if (product.stock_actuel <= product.stock_minimum) {
      return { status: 'danger', label: 'Stock faible', icon: AlertTriangle };
    }
    if (product.stock_actuel <= product.stock_minimum * 1.5) {
      return { status: 'warning', label: 'Stock moyen', icon: TrendingDown };
    }
    return { status: 'success', label: 'Stock bon', icon: TrendingUp };
  };

  const stats = {
    total: products.length,
    lowStock: products.filter(p => p.stock_actuel <= p.stock_minimum).length,
    active: products.filter(p => p.actif).length,
    categories: [...new Set(products.map(p => p.categorie))].length,
    totalValue: products.reduce((sum, p) => sum + (p.stock_actuel * p.prix_unitaire), 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Chargement du stock...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestion du Stock</h1>
          <p className="text-muted-foreground">{COMPANY_INFO.name} - Inventaire des briques</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau produit
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nom">Nom du produit</Label>
                  <Input
                    id="nom"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    placeholder="Ex: 15 Creux"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="categorie">Catégorie</Label>
                  <Select value={formData.categorie} onValueChange={(value) => setFormData({ ...formData, categorie: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="creuse">Briques creuses</SelectItem>
                      <SelectItem value="pleine">Briques pleines</SelectItem>
                      <SelectItem value="hourdis">Hourdis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="longueur">Longueur (cm)</Label>
                  <Input
                    id="longueur"
                    type="number"
                    value={formData.longueur_cm}
                    onChange={(e) => setFormData({ ...formData, longueur_cm: e.target.value })}
                    placeholder="40 ou 60"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="largeur">Largeur (cm)</Label>
                  <Input
                    id="largeur"
                    type="number"
                    value={formData.largeur_cm}
                    onChange={(e) => setFormData({ ...formData, largeur_cm: e.target.value })}
                    placeholder="20"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="hauteur">Hauteur (cm)</Label>
                  <Input
                    id="hauteur"
                    type="number"
                    value={formData.hauteur_cm}
                    onChange={(e) => setFormData({ ...formData, hauteur_cm: e.target.value })}
                    placeholder="10, 12, 15, 20"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="prix_unitaire">Prix unitaire (FCFA)</Label>
                  <Input
                    id="prix_unitaire"
                    type="number"
                    value={formData.prix_unitaire}
                    onChange={(e) => setFormData({ ...formData, prix_unitaire: e.target.value })}
                    placeholder="150"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="stock_actuel">Stock actuel</Label>
                  <Input
                    id="stock_actuel"
                    type="number"
                    value={formData.stock_actuel}
                    onChange={(e) => setFormData({ ...formData, stock_actuel: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="stock_minimum">Stock minimum</Label>
                  <Input
                    id="stock_minimum"
                    type="number"
                    value={formData.stock_minimum}
                    onChange={(e) => setFormData({ ...formData, stock_minimum: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">
                  {editingProduct ? 'Modifier' : 'Créer'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total produits</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock faible</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.lowStock}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produits actifs</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Catégories</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.categories}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valeur stock</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalValue.toLocaleString()} FCFA</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Catalogue des produits Cornerstone Briques</CardTitle>
          <CardDescription>
            Inventaire complet des briques creuses, pleines et hourdis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produit</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Dimensions</TableHead>
                <TableHead>Prix unitaire</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const stockStatus = getStockStatus(product);
                const StatusIcon = stockStatus.icon;
                
                return (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.nom}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {PRODUCT_CATEGORIES[product.categorie as keyof typeof PRODUCT_CATEGORIES] || product.categorie}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {product.longueur_cm} × {product.largeur_cm} × {product.hauteur_cm} cm
                    </TableCell>
                    <TableCell className="font-medium">
                      {product.prix_unitaire.toLocaleString()} FCFA
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <StatusIcon className={`h-4 w-4 ${
                          stockStatus.status === 'danger' ? 'text-red-500' :
                          stockStatus.status === 'warning' ? 'text-yellow-500' :
                          'text-green-500'
                        }`} />
                        <span className="font-medium">{product.stock_actuel}</span>
                        <span className="text-sm text-muted-foreground">/ {product.stock_minimum}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.actif ? 'default' : 'secondary'}>
                        {product.actif ? 'Actif' : 'Inactif'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(product)}
                        >
                          Modifier
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(product.id)}
                        >
                          Supprimer
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
