
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Package, AlertTriangle, Users } from 'lucide-react';
import { useSales, useProducts, useDailyLosses, useProductionOrders } from '@/hooks/useSupabaseDatabase';

const Rapports = () => {
  const { data: sales, loading: salesLoading } = useSales();
  const { data: products } = useProducts();
  const { data: losses } = useDailyLosses();
  const { data: productionOrders } = useProductionOrders();

  // Helper function to safely format currency
  const formatCurrency = (amount: number | undefined | null): string => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '0 FCFA';
    }
    return `${amount.toLocaleString()} FCFA`;
  };

  // Calculate KPIs
  const totalSales = sales.reduce((sum, sale) => sum + (sale.montant_total || 0), 0);
  const totalLossValue = losses.reduce((sum, loss) => sum + (loss.valeur_perte || 0), 0);
  const completedOrders = productionOrders.filter(order => order.statut === 'termine').length;
  const pendingOrders = productionOrders.filter(order => order.statut === 'en_attente').length;

  // Products with low stock
  const lowStockProducts = products.filter(product => 
    (product.stock_actuel || 0) <= (product.stock_minimum || 0)
  );

  if (salesLoading) {
    return <div className="flex justify-center items-center h-64">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Rapports & Analyses</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble de vos performances et indicateurs clés
        </p>
      </div>

      {/* KPIs Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chiffre d'affaires</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalSales)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total des ventes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pertes</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalLossValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Valeur des pertes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Production</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {completedOrders}
            </div>
            <p className="text-xs text-muted-foreground">
              Ordres terminés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {pendingOrders}
            </div>
            <p className="text-xs text-muted-foreground">
              Ordres en attente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <Card>
          <CardHeader>
            <CardTitle>Ventes récentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sales.slice(0, 5).map((sale) => (
              <div key={sale.id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{sale.client_nom}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(sale.date_vente).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(sale.montant_total)}</p>
                  <Badge variant={
                    sale.statut === 'livree' ? 'default' :
                    sale.statut === 'confirmee' ? 'secondary' : 'outline'
                  }>
                    {sale.statut}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Stock Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Alertes de stock
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {lowStockProducts.length > 0 ? (
              lowStockProducts.map((product) => (
                <div key={product.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{product.nom}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.longueur_cm}x{product.largeur_cm}x{product.hauteur_cm}cm
                    </p>
                  </div>
                  <Badge variant="destructive">
                    Stock: {product.stock_actuel || 0}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">Aucune alerte de stock</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Losses */}
        <Card>
          <CardHeader>
            <CardTitle>Pertes récentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {losses.slice(0, 5).map((loss) => {
              const product = products.find(p => p.id === loss.product_id);
              return (
                <div key={loss.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{product?.nom || 'Produit inconnu'}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(loss.date_perte).toLocaleDateString('fr-FR')} - {loss.quantite_cassee} pièces
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-red-600">
                      -{formatCurrency(loss.valeur_perte)}
                    </p>
                    <p className="text-sm text-muted-foreground">{loss.motif}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Production Status */}
        <Card>
          <CardHeader>
            <CardTitle>État de la production</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {productionOrders.slice(0, 5).map((order) => {
              const product = products.find(p => p.id === order.product_id);
              return (
                <div key={order.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{order.numero_ordre}</p>
                    <p className="text-sm text-muted-foreground">
                      {product?.nom} - {order.quantite} pièces
                    </p>
                  </div>
                  <Badge variant={
                    order.statut === 'termine' ? 'default' :
                    order.statut === 'en_cours' ? 'secondary' :
                    order.statut === 'approuve' ? 'outline' : 'destructive'
                  }>
                    {order.statut}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Rapports;
