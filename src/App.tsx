
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AppLayout } from '@/components/layout/AppLayout';

// Pages existantes
import { Index } from '@/pages/Index';
import { Dashboard } from '@/pages/Dashboard';
import { Stock } from '@/pages/Stock';
import { Ventes } from '@/pages/Ventes';
import { Production } from '@/pages/Production';
import { OrdresProduction } from '@/pages/OrdresProduction';
import { Livraisons } from '@/pages/Livraisons';
import { Factures } from '@/pages/Factures';
import { Devis } from '@/pages/Devis';
import { Employes } from '@/pages/Employes';
import { Comptabilite } from '@/pages/Comptabilite';
import { Objectifs } from '@/pages/Objectifs';
import { Rapports } from '@/pages/Rapports';
import { Pertes } from '@/pages/Pertes';
import { Notifications } from '@/pages/Notifications';
import { Parametres } from '@/pages/Parametres';
import { NotFound } from '@/pages/NotFound';

// Nouveaux modules
import { FacturesProfessionnelles } from '@/pages/FacturesProfessionnelles';
import { DevisProfessionnels } from '@/pages/DevisProfessionnels';
import { GestionClients } from '@/pages/GestionClients';
import { VentesAméliorées } from '@/pages/VentesAméliorées';
import { GestionProductionBriques } from '@/components/production/GestionProductionBriques';

import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/stock" element={<Stock />} />
            <Route path="/ventes" element={<VentesAméliorées />} />
            <Route path="/ventes-pos" element={<Ventes />} />
            <Route path="/production" element={<Production />} />
            <Route path="/ordres-production" element={<OrdresProduction />} />
            <Route path="/production-briques" element={<GestionProductionBriques />} />
            <Route path="/livraisons" element={<Livraisons />} />
            <Route path="/factures" element={<FacturesProfessionnelles />} />
            <Route path="/factures-anciennes" element={<Factures />} />
            <Route path="/devis" element={<DevisProfessionnels />} />
            <Route path="/devis-anciens" element={<Devis />} />
            <Route path="/clients" element={<GestionClients />} />
            <Route path="/employes" element={<Employes />} />
            <Route path="/comptabilite" element={<Comptabilite />} />
            <Route path="/objectifs" element={<Objectifs />} />
            <Route path="/rapports" element={<Rapports />} />
            <Route path="/pertes" element={<Pertes />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/parametres" element={<Parametres />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
