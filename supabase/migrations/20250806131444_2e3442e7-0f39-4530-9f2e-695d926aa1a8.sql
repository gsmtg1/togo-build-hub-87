
-- Créer la table monthly_goals (objectifs mensuels)
CREATE TABLE IF NOT EXISTS public.monthly_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  target_amount NUMERIC NOT NULL DEFAULT 0,
  current_amount NUMERIC NOT NULL DEFAULT 0,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  employee_id UUID REFERENCES public.employees(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer la table accounting_entries (écritures comptables)
CREATE TABLE IF NOT EXISTS public.accounting_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'salary', 'charge')),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  operation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT CHECK (payment_method IN ('cash', 'transfer', 'check', 'mobile_money')),
  external_reference TEXT,
  employee_id UUID REFERENCES public.employees(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer la table daily_losses (pertes quotidiennes)
CREATE TABLE IF NOT EXISTS public.daily_losses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id),
  loss_date DATE NOT NULL DEFAULT CURRENT_DATE,
  quantity_lost INTEGER NOT NULL,
  loss_value NUMERIC NOT NULL DEFAULT 0,
  responsible TEXT,
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer la table stock_movements (mouvements de stock)
CREATE TABLE IF NOT EXISTS public.stock_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id),
  movement_type TEXT NOT NULL CHECK (movement_type IN ('in', 'out', 'adjustment')),
  quantity INTEGER NOT NULL,
  reference_type TEXT CHECK (reference_type IN ('sale', 'production', 'loss', 'adjustment')),
  reference_id UUID,
  notes TEXT,
  movement_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ajouter RLS pour toutes les tables
ALTER TABLE public.monthly_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounting_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_losses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour monthly_goals
CREATE POLICY "Monthly goals are viewable by everyone" ON public.monthly_goals FOR SELECT USING (true);
CREATE POLICY "Users can manage monthly goals" ON public.monthly_goals FOR ALL USING (true);

-- Politiques RLS pour accounting_entries
CREATE POLICY "Accounting entries are viewable by everyone" ON public.accounting_entries FOR SELECT USING (true);
CREATE POLICY "Users can manage accounting entries" ON public.accounting_entries FOR ALL USING (true);

-- Politiques RLS pour daily_losses
CREATE POLICY "Daily losses are viewable by everyone" ON public.daily_losses FOR SELECT USING (true);
CREATE POLICY "Users can manage daily losses" ON public.daily_losses FOR ALL USING (true);

-- Politiques RLS pour stock_movements
CREATE POLICY "Stock movements are viewable by everyone" ON public.stock_movements FOR SELECT USING (true);
CREATE POLICY "Users can manage stock movements" ON public.stock_movements FOR ALL USING (true);

-- Mettre à jour les informations de l'entreprise dans la config
UPDATE public.products SET is_active = true WHERE is_active IS NULL;

-- Insérer les produits de Cornerstone Briques s'ils n'existent pas déjà
INSERT INTO public.products (name, type, dimensions, price, description, unit, is_active) VALUES
-- Briques creuses
('10 Creux', 'creuse', '40cm x 20cm x 10cm', 150, 'Brique creuse 10cm', 'pièce', true),
('12 Creux', 'creuse', '40cm x 20cm x 12cm', 175, 'Brique creuse 12cm', 'pièce', true),
('15 Creux', 'creuse', '40cm x 20cm x 15cm', 200, 'Brique creuse 15cm', 'pièce', true),
('20 Creux', 'creuse', '40cm x 20cm x 20cm', 225, 'Brique creuse 20cm', 'pièce', true),
-- Briques pleines
('10 Plein', 'pleine', '40cm x 20cm x 10cm', 180, 'Brique pleine 10cm', 'pièce', true),
('12 Plein', 'pleine', '40cm x 20cm x 12cm', 210, 'Brique pleine 12cm', 'pièce', true),
('15 Plein', 'pleine', '40cm x 20cm x 15cm', 240, 'Brique pleine 15cm', 'pièce', true),
('20 Plein', 'pleine', '40cm x 20cm x 20cm', 270, 'Brique pleine 20cm', 'pièce', true),
-- Hourdis
('Hourdis 12', 'hourdis', '60cm x 20cm x 12cm', 400, 'Hourdis 12cm', 'pièce', true),
('Hourdis 15', 'hourdis', '60cm x 20cm x 15cm', 450, 'Hourdis 15cm', 'pièce', true)
ON CONFLICT (name) DO NOTHING;

-- Créer un stock initial pour chaque produit
INSERT INTO public.stock (product_id, quantity, minimum_stock, location)
SELECT p.id, 0, 10, 'Magasin principal'
FROM public.products p
WHERE NOT EXISTS (SELECT 1 FROM public.stock s WHERE s.product_id = p.id);
