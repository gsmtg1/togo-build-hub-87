
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, TrendingUp, DollarSign, Users } from 'lucide-react';

const stats = [
  {
    title: 'Stock total',
    value: '15,240',
    unit: 'briques',
    change: '+2.5%',
    changeType: 'positive' as const,
    icon: Package,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    title: 'Production du mois',
    value: '3,850',
    unit: 'briques',
    change: '+12%',
    changeType: 'positive' as const,
    icon: TrendingUp,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    title: 'Chiffre d\'affaires',
    value: '2,340,000',
    unit: 'FCFA',
    change: '+8.2%',
    changeType: 'positive' as const,
    icon: DollarSign,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
  {
    title: 'Employés actifs',
    value: '28',
    unit: 'personnes',
    change: '+2',
    changeType: 'positive' as const,
    icon: Users,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
];

export const DashboardStats = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => (
        <Card key={stat.title} className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-full ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stat.value}
            </div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-500">{stat.unit}</p>
              <p className={`text-xs font-medium ${
                stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
