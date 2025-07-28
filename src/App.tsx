
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import Production from '@/pages/Production';
import { OrdresProduction } from '@/pages/OrdresProduction';
import { Livraisons } from '@/pages/Livraisons';
import Stock from '@/pages/Stock';
import Ventes from '@/pages/Ventes';
import Comptabilite from '@/pages/Comptabilite';
import Employes from '@/pages/Employes';
import Devis from '@/pages/Devis';
import Factures from '@/pages/Factures';
import Objectifs from '@/pages/Objectifs';
import Parametres from '@/pages/Parametres';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Index />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="production" element={<Production />} />
            <Route path="ordres-production" element={<OrdresProduction />} />
            <Route path="livraisons" element={<Livraisons />} />
            <Route path="stock" element={<Stock />} />
            <Route path="ventes" element={<Ventes />} />
            <Route path="comptabilite" element={<Comptabilite />} />
            <Route path="employes" element={<Employes />} />
            <Route path="devis" element={<Devis />} />
            <Route path="factures" element={<Factures />} />
            <Route path="objectifs" element={<Objectifs />} />
            <Route path="parametres" element={<Parametres />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
