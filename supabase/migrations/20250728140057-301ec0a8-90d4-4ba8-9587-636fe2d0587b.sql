
-- Create the products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  categorie TEXT NOT NULL,
  longueur_cm INTEGER NOT NULL,
  largeur_cm INTEGER NOT NULL,
  hauteur_cm INTEGER NOT NULL,
  date_creation TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  actif BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for products
CREATE POLICY "Allow all operations on products" 
  ON public.products 
  FOR ALL 
  USING (true);

-- Insert the initial product data
INSERT INTO public.products (nom, categorie, longueur_cm, largeur_cm, hauteur_cm, date_creation, actif)
VALUES 
('10 Creux', 'Brique creuse', 40, 20, 10, CURRENT_TIMESTAMP, TRUE),
('12 Creux', 'Brique creuse', 40, 20, 12, CURRENT_TIMESTAMP, TRUE),
('15 Creux', 'Brique creuse', 40, 20, 15, CURRENT_TIMESTAMP, TRUE),
('20 Creux', 'Brique creuse', 40, 20, 20, CURRENT_TIMESTAMP, TRUE),
('10 Plein', 'Brique pleine', 40, 20, 10, CURRENT_TIMESTAMP, TRUE),
('12 Plein', 'Brique pleine', 40, 20, 12, CURRENT_TIMESTAMP, TRUE),
('15 Plein', 'Brique pleine', 40, 20, 15, CURRENT_TIMESTAMP, TRUE),
('20 Plein', 'Brique pleine', 40, 20, 20, CURRENT_TIMESTAMP, TRUE),
('Hourdis 12', 'Hourdis', 60, 20, 12, CURRENT_TIMESTAMP, TRUE),
('Hourdis 15', 'Hourdis', 60, 20, 15, CURRENT_TIMESTAMP, TRUE);
