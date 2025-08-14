
import { useState } from 'react';
import { Eye, ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { SaleViewDialog } from '@/components/sales/SaleViewDialog';
import { EnhancedPOSSystem } from '@/components/sales/EnhancedPOSSystem';
import { useSales } from '@/hooks/useSupabaseDatabase';

const Ventes = () => {
  const { data: sales, loading } = useSales();
  const [selectedSale, setSelectedSale] = useState<any | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);

  const formatCurrency = (amount: number | undefined | null): string => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '0 FCFA';
    }
    return `${amount.toLocaleString()} FCFA`;
  };

  const handleView = (sale: any) => {
    setSelectedSale(sale);
    setShowViewDialog(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      pending: 'secondary',
      completed: 'default',
      cancelled: 'destructive',
    };
    
    const labels: Record<string, string> = {
      pending: 'En attente',
      completed: 'Terminée',
      cancelled: 'Annulée',
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
          <h1 className="text-3xl font-bold">Gestion des Ventes</h1>
          <p className="text-muted-foreground">
            Système de point de vente avancé avec gestion des remises et crédits
          </p>
        </div>
      </div>

      <Tabs defaultValue="pos" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pos" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Point de Vente (POS)
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Historique des Ventes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pos" className="mt-6">
          <EnhancedPOSSystem />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <div className="grid gap-4">
            {sales.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">Aucune vente enregistrée</p>
                    <p className="text-sm text-gray-400">Utilisez le POS pour effectuer des ventes</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              sales.map((sale) => (
                <Card key={sale.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">Vente #{sale.id.slice(0, 8)}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {new Date(sale.sale_date).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(sale.status)}
                        <Button size="sm" variant="outline" onClick={() => handleView(sale)}>
                          <Eye className="h-4 w-4 mr-1" />
                          Voir
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Quantité:</span><br />
                        {sale.quantity} unités
                      </div>
                      <div>
                        <span className="font-medium">Prix unitaire:</span><br />
                        {formatCurrency(sale.unit_price)}
                      </div>
                      <div>
                        <span className="font-medium">Montant total:</span><br />
                        <span className="font-bold text-green-600">
                          {formatCurrency(sale.total_amount)}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Paiement:</span><br />
                        {sale.payment_method === 'cash' ? 'Espèces' : 
                         sale.payment_method === 'card' ? 'Carte' : 
                         sale.payment_method === 'transfer' ? 'Virement' : 
                         sale.payment_method === 'credit' ? 'Crédit' : sale.payment_method}
                      </div>
                    </div>
                    {sale.notes && (
                      <div className="mt-3 pt-3 border-t">
                        <span className="font-medium text-sm">Notes:</span>
                        <p className="text-sm text-gray-600">{sale.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      <SaleViewDialog
        open={showViewDialog}
        onOpenChange={setShowViewDialog}
        sale={selectedSale}
      />
    </div>
  );
};

export default Ventes;
