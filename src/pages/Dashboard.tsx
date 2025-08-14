
import { ClassicDashboardStats } from '@/components/dashboard/ClassicDashboardStats';
import { ClassicDashboardAlerts } from '@/components/dashboard/ClassicDashboardAlerts';
import { ClassicDashboardCharts } from '@/components/dashboard/ClassicDashboardCharts';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-600">Vue d'ensemble de votre activité</p>
      </div>

      {/* Statistiques */}
      <ClassicDashboardStats />

      {/* Alertes et notifications */}
      <ClassicDashboardAlerts />

      {/* Graphiques et analyses */}
      <ClassicDashboardCharts />
    </div>
  );
}
