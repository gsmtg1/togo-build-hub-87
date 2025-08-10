
-- Créer la table stock_movements qui est référencée mais n'existe pas
CREATE TABLE IF NOT EXISTS public.stock_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('entree', 'sortie', 'perte', 'ajustement')),
  quantite INTEGER NOT NULL,
  motif TEXT,
  commentaire TEXT,
  date_mouvement TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ajouter RLS à stock_movements
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stock movements are viewable by everyone" 
  ON public.stock_movements 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can manage stock movements" 
  ON public.stock_movements 
  FOR ALL 
  USING (true);

-- Créer les tables manquantes référencées dans le code
CREATE TABLE IF NOT EXISTS public.production_materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT 'kg',
  cost_per_unit NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.production_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Production materials are viewable by everyone" 
  ON public.production_materials 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can manage production materials" 
  ON public.production_materials 
  FOR ALL 
  USING (true);

CREATE TABLE IF NOT EXISTS public.brick_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  dimensions TEXT NOT NULL,
  weight NUMERIC,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.brick_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brick types are viewable by everyone" 
  ON public.brick_types 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can manage brick types" 
  ON public.brick_types 
  FOR ALL 
  USING (true);

CREATE TABLE IF NOT EXISTS public.production_recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL,
  material_id UUID NOT NULL,
  quantity_needed NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.production_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Production recipes are viewable by everyone" 
  ON public.production_recipes 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can manage production recipes" 
  ON public.production_recipes 
  FOR ALL 
  USING (true);

CREATE TABLE IF NOT EXISTS public.production_costs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  production_id UUID NOT NULL,
  material_cost NUMERIC NOT NULL DEFAULT 0,
  labor_cost NUMERIC NOT NULL DEFAULT 0,
  overhead_cost NUMERIC NOT NULL DEFAULT 0,
  total_cost NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.production_costs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Production costs are viewable by everyone" 
  ON public.production_costs 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can manage production costs" 
  ON public.production_costs 
  FOR ALL 
  USING (true);

-- Ajouter un trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Ajouter les triggers aux nouvelles tables
CREATE TRIGGER update_stock_movements_updated_at BEFORE UPDATE ON stock_movements FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_production_materials_updated_at BEFORE UPDATE ON production_materials FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_brick_types_updated_at BEFORE UPDATE ON brick_types FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_production_recipes_updated_at BEFORE UPDATE ON production_recipes FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_production_costs_updated_at BEFORE UPDATE ON production_costs FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
