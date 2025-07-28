
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
      await update({ ...selectedQuote, ...quoteData, updatedAt: new Date().toISOString() });
    } else {
      const newQuote: Quote = {
        id: crypto.randomUUID(),
        customerName: quoteData.customerName || '',
        customerPhone: quoteData.customerPhone || '',
        customerAddress: quoteData.customerAddress || '',
        products: quoteData.products || [],
        totalAmount: quoteData.totalAmount || 0,
        date: quoteData.date || new Date().toISOString().split('T')[0],
        validUntil: quoteData.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: quoteData.status || 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await create(newQuote);
    }
    setDialogOpen(false);
  };

  const getStatusBadge = (status: Quote['status']) => {
    const variants: Record<Quote['status'], 'default' | 'secondary' | 'destructive'> = {
      draft: 'secondary',
      sent: 'default',
      accepted: 'default',
      rejected: 'destructive',
      expired: 'destructive',
    };
    
    const labels: Record<Quote['status'], string> = {
      draft: 'Brouillon',
      sent: 'Envoyé',
      accepted: 'Accepté',
      rejected: 'Refusé',
      expired: 'Expiré',
    };

    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  const totalQuotes = quotes.reduce((sum, quote) => sum + quote.totalAmount, 0);
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
                  <TableCell>{new Date(quote.date).toLocaleDateString()}</TableCell>
                  <TableCell>{quote.customerName}</TableCell>
                  <TableCell>{quote.customerPhone}</TableCell>
                  <TableCell>{quote.totalAmount.toLocaleString()} FCFA</TableCell>
                  <TableCell>{new Date(quote.validUntil).toLocaleDateString()}</TableCell>
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
