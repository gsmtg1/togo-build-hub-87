
import { useState } from 'react';
import { Plus, Play, Pause, CheckCircle, XCircle, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useProductionOrders, useProducts } from '@/hooks/useSupabaseDatabase';
import { ProductionOrderDialog } from '@/components/production/ProductionOrderDialog';
import type { ProductionOrder } from '@/types/database';

const Production = () => {
  const { data: orders, loading, create, update, remove } = useProductionOrders();
  const { data: products } = useProducts();
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleCreate = async (orderData: any) => {
    await create(orderData);
    setDialogOpen(false);
  };

  const handleEdit = (order: ProductionOrder) => {
    setSelectedOrder(order);
    setIsEditing(true);
    setDialogOpen(true);
  };

  const handleUpdate = async (orderData: any) => {
    if (selectedOrder) {
      await update(selectedOrder.id, orderData);
      setDialogOpen(false);
      setSelectedOrder(null);
      setIsEditing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet ordre de production ?')) {
      await remove(id);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: ProductionOrder['status']) => {
    await update(id, { status: newStatus });
  };

  const getStatusBadge = (status: ProductionOrder['status']) => {
    const variants = {
      planned: 'secondary' as const,
      in_progress: 'default' as const,
      completed: 'default' as const,
      cancelled: 'destructive' as const,
    };
    
    const labels = {
      planned: 'Planifié',
      in_progress: 'En cours',
      completed: 'Terminé',
      cancelled: 'Annulé',
    };

    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  const getStatusActions = (order: ProductionOrder) => {
    switch (order.status) {
      case 'planned':
        return (
          <Button 
            size="sm" 
            onClick={() => handleUpdateStatus(order.id, 'in_progress')}
            className="mr-2"
          >
            <Play className="h-4 w-4 mr-1" />
            Démarrer
          </Button>
        );
      case 'in_progress':
        return (
          <>
            <Button 
              size="sm" 
              onClick={() => handleUpdateStatus(order.id, 'completed')}
              className="mr-2"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Terminer
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleUpdateStatus(order.id, 'planned')}
              className="mr-2"
            >
              <Pause className="h-4 w-4 mr-1" />
              Pause
            </Button>
          </>
        );
      case 'completed':
        return (
          <Badge variant="default" className="mr-2">
            <CheckCircle className="h-4 w-4 mr-1" />
            Terminé
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="destructive" className="mr-2">
            <XCircle className="h-4 w-4 mr-1" />
            Annulé
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Production</h1>
          <p className="text-muted-foreground">
            Gérez les ordres de production et suivez l'avancement
          </p>
        </div>
        <Button onClick={() => {
          setSelectedOrder(null);
          setIsEditing(false);
          setDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvel ordre
        </Button>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total ordres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En cours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(o => o.status === 'in_progress').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terminés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(o => o.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Production totale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.reduce((sum, o) => sum + o.planned_quantity, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des ordres */}
      <div className="grid gap-4">
        {orders.map((order) => {
          const product = products.find(p => p.id === order.product_id);
          const progress = order.planned_quantity > 0 ? 
            Math.round((order.produced_quantity / order.planned_quantity) * 100) : 0;
          
          return (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {product ? (product.name || product.nom) : 'Produit introuvable'}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {product?.dimensions} - {product?.type}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(order.status)}
                    <div className="flex gap-1">
                      {getStatusActions(order)}
                      <Button size="sm" variant="outline" onClick={() => handleEdit(order)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(order.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Quantité prévue:</span><br />
                    {order.planned_quantity} pièces
                  </div>
                  <div>
                    <span className="font-medium">Produit:</span><br />
                    {order.produced_quantity} pièces
                  </div>
                  <div>
                    <span className="font-medium">Date début:</span><br />
                    {formatDate(order.start_date)}
                  </div>
                  <div>
                    <span className="font-medium">Date fin:</span><br />
                    {order.end_date ? formatDate(order.end_date) : 'Non définie'}
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progression:</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        order.status === 'completed' ? 'bg-green-600' :
                        order.status === 'in_progress' ? 'bg-blue-600' :
                        order.status === 'cancelled' ? 'bg-red-600' : 'bg-gray-400'
                      }`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>
                </div>
                {order.notes && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    <strong>Notes:</strong> {order.notes}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <ProductionOrderDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={isEditing ? handleUpdate : handleCreate}
        order={selectedOrder}
        isEditing={isEditing}
      />
    </div>
  );
};

export default Production;
