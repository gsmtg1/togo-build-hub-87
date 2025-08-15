
import { useState } from 'react';
import { Plus, Eye, Edit, Trash2, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DialogueFactureSimple } from '@/components/facturation/DialogueFactureSimple';
import { VueFactureComplete } from '@/components/facturation/VueFactureComplete';
import { useFacturesDatabase } from '@/hooks/useFacturesDatabase';
import { useToast } from '@/hooks/use-toast';

const Factures = () => {
  const { factures, loading, deleteFacture } = useFacturesDatabase();
  const { toast } = useToast();
  const [selectedFacture, setSelectedFacture] = useState<any | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);

  const handleEdit = (facture: any) => {
    setSelectedFacture(facture);
    setShowDialog(true);
  };

  const handleView = (facture: any) => {
    setSelectedFacture(facture);
    setShowViewDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
      try {
        await deleteFacture(id);
      } catch (error) {
        console.error('Error deleting invoice:', error);
      }
    }
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

  if (loading) {
    return <div className="flex justify-center items-center h-64">Chargement...</div>;
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
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle facture
        </Button>
      </div>

      <div className="grid gap-4">
        {!factures || factures.length === 0 ? (
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
          factures.map((facture) => (
            <Card key={facture.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Facture {facture.numero_facture}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Client: {facture.client_nom}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Émise le {new Date(facture.date_facture).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(facture.statut)}
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => handleView(facture)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleEdit(facture)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(facture.id)}>
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
                    {facture.client_telephone || 'Non renseigné'}
                  </div>
                  <div>
                    <span className="font-medium">Mode livraison:</span><br />
                    {facture.mode_livraison === 'retrait_usine' ? 'Retrait usine' : 
                     facture.mode_livraison === 'livraison_gratuite' ? 'Livraison gratuite' :
                     facture.mode_livraison === 'livraison_payante' ? 'Livraison payante' : 'Non défini'}
                  </div>
                  <div>
                    <span className="font-medium">Montant total:</span><br />
                    <span className="font-bold text-green-600">
                      {facture.montant_total?.toLocaleString()} FCFA
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Nb. produits:</span><br />
                    {facture.facture_items?.length || 0} produit(s)
                  </div>
                </div>
                {facture.commentaires && (
                  <div className="mt-3 pt-3 border-t">
                    <span className="font-medium text-sm">Commentaires:</span>
                    <p className="text-sm text-gray-600">{facture.commentaires}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <DialogueFactureSimple
        open={showDialog}
        onOpenChange={setShowDialog}
        facture={selectedFacture}
        onClose={() => {
          setShowDialog(false);
          setSelectedFacture(null);
        }}
      />

      {selectedFacture && (
        <VueFactureComplete
          open={showViewDialog}
          onOpenChange={setShowViewDialog}
          facture={selectedFacture}
        />
      )}
    </div>
  );
};

export default Factures;
