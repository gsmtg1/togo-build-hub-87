
import { useState } from 'react';
import { Plus, Filter, Search, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useProductionOrders } from '@/hooks/useSupabaseDatabase';
import { ProductionOrderDialog } from '@/components/production/ProductionOrderDialog';
import { ProductionOrdersList } from '@/components/production/ProductionOrdersList';
import { ProductionOrderApproval } from '@/components/production/ProductionOrderApproval';
import { ProductionOrderTracking } from '@/components/production/ProductionOrderTracking';
import type { Database } from '@/integrations/supabase/types';

type ProductionOrder = Database['public']['Tables']['production_orders']['Row'];

const OrdresProduction = () => {
  const { data: orders, loading, create, update, remove } = useProductionOrders();
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const handleCreateOrder = () => {
    setSelectedOrder(null);
    setDialogOpen(true);
  };

  const handleEditOrder = (order: ProductionOrder) => {
    setSelectedOrder(order);
    setDialogOpen(true);
  };

  const handleDeleteOrder = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet ordre de production ?')) {
      await remove(id);
    }
  };

  const handleApproveOrder = async (order: ProductionOrder) => {
    await update(order.id, {
      status: 'approved',
      approval_date: new Date().toISOString(),
      approved_by: 'Responsable Production'
    });
  };

  const handleRejectOrder = async (order: ProductionOrder, reason: string) => {
    await update(order.id, {
      status: 'rejected',
      rejection_reason: reason
    });
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.initiator_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingOrders = filteredOrders.filter(order => order.status === 'pending');
  const approvedOrders = filteredOrders.filter(order => order.status === 'approved');
  const inProgressOrders = filteredOrders.filter(order => order.status === 'in_progress');
  const completedOrders = filteredOrders.filter(order => order.status === 'completed');

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'En attente', variant: 'secondary' as const },
      approved: { label: 'Approuvé', variant: 'default' as const },
      rejected: { label: 'Rejeté', variant: 'destructive' as const },
      in_progress: { label: 'En cours', variant: 'default' as const },
      completed: { label: 'Terminé', variant: 'default' as const },
      cancelled: { label: 'Annulé', variant: 'destructive' as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'default' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Chargement des ordres de production...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Ordres de Production</h1>
        <Button onClick={handleCreateOrder} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouvel Ordre
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approuvés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedOrders.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">En cours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressOrders.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Terminés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedOrders.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par numéro ou initiateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg"
        >
          <option value="all">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="approved">Approuvés</option>
          <option value="in_progress">En cours</option>
          <option value="completed">Terminés</option>
          <option value="rejected">Rejetés</option>
        </select>
      </div>

      <Tabs defaultValue="approval" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="approval">Approbation</TabsTrigger>
          <TabsTrigger value="tracking">Suivi</TabsTrigger>
          <TabsTrigger value="all">Tous les ordres</TabsTrigger>
        </TabsList>

        <TabsContent value="approval">
          <ProductionOrderApproval
            orders={pendingOrders}
            onApprove={handleApproveOrder}
            onReject={handleRejectOrder}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>

        <TabsContent value="tracking">
          <ProductionOrderTracking
            orders={filteredOrders.filter(order => order.status === 'approved' || order.status === 'in_progress')}
            onUpdate={update}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>

        <TabsContent value="all">
          <ProductionOrdersList
            orders={filteredOrders}
            onEdit={handleEditOrder}
            onDelete={handleDeleteOrder}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>
      </Tabs>

      <ProductionOrderDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        order={selectedOrder}
        onSubmit={async (orderData) => {
          if (selectedOrder) {
            await update(selectedOrder.id, orderData);
          } else {
            await create(orderData);
          }
          setDialogOpen(false);
        }}
      />
    </div>
  );
};

export default OrdresProduction;
