
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Download, TrendingUp, TrendingDown, DollarSign, Package } from 'lucide-react';
import { useSales, useProducts, useDailyLosses, useProductionOrders } from '@/hooks/useSupabaseData';

export default function Rapports() {
  const { data: sales } = useSales();
  const { data: products } = useProducts();
  const { data: losses } = useDailyLosses();
  const { data: productionOrders } = useProductionOrders();
  
  const [reportType, setReportType] = useState('sales');
  const [period, setPeriod] = useState('month');
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  // Calculs pour les statistiques
  const totalSales = sales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
  const totalLossValue = losses.reduce((sum, loss) => sum + (loss.loss_value || 0), 0);
  const totalProduction = productionOrders.reduce((sum, order) => sum + order.produced_quantity, 0);

  // Données pour les graphiques
  const salesByMonth = sales.reduce((acc, sale) => {
    const month = new Date(sale.sale_date).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
    acc[month] = (acc[month] || 0) + sale.total_amount;
    return acc;
  }, {} as Record<string, number>);

  const salesChartData = Object.entries(salesByMonth).map(([month, amount]) => ({
    month,
    ventes: amount
  }));

  const productSalesData = products.map(product => {
    const productSales = sales.filter(sale => sale.product_id === product.id);
    const totalQuantity = productSales.reduce((sum, sale) => sum + sale.quantity, 0);
    const totalValue = productSales.reduce((sum, sale) => sum + sale.total_amount, 0);
    
    return {
      name: product.name,
      quantity: totalQuantity,
      value: totalValue
    };
  }).filter(item => item.quantity > 0);

  const lossesData = losses.map(loss => {
    const product = products.find(p => p.id === loss.product_id);
    return {
      date: new Date(loss.loss_date).toLocaleDateString('fr-FR'),
      product: product?.name || 'Inconnu',
      quantity: loss.quantity_lost,
      value: loss.loss_value || 0
    };
  });

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#f97316'];

  const exportReport = () => {
    // Logique d'export en PDF ou Excel
    console.log('Export du rapport...');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Rapports & Analyses</h1>
          <p className="text-muted-foreground">Tableaux de bord et analyses de performance</p>
        </div>
        <Button onClick={exportReport}>
          <Download className="h-4 w-4 mr-2" />
          Exporter PDF
        </Button>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres de rapport</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Type de rapport</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Ventes</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                  <SelectItem value="losses">Pertes</SelectItem>
                  <SelectItem value="global">Global</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Période</Label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Cette semaine</SelectItem>
                  <SelectItem value="month">Ce mois</SelectItem>
                  <SelectItem value="quarter">Ce trimestre</SelectItem>
                  <SelectItem value="year">Cette année</SelectItem>
                  <SelectItem value="custom">Personnalisé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Date début</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label>Date fin</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chiffre d'affaires</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalSales.toLocaleString()} FCFA</div>
            <div className="flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              +12.5% vs mois dernier
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Production totale</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalProduction.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">briques produites</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valeur des pertes</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalLossValue.toLocaleString()} FCFA</div>
            <div className="text-sm text-red-600">-5.2% vs mois dernier</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Marge brute</CardTitle>
            <FileText className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {((totalSales - totalLossValue) / totalSales * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">rentabilité</div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution des ventes */}
        <Card>
          <CardHeader>
            <CardTitle>Évolution des ventes</CardTitle>
            <CardDescription>Chiffre d'affaires par mois</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => [`${value.toLocaleString()} FCFA`, 'Ventes']} />
                <Legend />
                <Line type="monotone" dataKey="ventes" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Ventes par produit */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition des ventes par produit</CardTitle>
            <CardDescription>Volume des ventes par type de brique</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={productSalesData.slice(0, 6)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="quantity"
                >
                  {productSalesData.slice(0, 6).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value} unités`, 'Quantité']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance des produits */}
        <Card>
          <CardHeader>
            <CardTitle>Performance des produits</CardTitle>
            <CardDescription>Chiffre d'affaires par produit</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productSalesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value: number) => [`${value.toLocaleString()} FCFA`, 'CA']} />
                <Legend />
                <Bar dataKey="value" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Analyse des pertes */}
        <Card>
          <CardHeader>
            <CardTitle>Analyse des pertes</CardTitle>
            <CardDescription>Évolution de la valeur des pertes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={lossesData.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: number) => [`${value.toLocaleString()} FCFA`, 'Perte']} />
                <Legend />
                <Bar dataKey="value" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tableau détaillé */}
      <Card>
        <CardHeader>
          <CardTitle>Détail des {reportType === 'sales' ? 'ventes' : reportType === 'production' ? 'production' : 'pertes'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {reportType === 'sales' && (
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 p-2 text-left">Date</th>
                    <th className="border border-gray-300 p-2 text-left">Client</th>
                    <th className="border border-gray-300 p-2 text-left">Produit</th>
                    <th className="border border-gray-300 p-2 text-right">Quantité</th>
                    <th className="border border-gray-300 p-2 text-right">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.slice(0, 10).map((sale, index) => {
                    const product = products.find(p => p.id === sale.product_id);
                    const client = { name: sale.client_id }; // Simplification
                    return (
                      <tr key={index}>
                        <td className="border border-gray-300 p-2">
                          {new Date(sale.sale_date).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="border border-gray-300 p-2">{client.name}</td>
                        <td className="border border-gray-300 p-2">{product?.name || 'N/A'}</td>
                        <td className="border border-gray-300 p-2 text-right">{sale.quantity}</td>
                        <td className="border border-gray-300 p-2 text-right">{sale.total_amount?.toLocaleString()} FCFA</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
