
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { ProductionChart } from '@/components/dashboard/ProductionChart';
import { StockChart } from '@/components/dashboard/StockChart';
import { RecentActivity } from '@/components/dashboard/RecentActivity';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
        <div className="text-sm text-gray-500">
          Dernière mise à jour: {new Date().toLocaleString('fr-FR')}
        </div>
      </div>

      <DashboardStats />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProductionChart />
        <StockChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <h3 className="text-lg font-semibold mb-4">Performance du mois</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Objectif production</span>
                <span>110%</span>
              </div>
              <div className="w-full bg-orange-400 rounded-full h-2">
                <div className="bg-white h-2 rounded-full" style={{ width: '110%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Objectif ventes</span>
                <span>95%</span>
              </div>
              <div className="w-full bg-orange-400 rounded-full h-2">
                <div className="bg-white h-2 rounded-full" style={{ width: '95%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
