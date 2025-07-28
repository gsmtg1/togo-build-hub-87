
import { Edit, Trash2, Package, Calendar, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useProducts } from '@/hooks/useTypedDatabase';
import type { ProductionOrder } from '@/types/database';

interface ProductionOrdersListProps {
  orders: ProductionOrder[];
  onEdit: (order: ProductionOrder) => void;
  onDelete: (id: string) => void;
  getStatusBadge: (status: string) => React.ReactNode;
}

export const ProductionOrdersList = ({ orders, onEdit, onDelete, getStatusBadge }: ProductionOrdersListProps) => {
  const { data: products } = useProducts();

  const getProduct = (productId: string) => {
    return products.find(p => p.id === productId);
  };

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">Aucun ordre de production</p>
            <p className="text-muted-foreground">Créez votre premier ordre de production</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Liste des ordres de production</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Numéro</TableHead>
              <TableHead>Produit</TableHead>
              <TableHead>Quantité</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Demandeur</TableHead>
              <TableHead>Date demande</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const product = getProduct(order.product_id || '');
              
              return (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.numero_ordre}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{product?.nom || 'Produit inconnu'}</p>
                      <p className="text-sm text-muted-foreground">{product?.categorie}</p>
                    </div>
                  </TableCell>
                  <TableCell>{order.quantite?.toLocaleString()} unités</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{order.cout_prevu?.toLocaleString()} FCFA</p>
                      <p className="text-sm text-muted-foreground">
                        {product?.prix_unitaire?.toLocaleString()} FCFA/unité
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{order.demandeur_id}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {order.date_demande 
                          ? new Date(order.date_demande).toLocaleDateString('fr-FR')
                          : 'N/A'
                        }
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(order.statut || 'en_attente')}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(order)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(order.id)}
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
