
import { useState } from 'react';
import { Plus, Edit, Trash2, Eye, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useDatabase, useLocalStorage } from '@/hooks/useDatabase';
import { Quote } from '@/lib/database';
import { QuoteDialog } from '@/components/quotes/QuoteDialog';
import { QuoteViewDialog } from '@/components/quotes/QuoteViewDialog';

const Devis = () => {
  const { isInitialized } = useDatabase();
  const { data: quotes, loading, create, update, remove } = useLocalStorage<Quote>('quotes');
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  if (!isInitialized || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Chargement des devis...</div>
      </div>
    );
  }

  const handleCreate = () => {
    setSelectedQuote(null);
    setIsEditing(false);
    setDialogOpen(true);
  };

  const handleEdit = (quote: Quote) => {
    setSelectedQuote(quote);
    setIsEditing(true);
    setDialogOpen(true);
  };

  const handleView = (quote: Quote) => {
    setSelectedQuote(quote);
    setViewDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce devis ?')) {
      await remove(id);
    }
  };

  const handleSubmit = async (quoteData: Partial<Quote>) => {
    if (isEditing && selectedQuote) {
      await update({ ...selectedQuote, ...quoteData, updated_at: new Date().toISOString() });
    } else {
      const newQuote: Quote = {
        id: crypto.randomUUID(),
        numero_devis: `DEV-${Date.now()}`,
        client_nom: quoteData.client_nom || '',
        client_telephone: quoteData.client_telephone || '',
        client_adresse: quoteData.client_adresse || '',
        date_devis: quoteData.date_devis || new Date().toISOString().split('T')[0],
        date_validite: quoteData.date_validite || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        statut: quoteData.statut || 'brouillon',
        montant_total: quoteData.montant_total || 0,
        vendeur_id: quoteData.vendeur_id,
        commentaires: quoteData.commentaires,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      await create(newQuote);
    }
    setDialogOpen(false);
  };

  const getStatusBadge = (statut: Quote['statut']) => {
    const variants: Record<Quote['statut'], 'default' | 'secondary' | 'destructive'> = {
      brouillon: 'secondary',
      envoye: 'default',
      accepte: 'default',
      refuse: 'destructive',
      expire: 'destructive',
    };
    
    const labels: Record<Quote['statut'], string> = {
      brouillon: 'Brouillon',
      envoye: 'Envoyé',
      accepte: 'Accepté',
      refuse: 'Refusé',
      expire: 'Expiré',
    };

    return <Badge variant={variants[statut]}>{labels[statut]}</Badge>;
  };

  const totalQuotes = quotes.reduce((sum, quote) => sum + quote.montant_total, 0);
  const acceptedQuotes = quotes.filter(quote => quote.statut === 'accepte').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestion des Devis</h1>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouveau Devis
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total des Devis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuotes.toLocaleString()} FCFA</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Nombre de Devis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quotes.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Devis Acceptés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{acceptedQuotes}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Devis</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Valide jusqu'à</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell>{new Date(quote.date_devis).toLocaleDateString()}</TableCell>
                  <TableCell>{quote.client_nom}</TableCell>
                  <TableCell>{quote.client_telephone}</TableCell>
                  <TableCell>{quote.montant_total.toLocaleString()} FCFA</TableCell>
                  <TableCell>{quote.date_validite ? new Date(quote.date_validite).toLocaleDateString() : 'Non définie'}</TableCell>
                  <TableCell>{getStatusBadge(quote.statut)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(quote)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(quote)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(quote.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <QuoteDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        quote={selectedQuote}
        onSubmit={handleSubmit}
        isEditing={isEditing}
      />

      <QuoteViewDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        quote={selectedQuote}
      />
    </div>
  );
};

export default Devis;
