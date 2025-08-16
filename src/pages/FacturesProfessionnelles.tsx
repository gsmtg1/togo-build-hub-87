
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Eye, Plus, FileText } from 'lucide-react';
import { useFacturationDatabase } from '@/hooks/useFacturationDatabase';
import { NewInvoiceDialog } from '@/components/facturation/NewInvoiceDialog';
import { VueFactureComplete } from '@/components/facturation/VueFactureComplete';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

export default function FacturesProfessionnelles() {
  const { data: factures, loading, remove } = useFacturationDatabase().useFacturesProfessionnelles();
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [selectedFacture, setSelectedFacture] = useState<any>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({ 
    open: false, 
    id: null 
  });

  const handleEdit = (facture: any) => {
    setSelectedFacture(facture);
    setShowEditDialog(true);
  };

  const handleView = (facture: any) => {
    setSelectedFacture(facture);
    setShowViewDialog(true);
  };

  const handleDelete = (id: string) => {
    setDeleteConfirm({ open: true, id });
  };

  const confirmDelete = async () => {
    if (deleteConfirm.id) {
      await remove(deleteConfirm.id);
      setDeleteConfirm({ open: false, id: null });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (statut: string) => {
    const statusConfig = {
      brouillon: { label: 'Brouillon', variant: 'secondary' as const },
      valide: { label: 'Validée', variant: 'default' as const },
      envoyee: { label: 'Envoyée', variant: 'outline' as const },
      payee: { label: 'Payée', variant: 'default' as const },
      annulee: { label: 'Annulée', variant: 'destructive' as const }
    };
    
    const config = statusConfig[statut as keyof typeof statusConfig] || statusConfig.brouillon;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des factures...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-orange-600">Factures Professionnelles</h1>
          <p className="text-gray-600 mt-2">
            Gérez vos factures avec support multi-produits et aperçu PDF
          </p>
        </div>
        <Button 
          onClick={() => setShowNewDialog(true)}
          className="bg-orange-500 hover:bg-orange-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Facture
        </Button>
      </div>

      {factures.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune facture</h3>
            <p className="text-gray-600 text-center mb-4">
              Commencez par créer votre première facture professionnelle.
            </p>
            <Button 
              onClick={() => setShowNewDialog(true)}
              className="bg-orange-500 hover:bg-orange-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Créer une facture
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {factures.map((facture) => (
            <Card key={facture.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-orange-600">
                        {facture.numero_facture}
                      </h3>
                      {getStatusBadge(facture.statut)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Client</p>
                        <p className="font-medium">{facture.client_nom}</p>
                        {facture.client_telephone && (
                          <p className="text-sm text-gray-500">{facture.client_telephone}</p>
                        )}
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600">Date & Échéance</p>
                        <p className="font-medium">{new Date(facture.date_facture).toLocaleDateString('fr-FR')}</p>
                        {facture.date_echeance && (
                          <p className="text-sm text-gray-500">
                            Échéance: {new Date(facture.date_echeance).toLocaleDateString('fr-FR')}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600">Montant</p>
                        <p className="text-xl font-bold text-orange-600">
                          {formatCurrency(facture.montant_total)}
                        </p>
                        {facture.facture_produits && (
                          <p className="text-sm text-gray-500">
                            {facture.facture_produits.length} produit(s)
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {facture.commentaires && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-600">Commentaires</p>
                        <p className="text-sm text-gray-800">{facture.commentaires}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(facture)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(facture)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(facture.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialogue nouvelle facture */}
      <NewInvoiceDialog
        open={showNewDialog}
        onOpenChange={setShowNewDialog}
        type="facture"
      />

      {/* Dialogue édition facture */}
      {selectedFacture && (
        <NewInvoiceDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          type="facture"
          initialData={selectedFacture}
        />
      )}

      {/* Vue complète de la facture */}
      {selectedFacture && (
        <VueFactureComplete
          open={showViewDialog}
          onOpenChange={setShowViewDialog}
          facture={selectedFacture}
        />
      )}

      {/* Confirmation de suppression */}
      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open, id: null })}
        title="Supprimer la facture"
        description="Êtes-vous sûr de vouloir supprimer cette facture ? Cette action est irréversible."
        onConfirm={confirmDelete}
      />
    </div>
  );
}
