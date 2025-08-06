
import { useState } from 'react';
import { Plus, Factory, BarChart3, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ProductionOrderDialog } from '@/components/production/ProductionOrderDialog';
import { useProductionOrders, useProducts } from '@/hooks/useSupabaseDatabase';

const Production = () => {
  const { data: orders, loading, create, update } = useProductionOrders();
  const { data: products } = useProducts();
  const [showDialog, setShowDialog] = useState(false);

  const handleCreate = async (orderData: any) => {
    await create(orderData);
    setShowDialog(false);
  };

  const todayOrders = orders.filter(order => 
    order.date_demande === new Date().toISOString().split('T')[0]
  );

  const activeOrders = orders.filter(order => 
    ['en_cours', 'approuve'].includes(order.statut)
  );

  const completedOrders = orders.filter(order => order.statut === 'termine');

  const totalProduction = completedOrders.reduce((sum, order) => sum + order.quantite, 0);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      en_attente: { label: 'En attente', variant: 'secondary' as const },
      approuve: { label: 'Approuvé', variant: 'default' as const },
      en_cours: { label: 'En cours', variant: 'default' as const },
      termine: { label: 'Terminé', variant: 'default' as const },
      annule: { label: 'Annulé', variant: 'destructive' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.en_attente;
    return <Badge variant={config.variant}>{config.label}</Badge>;
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
            Gérez votre production de briques et suivez les performances
          </p>
        </div>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvel ordre
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ordres aujourd'hui</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayOrders.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En cours</CardTitle>
            <Factory className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{activeOrders.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terminés</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedOrders.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total produit</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{totalProduction}</div>
            <p className="text-xs text-muted-foreground">briques</p>
          </CardContent>
        </Card>
      </div>

      {/* Onglets */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">Ordres actifs</TabsTrigger>
          <TabsTrigger value="all">Tous les ordres</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ordres de production actifs</CardTitle>
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
                    <TableHead>Progression</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeOrders.map((order) => {
                    const product = products.find(p => p.id === order.product_id);
                    const progress = order.statut === 'termine' ? 100 : 
                                   order.statut === 'en_cours' ? 50 : 
                                   order.statut === 'approuve' ? 25 : 0;
                    
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.numero_ordre}</TableCell>
                        <TableCell>
                          {product ? product.nom || product.name : 'Produit introuvable'}
                        </TableCell>
                        <TableCell>{order.quantite}</TableCell>
                        <TableCell>
                          {new Date(order.date_demande).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell>
                          {order.date_prevue ? new Date(order.date_prevue).toLocaleDateString('fr-FR') : '-'}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(order.statut)}
                        </TableCell>
                        <TableCell>
                          <div className="w-20">
                            <Progress value={progress} className="h-2" />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historique complet des ordres</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N° Ordre</TableHead>
                    <TableHead>Produit</TableHead>
                    <TableHead>Quantité</TableHead>
                    <TableHead>Date demande</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Commentaires</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => {
                    const product = products.find(p => p.id === order.product_id);
                    
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.numero_ordre}</TableCell>
                        <TableCell>
                          {product ? product.nom || product.name : 'Produit introuvable'}
                        </TableCell>
                        <TableCell>{order.quantite}</TableCell>
                        <TableCell>
                          {new Date(order.date_demande).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(order.statut)}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {order.commentaires || '-'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ProductionOrderDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onSubmit={handleCreate}
      />
    </div>
  );
};

export default Production;
