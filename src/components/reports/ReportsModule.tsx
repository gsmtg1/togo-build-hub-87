
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, Download, FileText, TrendingUp, Package, DollarSign } from 'lucide-react';
import { useProducts, useSales, useDailyLosses, useAccountingEntries } from '@/hooks/useSupabaseDatabase';

export const ReportsModule = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const { data: products } = useProducts();
  const { data: sales } = useSales();
  const { data: losses } = useDailyLosses();
  const { data: accountingEntries } = useAccountingEntries();

  // Calculate total losses value
  const totalLossesValue = losses.reduce((sum, loss) => {
    return sum + (loss.loss_value || 0);
  }, 0);

  // Calculate sales statistics
  const totalSales = sales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
  const totalSalesCount = sales.length;

  // Calculate accounting statistics
  const totalRevenue = accountingEntries
    .filter(entry => entry.credit_amount > 0)
    .reduce((sum, entry) => sum + entry.credit_amount, 0);
  
  const totalExpenses = accountingEntries
    .filter(entry => entry.debit_amount > 0)
    .reduce((sum, entry) => sum + entry.debit_amount, 0);

  const generateSalesReport = () => {
    console.log('Génération du rapport des ventes...');
    // Logic to generate sales report
  };

  const generateLossesReport = () => {
    console.log('Génération du rapport des pertes...');
    // Logic to generate losses report
  };

  const generateFinancialReport = () => {
    console.log('Génération du rapport financier...');
    // Logic to generate financial report
  };

  const generateProductionReport = () => {
    console.log('Génération du rapport de production...');
    // Logic to generate production report
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Rapports</h1>
        <p className="text-muted-foreground">
          Générez et consultez vos rapports d'activité
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="sales">Ventes</TabsTrigger>
          <TabsTrigger value="losses">Pertes</TabsTrigger>
          <TabsTrigger value="financial">Financier</TabsTrigger>
          <TabsTrigger value="production">Production</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Ventes</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalSales.toLocaleString()} FCFA</div>
                <p className="text-xs text-muted-foreground">
                  {totalSalesCount} ventes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenus</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalRevenue.toLocaleString()} FCFA</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Dépenses</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalExpenses.toLocaleString()} FCFA</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pertes</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalLossesValue.toLocaleString()} FCFA</div>
                <p className="text-xs text-muted-foreground">
                  {losses.length} incidents
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rapport des Ventes</CardTitle>
              <CardDescription>
                Analysez les performances de vos ventes sur différentes périodes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="space-x-2">
                  <Button
                    variant={selectedPeriod === 'weekly' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedPeriod('weekly')}
                  >
                    Hebdomadaire
                  </Button>
                  <Button
                    variant={selectedPeriod === 'monthly' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedPeriod('monthly')}
                  >
                    Mensuel
                  </Button>
                  <Button
                    variant={selectedPeriod === 'yearly' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedPeriod('yearly')}
                  >
                    Annuel
                  </Button>
                </div>
                <Button onClick={generateSalesReport}>
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger
                </Button>
              </div>
              
              <div className="text-center p-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4" />
                <p>Les graphiques de ventes apparaîtront ici</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="losses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rapport des Pertes</CardTitle>
              <CardDescription>
                Suivez et analysez les pertes de production
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end mb-4">
                <Button onClick={generateLossesReport}>
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger
                </Button>
              </div>
              
              <div className="text-center p-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4" />
                <p>Les statistiques de pertes apparaîtront ici</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rapport Financier</CardTitle>
              <CardDescription>
                Bilan comptable et analyse financière
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end mb-4">
                <Button onClick={generateFinancialReport}>
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold text-green-600">Revenus</h3>
                  <p className="text-2xl font-bold">{totalRevenue.toLocaleString()} FCFA</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold text-red-600">Dépenses</h3>
                  <p className="text-2xl font-bold">{totalExpenses.toLocaleString()} FCFA</p>
                </div>
              </div>
              
              <div className="text-center p-8 text-muted-foreground">
                <DollarSign className="h-12 w-12 mx-auto mb-4" />
                <p>Les graphiques financiers apparaîtront ici</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="production" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rapport de Production</CardTitle>
              <CardDescription>
                Statistiques de production et performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end mb-4">
                <Button onClick={generateProductionReport}>
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger
                </Button>
              </div>
              
              <div className="text-center p-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4" />
                <p>Les métriques de production apparaîtront ici</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
