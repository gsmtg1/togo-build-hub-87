
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductionOrderApproval } from '@/components/production/ProductionOrderApproval';
import { ProductionOrderTracking } from '@/components/production/ProductionOrderTracking';
import { ProductionOrdersList } from '@/components/production/ProductionOrdersList';
import { ProductionOrderDialog } from '@/components/production/ProductionOrderDialog';
import { Badge } from '@/components/ui/badge';
import { useProductionOrders } from '@/hooks/useTypedDatabase';
import type { ProductionOrder } from '@/types/database';

const OrdresProduction = () => {
  const { data: orders, loading, create, update, remove } = useProductionOrders();
  const [showDialog, setShowDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(null);

  const handleCreate = async (orderData: Partial<ProductionOrder>) => {
    await create(orderData);
    setShowDialog(false);
  };

  const handleUpdate = async (orderData: Partial<ProductionOrder>) => {
    if (selectedOrder) {
      await update(selectedOrder.id, orderData);
      setShowDialog(false);
      setSelectedOrder(null);
    }
  };

  const handleEdit = (order: ProductionOrder) => {
    setSelectedOrder(order);
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet ordre ?')) {
      await remove(id);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
      approved: { label: 'Approuvé', color: 'bg-green-100 text-green-800' },
      rejected: { label: 'Rejeté', color: 'bg-red-100 text-red-800' },
      in_progress: { label: 'En cours', color: 'bg-blue-100 text-blue-800' },
      completed: { label: 'Terminé', color: 'bg-purple-100 text-purple-800' },
      cancelled: { label: 'Annulé', color: 'bg-gray-100 text-gray-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const pendingOrders = orders.filter(order => order.status === 'pending');
  const activeOrders = orders.filter(order => 
    ['approved', 'in_progress'].includes(order.status)
  );

  if (loading) {
    return <div className="flex justify-center items-center h-64">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Ordres de production</h1>
          <p className="text-muted-foreground">
            Gérez tous vos ordres de production et suivez leur progression
          </p>
        </div>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvel ordre
        </Button>
      </div>

      <Tabs defaultValue="approval" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="approval" className="flex items-center gap-2">
            Approbation
            {pendingOrders.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {pendingOrders.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="tracking" className="flex items-center gap-2">
            Suivi production
            {activeOrders.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeOrders.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="list">Liste complète</TabsTrigger>
        </TabsList>

        <TabsContent value="approval" className="space-y-4">
          <ProductionOrderApproval
            orders={pendingOrders}
            onUpdate={update}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>

        <TabsContent value="tracking" className="space-y-4">
          <ProductionOrderTracking
            orders={activeOrders}
            onUpdate={update}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <ProductionOrdersList
            orders={orders}
            onEdit={handleEdit}
            onDelete={handleDelete}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>
      </Tabs>

      <ProductionOrderDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        order={selectedOrder}
        onSubmit={selectedOrder ? handleUpdate : handleCreate}
      />
    </div>
  );
};

export default OrdresProduction;
