
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Play, CheckCircle, XCircle, Calendar, Package, Users } from 'lucide-react';
import { useOrdresProductionBriques } from '@/hooks/useFacturationDatabase';
import { useProductsWithStock } from '@/hooks/useSupabaseDatabase';

export const GestionProductionBriques = () => {
  const { data: ordres, loading, create, update, terminerProduction, remove } = useOrdresProductionBriques();
  const { products } = useProductsWithStock();
  
  const [showDialog, setShowDialog] = useState(false);
  const [editingOrdre, setEditingOrdre] = useState<any>(null);
  const [formData, setFormData] = useState({
    product_id: '',
    quantite_planifiee: 0,
    date_lancement: new Date().toISOString().split('T')[0],
    date_fin_prevue: '',
    responsable_production: '',
    cout_materiel: 0,
    cout_main_oeuvre: 0,
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const numero = `ORD-${Date.now().toString().slice(-6)}`;
    const ordreData = {
      ...formData,
      numero_ordre: numero,
      cout_total: formData.cout_materiel + formData.cout_main_oeuvre,
      statut: 'planifie'
    };

    try {
      if (editingOrdre) {
        await update(editingOrdre.id, ordreData);
      } else {
        await create(ordreData);
      }
      
      setShowDialog(false);
      setEditingOrdre(null);
      setFormData({
        product_id: '',
        quantite_planifiee: 0,
        date_lancement: new Date().toISOString().split('T')[0],
        date_fin_prevue: '',
        responsable_production: '',
        cout_materiel: 0,
        cout_main_oeuvre: 0,
        notes: ''
      });
    } catch (error) {
      console.error('Error saving ordre:', error);
    }
  };

  const handleStartProduction = async (id: string) => {
    await update(id, { 
      statut: 'en_cours',
      date_lancement: new Date().toISOString().split('T')[0]
    });
  };

  const handleCompleteProduction = async (ordre: any) => {
    const quantite = prompt(`Quantité produite pour ${ordre.products?.name}:`, ordre.quantite_planifiee.toString());
    if (quantite && !isNaN(parseInt(quantite))) {
      await terminerProduction(ordre.id, parseInt(quantite));
    }
  };

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'planifie':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Planifié</Badge>;
      case 'en_cours':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">En cours</Badge>;
      case 'termine':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Terminé</Badge>;
      case 'annule':
        return <Badge variant="destructive">Annulé</Badge>;
      default:
        return <Badge variant="outline">{statut}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p>Chargement des ordres de production...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Production de Briques</h2>
          <p className="text-gray-600">Gestion des ordres de production et suivi</p>
        </div>
        <Button 
          onClick={() => setShowDialog(true)}
          className="bg-orange-600 hover:bg-orange-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvel ordre
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Ordres</p>
                <p className="text-2xl font-bold">{ordres.length}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En cours</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {ordres.filter(o => o.statut === 'en_cours').length}
                </p>
              </div>
              <Play className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Terminés</p>
                <p className="text-2xl font-bold text-green-600">
                  {ordres.filter(o => o.statut === 'termine').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Planifiés</p>
                <p className="text-2xl font-bold text-blue-600">
                  {ordres.filter(o => o.statut === 'planifie').length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des ordres */}
      <div className="grid gap-4">
        {ordres.map((ordre) => (
          <Card key={ordre.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="text-lg font-semibold">{ordre.numero_ordre}</h3>
                    {getStatutBadge(ordre.statut)}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Produit:</p>
                      <p className="font-medium">
                        {ordre.products?.name} ({ordre.products?.dimensions})
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Quantité:</p>
                      <p className="font-medium">
                        {ordre.quantite_produite.toLocaleString()} / {ordre.quantite_planifiee.toLocaleString()}
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-orange-600 h-2 rounded-full" 
                          style={{ 
                            width: `${(ordre.quantite_produite / ordre.quantite_planifiee) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600">Dates:</p>
                      <p className="font-medium">
                        {new Date(ordre.date_lancement).toLocaleDateString('fr-FR')}
                        {ordre.date_fin_prevue && ` → ${new Date(ordre.date_fin_prevue).toLocaleDateString('fr-FR')}`}
                      </p>
                    </div>
                  </div>

                  {ordre.responsable_production && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="h-4 w-4" />
                        <span>Responsable: {ordre.responsable_production}</span>
                      </div>
                    </div>
                  )}

                  {ordre.notes && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        {ordre.notes}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  {ordre.statut === 'planifie' && (
                    <Button
                      size="sm"
                      onClick={() => handleStartProduction(ordre.id)}
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Démarrer
                    </Button>
                  )}
                  
                  {ordre.statut === 'en_cours' && (
                    <Button
                      size="sm"
                      onClick={() => handleCompleteProduction(ordre)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Terminer
                    </Button>
                  )}

                  {ordre.statut !== 'termine' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingOrdre(ordre);
                        setFormData({
                          product_id: ordre.product_id,
                          quantite_planifiee: ordre.quantite_planifiee,
                          date_lancement: ordre.date_lancement,
                          date_fin_prevue: ordre.date_fin_prevue || '',
                          responsable_production: ordre.responsable_production || '',
                          cout_materiel: ordre.cout_materiel || 0,
                          cout_main_oeuvre: ordre.cout_main_oeuvre || 0,
                          notes: ordre.notes || ''
                        });
                        setShowDialog(true);
                      }}
                    >
                      Modifier
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog pour créer/modifier un ordre */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingOrdre ? 'Modifier l\'ordre' : 'Nouvel ordre de production'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Produit *</Label>
                <Select 
                  value={formData.product_id} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, product_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un produit" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} ({product.dimensions})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Quantité planifiée *</Label>
                <Input
                  type="number"
                  value={formData.quantite_planifiee}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    quantite_planifiee: parseInt(e.target.value) || 0 
                  }))}
                  min="1"
                  required
                />
              </div>

              <div>
                <Label>Date de lancement *</Label>
                <Input
                  type="date"
                  value={formData.date_lancement}
                  onChange={(e) => setFormData(prev => ({ ...prev, date_lancement: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label>Date de fin prévue</Label>
                <Input
                  type="date"
                  value={formData.date_fin_prevue}
                  onChange={(e) => setFormData(prev => ({ ...prev, date_fin_prevue: e.target.value }))}
                />
              </div>

              <div>
                <Label>Responsable production</Label>
                <Input
                  value={formData.responsable_production}
                  onChange={(e) => setFormData(prev => ({ ...prev, responsable_production: e.target.value }))}
                  placeholder="Nom du responsable"
                />
              </div>

              <div>
                <Label>Coût matériel (FCFA)</Label>
                <Input
                  type="number"
                  value={formData.cout_materiel}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    cout_materiel: parseFloat(e.target.value) || 0 
                  }))}
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <Label>Coût main d'œuvre (FCFA)</Label>
                <Input
                  type="number"
                  value={formData.cout_main_oeuvre}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    cout_main_oeuvre: parseFloat(e.target.value) || 0 
                  }))}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Notes sur la production..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Annuler
              </Button>
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                {editingOrdre ? 'Mettre à jour' : 'Créer l\'ordre'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
