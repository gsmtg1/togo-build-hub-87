
import { useState } from 'react';
import { Plus, AlertTriangle, Calendar, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDailyLosses, useProducts } from '@/hooks/useSupabaseDatabase';
import { DailyLossDialog } from './DailyLossDialog';

interface DailyLossManagementProps {
  losses?: any[];
  loading?: boolean;
  onUpdate?: (id: string, updates: any) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export const DailyLossManagement = ({ 
  losses: externalLosses,
  loading: externalLoading,
  onUpdate: externalOnUpdate,
  onDelete: externalOnDelete 
}: DailyLossManagementProps) => {
  const { data: internalLosses, loading: internalLoading, remove: internalRemove, create } = useDailyLosses();
  const { data: products } = useProducts();
  const [dialogOpen, setDialogOpen] = useState(false);

  // Use external props if provided, otherwise use internal hooks
  const losses = externalLosses || internalLosses;
  const loading = externalLoading !== undefined ? externalLoading : internalLoading;
  const handleDelete = externalOnDelete || internalRemove;

  const handleCreate = async (lossData: any) => {
    await create(lossData);
    setDialogOpen(false);
  };

  const confirmDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette perte ?')) {
      await handleDelete(id);
    }
  };

  const todayLosses = losses.filter(loss => 
    loss.loss_date === new Date().toISOString().split('T')[0]
  );

  const totalLossesToday = todayLosses.reduce((sum, loss) => sum + loss.quantity_lost, 0);
  const totalValueToday = todayLosses.reduce((sum, loss) => sum + (loss.loss_value || 0), 0);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pertes Quotidiennes</h1>
          <p className="text-muted-foreground">Enregistrement des briques cassées et défectueuses</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Enregistrer une perte
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pertes aujourd'hui</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLossesToday}</div>
            <p className="text-xs text-muted-foreground">briques perdues</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valeur perdue aujourd'hui</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalValueToday.toLocaleString()} FCFA</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total pertes enregistrées</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{losses.length}</div>
            <p className="text-xs text-muted-foreground">enregistrements</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historique des pertes</CardTitle>
          <CardDescription>Liste chronologique des briques perdues</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Produit</TableHead>
                <TableHead>Quantité</TableHead>
                <TableHead>Valeur</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead>Commentaires</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {losses.map((loss) => {
                const product = products.find(p => p.id === loss.product_id);
                return (
                  <TableRow key={loss.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(loss.loss_date).toLocaleDateString('fr-FR')}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {product ? product.nom : 'Produit introuvable'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive">
                        -{loss.quantity_lost}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-red-600">
                      -{(loss.loss_value || 0).toLocaleString()} FCFA
                    </TableCell>
                    <TableCell className="text-sm">
                      {loss.responsible || 'Non spécifié'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                      {loss.comments || 'Aucun commentaire'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => confirmDelete(loss.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <DailyLossDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
        onSubmit={handleCreate}
      />
    </div>
  );
};
