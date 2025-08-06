
import { useState } from 'react';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SaleViewDialog } from '@/components/sales/SaleViewDialog';
import { ProfessionalInvoiceGenerator } from '@/components/invoices/ProfessionalInvoiceGenerator';
import { useSales } from '@/hooks/useSupabaseDatabase';
import type { Sale } from '@/types/database';

const Ventes = () => {
  const { data: sales, loading, create, update, remove } = useSales();
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);

  // Helper function to safely format currency
  const formatCurrency = (amount: number | undefined | null): string => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '0 FCFA';
    }
    return `${amount.toLocaleString()} FCFA`;
  };

  const handleView = (sale: Sale) => {
    setSelectedSale(sale);
    setShowViewDialog(true);
  };

  const handleCreateInvoice = (sale: Sale) => {
    setSelectedSale(sale);
    setShowInvoiceDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette vente ?')) {
      await remove(id);
    }
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

  if (loading) {
    return <div className="flex justify-center items-center h-64">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Ventes</h1>
          <p className="text-muted-foreground">
            Gérez toutes vos ventes et générez des factures professionnelles
          </p>
        </div>
        <Button onClick={() => setShowInvoiceDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle vente
        </Button>
      </div>

      <div className="grid gap-4">
        {sales.map((sale) => (
          <Card key={sale.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{sale.numero_vente}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Client: {sale.client_nom}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(sale.statut)}
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => handleView(sale)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleCreateInvoice(sale)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(sale.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Date:</span><br />
                  {new Date(sale.date_vente).toLocaleDateString('fr-FR')}
                </div>
                <div>
                  <span className="font-medium">Téléphone:</span><br />
                  {sale.client_telephone || 'Non renseigné'}
                </div>
                <div>
                  <span className="font-medium">Montant:</span><br />
                  <span className="font-bold text-green-600">
                    {formatCurrency(sale.montant_total)}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Statut:</span><br />
                  {getStatusBadge(sale.statut)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <SaleViewDialog
        open={showViewDialog}
        onOpenChange={setShowViewDialog}
        sale={selectedSale}
      />

      <ProfessionalInvoiceGenerator
        open={showInvoiceDialog}
        onOpenChange={setShowInvoiceDialog}
        onSubmit={create}
        editingSale={selectedSale}
      />
    </div>
  );
};

export default Ventes;
