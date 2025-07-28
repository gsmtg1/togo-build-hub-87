
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Package, Truck, DollarSign } from 'lucide-react';

const activities = [
  {
    id: 1,
    type: 'production',
    icon: Package,
    title: 'Production terminée',
    description: '500 briques 15x20x30',
    time: 'Il y a 2h',
    status: 'success'
  },
  {
    id: 2,
    type: 'delivery',
    icon: Truck,
    title: 'Livraison effectuée',
    description: 'Client Adjokè - 200 briques',
    time: 'Il y a 4h',
    status: 'success'
  },
  {
    id: 3,
    type: 'sale',
    icon: DollarSign,
    title: 'Vente enregistrée',
    description: '150,000 FCFA - Vente locale',
    time: 'Il y a 6h',
    status: 'success'
  },
  {
    id: 4,
    type: 'stock',
    icon: Package,
    title: 'Stock faible',
    description: 'Briques 6x20x30 sous le seuil',
    time: 'Il y a 8h',
    status: 'warning'
  }
];

export const RecentActivity = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Activité récente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className={`p-2 rounded-full ${
                activity.status === 'success' ? 'bg-green-100' : 
                activity.status === 'warning' ? 'bg-orange-100' : 'bg-gray-100'
              }`}>
                <activity.icon className={`h-4 w-4 ${
                  activity.status === 'success' ? 'text-green-600' : 
                  activity.status === 'warning' ? 'text-orange-600' : 'text-gray-600'
                }`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
