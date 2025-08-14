
import { useState } from 'react';
import { Plus, Eye, Edit, Trash2, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EnhancedInvoiceDialog } from '@/components/invoices/EnhancedInvoiceDialog';
import { InvoiceViewDialog } from '@/components/invoices/InvoiceViewDialog';
import { useInvoices } from '@/hooks/useSupabaseDatabase';

const Factures = () => {
  const { data: invoices, loading, remove } = useInvoices();
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);

  const handleEdit = (invoice: any) => {
    setSelectedInvoice(invoice);
    setShowDialog(true);
  };

  const handleView = (invoice: any) => {
    setSelectedInvoice(invoice);
    setShowViewDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
      await remove(id);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      draft: 'secondary',
      sent: 'default',
      paid: 'default',
      overdue: 'destructive',
      cancelled: 'destructive',
    };
    
    const labels: Record<string, string> = {
      draft: 'Brouillon',
      sent: 'Envoyée',
      paid: 'Payée',
      overdue: 'En retard',
      cancelled: 'Annulée',
    };

    return <Badge variant={variants[status] || 'secondary'}>{labels[status] || status}</Badge>;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Factures</h1>
          <p className="text-muted-foreground">
            Créez et gérez vos factures avec sélection avancée de produits
          </p>
        </div>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle facture
        </Button>
      </div>

      <div className="grid gap-4">
        {invoices.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Receipt className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Aucune facture créée</p>
                <p className="text-sm text-gray-400">Commencez par créer votre première facture</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          invoices.map((invoice) => (
            <Card key={invoice.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Facture {invoice.invoice_number}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Émise le {new Date(invoice.issue_date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(invoice.status)}
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => handleView(invoice)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleEdit(invoice)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(invoice.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Montant HT:</span><br />
                    {(invoice.total_amount - invoice.tax_amount).toLocaleString()} FCFA
                  </div>
                  <div>
                    <span className="font-medium">TVA ({invoice.tax_rate}%):</span><br />
                    {invoice.tax_amount?.toLocaleString()} FCFA
                  </div>
                  <div>
                    <span className="font-medium">Montant total:</span><br />
                    <span className="font-bold text-green-600">
                      {invoice.total_amount?.toLocaleString()} FCFA
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Échéance:</span><br />
                    {new Date(invoice.due_date).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                {invoice.notes && (
                  <div className="mt-3 pt-3 border-t">
                    <span className="font-medium text-sm">Notes:</span>
                    <p className="text-sm text-gray-600">{invoice.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <EnhancedInvoiceDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        invoice={selectedInvoice}
        onClose={() => {
          setShowDialog(false);
          setSelectedInvoice(null);
        }}
      />

      <InvoiceViewDialog
        open={showViewDialog}
        onOpenChange={setShowViewDialog}
        invoice={selectedInvoice}
      />
    </div>
  );
};

export default Factures;
