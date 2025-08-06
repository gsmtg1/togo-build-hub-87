
import { useState } from 'react';
import { Plus, Clock, CheckCircle, AlertCircle, Factory, Calendar, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useProductionOrders, useProducts } from '@/hooks/useSupabaseDatabase';
import { ProductionOrderDialog } from '@/components/production/ProductionOrderDialog';

export default function Production() {
  const { data: orders, loading, create, update } = useProductionOrders();
  const { data: products } = useProducts();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);

  const handleCreateOrder = async (orderData: any) => {
    await create(orderData);
    setDialogOpen(false);
  };

  const handleUpdateOrder = async (orderData: any) => {
    if (editingOrder) {
      await update(editingOrder.id, orderData);
      setEditingOrder(null);
      setDialogOpen(false);
    }
  };

  const openEditDialog = (order: any) => {
    setEditingOrder(order);
    setDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'en_attente': return 'bg-yellow-100 text-yellow-800';
      case 'en_cours': return 'bg-blue-100 text-blue-800';
      case 'termine': return 'bg-green-100 text-green-800';
      case 'annule': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'en_attente': return 'En attente';
      case 'en_cours': return 'En cours';
      case 'termine': return 'Terminé';
      case 'annule': return 'Annulé';
      default: return status;
    }
  };

  // Calculer les statistiques
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(order => order.statut === 'en_attente').length;
  const inProgressOrders = orders.filter(order => order.statut === 'en_cours').length;
  const completedOrders = orders.filter(order => order.statut === 'termine').length;

  if (loading) {
    return <div className="flex items-center justify-center h-64">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Production</h1>
          <p className="text-muted-foreground">Gérer les ordres de production</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvel ordre
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total ordres</CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En cours</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{inProgressOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terminés</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedOrders}</div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des ordres */}
      <Card>
        <CardHeader>
          <CardTitle>Ordres de production</CardTitle>
          <CardDescription>Liste de tous les ordres de production</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Ordre</TableHead>
                <TableHead>Produit</TableHead>
                <TableHead>Quantité</TableHead>
                <TableHead>Date demande</TableHead>
                <TableHead>Date prévue</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const product = products.find(p => p.id === order.product_id);
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {order.numero_ordre}
                    </TableCell>
                    <TableCell>
                      {product ? product.name : 'Produit introuvable'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {order.quantite} unités
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(order.date_demande).toLocaleDateString('fr-FR')}
                      </div>
                    </TableCell>
                    <TableCell>
                      {order.date_prevue ? (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(order.date_prevue).toLocaleDateString('fr-FR')}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Non définie</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.statut)}>
                        {getStatusLabel(order.statut)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(order)}
                      >
                        Modifier
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ProductionOrderDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={editingOrder ? handleUpdateOrder : handleCreateOrder}
        order={editingOrder}
      />
    </div>
  );
}
