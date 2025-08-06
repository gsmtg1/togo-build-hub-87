
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Calendar, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { useSales, useDailyLosses, useProducts, useAccountingEntries } from '@/hooks/useSupabaseDatabase';

export const ReportsModule = () => {
  const { data: sales } = useSales();
  const { data: losses } = useDailyLosses();
  const { data: products } = useProducts();
  const { data: accountingEntries } = useAccountingEntries();
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Calculate sales report
  const salesReport = {
    totalSales: sales.length,
    totalRevenue: sales.reduce((sum, sale) => sum + (sale.montant_total || 0), 0),
    completedSales: sales.filter(s => s.statut === 'confirmee').length,
    pendingSales: sales.filter(s => s.statut === 'en_attente').length,
  };

  // Calculate losses report
  const lossesReport = {
    totalLosses: losses.length,
    totalLossValue: losses.reduce((sum, loss) => sum + (loss.loss_value || 0), 0),
    totalQuantityLost: losses.reduce((sum, loss) => sum + loss.quantity_lost, 0),
  };

  // Calculate product report
  const productReport = {
    totalProducts: products.length,
    activeProducts: products.filter(p => p.is_active).length,
    averagePrice: products.length ? products.reduce((sum, p) => sum + p.price, 0) / products.length : 0,
  };

  // Calculate accounting report
  const accountingReport = {
    totalEntries: accountingEntries.length,
    totalDebits: accountingEntries.reduce((sum, entry) => sum + (entry.debit_amount || 0), 0),
    totalCredits: accountingEntries.reduce((sum, entry) => sum + (entry.credit_amount || 0), 0),
    balance: accountingEntries.reduce((sum, entry) => sum + (entry.debit_amount || 0) - (entry.credit_amount || 0), 0),
  };

  const handleExportReport = (reportType: string) => {
    console.log(`Exporting ${reportType} report for ${selectedPeriod}`);
    // Implementation for export functionality
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Rapports</h1>
          <p className="text-muted-foreground">Analyses et statistiques de l'activité</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Cette semaine</SelectItem>
              <SelectItem value="month">Ce mois</SelectItem>
              <SelectItem value="quarter">Ce trimestre</SelectItem>
              <SelectItem value="year">Cette année</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventes totales</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesReport.totalSales}</div>
            <p className="text-xs text-muted-foreground">
              {salesReport.totalRevenue.toLocaleString()} FCFA
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pertes</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lossesReport.totalLosses}</div>
            <p className="text-xs text-muted-foreground">
              {lossesReport.totalQuantityLost} unités perdues
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produits</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productReport.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {productReport.activeProducts} actifs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {accountingReport.balance.toLocaleString()} FCFA
            </div>
            <p className="text-xs text-muted-foreground">
              {accountingReport.totalEntries} écritures
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Report */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Rapport des ventes</CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleExportReport('sales')}
              >
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Ventes confirmées</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{salesReport.completedSales}</span>
                  <Badge variant="default">Confirmées</Badge>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ventes en attente</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{salesReport.pendingSales}</span>
                  <Badge variant="secondary">En attente</Badge>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Chiffre d'affaires total</p>
              <p className="text-3xl font-bold text-green-600">
                {salesReport.totalRevenue.toLocaleString()} FCFA
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Losses Report */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Rapport des pertes</CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleExportReport('losses')}
              >
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Nombre total de pertes</p>
              <p className="text-3xl font-bold text-red-600">{lossesReport.totalLosses}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Quantité totale perdue</p>
              <p className="text-2xl font-bold">{lossesReport.totalQuantityLost} unités</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Valeur des pertes</p>
              <p className="text-2xl font-bold text-red-600">
                {lossesReport.totalLossValue.toLocaleString()} FCFA
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Product Report */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Rapport des produits</CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleExportReport('products')}
              >
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Produits totaux</p>
                <p className="text-2xl font-bold">{productReport.totalProducts}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Produits actifs</p>
                <p className="text-2xl font-bold text-green-600">{productReport.activeProducts}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Prix moyen</p>
              <p className="text-2xl font-bold">
                {productReport.averagePrice.toLocaleString()} FCFA
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Accounting Report */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Rapport comptable</CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleExportReport('accounting')}
              >
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total débits</p>
                <p className="text-2xl font-bold text-blue-600">
                  {accountingReport.totalDebits.toLocaleString()} FCFA
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total crédits</p>
                <p className="text-2xl font-bold text-green-600">
                  {accountingReport.totalCredits.toLocaleString()} FCFA
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Balance nette</p>
              <p className={`text-3xl font-bold ${accountingReport.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {accountingReport.balance.toLocaleString()} FCFA
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
