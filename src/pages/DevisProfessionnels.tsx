
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Eye, Plus, FileText } from 'lucide-react';
import { useFacturationDatabase } from '@/hooks/useFacturationDatabase';
import { NewInvoiceDialog } from '@/components/facturation/NewInvoiceDialog';
import { VueFactureComplete } from '@/components/facturation/VueFactureComplete';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

export default function DevisProfessionnels() {
  const { data: devis, loading, remove } = useFacturationDatabase().useDevisProfessionnels();
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [selectedDevis, setSelectedDevis] = useState<any>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({ 
    open: false, 
    id: null 
  });

  const handleEdit = (devis: any) => {
    setSelectedDevis(devis);
    setShowEditDialog(true);
  };

  const handleView = (devis: any) => {
    setSelectedDevis(devis);
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
      valide: { label: 'Validé', variant: 'default' as const },
      envoye: { label: 'Envoyé', variant: 'outline' as const },
      accepte: { label: 'Accepté', variant: 'default' as const },
      refuse: { label: 'Refusé', variant: 'destructive' as const },
      expire: { label: 'Expiré', variant: 'secondary' as const }
    };
    
    const config = statusConfig[statut as keyof typeof statusConfig] || statusConfig.brouillon;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des devis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-orange-600">Devis Professionnels</h1>
          <p className="text-gray-600 mt-2">
            Gérez vos devis avec support multi-produits et aperçu PDF
          </p>
        </div>
        <Button 
          onClick={() => setShowNewDialog(true)}
          className="bg-orange-500 hover:bg-orange-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Devis
        </Button>
      </div>

      {devis.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun devis</h3>
            <p className="text-gray-600 text-center mb-4">
              Commencez par créer votre premier devis professionnel.
            </p>
            <Button 
              onClick={() => setShowNewDialog(true)}
              className="bg-orange-500 hover:bg-orange-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Créer un devis
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {devis.map((devisItem) => (
            <Card key={devisItem.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-orange-600">
                        {devisItem.numero_devis}
                      </h3>
                      {getStatusBadge(devisItem.statut)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Client</p>
                        <p className="font-medium">{devisItem.client_nom}</p>
                        {devisItem.client_telephone && (
                          <p className="text-sm text-gray-500">{devisItem.client_telephone}</p>
                        )}
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600">Date & Échéance</p>
                        <p className="font-medium">{new Date(devisItem.date_devis).toLocaleDateString('fr-FR')}</p>
                        {devisItem.date_echeance && (
                          <p className="text-sm text-gray-500">
                            Échéance: {new Date(devisItem.date_echeance).toLocaleDateString('fr-FR')}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600">Montant</p>
                        <p className="text-xl font-bold text-orange-600">
                          {formatCurrency(devisItem.montant_total)}
                        </p>
                        {devisItem.devis_produits && (
                          <p className="text-sm text-gray-500">
                            {devisItem.devis_produits.length} produit(s)
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {devisItem.commentaires && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-600">Commentaires</p>
                        <p className="text-sm text-gray-800">{devisItem.commentaires}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(devisItem)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(devisItem)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(devisItem.id)}
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

      {/* Dialogue nouveau devis */}
      <NewInvoiceDialog
        open={showNewDialog}
        onOpenChange={setShowNewDialog}
        type="devis"
      />

      {/* Dialogue édition devis */}
      {selectedDevis && (
        <NewInvoiceDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          type="devis"
          initialData={selectedDevis}
        />
      )}

      {/* Vue complète du devis */}
      {selectedDevis && (
        <VueFactureComplete
          open={showViewDialog}
          onOpenChange={setShowViewDialog}
          facture={selectedDevis}
        />
      )}

      {/* Confirmation de suppression */}
      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open, id: null })}
        title="Supprimer le devis"
        description="Êtes-vous sûr de vouloir supprimer ce devis ? Cette action est irréversible."
        onConfirm={confirmDelete}
      />
    </div>
  );
}
