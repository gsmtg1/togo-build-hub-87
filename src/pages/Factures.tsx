
import { useState } from 'react';
import { Plus, Edit, Trash2, Eye, Send, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useDatabase, useLocalStorage } from '@/hooks/useDatabase';
import { Invoice } from '@/lib/database';
import { InvoiceDialog } from '@/components/invoices/InvoiceDialog';
import { InvoiceViewDialog } from '@/components/invoices/InvoiceViewDialog';

const Factures = () => {
  const { isInitialized } = useDatabase();
  const { data: invoices, loading, create, update, remove } = useLocalStorage<Invoice>('invoices');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  if (!isInitialized || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Chargement des factures...</div>
      </div>
    );
  }

  const handleCreate = () => {
    setSelectedInvoice(null);
    setIsEditing(false);
    setDialogOpen(true);
  };

  const handleEdit = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsEditing(true);
    setDialogOpen(true);
  };

  const handleView = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setViewDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
      await remove(id);
    }
  };

  const handleSubmit = async (invoiceData: Partial<Invoice>) => {
    if (isEditing && selectedInvoice) {
      await update({ ...selectedInvoice, ...invoiceData, updatedAt: new Date().toISOString() });
    } else {
      const newInvoice: Invoice = {
        id: crypto.randomUUID(),
        customerName: invoiceData.customerName || '',
        customerPhone: invoiceData.customerPhone || '',
        customerAddress: invoiceData.customerAddress || '',
        products: invoiceData.products || [],
        totalAmount: invoiceData.totalAmount || 0,
        date: invoiceData.date || new Date().toISOString().split('T')[0],
        dueDate: invoiceData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: invoiceData.status || 'draft',
        saleId: invoiceData.saleId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await create(newInvoice);
    }
    setDialogOpen(false);
  };

  const getStatusBadge = (status: Invoice['status']) => {
    const variants: Record<Invoice['status'], 'default' | 'secondary' | 'destructive'> = {
      draft: 'secondary',
      sent: 'default',
      paid: 'default',
      overdue: 'destructive',
    };
    
    const labels: Record<Invoice['status'], string> = {
      draft: 'Brouillon',
      sent: 'Envoyée',
      paid: 'Payée',
      overdue: 'En retard',
    };

    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  const totalInvoices = invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
  const paidInvoices = invoices.filter(invoice => invoice.status === 'paid').length;
  const overdueInvoices = invoices.filter(invoice => invoice.status === 'overdue').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestion des Factures</h1>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouvelle Facture
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total des Factures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInvoices.toLocaleString()} FCFA</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Nombre de Factures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Factures Payées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paidInvoices}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Factures en Retard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overdueInvoices}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Factures</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Échéance</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                  <TableCell>{invoice.customerName}</TableCell>
                  <TableCell>{invoice.customerPhone}</TableCell>
                  <TableCell>{invoice.totalAmount.toLocaleString()} FCFA</TableCell>
                  <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(invoice)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(invoice)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(invoice.id)}
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

      <InvoiceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        invoice={selectedInvoice}
        onSubmit={handleSubmit}
        isEditing={isEditing}
      />

      <InvoiceViewDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        invoice={selectedInvoice}
      />
    </div>
  );
};

export default Factures;
