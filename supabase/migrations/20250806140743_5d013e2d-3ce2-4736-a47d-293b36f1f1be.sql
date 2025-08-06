
-- Créer les tables manquantes pour corriger les erreurs

-- Table pour les objectifs mensuels (monthly_goals)
CREATE TABLE IF NOT EXISTS public.monthly_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  target_value NUMERIC NOT NULL,
  current_value NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les entrées comptables (accounting_entries)
CREATE TABLE IF NOT EXISTS public.accounting_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT NOT NULL,
  account_name TEXT NOT NULL,
  debit_amount NUMERIC DEFAULT 0,
  credit_amount NUMERIC DEFAULT 0,
  reference TEXT,
  category TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les catégories comptables
CREATE TABLE IF NOT EXISTS public.accounting_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  account_type TEXT NOT NULL CHECK (account_type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les pertes quotidiennes (daily_losses)
CREATE TABLE IF NOT EXISTS public.daily_losses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity_lost INTEGER NOT NULL,
  loss_date DATE NOT NULL DEFAULT CURRENT_DATE,
  loss_value NUMERIC,
  responsible TEXT,
  comments TEXT,
  loss_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les paramètres de l'application
CREATE TABLE IF NOT EXISTS public.app_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cle TEXT NOT NULL UNIQUE,
  valeur TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS sur toutes les tables
ALTER TABLE public.monthly_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounting_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounting_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_losses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS pour permettre l'accès à tous
CREATE POLICY "Monthly goals are viewable by everyone" ON public.monthly_goals FOR SELECT USING (true);
CREATE POLICY "Users can manage monthly goals" ON public.monthly_goals FOR ALL USING (true);

CREATE POLICY "Accounting entries are viewable by everyone" ON public.accounting_entries FOR SELECT USING (true);
CREATE POLICY "Users can manage accounting entries" ON public.accounting_entries FOR ALL USING (true);

CREATE POLICY "Accounting categories are viewable by everyone" ON public.accounting_categories FOR SELECT USING (true);
CREATE POLICY "Users can manage accounting categories" ON public.accounting_categories FOR ALL USING (true);

CREATE POLICY "Daily losses are viewable by everyone" ON public.daily_losses FOR SELECT USING (true);
CREATE POLICY "Users can manage daily losses" ON public.daily_losses FOR ALL USING (true);

CREATE POLICY "App settings are viewable by everyone" ON public.app_settings FOR SELECT USING (true);
CREATE POLICY "Users can manage app settings" ON public.app_settings FOR ALL USING (true);

-- Créer le trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Appliquer le trigger aux nouvelles tables
CREATE TRIGGER update_monthly_goals_updated_at BEFORE UPDATE ON public.monthly_goals FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_accounting_entries_updated_at BEFORE UPDATE ON public.accounting_entries FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_accounting_categories_updated_at BEFORE UPDATE ON public.accounting_categories FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_daily_losses_updated_at BEFORE UPDATE ON public.daily_losses FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON public.app_settings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Insérer quelques données de base pour les catégories comptables
INSERT INTO public.accounting_categories (name, description, account_type) VALUES
('Ventes', 'Revenus des ventes de briques', 'revenue'),
('Achats matières premières', 'Coûts des matières premières', 'expense'),
('Salaires', 'Coûts de main-d''œuvre', 'expense'),
('Équipements', 'Actifs équipements', 'asset'),
('Fournisseurs', 'Dettes fournisseurs', 'liability')
ON CONFLICT (name) DO NOTHING;

-- Insérer les paramètres de base pour CORNERSTONE BRIQUES
INSERT INTO public.app_settings (cle, valeur, description) VALUES
('nom_entreprise', 'CORNERSTONE BRIQUES', 'Nom de l''entreprise'),
('telephone1', '+228 90 96 49 93', 'Numéro de téléphone principal'),
('telephone2', '+228 99 87 01 95', 'Numéro de téléphone secondaire'),
('slogan', 'Votre partenaire de confiance pour des briques de qualité', 'Slogan de l''entreprise'),
('adresse', 'Akodessewa, après les rails, non loin de la station d''essence CM', 'Adresse de l''entreprise'),
('ville', 'Lomé', 'Ville'),
('pays', 'Togo', 'Pays'),
('email', 'contact@cornerstonebriques.tg', 'Email de contact'),
('site_web', 'www.cornerstonebriques.tg', 'Site web')
ON CONFLICT (cle) DO NOTHING;
