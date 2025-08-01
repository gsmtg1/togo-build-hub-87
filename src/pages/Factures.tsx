
import { useState } from 'react';
import { Plus, Edit, Trash2, Eye, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useDatabase, useLocalStorage } from '@/hooks/useDatabase';
import { Invoice } from '@/lib/database';
import { EnhancedInvoiceDialog } from '@/components/invoices/EnhancedInvoiceDialog';
import { ProfessionalInvoiceView } from '@/components/invoices/ProfessionalInvoiceView';

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
      await update({ ...selectedInvoice, ...invoiceData, updated_at: new Date().toISOString() });
    } else {
      const newInvoice: Invoice = {
        id: crypto.randomUUID(),
        numero_facture: `INV-${Date.now()}`,
        client_nom: invoiceData.client_nom || '',
        client_telephone: invoiceData.client_telephone || '',
        client_adresse: invoiceData.client_adresse || '',
        date_facture: invoiceData.date_facture || new Date().toISOString().split('T')[0],
        date_echeance: invoiceData.date_echeance,
        statut: invoiceData.statut || 'brouillon',
        montant_total: (invoiceData as any).montant_total || 0,
        montant_paye: 0,
        vendeur_id: invoiceData.vendeur_id,
        sale_id: invoiceData.sale_id,
        delivery_id: invoiceData.delivery_id,
        commentaires: invoiceData.commentaires,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...(invoiceData as any) // Pour les champs supplémentaires comme products, deliveryType
      };
      await create(newInvoice);
    }
    setDialogOpen(false);
  };

  const getStatusBadge = (statut: Invoice['statut']) => {
    const config = {
      brouillon: { variant: 'secondary' as const, label: '📝 Brouillon', color: 'text-gray-600' },
      envoyee: { variant: 'default' as const, label: '📤 Envoyée', color: 'text-blue-600' },
      payee: { variant: 'default' as const, label: '✅ Payée', color: 'text-green-600' },
      en_retard: { variant: 'destructive' as const, label: '⏰ En retard', color: 'text-red-600' },
      annulee: { variant: 'destructive' as const, label: '❌ Annulée', color: 'text-gray-600' },
    };

    const { variant, label } = config[statut];
    return <Badge variant={variant}>{label}</Badge>;
  };

  // Statistiques
  const totalInvoices = invoices.reduce((sum, invoice) => sum + invoice.montant_total, 0);
  const paidInvoices = invoices.filter(invoice => invoice.statut === 'payee');
  const overdueInvoices = invoices.filter(invoice => invoice.statut === 'en_retard');
  const draftInvoices = invoices.filter(invoice => invoice.statut === 'brouillon');
  const totalPaid = paidInvoices.reduce((sum, invoice) => sum + invoice.montant_total, 0);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-orange-600">💼 Gestion des Factures</h1>
          <p className="text-gray-600 mt-1">Créez, gérez et suivez vos factures professionnelles</p>
        </div>
        <Button onClick={handleCreate} className="gap-2 bg-orange-600 hover:bg-orange-700">
          <Plus className="h-4 w-4" />
          Nouvelle Facture
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Chiffre d'affaires total</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{totalInvoices.toLocaleString()} FCFA</div>
            <p className="text-xs text-gray-500 mt-1">{invoices.length} factures au total</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Montant encaissé</CardTitle>
              <div className="text-green-500">✅</div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalPaid.toLocaleString()} FCFA</div>
            <p className="text-xs text-gray-500 mt-1">{paidInvoices.length} factures payées</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">En retard</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueInvoices.length}</div>
            <p className="text-xs text-gray-500 mt-1">Factures en retard</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-gray-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Brouillons</CardTitle>
              <Calendar className="h-4 w-4 text-gray-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{draftInvoices.length}</div>
            <p className="text-xs text-gray-500 mt-1">À finaliser</p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des factures */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📋 Liste des Factures
            <Badge variant="outline">{invoices.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Aucune facture</h3>
              <p className="text-gray-500 mb-6">Commencez par créer votre première facture</p>
              <Button onClick={handleCreate} className="bg-orange-600 hover:bg-orange-700">
                <Plus className="h-4 w-4 mr-2" />
                Créer une facture
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Facture</TableHead>
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
                  <TableRow key={invoice.id} className="hover:bg-gray-50">
                    <TableCell className="font-mono text-sm">
                      #{invoice.numero_facture || invoice.id.slice(-8).toUpperCase()}
                    </TableCell>
                    <TableCell>{new Date(invoice.date_facture).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell className="font-medium">{invoice.client_nom}</TableCell>
                    <TableCell>{invoice.client_telephone}</TableCell>
                    <TableCell className="font-semibold text-orange-600">
                      {invoice.montant_total.toLocaleString()} FCFA
                    </TableCell>
                    <TableCell>
                      <span className={`${
                        invoice.date_echeance && new Date(invoice.date_echeance) < new Date() && invoice.statut !== 'payee' 
                          ? 'text-red-600 font-medium' 
                          : 'text-gray-600'
                      }`}>
                        {invoice.date_echeance ? new Date(invoice.date_echeance).toLocaleDateString('fr-FR') : 'Non définie'}
                      </span>
                    </TableCell>
                    <TableCell>{getStatusBadge(invoice.statut)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(invoice)}
                          title="Voir la facture"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(invoice)}
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(invoice.id)}
                          title="Supprimer"
                          className="hover:bg-red-50 hover:border-red-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <EnhancedInvoiceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        invoice={selectedInvoice}
        onSubmit={handleSubmit}
        isEditing={isEditing}
      />

      <ProfessionalInvoiceView
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        invoice={selectedInvoice}
      />
    </div>
  );
};

export default Factures;
