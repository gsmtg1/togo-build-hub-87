
import { useState } from 'react';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useQuotations } from '@/hooks/useSupabaseDatabase';
import { QuoteDialog } from '@/components/quotes/QuoteDialog';
import { QuoteViewDialog } from '@/components/quotes/QuoteViewDialog';

const Devis = () => {
  const { data: quotes, loading, create, update, remove } = useQuotations();
  const [selectedQuote, setSelectedQuote] = useState<any | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleCreate = () => {
    setSelectedQuote(null);
    setIsEditing(false);
    setDialogOpen(true);
  };

  const handleEdit = (quote: any) => {
    setSelectedQuote(quote);
    setIsEditing(true);
    setDialogOpen(true);
  };

  const handleView = (quote: any) => {
    setSelectedQuote(quote);
    setViewDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce devis ?')) {
      await remove(id);
    }
  };

  const handleSubmit = async (quoteData: any) => {
    if (isEditing && selectedQuote) {
      await update(selectedQuote.id, { ...quoteData, updated_at: new Date().toISOString() });
    } else {
      const newQuote = {
        ...quoteData,
        status: quoteData.status || 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      await create(newQuote);
    }
    setDialogOpen(false);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      draft: 'secondary',
      sent: 'default',
      accepted: 'default',
      rejected: 'destructive',
      expired: 'destructive',
    };
    
    const labels: Record<string, string> = {
      draft: 'Brouillon',
      sent: 'Envoyé',
      accepted: 'Accepté',
      rejected: 'Refusé',
      expired: 'Expiré',
    };

    return <Badge variant={variants[status] || 'secondary'}>{labels[status] || status}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Chargement des devis...</div>
      </div>
    );
  }

  const totalQuotes = quotes.reduce((sum, quote) => sum + (quote.total_amount || 0), 0);
  const acceptedQuotes = quotes.filter(quote => quote.status === 'accepted').length;

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
          {quotes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun devis trouvé
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Produit</TableHead>
                  <TableHead>Quantité</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Valide jusqu'à</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotes.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell>{new Date(quote.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{quote.client_id || 'N/A'}</TableCell>
                    <TableCell>{quote.product_id || 'N/A'}</TableCell>
                    <TableCell>{quote.quantity || 0}</TableCell>
                    <TableCell>{(quote.total_amount || 0).toLocaleString()} FCFA</TableCell>
                    <TableCell>
                      {quote.valid_until ? new Date(quote.valid_until).toLocaleDateString() : 'Non définie'}
                    </TableCell>
                    <TableCell>{getStatusBadge(quote.status)}</TableCell>
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
          )}
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
