
import { Edit, Trash2, Package, MapPin, Phone, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useProductionOrders } from '@/hooks/useTypedDatabase';
import type { Delivery } from '@/types/database';

interface DeliveryListProps {
  deliveries: Delivery[];
  onEdit: (delivery: Delivery) => void;
  onDelete: (id: string) => void;
  getStatusBadge: (status: string) => React.ReactNode;
}

export const DeliveryList = ({ deliveries, onEdit, onDelete, getStatusBadge }: DeliveryListProps) => {
  const { data: orders } = useProductionOrders();

  const getOrder = (orderId: string) => {
    return orders.find(order => order.id === orderId);
  };

  if (deliveries.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">Aucune livraison</p>
            <p className="text-muted-foreground">Créez votre première livraison</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Liste des livraisons</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Numéro</TableHead>
              <TableHead>Ordre</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Adresse</TableHead>
              <TableHead>Quantité</TableHead>
              <TableHead>Date livraison</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deliveries.map((delivery) => {
              const order = getOrder(delivery.production_order_id || '');
              
              return (
                <TableRow key={delivery.id}>
                  <TableCell className="font-medium">{delivery.delivery_number}</TableCell>
                  <TableCell>{order?.order_number || 'N/A'}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{delivery.customer_name}</p>
                      {delivery.customer_phone && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>{delivery.customer_phone}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate max-w-32">{delivery.customer_address}</span>
                    </div>
                  </TableCell>
                  <TableCell>{delivery.quantity_delivered} unités</TableCell>
                  <TableCell>
                    {delivery.delivery_date ? (
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(delivery.delivery_date).toLocaleDateString('fr-FR')}</span>
                      </div>
                    ) : (
                      'Non planifiée'
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(delivery.status || 'pending')}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(delivery)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(delivery.id)}
                      >
                        <Trash2 className="h-4 w-4" />
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
  );
};
