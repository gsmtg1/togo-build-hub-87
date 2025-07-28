
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Comptabilite from "./pages/Comptabilite";
import Production from "./pages/Production";
import Stock from "./pages/Stock";
import Ventes from "./pages/Ventes";
import Devis from "./pages/Devis";
import Objectifs from "./pages/Objectifs";
import Employes from "./pages/Employes";
import Parametres from "./pages/Parametres";
import Factures from "./pages/Factures";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/comptabilite" element={<Comptabilite />} />
            <Route path="/production" element={<Production />} />
            <Route path="/stock" element={<Stock />} />
            <Route path="/ventes" element={<Ventes />} />
            <Route path="/devis" element={<Devis />} />
            <Route path="/objectifs" element={<Objectifs />} />
            <Route path="/employes" element={<Employes />} />
            <Route path="/parametres" element={<Parametres />} />
            <Route path="/factures" element={<Factures />} />
            <Route path="/livraison" element={<div className="p-6"><h1 className="text-2xl font-bold">Module Livraison</h1><p>En cours de développement...</p></div>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
