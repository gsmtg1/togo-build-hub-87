
-- Créer la table pour les matériaux de production avec les champs français
CREATE TABLE IF NOT EXISTS public.materiaux_production (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  description TEXT,
  unite TEXT NOT NULL DEFAULT 'kg',
  prix_unitaire NUMERIC NOT NULL DEFAULT 0,
  stock_actuel NUMERIC NOT NULL DEFAULT 0,
  stock_minimum NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer la table pour les types de briques avec les champs français
CREATE TABLE IF NOT EXISTS public.types_briques (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  description TEXT,
  longueur_cm NUMERIC NOT NULL DEFAULT 0,
  largeur_cm NUMERIC NOT NULL DEFAULT 0,
  hauteur_cm NUMERIC NOT NULL DEFAULT 0,
  poids_kg NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer la table pour les recettes de production
CREATE TABLE IF NOT EXISTS public.recettes_production (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL,
  material_id UUID NOT NULL,
  quantite_necessaire NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer la table pour les coûts de production
CREATE TABLE IF NOT EXISTS public.couts_production (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  production_order_id UUID NOT NULL,
  material_id UUID NOT NULL,
  quantite_utilisee NUMERIC NOT NULL DEFAULT 0,
  cout_unitaire NUMERIC NOT NULL DEFAULT 0,
  cout_total NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ajouter les politiques RLS pour toutes les nouvelles tables
ALTER TABLE public.materiaux_production ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.types_briques ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recettes_production ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.couts_production ENABLE ROW LEVEL SECURITY;

-- Politiques pour materiaux_production
CREATE POLICY "Materiaux production are viewable by everyone" 
  ON public.materiaux_production 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can manage materiaux production" 
  ON public.materiaux_production 
  FOR ALL 
  USING (true);

-- Politiques pour types_briques
CREATE POLICY "Types briques are viewable by everyone" 
  ON public.types_briques 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can manage types briques" 
  ON public.types_briques 
  FOR ALL 
  USING (true);

-- Politiques pour recettes_production
CREATE POLICY "Recettes production are viewable by everyone" 
  ON public.recettes_production 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can manage recettes production" 
  ON public.recettes_production 
  FOR ALL 
  USING (true);

-- Politiques pour couts_production
CREATE POLICY "Couts production are viewable by everyone" 
  ON public.couts_production 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can manage couts production" 
  ON public.couts_production 
  FOR ALL 
  USING (true);

-- Insérer quelques données de base pour les matériaux
INSERT INTO public.materiaux_production (nom, description, unite, prix_unitaire, stock_actuel, stock_minimum) VALUES
('Argile', 'Argile pour fabrication de briques', 'tonne', 25000, 100, 10),
('Sable', 'Sable fin pour mélange', 'tonne', 15000, 50, 5),
('Ciment', 'Ciment Portland', 'sac 50kg', 4500, 200, 20),
('Eau', 'Eau pour mélange', 'litre', 1, 10000, 1000)
ON CONFLICT DO NOTHING;

-- Insérer quelques types de briques de base
INSERT INTO public.types_briques (nom, description, longueur_cm, largeur_cm, hauteur_cm, poids_kg) VALUES
('Brique Standard', 'Brique rouge standard', 20, 10, 6, 2.5),
('Brique Creuse', 'Brique creuse pour isolation', 20, 15, 10, 3.2),
('Brique Pleine', 'Brique pleine résistante', 22, 11, 6, 3.8)
ON CONFLICT DO NOTHING;

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Appliquer le trigger aux nouvelles tables
CREATE TRIGGER update_materiaux_production_updated_at BEFORE UPDATE ON public.materiaux_production FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_types_briques_updated_at BEFORE UPDATE ON public.types_briques FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_recettes_production_updated_at BEFORE UPDATE ON public.recettes_production FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_couts_production_updated_at BEFORE UPDATE ON public.couts_production FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
