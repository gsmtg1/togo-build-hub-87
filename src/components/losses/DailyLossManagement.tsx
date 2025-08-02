
import { useState } from 'react';
import { Plus, AlertTriangle, Calendar, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useDailyLosses, useProductsWithStock } from '@/hooks/useSupabaseDatabase';

export const DailyLossManagement = () => {
  const { data: losses, loading, create, remove } = useDailyLosses();
  const { products } = useProductsWithStock();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    product_id: '',
    date_perte: new Date().toISOString().split('T')[0],
    quantite_cassee: '',
    responsable: '',
    commentaire: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedProduct = products.find(p => p.id === formData.product_id);
      const valeurPerte = selectedProduct ? selectedProduct.prix_unitaire * parseInt(formData.quantite_cassee) : 0;

      await create({
        product_id: formData.product_id,
        date_perte: formData.date_perte,
        quantite_cassee: parseInt(formData.quantite_cassee),
        valeur_perte: valeurPerte,
        responsable: formData.responsable,
        commentaire: formData.commentaire
      });
      
      setFormData({
        product_id: '',
        date_perte: new Date().toISOString().split('T')[0],
        quantite_cassee: '',
        responsable: '',
        commentaire: ''
      });
      setDialogOpen(false);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la perte:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette perte ?')) {
      await remove(id);
    }
  };

  const todayLosses = losses.filter(loss => 
    loss.date_perte === new Date().toISOString().split('T')[0]
  );

  const totalLossesToday = todayLosses.reduce((sum, loss) => sum + loss.quantite_cassee, 0);
  const totalValueToday = todayLosses.reduce((sum, loss) => sum + (loss.valeur_perte || 0), 0);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pertes Quotidiennes</h1>
          <p className="text-muted-foreground">Enregistrement des briques cassées et défectueuses</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Enregistrer une perte
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>📋 Nouvelle perte</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="product_id">Produit concerné</Label>
                <Select value={formData.product_id} onValueChange={(value) => setFormData(prev => ({ ...prev, product_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un produit" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.nom} - {product.prix_unitaire} FCFA
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="date_perte">Date de la perte</Label>
                <Input
                  id="date_perte"
                  type="date"
                  value={formData.date_perte}
                  onChange={(e) => setFormData(prev => ({ ...prev, date_perte: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="quantite_cassee">Quantité cassée</Label>
                <Input
                  id="quantite_cassee"
                  type="number"
                  min="1"
                  value={formData.quantite_cassee}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantite_cassee: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="responsable">Responsable/Témoin</Label>
                <Input
                  id="responsable"
                  value={formData.responsable}
                  onChange={(e) => setFormData(prev => ({ ...prev, responsable: e.target.value }))}
                  placeholder="Nom du responsable"
                />
              </div>

              <div>
                <Label htmlFor="commentaire">Commentaire</Label>
                <Textarea
                  id="commentaire"
                  value={formData.commentaire}
                  onChange={(e) => setFormData(prev => ({ ...prev, commentaire: e.target.value }))}
                  placeholder="Cause de la casse, circonstances..."
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">
                  Enregistrer
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pertes aujourd'hui</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLossesToday}</div>
            <p className="text-xs text-muted-foreground">briques cassées</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valeur perdue aujourd'hui</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalValueToday.toLocaleString()} FCFA</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total pertes enregistrées</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{losses.length}</div>
            <p className="text-xs text-muted-foreground">enregistrements</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historique des pertes</CardTitle>
          <CardDescription>Liste chronologique des briques cassées</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Produit</TableHead>
                <TableHead>Quantité</TableHead>
                <TableHead>Valeur</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead>Commentaire</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {losses.map((loss) => {
                const product = products.find(p => p.id === loss.product_id);
                return (
                  <TableRow key={loss.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(loss.date_perte).toLocaleDateString('fr-FR')}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {product ? product.nom : 'Produit introuvable'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive">
                        -{loss.quantite_cassee}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-red-600">
                      -{(loss.valeur_perte || 0).toLocaleString()} FCFA
                    </TableCell>
                    <TableCell className="text-sm">
                      {loss.responsable || 'Non spécifié'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                      {loss.commentaire || 'Aucun commentaire'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(loss.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
