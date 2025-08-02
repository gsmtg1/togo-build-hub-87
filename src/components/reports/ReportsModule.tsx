
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, Package, AlertTriangle, FileBarChart, Download } from 'lucide-react';
import { useProducts, useSales, useStockMovements, useDailyLosses, useInvoices } from '@/hooks/useSupabaseDatabase';

const COLORS = ['#f97316', '#ef4444', '#22c55e', '#3b82f6', '#a855f7'];

export const ReportsModule = () => {
  const { data: products } = useProducts();
  const { data: sales } = useSales();
  const { data: movements } = useStockMovements();
  const { data: losses } = useDailyLosses();
  const { data: invoices } = useInvoices();
  const [selectedPeriod, setSelectedPeriod] = useState('30'); // derniers 30 jours

  // Calculs des statistiques générales
  const totalStockValue = products.reduce((sum, p) => sum + (p.stock_actuel * p.prix_unitaire), 0);
  const lowStockItems = products.filter(p => p.stock_actuel <= p.stock_minimum).length;
  const totalSalesThisMonth = sales.filter(s => {
    const saleDate = new Date(s.date_vente);
    const currentMonth = new Date();
    return saleDate.getMonth() === currentMonth.getMonth() && saleDate.getFullYear() === currentMonth.getFullYear();
  }).reduce((sum, s) => sum + s.montant_total, 0);

  const totalLossesThisMonth = losses.filter(l => {
    const lossDate = new Date(l.date_perte);
    const currentMonth = new Date();
    return lossDate.getMonth() === currentMonth.getMonth() && lossDate.getFullYear() === currentMonth.getFullYear();
  }).reduce((sum, l) => sum + (l.valeur_perte || 0), 0);

  // Données pour les graphiques
  const stockByCategory = products.reduce((acc, product) => {
    const category = product.categorie;
    if (!acc[category]) {
      acc[category] = { name: category, value: 0, quantity: 0 };
    }
    acc[category].value += product.stock_actuel * product.prix_unitaire;
    acc[category].quantity += product.stock_actuel;
    return acc;
  }, {} as any);

  const stockChartData = Object.values(stockByCategory);

  // Mouvements de stock par mois
  const stockMovementsByMonth = movements.reduce((acc, movement) => {
    const date = new Date(movement.date_mouvement);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!acc[monthKey]) {
      acc[monthKey] = { month: monthKey, entrees: 0, sorties: 0, pertes: 0 };
    }
    
    if (movement.type === 'entree') {
      acc[monthKey].entrees += movement.quantite;
    } else if (movement.type === 'sortie') {
      acc[monthKey].sorties += movement.quantite;
    } else if (movement.type === 'perte') {
      acc[monthKey].pertes += movement.quantite;
    }
    
    return acc;
  }, {} as any);

  const movementChartData = Object.values(stockMovementsByMonth).slice(-6); // 6 derniers mois

  // Ventes par mois
  const salesByMonth = sales.reduce((acc, sale) => {
    const date = new Date(sale.date_vente);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!acc[monthKey]) {
      acc[monthKey] = { month: monthKey, montant: 0, nombre: 0 };
    }
    
    acc[monthKey].montant += sale.montant_total;
    acc[monthKey].nombre += 1;
    
    return acc;
  }, {} as any);

  const salesChartData = Object.values(salesByMonth).slice(-6);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">📊 Rapports & Analyses</h1>
          <p className="text-muted-foreground">Vue d'ensemble des performances de l'entreprise</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 derniers jours</SelectItem>
              <SelectItem value="30">30 derniers jours</SelectItem>
              <SelectItem value="90">3 derniers mois</SelectItem>
              <SelectItem value="365">Année complète</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valeur stock total</CardTitle>
            <Package className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalStockValue.toLocaleString()} FCFA
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              Inventaire actuel
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventes ce mois</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {totalSalesThisMonth.toLocaleString()} FCFA
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <FileBarChart className="h-3 w-3 mr-1" />
              Chiffre d'affaires mensuel
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pertes ce mois</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {totalLossesThisMonth.toLocaleString()} FCFA
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <TrendingDown className="h-3 w-3 mr-1" />
              Valeur des pertes
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stocks faibles</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {lowStockItems}
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <Package className="h-3 w-3 mr-1" />
              Produits en rupture
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Répartition du stock par catégorie</CardTitle>
            <CardDescription>Valeur du stock par type de produit</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stockChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${(value / 1000000).toFixed(1)}M`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stockChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${Number(value).toLocaleString()} FCFA`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Évolution des ventes</CardTitle>
            <CardDescription>Chiffre d'affaires par mois</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${Number(value).toLocaleString()} FCFA`} />
                  <Line 
                    type="monotone" 
                    dataKey="montant" 
                    stroke="#f97316" 
                    strokeWidth={3}
                    name="Ventes"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mouvements de stock</CardTitle>
            <CardDescription>Entrées, sorties et pertes par mois</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={movementChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="entrees" fill="#22c55e" name="Entrées" />
                  <Bar dataKey="sorties" fill="#3b82f6" name="Sorties" />
                  <Bar dataKey="pertes" fill="#ef4444" name="Pertes" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Résumé des activités</CardTitle>
            <CardDescription>Aperçu général des opérations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <div>
                <div className="font-semibold text-green-800">Total produits en stock</div>
                <div className="text-sm text-green-600">{products.length} références</div>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {products.reduce((sum, p) => sum + p.stock_actuel, 0).toLocaleString()} unités
              </Badge>
            </div>

            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <div>
                <div className="font-semibold text-blue-800">Total ventes</div>
                <div className="text-sm text-blue-600">{sales.length} transactions</div>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {sales.reduce((sum, s) => sum + s.montant_total, 0).toLocaleString()} FCFA
              </Badge>
            </div>

            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <div>
                <div className="font-semibold text-red-800">Total pertes</div>
                <div className="text-sm text-red-600">{losses.length} incidents</div>
              </div>
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                {losses.reduce((sum, l) => sum + (l.valeur_perte || 0), 0).toLocaleString()} FCFA
              </Badge>
            </div>

            <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
              <div>
                <div className="font-semibold text-orange-800">Factures générées</div>
                <div className="text-sm text-orange-600">{invoices.length} factures</div>
              </div>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                {invoices.reduce((sum, i) => sum + i.montant_total, 0).toLocaleString()} FCFA
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
