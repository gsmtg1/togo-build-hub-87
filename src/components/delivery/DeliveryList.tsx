
import { Edit, Trash2, Package, MapPin, Phone, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useProductionOrders } from '@/hooks/useSupabaseDatabase';
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
              <TableHead>Client</TableHead>
              <TableHead>Adresse</TableHead>
              <TableHead>Lieu livraison</TableHead>
              <TableHead>Date prévue</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deliveries.map((delivery) => (
              <TableRow key={delivery.id}>
                <TableCell className="font-medium">{delivery.numero_livraison}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{delivery.client_nom}</p>
                    {delivery.client_telephone && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span>{delivery.client_telephone}</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate max-w-32">{delivery.client_adresse}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{delivery.lieu_livraison}</span>
                </TableCell>
                <TableCell>
                  {delivery.date_livraison_prevue ? (
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(delivery.date_livraison_prevue).toLocaleDateString('fr-FR')}</span>
                    </div>
                  ) : (
                    'Non planifiée'
                  )}
                </TableCell>
                <TableCell>{getStatusBadge(delivery.statut || 'en_attente')}</TableCell>
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
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
