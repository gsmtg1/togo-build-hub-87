
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSupabaseDatabase } from '@/hooks/useSupabaseDatabase';
import { Plus, Eye, Edit, Trash2, Search, TrendingUp, ShoppingCart, Calendar, DollarSign } from 'lucide-react';

export const VentesAméliorées = () => {
  const { data: ventes, loading, create, update, remove } = useSupabaseDatabase('sales');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedVente, setSelectedVente] = useState<any>(null);

  const filteredVentes = ventes.filter(vente =>
    (vente.client_nom && vente.client_nom.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (vente.product_id && vente.product_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (vente.notes && vente.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette vente ?')) {
      await remove(id);
    }
  };

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      case 'confirmed':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Confirmée</Badge>;
      case 'delivered':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Livrée</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Annulée</Badge>;
      default:
        return <Badge variant="outline">{statut}</Badge>;
    }
  };

  const totalVentes = filteredVentes.reduce((sum, vente) => sum + (vente.total_amount || 0), 0);
  const ventesConfirmees = filteredVentes.filter(v => v.status === 'confirmed' || v.status === 'delivered').length;
  const ventesEnAttente = filteredVentes.filter(v => v.status === 'pending').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p>Chargement de l'historique des ventes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Historique des Ventes</h1>
          <p className="text-gray-600">Suivi et gestion de toutes les ventes</p>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Ventes</p>
                <p className="text-2xl font-bold">{filteredVentes.length}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Chiffre d'affaires</p>
                <p className="text-2xl font-bold text-green-600">
                  {totalVentes.toLocaleString()} FCFA
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Confirmées</p>
                <p className="text-2xl font-bold text-green-600">{ventesConfirmees}</p>
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
                <p className="text-sm text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-yellow-600">{ventesEnAttente}</p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-600" />
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
              placeholder="Rechercher par client, produit ou notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Liste des ventes */}
      <div className="grid gap-4">
        {filteredVentes.map((vente) => (
          <Card key={vente.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="text-lg font-semibold">
                      Vente #{vente.id.slice(0, 8)}
                    </h3>
                    {getStatutBadge(vente.status)}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Client:</p>
                      <p className="font-medium">{vente.client_nom || 'Client non spécifié'}</p>
                      {vente.client_telephone && (
                        <p className="text-gray-500">{vente.client_telephone}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-gray-600">Date:</p>
                      <p className="font-medium">
                        {new Date(vente.sale_date).toLocaleDateString('fr-FR')}
                      </p>
                      <p className="text-gray-500">
                        {new Date(vente.sale_date).toLocaleTimeString('fr-FR')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Quantité:</p>
                      <p className="font-medium">{vente.quantity?.toLocaleString() || 0}</p>
                      <p className="text-gray-500">
                        Prix unitaire: {vente.unit_price?.toLocaleString() || 0} FCFA
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Montant total:</p>
                      <p className="font-bold text-green-600">
                        {(vente.total_amount || 0).toLocaleString()} FCFA
                      </p>
                      {vente.payment_method && (
                        <p className="text-gray-500">
                          Paiement: {vente.payment_method}
                        </p>
                      )}
                    </div>
                  </div>

                  {vente.client_adresse && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">
                        <strong>Adresse:</strong> {vente.client_adresse}
                      </p>
                    </div>
                  )}

                  {(vente.notes || vente.commentaires) && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        {vente.notes || vente.commentaires}
                      </p>
                    </div>
                  )}

                  {vente.vendeur_nom && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Vendeur: {vente.vendeur_nom}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedVente(vente);
                      setShowDetailsDialog(true);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(vente.id)}
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

      {filteredVentes.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune vente trouvée</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'Aucune vente ne correspond à votre recherche.' : 'L\'historique des ventes apparaîtra ici.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Dialog de détails */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de la vente</DialogTitle>
          </DialogHeader>

          {selectedVente && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Informations générales</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>ID:</strong> {selectedVente.id}</p>
                    <p><strong>Date:</strong> {new Date(selectedVente.sale_date).toLocaleString('fr-FR')}</p>
                    <p><strong>Statut:</strong> {selectedVente.status}</p>
                    <p><strong>Mode de paiement:</strong> {selectedVente.payment_method || 'Non spécifié'}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Client</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Nom:</strong> {selectedVente.client_nom || 'Non spécifié'}</p>
                    <p><strong>Téléphone:</strong> {selectedVente.client_telephone || 'Non spécifié'}</p>
                    <p><strong>Adresse:</strong> {selectedVente.client_adresse || 'Non spécifiée'}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Détails produit</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Quantité</p>
                      <p className="font-semibold">{selectedVente.quantity?.toLocaleString() || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Prix unitaire</p>
                      <p className="font-semibold">{selectedVente.unit_price?.toLocaleString() || 0} FCFA</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Total</p>
                      <p className="font-semibold text-green-600">{(selectedVente.total_amount || 0).toLocaleString()} FCFA</p>
                    </div>
                  </div>
                </div>
              </div>

              {(selectedVente.notes || selectedVente.commentaires) && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Notes</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {selectedVente.notes || selectedVente.commentaires}
                  </p>
                </div>
              )}

              {selectedVente.vendeur_nom && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Vendeur</h4>
                  <p className="text-sm">{selectedVente.vendeur_nom}</p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
