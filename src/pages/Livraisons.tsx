
import { useState } from 'react';
import { Plus, Truck, Package, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useDeliveries } from '@/hooks/useSupabaseDatabase';
import { DeliveryDialog } from '@/components/delivery/DeliveryDialog';
import { DeliveryTracking } from '@/components/delivery/DeliveryTracking';
import { DeliveryList } from '@/components/delivery/DeliveryList';
import type { Database } from '@/integrations/supabase/types';

type Delivery = Database['public']['Tables']['deliveries']['Row'];

const Livraisons = () => {
  const { data: deliveries, loading, create, update, remove } = useDeliveries();
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCreateDelivery = () => {
    setSelectedDelivery(null);
    setDialogOpen(true);
  };

  const handleEditDelivery = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setDialogOpen(true);
  };

  const handleDeleteDelivery = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette livraison ?')) {
      await remove(id);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'En attente', variant: 'secondary' as const },
      confirmed: { label: 'Confirmée', variant: 'default' as const },
      in_transit: { label: 'En transit', variant: 'default' as const },
      delivered: { label: 'Livrée', variant: 'default' as const },
      cancelled: { label: 'Annulée', variant: 'destructive' as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'default' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Chargement des livraisons...</div>
      </div>
    );
  }

  const pendingDeliveries = deliveries.filter(delivery => delivery.status === 'pending');
  const confirmedDeliveries = deliveries.filter(delivery => delivery.status === 'confirmed');
  const inTransitDeliveries = deliveries.filter(delivery => delivery.status === 'in_transit');
  const deliveredDeliveries = deliveries.filter(delivery => delivery.status === 'delivered');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestion des Livraisons</h1>
        <Button onClick={handleCreateDelivery} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouvelle Livraison
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              En attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingDeliveries.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Confirmées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{confirmedDeliveries.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Truck className="h-4 w-4" />
              En transit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inTransitDeliveries.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4" />
              Livrées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deliveredDeliveries.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tracking" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tracking">Suivi des livraisons</TabsTrigger>
          <TabsTrigger value="all">Toutes les livraisons</TabsTrigger>
        </TabsList>

        <TabsContent value="tracking">
          <DeliveryTracking
            deliveries={deliveries.filter(d => d.status !== 'delivered' && d.status !== 'cancelled')}
            onUpdate={update}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>

        <TabsContent value="all">
          <DeliveryList
            deliveries={deliveries}
            onEdit={handleEditDelivery}
            onDelete={handleDeleteDelivery}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>
      </Tabs>

      <DeliveryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        delivery={selectedDelivery}
        onSubmit={async (deliveryData) => {
          if (selectedDelivery) {
            await update(selectedDelivery.id, deliveryData);
          } else {
            await create(deliveryData);
          }
          setDialogOpen(false);
        }}
      />
    </div>
  );
};

export default Livraisons;
