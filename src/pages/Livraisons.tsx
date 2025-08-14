
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DeliveryTracking } from '@/components/delivery/DeliveryTracking';
import { DeliveryList } from '@/components/delivery/DeliveryList';
import { DeliveryDialog } from '@/components/delivery/DeliveryDialog';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Badge } from '@/components/ui/badge';
import { useDeliveries } from '@/hooks/useSupabaseDatabase';
import type { Delivery } from '@/types/database';

const Livraisons = () => {
  const { data: deliveries, loading, create, update, remove } = useDeliveries();
  const [showDialog, setShowDialog] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleCreate = async (deliveryData: any) => {
    try {
      const completeDeliveryData = {
        ...deliveryData,
        status: deliveryData.status || 'scheduled',
        delivery_date: deliveryData.delivery_date || new Date().toISOString(),
        delivery_address: deliveryData.delivery_address || '',
        sale_id: deliveryData.sale_id || crypto.randomUUID(), // Temporary sale_id
      };
      
      await create(completeDeliveryData);
      setShowDialog(false);
    } catch (error) {
      console.error('Error creating delivery:', error);
    }
  };

  const handleUpdate = async (deliveryData: any) => {
    if (selectedDelivery) {
      try {
        await update(selectedDelivery.id, deliveryData);
        setShowDialog(false);
        setSelectedDelivery(null);
      } catch (error) {
        console.error('Error updating delivery:', error);
      }
    }
  };

  const handleEdit = (delivery: any) => {
    setSelectedDelivery(delivery);
    setShowDialog(true);
  };

  const handleDeleteRequest = (id: string) => {
    setDeleteId(id);
  };

  const handleDeleteConfirm = async () => {
    if (deleteId) {
      try {
        await remove(deleteId);
        setDeleteId(null);
      } catch (error) {
        console.error('Error deleting delivery:', error);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { label: 'Programmée', color: 'bg-yellow-100 text-yellow-800' },
      in_transit: { label: 'En transit', color: 'bg-blue-100 text-blue-800' },
      delivered: { label: 'Livrée', color: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Annulée', color: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const activeDeliveries = deliveries.filter(delivery => 
    ['scheduled', 'in_transit'].includes(delivery.status)
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Livraisons</h1>
          <p className="text-muted-foreground mt-1">
            Gérez et suivez toutes vos livraisons en temps réel
          </p>
        </div>
        <Button onClick={() => setShowDialog(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle livraison
        </Button>
      </div>

      <Tabs defaultValue="tracking" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tracking" className="flex items-center gap-2">
            <span className="hidden sm:inline">Suivi en temps réel</span>
            <span className="sm:hidden">Suivi</span>
            {activeDeliveries.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeDeliveries.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="list">
            <span className="hidden sm:inline">Liste complète</span>
            <span className="sm:hidden">Liste</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tracking" className="space-y-4 mt-6">
          <DeliveryTracking
            deliveries={activeDeliveries}
            onUpdate={update}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>

        <TabsContent value="list" className="space-y-4 mt-6">
          <DeliveryList
            deliveries={deliveries}
            onEdit={handleEdit}
            onDelete={handleDeleteRequest}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>
      </Tabs>

      <DeliveryDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        delivery={selectedDelivery}
        onSubmit={selectedDelivery ? handleUpdate : handleCreate}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Supprimer la livraison"
        description="Êtes-vous sûr de vouloir supprimer cette livraison ? Cette action est irréversible."
        onConfirm={handleDeleteConfirm}
        confirmText="Supprimer"
        variant="destructive"
      />
    </div>
  );
};

export default Livraisons;
