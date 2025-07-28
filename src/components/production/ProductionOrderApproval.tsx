
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, XCircle, Clock, Package } from 'lucide-react';
import { useProductionOrders, useProducts } from '@/hooks/useTypedDatabase';
import type { ProductionOrder } from '@/types/database';

export const ProductionOrderApproval = () => {
  const { data: orders, update: updateOrder } = useProductionOrders();
  const { data: products } = useProducts();

  const pendingOrders = orders.filter(order => order.status === 'pending');

  const approveOrder = async (orderId: string) => {
    await updateOrder(orderId, {
      status: 'approved',
      approval_date: new Date().toISOString(),
      approved_by: 'Manager' // In a real app, this would be the current user
    });
  };

  const rejectOrder = async (orderId: string) => {
    await updateOrder(orderId, {
      status: 'rejected',
      rejection_reason: 'Capacité de production insuffisante'
    });
  };

  const getProduct = (productId: string | null) => {
    if (!productId) return null;
    return products.find(p => p.id === productId);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />En attente</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approuvé</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejeté</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (pendingOrders.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">Aucun ordre en attente d'approbation</p>
            <p className="text-muted-foreground">Tous les ordres ont été traités</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Approbation des ordres</h2>
        <Badge variant="outline">
          {pendingOrders.length} ordre(s) en attente
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ordres en attente d'approbation</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numéro</TableHead>
                <TableHead>Produit</TableHead>
                <TableHead>Quantité</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Initiateur</TableHead>
                <TableHead>Date demande</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingOrders.map((order) => {
                const product = getProduct(order.product_id);
                
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.order_number}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{product?.name || 'Produit inconnu'}</p>
                        <p className="text-sm text-muted-foreground">{product?.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>{order.quantity?.toLocaleString()} unités</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.total_amount?.toLocaleString()} FCFA</p>
                        <p className="text-sm text-muted-foreground">
                          {order.unit_price?.toLocaleString()} FCFA/unité
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{order.initiator_name}</TableCell>
                    <TableCell>
                      {order.requested_date 
                        ? new Date(order.requested_date).toLocaleDateString('fr-FR')
                        : 'N/A'
                      }
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status || 'pending')}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => approveOrder(order.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approuver
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => rejectOrder(order.id)}
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Rejeter
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
