
import { ClassicDashboardStats } from '@/components/dashboard/ClassicDashboardStats';
import { ClassicDashboardAlerts } from '@/components/dashboard/ClassicDashboardAlerts';
import { ClassicDashboardCharts } from '@/components/dashboard/ClassicDashboardCharts';

export default function Dashboard() {
  return (
    <div className="space-y-8 bg-gray-50 min-h-screen">
      {/* En-tête avec style BrickFlow */}
      <div className="bg-white border-b border-gray-200 -mx-6 -mt-6 px-6 py-6">
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-600 mt-1">Vue d'ensemble de votre activité</p>
      </div>

      <div className="space-y-8">
        {/* Statistiques avec style BrickFlow */}
        <ClassicDashboardStats />

        {/* Alertes et notifications */}
        <ClassicDashboardAlerts />

        {/* Graphiques et analyses */}
        <ClassicDashboardCharts />
      </div>
    </div>
  );
}
