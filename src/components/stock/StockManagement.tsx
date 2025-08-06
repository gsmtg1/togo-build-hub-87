
import { useState } from 'react';
import { Plus, Package, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useProducts } from '@/hooks/useSupabaseDatabase';
import { StockMovementDialog } from './StockMovementDialog';
import type { Product } from '@/types/database';

export const StockManagement = () => {
  const { data: products, loading } = useProducts();
  const [showMovementDialog, setShowMovementDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const getStockStatus = (product: Product) => {
    // For now, we'll use a simple check since stock info is not in the current Product type
    const hasStock = true; // This would need to be determined from a stock table
    
    if (!hasStock) {
      return { status: 'danger', label: 'Stock critique', icon: AlertTriangle, color: 'text-red-500' };
    }
    return { status: 'success', label: 'Stock bon', icon: TrendingUp, color: 'text-green-500' };
  };

  const stats = {
    total: products.length,
    lowStock: 0, // Would need to calculate from stock data
    totalValue: products.reduce((sum, p) => sum + p.price, 0),
    totalQuantity: products.length // Simplified calculation
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestion du Stock</h1>
          <p className="text-muted-foreground">Contrôle et suivi de l'inventaire des briques</p>
        </div>
        <Button onClick={() => setShowMovementDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Mouvement de stock
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <CardTitle className="text-sm font-medium">Stocks faibles</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.lowStock}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quantité totale</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalQuantity.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">unités</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valeur stock</CardTitle>
            <Package className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalValue.toLocaleString()} FCFA</div>
          </CardContent>
        </Card>
      </div>

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
                <TableHead>Prix unitaire</TableHead>
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
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.type}</Badge>
                    </TableCell>
                    <TableCell>
                      {product.dimensions}
                    </TableCell>
                    <TableCell className="font-medium">
                      {product.price.toLocaleString()} FCFA
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <StatusIcon className={`h-4 w-4 ${stockStatus.color}`} />
                        <span className="text-sm">{stockStatus.label}</span>
                      </div>
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
                        Ajuster stock
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
