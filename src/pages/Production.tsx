
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, PlayCircle, PauseCircle, CheckCircle, XCircle, Edit } from 'lucide-react';
import { ProductionOrderDialog } from '@/components/production/ProductionOrderDialog';
import { useProductionOrders, useProducts } from '@/hooks/useSupabaseDatabase';

const Production = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { data: orders, loading, create, update } = useProductionOrders();
  const { data: products } = useProducts();

  const handleCreateOrder = (orderData: any) => {
    if (isEditing && selectedOrder) {
      update(selectedOrder.id, orderData);
    } else {
      create(orderData);
    }
    setDialogOpen(false);
    setSelectedOrder(null);
    setIsEditing(false);
  };

  const handleEditOrder = (order: any) => {
    setSelectedOrder(order);
    setIsEditing(true);
    setDialogOpen(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planned': return <PauseCircle className="h-4 w-4" />;
      case 'in_progress': return <PlayCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <PauseCircle className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'planned': return 'Planifié';
      case 'in_progress': return 'En cours';
      case 'completed': return 'Terminé';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'planned': return 'outline';
      case 'in_progress': return 'default';
      case 'completed': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  // Grouper les produits par type
  const productsByType = products.reduce((acc, product) => {
    const type = product.type || 'Autres';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(product);
    return acc;
  }, {} as Record<string, any[]>);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Production</h1>
          <p className="text-muted-foreground">
            Gérez vos ordres de production et suivez l'avancement
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvel ordre
        </Button>
      </div>

      {/* Affichage des produits par type */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(productsByType).map(([type, typeProducts]) => (
          <Card key={type}>
            <CardHeader>
              <CardTitle className="text-lg">{type}</CardTitle>
              <CardDescription>
                {typeProducts.length} produit{typeProducts.length > 1 ? 's' : ''} disponible{typeProducts.length > 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {typeProducts.map((product) => (
                  <div key={product.id} className="flex justify-between items-center text-sm">
                    <div>
                      <span className="font-medium">{product.name || product.nom}</span>
                      <div className="text-xs text-muted-foreground">{product.dimensions}</div>
                    </div>
                    <span className="text-muted-foreground">{product.price} FCFA</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ordres de production</CardTitle>
          <CardDescription>
            Liste de tous les ordres de production avec leur statut
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Produit</th>
                  <th className="text-left py-2">Quantité prévue</th>
                  <th className="text-left py-2">Quantité produite</th>
                  <th className="text-left py-2">Date début</th>
                  <th className="text-left py-2">Date fin</th>
                  <th className="text-left py-2">Statut</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const product = products.find(p => p.id === order.product_id);
                  return (
                    <tr key={order.id} className="border-b">
                      <td className="py-2">
                        <div>
                          <div className="font-medium">{product ? (product.name || product.nom) : 'Produit inconnu'}</div>
                          {product && (
                            <div className="text-xs text-muted-foreground">{product.dimensions}</div>
                          )}
                        </div>
                      </td>
                      <td className="py-2">{order.planned_quantity}</td>
                      <td className="py-2">{order.produced_quantity}</td>
                      <td className="py-2">{new Date(order.start_date).toLocaleDateString('fr-FR')}</td>
                      <td className="py-2">
                        {order.end_date ? new Date(order.end_date).toLocaleDateString('fr-FR') : 'Non définie'}
                      </td>
                      <td className="py-2">
                        <Badge variant={getStatusVariant(order.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(order.status)}
                            {getStatusLabel(order.status)}
                          </div>
                        </Badge>
                      </td>
                      <td className="py-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditOrder(order)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <ProductionOrderDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleCreateOrder}
        order={selectedOrder}
        isEditing={isEditing}
      />
    </div>
  );
};

export default Production;
