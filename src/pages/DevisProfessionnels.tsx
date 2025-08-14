
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DialogueFacture } from '@/components/facturation/DialogueFacture';
import { VueFacture } from '@/components/facturation/VueFacture';
import { useDevisProfessionnels } from '@/hooks/useFacturationDatabase';
import { Plus, Eye, Edit, Trash2, Search, FileText, TrendingUp, Calendar } from 'lucide-react';

export const DevisProfessionnels = () => {
  const { data: devis, loading, create, update, remove } = useDevisProfessionnels();
  const [showDialog, setShowDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [editingDevis, setEditingDevis] = useState<any>(null);
  const [viewingDevis, setViewingDevis] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDevis = devis.filter(devis =>
    devis.client_nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    devis.numero_devis.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async (devisData: any, items: any[]) => {
    await create(devisData, items);
  };

  const handleUpdate = async (devisData: any, items: any[]) => {
    if (editingDevis) {
      await update(editingDevis.id, devisData);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce devis ?')) {
      await remove(id);
    }
  };

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'brouillon':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Brouillon</Badge>;
      case 'envoye':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Envoyé</Badge>;
      case 'accepte':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Accepté</Badge>;
      case 'refuse':
        return <Badge variant="destructive">Refusé</Badge>;
      case 'expire':
        return <Badge variant="destructive">Expiré</Badge>;
      default:
        return <Badge variant="outline">{statut}</Badge>;
    }
  };

  const totalMontant = filteredDevis.reduce((sum, devis) => sum + devis.montant_total, 0);
  const devisAcceptes = filteredDevis.filter(d => d.statut === 'accepte').length;
  const devisExpires = filteredDevis.filter(d => {
    if (d.date_echeance) {
      return new Date(d.date_echeance) < new Date() && d.statut !== 'accepte';
    }
    return false;
  }).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p>Chargement des devis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Devis</h1>
          <p className="text-gray-600">Gestion des devis professionnels</p>
        </div>
        <Button 
          onClick={() => {
            setEditingDevis(null);
            setShowDialog(true);
          }}
          className="bg-orange-600 hover:bg-orange-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouveau devis
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Devis</p>
                <p className="text-2xl font-bold">{filteredDevis.length}</p>
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
                <p className="text-sm text-gray-600">Acceptés</p>
                <p className="text-2xl font-bold text-green-600">{devisAcceptes}</p>
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
                <p className="text-sm text-gray-600">Expirés</p>
                <p className="text-2xl font-bold text-red-600">{devisExpires}</p>
              </div>
              <Calendar className="h-8 w-8 text-red-600" />
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
              placeholder="Rechercher par nom de client ou numéro de devis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Liste des devis */}
      <div className="grid gap-4">
        {filteredDevis.map((devis) => (
          <Card key={devis.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="text-lg font-semibold">{devis.numero_devis}</h3>
                    {getStatutBadge(devis.statut)}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Client:</p>
                      <p className="font-medium">{devis.client_nom}</p>
                      {devis.client_telephone && (
                        <p className="text-gray-500">{devis.client_telephone}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-gray-600">Date:</p>
                      <p className="font-medium">
                        {new Date(devis.date_devis).toLocaleDateString('fr-FR')}
                      </p>
                      {devis.date_echeance && (
                        <p className={`text-sm ${
                          new Date(devis.date_echeance) < new Date() 
                            ? 'text-red-600 font-medium' 
                            : 'text-gray-500'
                        }`}>
                          Valide jusqu'au: {new Date(devis.date_echeance).toLocaleDateString('fr-FR')}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-gray-600">Montant:</p>
                      <p className="font-bold text-green-600">
                        {devis.montant_total.toLocaleString()} FCFA
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Produits:</p>
                      <p className="font-medium">
                        {devis.devis_items?.length || 0} articles
                      </p>
                    </div>
                  </div>

                  {devis.commentaires && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        {devis.commentaires}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setViewingDevis(devis);
                      setShowViewDialog(true);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingDevis(devis);
                      setShowDialog(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(devis.id)}
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

      {filteredDevis.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun devis trouvé</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'Aucun devis ne correspond à votre recherche.' : 'Commencez par créer votre premier devis.'}
            </p>
            {!searchTerm && (
              <Button 
                onClick={() => setShowDialog(true)}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Créer un devis
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <DialogueFacture
        open={showDialog}
        onOpenChange={setShowDialog}
        onSubmit={editingDevis ? handleUpdate : handleCreate}
        facture={editingDevis}
        type="devis"
      />

      <VueFacture
        open={showViewDialog}
        onOpenChange={setShowViewDialog}
        facture={viewingDevis}
        type="devis"
      />
    </div>
  );
};
