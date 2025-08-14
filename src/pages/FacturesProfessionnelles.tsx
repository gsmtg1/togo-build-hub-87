
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DialogueFacture } from '@/components/facturation/DialogueFacture';
import { VueFacture } from '@/components/facturation/VueFacture';
import { useFacturesProfessionnelles } from '@/hooks/useFacturationDatabase';
import { Plus, Eye, Edit, Trash2, Search, FileText, TrendingUp } from 'lucide-react';

export const FacturesProfessionnelles = () => {
  const { data: factures, loading, create, update, remove } = useFacturesProfessionnelles();
  const [showDialog, setShowDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [editingFacture, setEditingFacture] = useState<any>(null);
  const [viewingFacture, setViewingFacture] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFactures = factures.filter(facture =>
    facture.client_nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    facture.numero_facture.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async (factureData: any, items: any[]) => {
    await create(factureData, items);
  };

  const handleUpdate = async (factureData: any, items: any[]) => {
    if (editingFacture) {
      await update(editingFacture.id, factureData);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
      await remove(id);
    }
  };

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'brouillon':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Brouillon</Badge>;
      case 'envoyee':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Envoyée</Badge>;
      case 'payee':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Payée</Badge>;
      case 'en_retard':
        return <Badge variant="destructive">En retard</Badge>;
      case 'annulee':
        return <Badge variant="destructive">Annulée</Badge>;
      default:
        return <Badge variant="outline">{statut}</Badge>;
    }
  };

  const totalMontant = filteredFactures.reduce((sum, facture) => sum + facture.montant_total, 0);
  const facturesPayees = filteredFactures.filter(f => f.statut === 'payee').length;
  const facturesEnRetard = filteredFactures.filter(f => f.statut === 'en_retard').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p>Chargement des factures...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Factures</h1>
          <p className="text-gray-600">Gestion des factures professionnelles</p>
        </div>
        <Button 
          onClick={() => {
            setEditingFacture(null);
            setShowDialog(true);
          }}
          className="bg-orange-600 hover:bg-orange-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle facture
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Factures</p>
                <p className="text-2xl font-bold">{filteredFactures.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Montant Total</p>
                <p className="text-2xl font-bold text-green-600">
                  {totalMontant.toLocaleString()} FCFA
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Payées</p>
                <p className="text-2xl font-bold text-green-600">{facturesPayees}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 font-bold">✓</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En retard</p>
                <p className="text-2xl font-bold text-red-600">{facturesEnRetard}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-red-600 font-bold">!</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barre de recherche */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Search className="h-5 w-5 text-gray-400" />
            <Input
              placeholder="Rechercher par nom de client ou numéro de facture..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Liste des factures */}
      <div className="grid gap-4">
        {filteredFactures.map((facture) => (
          <Card key={facture.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="text-lg font-semibold">{facture.numero_facture}</h3>
                    {getStatutBadge(facture.statut)}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Client:</p>
                      <p className="font-medium">{facture.client_nom}</p>
                      {facture.client_telephone && (
                        <p className="text-gray-500">{facture.client_telephone}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-gray-600">Date:</p>
                      <p className="font-medium">
                        {new Date(facture.date_facture).toLocaleDateString('fr-FR')}
                      </p>
                      {facture.date_echeance && (
                        <p className="text-gray-500">
                          Échéance: {new Date(facture.date_echeance).toLocaleDateString('fr-FR')}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-gray-600">Montant:</p>
                      <p className="font-bold text-green-600">
                        {facture.montant_total.toLocaleString()} FCFA
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Produits:</p>
                      <p className="font-medium">
                        {facture.facture_items?.length || 0} articles
                      </p>
                    </div>
                  </div>

                  {facture.commentaires && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        {facture.commentaires}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setViewingFacture(facture);
                      setShowViewDialog(true);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingFacture(facture);
                      setShowDialog(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
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

      {filteredFactures.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune facture trouvée</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'Aucune facture ne correspond à votre recherche.' : 'Commencez par créer votre première facture.'}
            </p>
            {!searchTerm && (
              <Button 
                onClick={() => setShowDialog(true)}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Créer une facture
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <DialogueFacture
        open={showDialog}
        onOpenChange={setShowDialog}
        onSubmit={editingFacture ? handleUpdate : handleCreate}
        facture={editingFacture}
        type="facture"
      />

      <VueFacture
        open={showViewDialog}
        onOpenChange={setShowViewDialog}
        facture={viewingFacture}
        type="facture"
      />
    </div>
  );
};
