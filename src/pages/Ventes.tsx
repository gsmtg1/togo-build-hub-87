
import { useState } from 'react';
import { Plus, Edit, Trash2, Eye, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useSales } from '@/hooks/useSupabaseDatabase';
import type { Sale } from '@/types/database';
import { SaleDialog } from '@/components/sales/SaleDialog';
import { SaleViewDialog } from '@/components/sales/SaleViewDialog';
import { COMPANY_INFO } from '@/config/company';

const Ventes = () => {
  const { data: sales, loading, create, update, remove } = useSales();
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  if (loading) {
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
      await update(selectedSale.id, { ...saleData, updated_at: new Date().toISOString() });
    } else {
      const newSale = {
        numero_vente: `VTE-${Date.now().toString().slice(-6)}`,
        client_nom: saleData.client_nom || '',
        client_telephone: saleData.client_telephone || '',
        client_adresse: saleData.client_adresse || '',
        date_vente: saleData.date_vente || new Date().toISOString(),
        statut: saleData.statut || 'en_attente' as const,
        montant_total: saleData.montant_total || 0,
        vendeur_id: saleData.vendeur_id || '',
        commentaires: saleData.commentaires || ''
      };
      await create(newSale);
    }
    setDialogOpen(false);
  };

  const getStatusBadge = (status: Sale['statut']) => {
    const variants: Record<Sale['statut'], 'default' | 'secondary' | 'destructive'> = {
      en_attente: 'secondary',
      confirmee: 'default',
      livree: 'default',
      annulee: 'destructive',
    };
    
    const labels: Record<Sale['statut'], string> = {
      en_attente: 'En attente',
      confirmee: 'Confirmée',
      livree: 'Livrée',
      annulee: 'Annulée',
    };

    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  const totalSales = sales.reduce((sum, sale) => sum + sale.montant_total, 0);
  const confirmedSales = sales.filter(sale => sale.statut === 'confirmee').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Ventes</h1>
          <p className="text-muted-foreground">{COMPANY_INFO.name} - {COMPANY_INFO.slogan}</p>
        </div>
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
            <CardTitle className="text-sm font-medium">Ventes Confirmées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{confirmedSales}</div>
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
                <TableHead>N° Vente</TableHead>
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
                  <TableCell className="font-medium">{sale.numero_vente}</TableCell>
                  <TableCell>{new Date(sale.date_vente).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell>{sale.client_nom}</TableCell>
                  <TableCell>{sale.client_telephone}</TableCell>
                  <TableCell className="font-medium">{sale.montant_total.toLocaleString()} FCFA</TableCell>
                  <TableCell>{getStatusBadge(sale.statut)}</TableCell>
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
              {sales.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Aucune vente enregistrée.</p>
                      <p className="text-sm">Cliquez sur "Nouvelle Vente" pour commencer.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
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
