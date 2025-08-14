
-- Créer une table clients dédiée pour centraliser les informations client
CREATE TABLE IF NOT EXISTS public.clients_complets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nom_complet TEXT NOT NULL,
  telephone TEXT,
  adresse TEXT,
  email TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer une table pour les factures professionnelles
CREATE TABLE IF NOT EXISTS public.factures_professionnelles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_facture TEXT NOT NULL UNIQUE,
  client_id UUID REFERENCES public.clients_complets(id),
  client_nom TEXT NOT NULL,
  client_telephone TEXT,
  client_adresse TEXT,
  date_facture DATE NOT NULL DEFAULT CURRENT_DATE,
  date_echeance DATE,
  statut TEXT NOT NULL DEFAULT 'brouillon' CHECK (statut IN ('brouillon', 'envoyee', 'payee', 'en_retard', 'annulee')),
  montant_total NUMERIC NOT NULL DEFAULT 0,
  montant_paye NUMERIC NOT NULL DEFAULT 0,
  vendeur_id UUID REFERENCES public.employees(id),
  sale_id UUID REFERENCES public.sales(id),
  delivery_id UUID REFERENCES public.deliveries(id),
  commentaires TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer une table pour les lignes de facture (produits dans la facture)
CREATE TABLE IF NOT EXISTS public.facture_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  facture_id UUID NOT NULL REFERENCES public.factures_professionnelles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  nom_produit TEXT NOT NULL,
  quantite INTEGER NOT NULL DEFAULT 1,
  prix_unitaire NUMERIC NOT NULL DEFAULT 0,
  total_ligne NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer une table pour les devis professionnels
CREATE TABLE IF NOT EXISTS public.devis_professionnels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_devis TEXT NOT NULL UNIQUE,
  client_id UUID REFERENCES public.clients_complets(id),
  client_nom TEXT NOT NULL,
  client_telephone TEXT,
  client_adresse TEXT,
  date_devis DATE NOT NULL DEFAULT CURRENT_DATE,
  date_echeance DATE NOT NULL,
  statut TEXT NOT NULL DEFAULT 'brouillon' CHECK (statut IN ('brouillon', 'envoye', 'accepte', 'refuse', 'expire')),
  montant_total NUMERIC NOT NULL DEFAULT 0,
  vendeur_id UUID REFERENCES public.employees(id),
  commentaires TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer une table pour les lignes de devis
CREATE TABLE IF NOT EXISTS public.devis_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  devis_id UUID NOT NULL REFERENCES public.devis_professionnels(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  nom_produit TEXT NOT NULL,
  quantite INTEGER NOT NULL DEFAULT 1,
  prix_unitaire NUMERIC NOT NULL DEFAULT 0,
  total_ligne NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Mettre à jour la table sales pour inclure l'historique complet
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS client_nom TEXT;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS client_telephone TEXT;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS client_adresse TEXT;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS vendeur_nom TEXT;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS commentaires TEXT;

-- Créer une table pour les ordres de production de briques
CREATE TABLE IF NOT EXISTS public.ordres_production_briques (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_ordre TEXT NOT NULL UNIQUE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantite_planifiee INTEGER NOT NULL,
  quantite_produite INTEGER NOT NULL DEFAULT 0,
  date_lancement DATE NOT NULL DEFAULT CURRENT_DATE,
  date_fin_prevue DATE,
  date_fin_reelle DATE,
  statut TEXT NOT NULL DEFAULT 'planifie' CHECK (statut IN ('planifie', 'en_cours', 'termine', 'annule')),
  responsable_production TEXT,
  cout_materiel NUMERIC DEFAULT 0,
  cout_main_oeuvre NUMERIC DEFAULT 0,
  cout_total NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ajouter des politiques RLS pour toutes les nouvelles tables
ALTER TABLE public.clients_complets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.factures_professionnelles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facture_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devis_professionnels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devis_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordres_production_briques ENABLE ROW LEVEL SECURITY;

-- Créer les politiques pour permettre à tous les utilisateurs d'accéder aux données
CREATE POLICY "Clients complets are viewable by everyone" ON public.clients_complets FOR SELECT USING (true);
CREATE POLICY "Users can manage clients complets" ON public.clients_complets FOR ALL USING (true);

CREATE POLICY "Factures professionnelles are viewable by everyone" ON public.factures_professionnelles FOR SELECT USING (true);
CREATE POLICY "Users can manage factures professionnelles" ON public.factures_professionnelles FOR ALL USING (true);

CREATE POLICY "Facture items are viewable by everyone" ON public.facture_items FOR SELECT USING (true);
CREATE POLICY "Users can manage facture items" ON public.facture_items FOR ALL USING (true);

CREATE POLICY "Devis professionnels are viewable by everyone" ON public.devis_professionnels FOR SELECT USING (true);
CREATE POLICY "Users can manage devis professionnels" ON public.devis_professionnels FOR ALL USING (true);

CREATE POLICY "Devis items are viewable by everyone" ON public.devis_items FOR SELECT USING (true);
CREATE POLICY "Users can manage devis items" ON public.devis_items FOR ALL USING (true);

CREATE POLICY "Ordres production briques are viewable by everyone" ON public.ordres_production_briques FOR SELECT USING (true);
CREATE POLICY "Users can manage ordres production briques" ON public.ordres_production_briques FOR ALL USING (true);

-- Créer des triggers pour mettre à jour les timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clients_complets_updated_at BEFORE UPDATE ON public.clients_complets FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_factures_professionnelles_updated_at BEFORE UPDATE ON public.factures_professionnelles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_devis_professionnels_updated_at BEFORE UPDATE ON public.devis_professionnels FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_ordres_production_briques_updated_at BEFORE UPDATE ON public.ordres_production_briques FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
