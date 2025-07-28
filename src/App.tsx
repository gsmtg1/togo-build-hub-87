
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Toaster } from '@/components/ui/toaster';
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import Ventes from '@/pages/Ventes';
import Stock from '@/pages/Stock';
import Production from '@/pages/Production';
import OrdresProduction from '@/pages/OrdresProduction';
import Livraisons from '@/pages/Livraisons';
import Comptabilite from '@/pages/Comptabilite';
import Factures from '@/pages/Factures';
import Devis from '@/pages/Devis';
import Employes from '@/pages/Employes';
import Objectifs from '@/pages/Objectifs';
import Parametres from '@/pages/Parametres';
import NotFound from '@/pages/NotFound';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/ventes" element={<Ventes />} />
            <Route path="/stock" element={<Stock />} />
            <Route path="/production" element={<Production />} />
            <Route path="/ordres-production" element={<OrdresProduction />} />
            <Route path="/livraisons" element={<Livraisons />} />
            <Route path="/comptabilite" element={<Comptabilite />} />
            <Route path="/factures" element={<Factures />} />
            <Route path="/devis" element={<Devis />} />
            <Route path="/employes" element={<Employes />} />
            <Route path="/objectifs" element={<Objectifs />} />
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
