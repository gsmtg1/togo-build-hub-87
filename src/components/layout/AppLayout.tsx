
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { SystemAlerts } from '@/components/notifications/SystemAlerts';
import { ProductionAlerts } from '@/components/dashboard/ProductionAlerts';

export const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <main className="flex-1 p-6 lg:ml-64">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Alertes système en temps réel */}
      <SystemAlerts />
      
      {/* Alertes de production sur le dashboard uniquement */}
      {window.location.pathname === '/' && <ProductionAlerts />}
    </div>
  );
};
