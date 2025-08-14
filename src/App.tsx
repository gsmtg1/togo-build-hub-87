
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Stock from "./pages/Stock";
import Production from "./pages/Production";
import OrdresProduction from "./pages/OrdresProduction";
import Ventes from "./pages/Ventes";
import Livraisons from "./pages/Livraisons";
import Factures from "./pages/Factures";
import Devis from "./pages/Devis";
import Comptabilite from "./pages/Comptabilite";
import Employes from "./pages/Employes";
import Pertes from "./pages/Pertes";
import Objectifs from "./pages/Objectifs";
import Rapports from "./pages/Rapports";
import Notifications from "./pages/Notifications";
import Parametres from "./pages/Parametres";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Index />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="stock" element={<Stock />} />
            <Route path="production" element={<Production />} />
            <Route path="ordres-production" element={<OrdresProduction />} />
            <Route path="ventes" element={<Ventes />} />
            <Route path="livraisons" element={<Livraisons />} />
            <Route path="factures" element={<Factures />} />
            <Route path="devis" element={<Devis />} />
            <Route path="comptabilite" element={<Comptabilite />} />
            <Route path="employes" element={<Employes />} />
            <Route path="pertes" element={<Pertes />} />
            <Route path="objectifs" element={<Objectifs />} />
            <Route path="rapports" element={<Rapports />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="parametres" element={<Parametres />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
