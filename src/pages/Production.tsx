
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Clock, CheckCircle, XCircle } from 'lucide-react';

const Production = () => {
  const ordres = [
    {
      id: 'OP-001',
      type: 'Briques 15x20x30',
      quantite: 1000,
      date: '2025-01-28',
      statut: 'en-cours',
      progression: 75
    },
    {
      id: 'OP-002',
      type: 'Briques 10x20x30',
      quantite: 800,
      date: '2025-01-27',
      statut: 'termine',
      progression: 100
    },
    {
      id: 'OP-003',
      type: 'Briques 8x20x30',
      quantite: 1200,
      date: '2025-01-29',
      statut: 'en-attente',
      progression: 0
    }
  ];

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'en-cours':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="mr-1 h-3 w-3" />En cours</Badge>;
      case 'termine':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="mr-1 h-3 w-3" />Terminé</Badge>;
      case 'en-attente':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800"><XCircle className="mr-1 h-3 w-3" />En attente</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Ordres de production</h1>
        <Button className="bg-orange-500 hover:bg-orange-600">
          <Plus className="mr-2 h-4 w-4" />
          Nouvel ordre
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-yellow-600">En attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-sm text-gray-500">ordre en validation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-blue-600">En cours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-sm text-gray-500">ordre en production</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-green-600">Terminés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-sm text-gray-500">ordre finalisé</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des ordres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ordres.map((ordre) => (
              <div key={ordre.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <h3 className="font-semibold text-lg">{ordre.id}</h3>
                    {getStatutBadge(ordre.statut)}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Modifier</Button>
                    <Button variant="outline" size="sm">Voir détails</Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div>
                    <span className="text-sm text-gray-500">Type de brique</span>
                    <p className="font-medium">{ordre.type}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Quantité</span>
                    <p className="font-medium">{ordre.quantite.toLocaleString()} unités</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Date prévue</span>
                    <p className="font-medium">{new Date(ordre.date).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>

                {ordre.statut === 'en-cours' && (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-500">Progression</span>
                      <span className="text-sm font-medium">{ordre.progression}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${ordre.progression}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Production;
