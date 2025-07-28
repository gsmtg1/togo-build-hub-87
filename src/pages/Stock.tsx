
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertTriangle, Package, Search } from 'lucide-react';

const Stock = () => {
  const stockData = [
    { id: 1, type: 'Briques 15x20x30', stock: 4200, seuil: 1000, prix: 125, statut: 'bon' },
    { id: 2, type: 'Briques 10x20x30', stock: 3800, seuil: 800, prix: 95, statut: 'bon' },
    { id: 3, type: 'Briques 8x20x30', stock: 2450, seuil: 500, prix: 80, statut: 'bon' },
    { id: 4, type: 'Briques 6x20x30', stock: 390, seuil: 400, prix: 65, statut: 'critique' },
    { id: 5, type: 'Briques 20x20x30', stock: 750, seuil: 600, prix: 150, statut: 'faible' },
  ];

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'bon':
        return <Badge className="bg-green-100 text-green-800">Stock normal</Badge>;
      case 'faible':
        return <Badge className="bg-yellow-100 text-yellow-800">Stock faible</Badge>;
      case 'critique':
        return <Badge className="bg-red-100 text-red-800">Stock critique</Badge>;
      default:
        return null;
    }
  };

  const stockTotal = stockData.reduce((sum, item) => sum + item.stock, 0);
  const valeurStock = stockData.reduce((sum, item) => sum + (item.stock * item.prix), 0);
  const alertes = stockData.filter(item => item.statut !== 'bon').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Gestion du stock</h1>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Rechercher un type..." className="pl-10" />
          </div>
          <Button className="bg-orange-500 hover:bg-orange-600">
            Ajustement stock
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock total</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockTotal.toLocaleString()}</div>
            <p className="text-xs text-gray-500">briques en stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valeur du stock</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{valeurStock.toLocaleString()}</div>
            <p className="text-xs text-gray-500">FCFA</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Types de briques</CardTitle>
            <Package className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockData.length}</div>
            <p className="text-xs text-gray-500">références</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{alertes}</div>
            <p className="text-xs text-gray-500">stocks critiques</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Détail du stock par type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Type de brique</th>
                  <th className="text-left py-3 px-4">Stock actuel</th>
                  <th className="text-left py-3 px-4">Seuil d'alerte</th>
                  <th className="text-left py-3 px-4">Prix unitaire</th>
                  <th className="text-left py-3 px-4">Valeur totale</th>
                  <th className="text-left py-3 px-4">Statut</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {stockData.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{item.type}</td>
                    <td className="py-3 px-4">{item.stock.toLocaleString()}</td>
                    <td className="py-3 px-4 text-gray-500">{item.seuil.toLocaleString()}</td>
                    <td className="py-3 px-4">{item.prix} FCFA</td>
                    <td className="py-3 px-4 font-medium">{(item.stock * item.prix).toLocaleString()} FCFA</td>
                    <td className="py-3 px-4">{getStatutBadge(item.statut)}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Ajuster</Button>
                        <Button variant="outline" size="sm">Historique</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Stock;
