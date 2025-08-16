
-- Vérifier et créer les tables pour les produits des factures et devis

-- Table pour les produits des factures professionnelles
CREATE TABLE IF NOT EXISTS public.facture_produits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  facture_id UUID NOT NULL REFERENCES public.factures_professionnelles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  nom_produit TEXT NOT NULL,
  quantite INTEGER NOT NULL DEFAULT 1,
  prix_unitaire NUMERIC NOT NULL DEFAULT 0,
  total_ligne NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les produits des devis professionnels
CREATE TABLE IF NOT EXISTS public.devis_produits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  devis_id UUID NOT NULL REFERENCES public.devis_professionnels(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  nom_produit TEXT NOT NULL,
  quantite INTEGER NOT NULL DEFAULT 1,
  prix_unitaire NUMERIC NOT NULL DEFAULT 0,
  total_ligne NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS sur les nouvelles tables
ALTER TABLE public.facture_produits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devis_produits ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour facture_produits
CREATE POLICY "Facture produits are viewable by everyone" 
  ON public.facture_produits 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can manage facture produits" 
  ON public.facture_produits 
  FOR ALL 
  USING (true);

-- Politiques RLS pour devis_produits
CREATE POLICY "Devis produits are viewable by everyone" 
  ON public.devis_produits 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can manage devis produits" 
  ON public.devis_produits 
  FOR ALL 
  USING (true);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_facture_produits_facture_id ON public.facture_produits(facture_id);
CREATE INDEX IF NOT EXISTS idx_devis_produits_devis_id ON public.devis_produits(devis_id);
