
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DeliveryTracking } from '@/components/delivery/DeliveryTracking';
import { DeliveryList } from '@/components/delivery/DeliveryList';
import { DeliveryDialog } from '@/components/delivery/DeliveryDialog';
import { Badge } from '@/components/ui/badge';
import { useDeliveries } from '@/hooks/useTypedDatabase';
import type { Delivery } from '@/types/database';

const Livraisons = () => {
  const { data: deliveries, loading, create, update, remove } = useDeliveries();
  const [showDialog, setShowDialog] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);

  const handleCreate = async (deliveryData: Partial<Delivery>) => {
    await create(deliveryData);
    setShowDialog(false);
  };

  const handleUpdate = async (deliveryData: Partial<Delivery>) => {
    if (selectedDelivery) {
      await update(selectedDelivery.id, deliveryData);
      setShowDialog(false);
      setSelectedDelivery(null);
    }
  };

  const handleEdit = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette livraison ?')) {
      await remove(id);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
      confirmed: { label: 'Confirmée', color: 'bg-blue-100 text-blue-800' },
      in_transit: { label: 'En transit', color: 'bg-orange-100 text-orange-800' },
      delivered: { label: 'Livrée', color: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Annulée', color: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const activeDeliveries = deliveries.filter(delivery => 
    ['pending', 'confirmed', 'in_transit'].includes(delivery.status)
  );

  if (loading) {
    return <div className="flex justify-center items-center h-64">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Livraisons</h1>
          <p className="text-muted-foreground">
            Gérez et suivez toutes vos livraisons en temps réel
          </p>
        </div>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle livraison
        </Button>
      </div>

      <Tabs defaultValue="tracking" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tracking" className="flex items-center gap-2">
            Suivi en temps réel
            {activeDeliveries.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeDeliveries.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="list">Liste complète</TabsTrigger>
        </TabsList>

        <TabsContent value="tracking" className="space-y-4">
          <DeliveryTracking
            deliveries={activeDeliveries}
            onUpdate={update}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <DeliveryList
            deliveries={deliveries}
            onEdit={handleEdit}
            onDelete={handleDelete}
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
    </div>
  );
};

export default Livraisons;
