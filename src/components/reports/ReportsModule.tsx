
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { Badge } from '@/components/ui/badge';
import { useDailyLosses, useAccountingEntries, useSales, useProductionOrders, useProducts } from '@/hooks/useSupabaseDatabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Package, AlertTriangle } from 'lucide-react';
import { DateRange } from 'react-day-picker';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const ReportsModule = () => {
  const [selectedReport, setSelectedReport] = useState<string>('pertes');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  
  const { data: losses } = useDailyLosses();
  const { data: accountingEntries } = useAccountingEntries();
  const { data: sales } = useSales();
  const { data: productionOrders } = useProductionOrders();
  const { data: products } = useProducts();

  const filteredLosses = losses.filter(loss => {
    const lossDate = new Date(loss.loss_date);
    if (!dateRange?.from || !dateRange?.to) return true;
    return lossDate >= dateRange.from && lossDate <= dateRange.to;
  });

  const totalLossValue = filteredLosses.reduce((sum, loss) => sum + (loss.loss_value || 0), 0);

  const lossesData = filteredLosses.reduce((acc, loss) => {
    const product = products.find(p => p.id === loss.product_id);
    const productName = product ? (product.name || product.nom) : 'Produit inconnu';
    const existing = acc.find(item => item.name === productName);
    
    if (existing) {
      existing.value += loss.loss_value || 0;
      existing.quantity += loss.quantity_lost;
    } else {
      acc.push({
        name: productName,
        value: loss.loss_value || 0,
        quantity: loss.quantity_lost
      });
    }
    return acc;
  }, [] as Array<{ name: string; value: number; quantity: number }>);

  const renderLossesReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total pertes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredLosses.length}</div>
            <p className="text-xs text-muted-foreground">enregistrements</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quantité perdue</CardTitle>
            <Package className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredLosses.reduce((sum, loss) => sum + loss.quantity_lost, 0)}
            </div>
            <p className="text-xs text-muted-foreground">unités</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valeur perdue</CardTitle>
            <DollarSign className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {totalLossValue.toLocaleString()} FCFA
            </div>
          </CardContent>
        </Card>
      </div>

      {lossesData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Pertes par produit (Valeur)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={lossesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {lossesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${Number(value).toLocaleString()} FCFA`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pertes par produit (Quantité)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={lossesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="quantity" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Détail des pertes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredLosses.map((loss) => {
              const product = products.find(p => p.id === loss.product_id);
              return (
                <div key={loss.id} className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <p className="font-medium">{product ? (product.name || product.nom) : 'Produit inconnu'}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(loss.loss_date).toLocaleDateString('fr-FR')} - {loss.loss_type}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="destructive">-{loss.quantity_lost}</Badge>
                    <p className="text-sm text-red-600 font-medium">
                      -{(loss.loss_value || 0).toLocaleString()} FCFA
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSalesReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total ventes</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sales.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chiffre d'affaires</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {sales.reduce((sum, sale) => sum + (sale.montant_total || 0), 0).toLocaleString()} FCFA
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventes confirmées</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sales.filter(s => s.statut === 'confirmee').length}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderProductionReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ordres actifs</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {productionOrders.filter(o => o.status !== 'cancelled').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Production planifiée</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {productionOrders.reduce((sum, o) => sum + (o.planned_quantity || 0), 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Production réalisée</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {productionOrders.reduce((sum, o) => sum + (o.produced_quantity || 0), 0)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const reportTypes = {
    pertes: { label: 'Rapport des Pertes', component: renderLossesReport },
    ventes: { label: 'Rapport des Ventes', component: renderSalesReport },
    production: { label: 'Rapport de Production', component: renderProductionReport },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Rapports</h2>
          <p className="text-muted-foreground">Analysez les performances de votre entreprise</p>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <Select value={selectedReport} onValueChange={setSelectedReport}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Type de rapport" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(reportTypes).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DatePickerWithRange 
            date={dateRange} 
            setDate={setDateRange}
            placeholder="Sélectionner une période"
          />
        </div>
      </div>

      {reportTypes[selectedReport as keyof typeof reportTypes]?.component()}
    </div>
  );
};
