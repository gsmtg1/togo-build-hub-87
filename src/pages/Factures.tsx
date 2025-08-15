
import { useState } from 'react';
import { Plus, Eye, Edit, Trash2, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NewInvoiceDialog } from '@/components/facturation/NewInvoiceDialog';
import { VueFactureComplete } from '@/components/facturation/VueFactureComplete';
import { useInvoicesManager } from '@/hooks/useInvoicesManager';

const Factures = () => {
  const { invoices, isLoading, deleteInvoice } = useInvoicesManager();
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);

  const handleEdit = (invoice: any) => {
    console.log('✏️ Édition facture:', invoice.id);
    setSelectedInvoice(invoice);
    setShowDialog(true);
  };

  const handleView = (invoice: any) => {
    console.log('👁️ Visualisation facture:', invoice.id);
    setSelectedInvoice(invoice);
    setShowViewDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
      try {
        console.log('🗑️ Suppression facture:', id);
        await deleteInvoice(id);
      } catch (error) {
        console.error('❌ Erreur suppression:', error);
      }
    }
  };

  const handleNewInvoice = () => {
    console.log('➕ Nouvelle facture');
    setSelectedInvoice(null);
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setSelectedInvoice(null);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      brouillon: 'secondary',
      envoye: 'default',
      payee: 'default',
      en_retard: 'destructive',
      annulee: 'destructive',
    };
    
    const labels: Record<string, string> = {
      brouillon: 'Brouillon',
      envoye: 'Envoyée',
      payee: 'Payée',
      en_retard: 'En retard',
      annulee: 'Annulée',
    };

    return <Badge variant={variants[status] || 'secondary'}>{labels[status] || status}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p>Chargement des factures...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Factures</h1>
          <p className="text-muted-foreground">
            Créez et gérez vos factures avec plusieurs produits
          </p>
        </div>
        <Button onClick={handleNewInvoice} className="bg-orange-500 hover:bg-orange-600">
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle facture
        </Button>
      </div>

      <div className="grid gap-4">
        {!invoices || invoices.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Receipt className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 font-medium">Aucune facture créée</p>
                <p className="text-sm text-gray-400 mb-4">Commencez par créer votre première facture</p>
                <Button onClick={handleNewInvoice} className="bg-orange-500 hover:bg-orange-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Créer ma première facture
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          invoices.map((invoice) => (
            <Card key={invoice.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Facture {invoice.numero_facture}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Client: {invoice.client_nom}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Émise le {new Date(invoice.date_facture).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(invoice.statut)}
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => handleView(invoice)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleEdit(invoice)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleDelete(invoice.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Téléphone:</span><br />
                    {invoice.client_telephone || 'Non renseigné'}
                  </div>
                  <div>
                    <span className="font-medium">Mode livraison:</span><br />
                    {invoice.mode_livraison === 'retrait_usine' ? 'Retrait usine' : 
                     invoice.mode_livraison === 'livraison_gratuite' ? 'Livraison gratuite' :
                     invoice.mode_livraison === 'livraison_payante' ? 'Livraison payante' : 'Non défini'}
                  </div>
                  <div>
                    <span className="font-medium">Montant total:</span><br />
                    <span className="font-bold text-green-600">
                      {invoice.montant_total?.toLocaleString()} FCFA
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Nb. produits:</span><br />
                    {invoice.facture_items?.length || 0} produit(s)
                  </div>
                </div>
                {invoice.commentaires && (
                  <div className="mt-3 pt-3 border-t">
                    <span className="font-medium text-sm">Commentaires:</span>
                    <p className="text-sm text-gray-600">{invoice.commentaires}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <NewInvoiceDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        invoice={selectedInvoice}
        onClose={handleCloseDialog}
      />

      {selectedInvoice && (
        <VueFactureComplete
          open={showViewDialog}
          onOpenChange={setShowViewDialog}
          facture={selectedInvoice}
        />
      )}
    </div>
  );
};

export default Factures;
