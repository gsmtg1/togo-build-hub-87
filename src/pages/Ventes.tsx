
import { useState } from 'react';
import { Plus, Edit, Trash2, Eye, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useDatabase, useLocalStorage } from '@/hooks/useDatabase';
import { Sale } from '@/lib/database';
import { SaleDialog } from '@/components/sales/SaleDialog';
import { SaleViewDialog } from '@/components/sales/SaleViewDialog';

const Ventes = () => {
  const { isInitialized } = useDatabase();
  const { data: sales, loading, create, update, remove } = useLocalStorage<Sale>('sales');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  if (!isInitialized || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Chargement des ventes...</div>
      </div>
    );
  }

  const handleCreate = () => {
    setSelectedSale(null);
    setIsEditing(false);
    setDialogOpen(true);
  };

  const handleEdit = (sale: Sale) => {
    setSelectedSale(sale);
    setIsEditing(true);
    setDialogOpen(true);
  };

  const handleView = (sale: Sale) => {
    setSelectedSale(sale);
    setViewDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette vente ?')) {
      await remove(id);
    }
  };

  const handleSubmit = async (saleData: Partial<Sale>) => {
    if (isEditing && selectedSale) {
      await update({ ...selectedSale, ...saleData, updatedAt: new Date().toISOString() });
    } else {
      const newSale: Sale = {
        id: crypto.randomUUID(),
        customerName: saleData.customerName || '',
        customerPhone: saleData.customerPhone || '',
        customerAddress: saleData.customerAddress || '',
        products: saleData.products || [],
        totalAmount: saleData.totalAmount || 0,
        date: saleData.date || new Date().toISOString().split('T')[0],
        status: saleData.status || 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await create(newSale);
    }
    setDialogOpen(false);
  };

  const getStatusBadge = (status: Sale['status']) => {
    const variants: Record<Sale['status'], 'default' | 'secondary' | 'destructive'> = {
      pending: 'secondary',
      completed: 'default',
      cancelled: 'destructive',
    };
    
    const labels: Record<Sale['status'], string> = {
      pending: 'En attente',
      completed: 'Terminée',
      cancelled: 'Annulée',
    };

    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  const totalSales = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const completedSales = sales.filter(sale => sale.status === 'completed').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestion des Ventes</h1>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouvelle Vente
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total des Ventes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSales.toLocaleString()} FCFA</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Nombre de Ventes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sales.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ventes Terminées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedSales}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Ventes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
                  <TableCell>{sale.customerName}</TableCell>
                  <TableCell>{sale.customerPhone}</TableCell>
                  <TableCell>{sale.totalAmount.toLocaleString()} FCFA</TableCell>
                  <TableCell>{getStatusBadge(sale.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(sale)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(sale)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(sale.id)}
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

      <SaleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        sale={selectedSale}
        onSubmit={handleSubmit}
        isEditing={isEditing}
      />

      <SaleViewDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        sale={selectedSale}
      />
    </div>
  );
};

export default Ventes;
