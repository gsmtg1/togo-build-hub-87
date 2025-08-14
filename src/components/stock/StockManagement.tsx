
import { useState } from 'react';
import { Plus, Package, AlertTriangle, TrendingUp, Activity, History } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useProductsWithStock, useStockMovements } from '@/hooks/useSupabaseDatabase';
import { StockMovementDialog } from './StockMovementDialog';

export const StockManagement = () => {
  const { products, loading } = useProductsWithStock();
  const { data: movements } = useStockMovements();
  const [showMovementDialog, setShowMovementDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const getStockStatus = (product: any) => {
    const quantity = product.stock_quantity || 0;
    const minimum = product.minimum_stock || 0;
    
    if (quantity === 0) {
      return { 
        status: 'critical', 
        label: 'Rupture', 
        icon: AlertTriangle, 
        color: 'text-red-600 bg-red-100',
        badge: 'destructive' as const
      };
    } else if (quantity <= minimum) {
      return { 
        status: 'warning', 
        label: 'Stock faible', 
        icon: AlertTriangle, 
        color: 'text-orange-600 bg-orange-100',
        badge: 'secondary' as const
      };
    }
    return { 
      status: 'good', 
      label: 'Stock bon', 
      icon: TrendingUp, 
      color: 'text-green-600 bg-green-100',
      badge: 'default' as const
    };
  };

  const stats = {
    total: products.length,
    lowStock: products.filter(p => (p.stock_quantity || 0) <= (p.minimum_stock || 0)).length,
    outOfStock: products.filter(p => (p.stock_quantity || 0) === 0).length,
    totalValue: products.reduce((sum, p) => sum + (p.price * (p.stock_quantity || 0)), 0),
    totalQuantity: products.reduce((sum, p) => sum + (p.stock_quantity || 0), 0),
    recentMovements: movements.slice(0, 5)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-2" />
          <p>Chargement des données de stock...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion du Stock</h1>
          <p className="text-gray-600">Contrôle et suivi de l'inventaire des briques</p>
        </div>
        <Button onClick={() => setShowMovementDialog(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Mouvement de stock
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total produits</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-gray-600">références actives</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ruptures</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.outOfStock}</div>
            <p className="text-xs text-red-600">à réapprovisionner</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stocks faibles</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.lowStock - stats.outOfStock}</div>
            <p className="text-xs text-orange-600">sous le seuil</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quantité totale</CardTitle>
            <Package className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.totalQuantity.toLocaleString()}</div>
            <p className="text-xs text-green-600">unités en stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valeur stock</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.totalValue.toLocaleString()}</div>
            <p className="text-xs text-purple-600">FCFA</p>
          </CardContent>
        </Card>
      </div>

      {/* Mouvements récents */}
      {stats.recentMovements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Mouvements récents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.recentMovements.map((movement) => (
                <div key={movement.id} className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant={movement.type === 'entree' ? 'default' : 'secondary'}>
                      {movement.type === 'entree' ? '+' : '-'}{movement.quantite}
                    </Badge>
                    <span className="font-medium">{movement.motif}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(movement.date_mouvement).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventaire détaillé */}
      <Card>
        <CardHeader>
          <CardTitle>Inventaire des produits</CardTitle>
          <CardDescription>État actuel des stocks par produit</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produit</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Dimensions</TableHead>
                <TableHead className="text-right">Stock actuel</TableHead>
                <TableHead className="text-right">Stock minimum</TableHead>
                <TableHead className="text-right">Prix unitaire</TableHead>
                <TableHead className="text-right">Valeur stock</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const stockStatus = getStockStatus(product);
                const StatusIcon = stockStatus.icon;
                const stockValue = (product.stock_quantity || 0) * product.price;
                
                return (
                  <TableRow key={product.id} className={stockStatus.status === 'critical' ? 'bg-red-50' : ''}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.type}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {product.dimensions}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {(product.stock_quantity || 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-gray-600">
                      {(product.minimum_stock || 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {product.price.toLocaleString()} FCFA
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {stockValue.toLocaleString()} FCFA
                    </TableCell>
                    <TableCell>
                      <Badge variant={stockStatus.badge} className={stockStatus.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {stockStatus.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowMovementDialog(true);
                        }}
                      >
                        Ajuster
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <StockMovementDialog
        open={showMovementDialog}
        onOpenChange={setShowMovementDialog}
        selectedProduct={selectedProduct}
        onClose={() => {
          setShowMovementDialog(false);
          setSelectedProduct(null);
        }}
      />
    </div>
  );
};
