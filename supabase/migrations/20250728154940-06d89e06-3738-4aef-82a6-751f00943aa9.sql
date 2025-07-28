
-- Table des produits
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom VARCHAR(255) NOT NULL,
  categorie VARCHAR(100) NOT NULL,
  longueur_cm INTEGER NOT NULL,
  largeur_cm INTEGER NOT NULL,
  hauteur_cm INTEGER NOT NULL,
  prix_unitaire DECIMAL(10,2) DEFAULT 0,
  stock_actuel INTEGER DEFAULT 0,
  stock_minimum INTEGER DEFAULT 0,
  actif BOOLEAN DEFAULT TRUE,
  date_creation TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date_modification TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des ordres de production
CREATE TABLE IF NOT EXISTS public.production_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_ordre VARCHAR(50) UNIQUE NOT NULL,
  product_id UUID REFERENCES public.products(id),
  quantite INTEGER NOT NULL,
  date_demande TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date_prevue TIMESTAMP WITH TIME ZONE,
  date_completion TIMESTAMP WITH TIME ZONE,
  statut VARCHAR(20) DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'approuve', 'rejete', 'en_cours', 'termine', 'annule')),
  demandeur_id UUID,
  approbateur_id UUID,
  commentaires TEXT,
  cout_prevu DECIMAL(10,2),
  cout_reel DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des livraisons
CREATE TABLE IF NOT EXISTS public.deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_livraison VARCHAR(50) UNIQUE NOT NULL,
  client_nom VARCHAR(255) NOT NULL,
  client_telephone VARCHAR(50),
  client_adresse TEXT NOT NULL,
  lieu_livraison TEXT NOT NULL,
  date_commande TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date_livraison_prevue TIMESTAMP WITH TIME ZONE,
  date_livraison_reelle TIMESTAMP WITH TIME ZONE,
  statut VARCHAR(20) DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'approuve', 'en_cours', 'livre', 'annule')),
  responsable_id UUID,
  signature_client TEXT,
  commentaires TEXT,
  montant_total DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des items de livraison
CREATE TABLE IF NOT EXISTS public.delivery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id UUID REFERENCES public.deliveries(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  quantite INTEGER NOT NULL,
  prix_unitaire DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des ventes
CREATE TABLE IF NOT EXISTS public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_vente VARCHAR(50) UNIQUE NOT NULL,
  client_nom VARCHAR(255) NOT NULL,
  client_telephone VARCHAR(50),
  client_adresse TEXT,
  date_vente TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  statut VARCHAR(20) DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'confirmee', 'annulee')),
  montant_total DECIMAL(10,2) DEFAULT 0,
  vendeur_id UUID,
  commentaires TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des items de vente
CREATE TABLE IF NOT EXISTS public.sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID REFERENCES public.sales(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  quantite INTEGER NOT NULL,
  prix_unitaire DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des devis
CREATE TABLE IF NOT EXISTS public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_devis VARCHAR(50) UNIQUE NOT NULL,
  client_nom VARCHAR(255) NOT NULL,
  client_telephone VARCHAR(50),
  client_adresse TEXT,
  date_devis TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date_validite TIMESTAMP WITH TIME ZONE,
  statut VARCHAR(20) DEFAULT 'brouillon' CHECK (statut IN ('brouillon', 'envoye', 'accepte', 'refuse', 'expire')),
  montant_total DECIMAL(10,2) DEFAULT 0,
  vendeur_id UUID,
  commentaires TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des items de devis
CREATE TABLE IF NOT EXISTS public.quote_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID REFERENCES public.quotes(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  description TEXT,
  quantite INTEGER NOT NULL,
  prix_unitaire DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des factures
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_facture VARCHAR(50) UNIQUE NOT NULL,
  client_nom VARCHAR(255) NOT NULL,
  client_telephone VARCHAR(50),
  client_adresse TEXT,
  date_facture TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date_echeance TIMESTAMP WITH TIME ZONE,
  statut VARCHAR(20) DEFAULT 'brouillon' CHECK (statut IN ('brouillon', 'envoyee', 'payee', 'en_retard', 'annulee')),
  montant_total DECIMAL(10,2) DEFAULT 0,
  montant_paye DECIMAL(10,2) DEFAULT 0,
  vendeur_id UUID,
  sale_id UUID REFERENCES public.sales(id),
  delivery_id UUID REFERENCES public.deliveries(id),
  commentaires TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des items de facture
CREATE TABLE IF NOT EXISTS public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  description TEXT,
  quantite INTEGER NOT NULL,
  prix_unitaire DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des employés
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom VARCHAR(255) NOT NULL,
  prenom VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  telephone VARCHAR(50),
  adresse TEXT,
  document_identite VARCHAR(100),
  role VARCHAR(50) DEFAULT 'employe' CHECK (role IN ('admin', 'manager', 'vendeur', 'production', 'livraison', 'employe')),
  salaire DECIMAL(10,2) DEFAULT 0,
  date_embauche TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  actif BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table de comptabilité
CREATE TABLE IF NOT EXISTS public.accounting_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) NOT NULL CHECK (type IN ('recette', 'depense', 'salaire', 'charge')),
  categorie VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  montant DECIMAL(10,2) NOT NULL,
  date_operation TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  methode_paiement VARCHAR(50) CHECK (methode_paiement IN ('especes', 'virement', 'cheque', 'mobile_money')),
  reference_externe VARCHAR(100),
  employee_id UUID REFERENCES public.employees(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des objectifs mensuels
CREATE TABLE IF NOT EXISTS public.monthly_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titre VARCHAR(255) NOT NULL,
  description TEXT,
  mois INTEGER NOT NULL CHECK (mois BETWEEN 1 AND 12),
  annee INTEGER NOT NULL,
  objectif_montant DECIMAL(10,2) NOT NULL,
  montant_realise DECIMAL(10,2) DEFAULT 0,
  statut VARCHAR(20) DEFAULT 'actif' CHECK (statut IN ('actif', 'termine', 'annule')),
  employee_id UUID REFERENCES public.employees(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des paramètres de l'application
CREATE TABLE IF NOT EXISTS public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cle VARCHAR(100) UNIQUE NOT NULL,
  valeur JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertion des produits de base
INSERT INTO public.products (nom, categorie, longueur_cm, largeur_cm, hauteur_cm, prix_unitaire, stock_actuel, stock_minimum) 
VALUES 
('10 Creux', 'Brique creuse', 40, 20, 10, 125, 0, 500),
('12 Creux', 'Brique creuse', 40, 20, 12, 150, 0, 500),
('15 Creux', 'Brique creuse', 40, 20, 15, 175, 0, 500),
('20 Creux', 'Brique creuse', 40, 20, 20, 200, 0, 500),
('10 Plein', 'Brique pleine', 40, 20, 10, 140, 0, 300),
('12 Plein', 'Brique pleine', 40, 20, 12, 165, 0, 300),
('15 Plein', 'Brique pleine', 40, 20, 15, 190, 0, 300),
('20 Plein', 'Brique pleine', 40, 20, 20, 215, 0, 300),
('Hourdis 12', 'Hourdis', 60, 20, 12, 300, 0, 200),
('Hourdis 15', 'Hourdis', 60, 20, 15, 350, 0, 200)
ON CONFLICT (nom) DO NOTHING;

-- Insertion des paramètres par défaut
INSERT INTO public.app_settings (cle, valeur, description) VALUES
('company_info', '{"nom": "Cornerstone Briques", "adresse": "Lomé, Togo", "telephone": "+228 XX XX XX XX", "email": "contact@cornerstone-briques.tg"}', 'Informations de l\'entreprise'),
('invoice_settings', '{"logo": "", "couleur_primaire": "#ea580c", "couleur_secondaire": "#f97316", "mentions_legales": "Conditions de paiement: 30 jours"}', 'Paramètres de facturation'),
('system_settings', '{"devise": "FCFA", "taux_tva": 18, "seuil_stock_critique": 100}', 'Paramètres système')
ON CONFLICT (cle) DO NOTHING;

-- Activer Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounting_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Créer des politiques d'accès public (pour l'instant)
CREATE POLICY "Allow all operations on products" ON public.products FOR ALL USING (true);
CREATE POLICY "Allow all operations on production_orders" ON public.production_orders FOR ALL USING (true);
CREATE POLICY "Allow all operations on deliveries" ON public.deliveries FOR ALL USING (true);
CREATE POLICY "Allow all operations on delivery_items" ON public.delivery_items FOR ALL USING (true);
CREATE POLICY "Allow all operations on sales" ON public.sales FOR ALL USING (true);
CREATE POLICY "Allow all operations on sale_items" ON public.sale_items FOR ALL USING (true);
CREATE POLICY "Allow all operations on quotes" ON public.quotes FOR ALL USING (true);
CREATE POLICY "Allow all operations on quote_items" ON public.quote_items FOR ALL USING (true);
CREATE POLICY "Allow all operations on invoices" ON public.invoices FOR ALL USING (true);
CREATE POLICY "Allow all operations on invoice_items" ON public.invoice_items FOR ALL USING (true);
CREATE POLICY "Allow all operations on employees" ON public.employees FOR ALL USING (true);
CREATE POLICY "Allow all operations on accounting_entries" ON public.accounting_entries FOR ALL USING (true);
CREATE POLICY "Allow all operations on monthly_goals" ON public.monthly_goals FOR ALL USING (true);
CREATE POLICY "Allow all operations on app_settings" ON public.app_settings FOR ALL USING (true);

-- Créer des index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_products_categorie ON public.products(categorie);
CREATE INDEX IF NOT EXISTS idx_production_orders_statut ON public.production_orders(statut);
CREATE INDEX IF NOT EXISTS idx_deliveries_statut ON public.deliveries(statut);
CREATE INDEX IF NOT EXISTS idx_sales_date ON public.sales(date_vente);
CREATE INDEX IF NOT EXISTS idx_quotes_statut ON public.quotes(statut);
CREATE INDEX IF NOT EXISTS idx_invoices_statut ON public.invoices(statut);
CREATE INDEX IF NOT EXISTS idx_employees_role ON public.employees(role);
CREATE INDEX IF NOT EXISTS idx_accounting_entries_type ON public.accounting_entries(type);
CREATE INDEX IF NOT EXISTS idx_monthly_goals_mois_annee ON public.monthly_goals(mois, annee);
