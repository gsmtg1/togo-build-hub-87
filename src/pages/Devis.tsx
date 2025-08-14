
import { useState } from 'react';
import { Plus, Eye, Edit, Trash2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EnhancedQuoteDialog } from '@/components/quotes/EnhancedQuoteDialog';
import { QuoteViewDialog } from '@/components/quotes/QuoteViewDialog';
import { useQuotations } from '@/hooks/useSupabaseDatabase';

const Devis = () => {
  const { data: quotations, loading, remove } = useQuotations();
  const [selectedQuote, setSelectedQuote] = useState<any | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);

  const handleEdit = (quote: any) => {
    setSelectedQuote(quote);
    setShowDialog(true);
  };

  const handleView = (quote: any) => {
    setSelectedQuote(quote);
    setShowViewDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce devis ?')) {
      await remove(id);
    }
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
      rejected: 'Rejeté',
      expired: 'Expiré',
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
          <h1 className="text-3xl font-bold">Gestion des Devis</h1>
          <p className="text-muted-foreground">
            Créez et gérez vos devis avec sélection avancée de produits
          </p>
        </div>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau devis
        </Button>
      </div>

      <div className="grid gap-4">
        {quotations.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Aucun devis créé</p>
                <p className="text-sm text-gray-400">Commencez par créer votre premier devis</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          quotations.map((quote) => (
            <Card key={quote.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Devis #{quote.id.slice(0, 8)}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Créé le {new Date(quote.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(quote.status)}
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => handleView(quote)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleEdit(quote)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(quote.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Quantité:</span><br />
                    {quote.quantity} unités
                  </div>
                  <div>
                    <span className="font-medium">Prix unitaire:</span><br />
                    {quote.unit_price?.toLocaleString()} FCFA
                  </div>
                  <div>
                    <span className="font-medium">Montant total:</span><br />
                    <span className="font-bold text-green-600">
                      {quote.total_amount?.toLocaleString()} FCFA
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Valide jusqu'au:</span><br />
                    {new Date(quote.valid_until).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                {quote.notes && (
                  <div className="mt-3 pt-3 border-t">
                    <span className="font-medium text-sm">Notes:</span>
                    <p className="text-sm text-gray-600">{quote.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <EnhancedQuoteDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        quote={selectedQuote}
        onClose={() => {
          setShowDialog(false);
          setSelectedQuote(null);
        }}
      />

      <QuoteViewDialog
        open={showViewDialog}
        onOpenChange={setShowViewDialog}
        quote={selectedQuote}
      />
    </div>
  );
};

export default Devis;
