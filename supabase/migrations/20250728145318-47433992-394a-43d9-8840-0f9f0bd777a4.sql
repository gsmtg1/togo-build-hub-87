
-- Supprimer les tables existantes si elles existent pour éviter les conflits
DROP TABLE IF EXISTS public.delivery_items CASCADE;
DROP TABLE IF EXISTS public.deliveries CASCADE;
DROP TABLE IF EXISTS public.production_steps CASCADE;
DROP TABLE IF EXISTS public.production_orders CASCADE;

-- Créer la table des ordres de production
CREATE TABLE public.production_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'in_progress', 'completed', 'cancelled')),
  product_id UUID REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(10,2),
  total_amount NUMERIC(10,2),
  requested_date DATE,
  start_date DATE,
  completion_date DATE,
  initiator_name TEXT NOT NULL,
  notes TEXT,
  approval_date TIMESTAMP WITH TIME ZONE,
  approved_by TEXT,
  rejection_reason TEXT,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer la table des étapes de production
CREATE TABLE public.production_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  production_order_id UUID REFERENCES public.production_orders(id) ON DELETE CASCADE,
  step_name TEXT NOT NULL,
  step_order INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked')),
  start_date TIMESTAMP WITH TIME ZONE,
  completion_date TIMESTAMP WITH TIME ZONE,
  responsible_person TEXT,
  estimated_duration INTEGER, -- en heures
  actual_duration INTEGER, -- en heures
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer la table des livraisons
CREATE TABLE public.deliveries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  delivery_number TEXT NOT NULL UNIQUE,
  production_order_id UUID REFERENCES public.production_orders(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_transit', 'delivered', 'cancelled')),
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_address TEXT NOT NULL,
  delivery_date DATE,
  delivery_time TIME,
  transport_method TEXT,
  transport_company TEXT,
  driver_name TEXT,
  driver_phone TEXT,
  vehicle_number TEXT,
  quantity_delivered INTEGER NOT NULL,
  delivery_notes TEXT,
  received_by TEXT,
  delivery_confirmation_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer la table des produits livrés (détails de livraison)
CREATE TABLE public.delivery_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  delivery_id UUID REFERENCES public.deliveries(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(10,2),
  total_price NUMERIC(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS pour toutes les tables
ALTER TABLE public.production_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_items ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS (accès public pour l'instant)
CREATE POLICY "Allow all operations on production_orders" ON public.production_orders FOR ALL USING (true);
CREATE POLICY "Allow all operations on production_steps" ON public.production_steps FOR ALL USING (true);
CREATE POLICY "Allow all operations on deliveries" ON public.deliveries FOR ALL USING (true);
CREATE POLICY "Allow all operations on delivery_items" ON public.delivery_items FOR ALL USING (true);

-- Créer les index pour optimiser les performances
CREATE INDEX idx_production_orders_status ON public.production_orders(status);
CREATE INDEX idx_production_orders_product_id ON public.production_orders(product_id);
CREATE INDEX idx_production_orders_created_at ON public.production_orders(created_at);
CREATE INDEX idx_production_steps_order_id ON public.production_steps(production_order_id);
CREATE INDEX idx_production_steps_status ON public.production_steps(status);
CREATE INDEX idx_deliveries_production_order_id ON public.deliveries(production_order_id);
CREATE INDEX idx_deliveries_status ON public.deliveries(status);
CREATE INDEX idx_deliveries_delivery_date ON public.deliveries(delivery_date);
CREATE INDEX idx_delivery_items_delivery_id ON public.delivery_items(delivery_id);

-- Créer une fonction pour générer automatiquement les numéros d'ordre
CREATE OR REPLACE FUNCTION generate_production_order_number()
RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
    order_number TEXT;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 'OP-(\d+)') AS INTEGER)), 0) + 1
    INTO next_number
    FROM production_orders
    WHERE order_number ~ '^OP-\d+$';
    
    order_number := 'OP-' || LPAD(next_number::TEXT, 3, '0');
    RETURN order_number;
END;
$$ LANGUAGE plpgsql;

-- Créer une fonction pour générer automatiquement les numéros de livraison
CREATE OR REPLACE FUNCTION generate_delivery_number()
RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
    delivery_number TEXT;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(delivery_number FROM 'LIV-(\d+)') AS INTEGER)), 0) + 1
    INTO next_number
    FROM deliveries
    WHERE delivery_number ~ '^LIV-\d+$';
    
    delivery_number := 'LIV-' || LPAD(next_number::TEXT, 3, '0');
    RETURN delivery_number;
END;
$$ LANGUAGE plpgsql;

-- Créer des triggers pour auto-générer les numéros
CREATE OR REPLACE FUNCTION set_production_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
        NEW.order_number := generate_production_order_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_delivery_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.delivery_number IS NULL OR NEW.delivery_number = '' THEN
        NEW.delivery_number := generate_delivery_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer une fonction pour mettre à jour automatiquement le pourcentage de progression
CREATE OR REPLACE FUNCTION update_production_order_progress()
RETURNS TRIGGER AS $$
DECLARE
    total_steps INTEGER;
    completed_steps INTEGER;
    progress_pct INTEGER;
BEGIN
    -- Calculer le nombre total d'étapes
    SELECT COUNT(*) INTO total_steps
    FROM production_steps
    WHERE production_order_id = COALESCE(NEW.production_order_id, OLD.production_order_id);
    
    -- Calculer le nombre d'étapes complétées
    SELECT COUNT(*) INTO completed_steps
    FROM production_steps
    WHERE production_order_id = COALESCE(NEW.production_order_id, OLD.production_order_id)
    AND status = 'completed';
    
    -- Calculer le pourcentage
    IF total_steps > 0 THEN
        progress_pct := (completed_steps * 100) / total_steps;
    ELSE
        progress_pct := 0;
    END IF;
    
    -- Mettre à jour l'ordre de production
    UPDATE production_orders
    SET progress_percentage = progress_pct,
        updated_at = now()
    WHERE id = COALESCE(NEW.production_order_id, OLD.production_order_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Créer les triggers
CREATE TRIGGER trigger_set_production_order_number
    BEFORE INSERT ON production_orders
    FOR EACH ROW
    EXECUTE FUNCTION set_production_order_number();

CREATE TRIGGER trigger_set_delivery_number
    BEFORE INSERT ON deliveries
    FOR EACH ROW
    EXECUTE FUNCTION set_delivery_number();

CREATE TRIGGER trigger_update_production_progress
    AFTER INSERT OR UPDATE OR DELETE ON production_steps
    FOR EACH ROW
    EXECUTE FUNCTION update_production_order_progress();

-- Insérer des produits d'exemple
INSERT INTO public.products (name, description, price) VALUES
  ('Brique 15 Creux', 'Brique 15x20x30 avec creux', 150.00),
  ('Brique 10 Creux', 'Brique 10x20x30 avec creux', 120.00),
  ('Brique 20 Plein', 'Brique 20x20x30 pleine', 180.00),
  ('Brique 8 Mince', 'Brique 8x20x30 mince', 100.00);

-- Insérer des ordres de production d'exemple
INSERT INTO public.production_orders (order_number, status, product_id, quantity, unit_price, total_amount, requested_date, initiator_name, notes, priority)
SELECT 
    'OP-001',
    'in_progress',
    p.id,
    1000,
    150.00,
    150000.00,
    '2025-01-28',
    'Jean Dupont',
    'Commande urgente pour projet construction',
    'high'
FROM public.products p
WHERE p.name = 'Brique 15 Creux'
LIMIT 1;

INSERT INTO public.production_orders (order_number, status, product_id, quantity, unit_price, total_amount, requested_date, initiator_name, notes, priority)
SELECT 
    'OP-002',
    'completed',
    p.id,
    800,
    120.00,
    96000.00,
    '2025-01-27',
    'Marie Martin',
    'Commande standard',
    'normal'
FROM public.products p
WHERE p.name = 'Brique 10 Creux'
LIMIT 1;

INSERT INTO public.production_orders (order_number, status, product_id, quantity, unit_price, total_amount, requested_date, initiator_name, notes, priority)
SELECT 
    'OP-003',
    'pending',
    p.id,
    1200,
    180.00,
    216000.00,
    '2025-01-29',
    'Pierre Durand',
    'Commande en attente d''approbation',
    'normal'
FROM public.products p
WHERE p.name = 'Brique 20 Plein'
LIMIT 1;

-- Insérer des étapes de production pour chaque ordre
INSERT INTO public.production_steps (production_order_id, step_name, step_order, status, estimated_duration)
SELECT 
    po.id,
    step_data.step_name,
    step_data.step_order,
    CASE 
        WHEN po.status = 'completed' THEN 'completed'
        WHEN po.status = 'in_progress' AND step_data.step_order <= 3 THEN 'completed'
        WHEN po.status = 'in_progress' AND step_data.step_order = 4 THEN 'in_progress'
        ELSE 'pending'
    END,
    step_data.estimated_duration
FROM public.production_orders po
CROSS JOIN (
    VALUES 
        ('Préparation matières premières', 1, 4),
        ('Mélange et façonnage', 2, 6),
        ('Séchage', 3, 24),
        ('Cuisson', 4, 8),
        ('Contrôle qualité', 5, 2),
        ('Emballage', 6, 3)
) AS step_data(step_name, step_order, estimated_duration);

-- Insérer des livraisons d'exemple
INSERT INTO public.deliveries (delivery_number, production_order_id, status, customer_name, customer_phone, customer_address, delivery_date, quantity_delivered, delivery_notes)
SELECT 
    'LIV-001',
    po.id,
    'delivered',
    'Construction ABC',
    '+228 90 12 34 56',
    'Lomé, Quartier Adidogomé',
    '2025-01-25',
    800,
    'Livraison complète effectuée'
FROM public.production_orders po
WHERE po.order_number = 'OP-002'
LIMIT 1;

INSERT INTO public.deliveries (delivery_number, production_order_id, status, customer_name, customer_phone, customer_address, delivery_date, quantity_delivered, delivery_notes)
SELECT 
    'LIV-002',
    po.id,
    'pending',
    'Entreprise XYZ',
    '+228 91 23 45 67',
    'Lomé, Quartier Bè',
    '2025-01-30',
    1000,
    'Livraison programmée'
FROM public.production_orders po
WHERE po.order_number = 'OP-001'
LIMIT 1;
