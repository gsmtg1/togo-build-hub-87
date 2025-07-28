
-- Tables pour le module Comptabilité
CREATE TABLE public.accounting_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.accounting_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  category_id UUID REFERENCES public.accounting_categories(id),
  reference_number TEXT,
  payment_method TEXT CHECK (payment_method IN ('cash', 'bank_transfer', 'check', 'mobile_money')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tables pour le module Estimation du coût de production
CREATE TABLE public.production_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  unit_cost DECIMAL(10,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.brick_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  dimensions TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.production_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brick_type_id UUID REFERENCES public.brick_types(id),
  material_id UUID REFERENCES public.production_materials(id),
  quantity DECIMAL(10,3) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(brick_type_id, material_id)
);

CREATE TABLE public.production_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brick_type_id UUID REFERENCES public.brick_types(id),
  calculated_cost DECIMAL(10,2) NOT NULL,
  calculation_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  notes TEXT
);

-- Tables pour le module Objectifs mensuels
CREATE TABLE public.monthly_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  target_quantity INTEGER NOT NULL,
  current_quantity INTEGER DEFAULT 0,
  target_amount DECIMAL(15,2),
  current_amount DECIMAL(15,2) DEFAULT 0,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  brick_type_id UUID REFERENCES public.brick_types(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tables pour le module Paramètres
CREATE TABLE public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.invoice_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  template_data JSONB NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tables pour la sauvegarde locale
CREATE TABLE public.sync_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  last_sync TIMESTAMP WITH TIME ZONE DEFAULT now(),
  sync_status TEXT DEFAULT 'synced' CHECK (sync_status IN ('synced', 'pending', 'error')),
  error_message TEXT
);

-- Insérer les catégories comptables par défaut
INSERT INTO public.accounting_categories (name, description) VALUES
('Salaires', 'Salaires et charges sociales'),
('Matières premières', 'Achat de ciment, sable, eau, etc.'),
('Énergie', 'Électricité, carburant, etc.'),
('Maintenance', 'Réparation et entretien des équipements'),
('Transport', 'Frais de transport et livraison'),
('Administration', 'Frais généraux et administratifs'),
('Taxes', 'Impôts et taxes diverses');

-- Insérer les matériaux par défaut
INSERT INTO public.production_materials (name, unit, unit_cost, description) VALUES
('Ciment', 'sac', 5500, 'Sac de ciment de 50kg'),
('Sable', 'm3', 15000, 'Mètre cube de sable'),
('Eau', 'litre', 0.5, 'Eau potable'),
('Électricité', 'kWh', 85, 'Kilowatt-heure'),
('Main d''œuvre', 'heure', 800, 'Heure de travail'),
('Carburant', 'litre', 650, 'Carburant pour machines');

-- Insérer les types de briques par défaut
INSERT INTO public.brick_types (name, dimensions) VALUES
('Brique 15x20x30', '15cm x 20cm x 30cm'),
('Brique 10x20x30', '10cm x 20cm x 30cm'),
('Brique 8x20x30', '8cm x 20cm x 30cm');

-- Insérer les paramètres par défaut
INSERT INTO public.app_settings (setting_key, setting_value, description) VALUES
('company_info', '{"name": "Cornerstone Briques", "address": "Lomé, Togo", "phone": "+228 XX XX XX XX", "email": "contact@cornerstone-briques.tg"}', 'Informations de l''entreprise'),
('invoice_settings', '{"logo": "", "header_text": "Cornerstone Briques - Votre partenaire de confiance", "footer_text": "Merci pour votre confiance", "primary_color": "#ea580c", "secondary_color": "#f97316"}', 'Paramètres des factures'),
('alert_thresholds', '{"stock_minimum": 100, "production_delay": 7}', 'Seuils d''alerte'),
('units', '{"weight": "kg", "volume": "m3", "length": "cm"}', 'Unités de mesure');

-- Activer Row Level Security sur toutes les tables
ALTER TABLE public.accounting_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounting_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brick_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_status ENABLE ROW LEVEL SECURITY;

-- Créer des politiques RLS permissives pour l'instant (à ajuster selon les besoins d'authentification)
CREATE POLICY "Allow all operations" ON public.accounting_categories FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON public.accounting_entries FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON public.production_materials FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON public.brick_types FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON public.production_recipes FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON public.production_costs FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON public.monthly_goals FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON public.app_settings FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON public.invoice_templates FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON public.sync_status FOR ALL USING (true);

-- Créer des indexes pour améliorer les performances
CREATE INDEX idx_accounting_entries_date ON public.accounting_entries(date);
CREATE INDEX idx_accounting_entries_category ON public.accounting_entries(category_id);
CREATE INDEX idx_monthly_goals_month_year ON public.monthly_goals(month, year);
CREATE INDEX idx_production_recipes_brick_type ON public.production_recipes(brick_type_id);
CREATE INDEX idx_sync_status_table ON public.sync_status(table_name);
