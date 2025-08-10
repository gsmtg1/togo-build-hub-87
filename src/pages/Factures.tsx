
import { useState } from 'react';
import { Plus, Search, Filter, Eye, Edit, Trash2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TaxableInvoiceDialog } from '@/components/invoices/TaxableInvoiceDialog';
import { useInvoices } from '@/hooks/useSupabaseDatabase';
import { useToast } from '@/hooks/use-toast';

const statusLabels = {
  'brouillon': { label: '📝 Brouillon', variant: 'secondary' as const },
  'envoyee': { label: '📤 Envoyée', variant: 'default' as const },
  'payee': { label: '✅ Payée', variant: 'success' as const },
  'en_retard': { label: '⏰ En retard', variant: 'destructive' as const },
  'annulee': { label: '❌ Annulée', variant: 'outline' as const },
};

export default function Factures() {
  const { data: invoices, loading, create, update, remove } = useInvoices();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<any>(null);

  const filteredInvoices = invoices.filter((invoice: any) => {
    const matchesSearch = !searchTerm || 
      invoice.client_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !selectedStatus || invoice.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateInvoice = async (invoiceData: any) => {
    try {
      const invoiceNumber = `FAC-${Date.now()}`;
      await create({
        ...invoiceData,
        invoice_number: invoiceNumber,
        issue_date: invoiceData.date_facture,
        due_date: invoiceData.date_echeance,
        status: invoiceData.statut,
        total_amount: invoiceData.montant_total,
        tax_amount: invoiceData.tax_amount || 0,
        tax_rate: invoiceData.useTax ? invoiceData.defaultTaxRate : 0,
        notes: invoiceData.notes
      });
      
      toast({
        title: "Succès",
        description: "Facture créée avec succès",
      });
    } catch (error) {
      console.error('Error creating invoice:', error);
    }
  };

  const handleUpdateInvoice = async (invoiceData: any) => {
    try {
      if (editingInvoice) {
        await update(editingInvoice.id, {
          ...invoiceData,
          issue_date: invoiceData.date_facture,
          due_date: invoiceData.date_echeance,
          status: invoiceData.statut,
          total_amount: invoiceData.montant_total,
          tax_amount: invoiceData.tax_amount || 0,
          tax_rate: invoiceData.useTax ? invoiceData.defaultTaxRate : 0,
          notes: invoiceData.notes
        });
        
        toast({
          title: "Succès",
          description: "Facture mise à jour avec succès",
        });
        setEditingInvoice(null);
      }
    } catch (error) {
      console.error('Error updating invoice:', error);
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    try {
      await remove(id);
      toast({
        title: "Succès",
        description: "Facture supprimée avec succès",
      });
    } catch (error) {
      console.error('Error deleting invoice:', error);
    }
  };

  const openCreateDialog = () => {
    setEditingInvoice(null);
    setDialogOpen(true);
  };

  const openEditDialog = (invoice: any) => {
    setEditingInvoice(invoice);
    setDialogOpen(true);
  };

  const getTotalStats = () => {
    const total = filteredInvoices.reduce((sum: number, invoice: any) => sum + (invoice.total_amount || 0), 0);
    const paid = filteredInvoices.filter((inv: any) => inv.status === 'paid').reduce((sum: number, invoice: any) => sum + (invoice.total_amount || 0), 0);
    const pending = total - paid;
    
    return { total, paid, pending };
  };

  const { total, paid, pending } = getTotalStats();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">📄 Gestion des Factures</h1>
          <p className="text-muted-foreground">
            Créez et gérez vos factures avec ou sans TVA
          </p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouvelle Facture
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total des factures</p>
                <p className="text-2xl font-bold">{total.toLocaleString()} FCFA</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Factures payées</p>
                <p className="text-2xl font-bold text-green-600">{paid.toLocaleString()} FCFA</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600">✓</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold text-orange-600">{pending.toLocaleString()} FCFA</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                <span className="text-orange-600">⏳</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par client ou numéro de facture..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-input rounded-md"
            >
              <option value="">Tous les statuts</option>
              <option value="draft">Brouillon</option>
              <option value="sent">Envoyée</option>
              <option value="paid">Payée</option>
              <option value="overdue">En retard</option>
              <option value="cancelled">Annulée</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Table des factures */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Factures ({filteredInvoices.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Chargement des factures...</div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucune facture trouvée
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numéro</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Échéance</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>TVA</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice: any) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-mono">
                        {invoice.invoice_number || `FAC-${invoice.id.slice(0, 8)}`}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{invoice.client_nom || 'N/A'}</div>
                          <div className="text-sm text-muted-foreground">
                            {invoice.client_telephone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {invoice.issue_date ? new Date(invoice.issue_date).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {(invoice.total_amount || 0).toLocaleString()} FCFA
                      </TableCell>
                      <TableCell>
                        {invoice.tax_amount ? (
                          <span className="text-sm">
                            {invoice.tax_amount.toLocaleString()} FCFA
                            <br />
                            <span className="text-muted-foreground">({invoice.tax_rate}%)</span>
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Sans TVA</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={(statusLabels as any)[invoice.status]?.variant || 'secondary'}>
                          {(statusLabels as any)[invoice.status]?.label || invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(invoice)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteInvoice(invoice.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog pour créer/modifier les factures */}
      <TaxableInvoiceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        invoice={editingInvoice}
        onSubmit={editingInvoice ? handleUpdateInvoice : handleCreateInvoice}
        isEditing={!!editingInvoice}
      />
    </div>
  );
}
