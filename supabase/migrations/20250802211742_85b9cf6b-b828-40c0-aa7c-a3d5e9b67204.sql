
-- Table pour les produits (si elle n'existe pas déjà)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom VARCHAR NOT NULL,
  categorie VARCHAR NOT NULL,
  longueur_cm INTEGER NOT NULL,
  largeur_cm INTEGER NOT NULL,
  hauteur_cm INTEGER NOT NULL,
  prix_unitaire DECIMAL(10,2) NOT NULL,
  stock_actuel INTEGER NOT NULL DEFAULT 0,
  stock_minimum INTEGER NOT NULL DEFAULT 0,
  actif BOOLEAN NOT NULL DEFAULT true,
  date_creation TIMESTAMP WITH TIME ZONE DEFAULT now(),
  date_modification TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les mouvements de stock
CREATE TABLE public.stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  type VARCHAR NOT NULL CHECK (type IN ('entree', 'sortie', 'perte', 'ajustement')),
  quantite INTEGER NOT NULL,
  motif VARCHAR,
  reference_document VARCHAR, -- pour lier aux ventes/livraisons
  date_mouvement TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID,
  commentaire TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les pertes quotidiennes de briques
CREATE TABLE public.daily_losses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  date_perte DATE NOT NULL,
  quantite_cassee INTEGER NOT NULL,
  motif VARCHAR DEFAULT 'Briques cassées',
  valeur_perte DECIMAL(10,2), -- prix unitaire × quantité
  responsable VARCHAR,
  commentaire TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les rapports mensuels de pertes
CREATE TABLE public.monthly_loss_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mois INTEGER NOT NULL CHECK (mois BETWEEN 1 AND 12),
  annee INTEGER NOT NULL,
  total_pertes_quantite INTEGER NOT NULL DEFAULT 0,
  total_pertes_valeur DECIMAL(12,2) NOT NULL DEFAULT 0,
  nombre_produits_affectes INTEGER NOT NULL DEFAULT 0,
  rapport_genere_le TIMESTAMP WITH TIME ZONE DEFAULT now(),
  statut VARCHAR DEFAULT 'actif' CHECK (statut IN ('actif', 'archive'))
);

-- Table pour les détails des rapports mensuels
CREATE TABLE public.monthly_loss_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rapport_id UUID REFERENCES public.monthly_loss_reports(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  quantite_perdue INTEGER NOT NULL,
  valeur_perdue DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les ventes (mise à jour)
CREATE TABLE IF NOT EXISTS public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_vente VARCHAR UNIQUE NOT NULL,
  client_nom VARCHAR NOT NULL,
  client_telephone VARCHAR,
  client_adresse TEXT,
  date_vente DATE NOT NULL,
  statut VARCHAR NOT NULL DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'confirmee', 'livree', 'annulee')),
  montant_total DECIMAL(12,2) NOT NULL DEFAULT 0,
  vendeur_id UUID,
  commentaires TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les éléments de vente
CREATE TABLE IF NOT EXISTS public.sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID REFERENCES public.sales(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  quantite INTEGER NOT NULL,
  prix_unitaire DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les livraisons (mise à jour)
CREATE TABLE IF NOT EXISTS public.deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_livraison VARCHAR UNIQUE NOT NULL,
  sale_id UUID REFERENCES public.sales(id),
  client_nom VARCHAR NOT NULL,
  client_telephone VARCHAR,
  client_adresse TEXT NOT NULL,
  lieu_livraison TEXT NOT NULL,
  date_commande DATE NOT NULL,
  date_livraison_prevue DATE,
  date_livraison_reelle DATE,
  statut VARCHAR NOT NULL DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'approuve', 'en_cours', 'livre', 'annule')),
  responsable_id UUID,
  signature_client TEXT,
  commentaires TEXT,
  montant_total DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les éléments de livraison
CREATE TABLE IF NOT EXISTS public.delivery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id UUID REFERENCES public.deliveries(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  quantite INTEGER NOT NULL,
  prix_unitaire DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les factures (mise à jour)
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_facture VARCHAR UNIQUE NOT NULL,
  client_nom VARCHAR NOT NULL,
  client_telephone VARCHAR,
  client_adresse TEXT,
  date_facture DATE NOT NULL,
  date_echeance DATE,
  statut VARCHAR NOT NULL DEFAULT 'brouillon' CHECK (statut IN ('brouillon', 'envoyee', 'payee', 'en_retard', 'annulee')),
  montant_total DECIMAL(12,2) NOT NULL DEFAULT 0,
  montant_paye DECIMAL(12,2) NOT NULL DEFAULT 0,
  vendeur_id UUID,
  sale_id UUID REFERENCES public.sales(id),
  delivery_id UUID REFERENCES public.deliveries(id),
  commentaires TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les éléments de facture
CREATE TABLE IF NOT EXISTS public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  description TEXT,
  quantite INTEGER NOT NULL,
  prix_unitaire DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Activer RLS sur toutes les tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_losses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_loss_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_loss_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- Politiques RLS (accès public pour simplifier - à ajuster selon les besoins de sécurité)
CREATE POLICY "Allow all operations on products" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on stock_movements" ON public.stock_movements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on daily_losses" ON public.daily_losses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on monthly_loss_reports" ON public.monthly_loss_reports FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on monthly_loss_details" ON public.monthly_loss_details FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on sales" ON public.sales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on sale_items" ON public.sale_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on deliveries" ON public.deliveries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on delivery_items" ON public.delivery_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on invoices" ON public.invoices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on invoice_items" ON public.invoice_items FOR ALL USING (true) WITH CHECK (true);

-- Fonction pour mettre à jour le stock automatiquement
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Mise à jour du stock selon le type de mouvement
    IF NEW.type = 'entree' THEN
      UPDATE public.products 
      SET stock_actuel = stock_actuel + NEW.quantite,
          date_modification = now()
      WHERE id = NEW.product_id;
    ELSIF NEW.type IN ('sortie', 'perte') THEN
      UPDATE public.products 
      SET stock_actuel = stock_actuel - NEW.quantite,
          date_modification = now()
      WHERE id = NEW.product_id;
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour la mise à jour automatique du stock
DROP TRIGGER IF EXISTS trigger_update_stock ON public.stock_movements;
CREATE TRIGGER trigger_update_stock
  AFTER INSERT ON public.stock_movements
  FOR EACH ROW EXECUTE FUNCTION update_product_stock();

-- Fonction pour créer un mouvement de stock lors des pertes
CREATE OR REPLACE FUNCTION create_loss_movement()
RETURNS TRIGGER AS $$
BEGIN
  -- Insérer un mouvement de stock pour la perte
  INSERT INTO public.stock_movements (
    product_id, 
    type, 
    quantite, 
    motif, 
    date_mouvement,
    commentaire
  ) VALUES (
    NEW.product_id,
    'perte',
    NEW.quantite_cassee,
    'Perte quotidienne - briques cassées',
    NEW.date_perte::timestamp with time zone,
    NEW.commentaire
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour créer automatiquement les mouvements de stock lors des pertes
DROP TRIGGER IF EXISTS trigger_create_loss_movement ON public.daily_losses;
CREATE TRIGGER trigger_create_loss_movement
  AFTER INSERT ON public.daily_losses
  FOR EACH ROW EXECUTE FUNCTION create_loss_movement();

-- Fonction pour gérer les mouvements de stock lors des livraisons
CREATE OR REPLACE FUNCTION handle_delivery_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.statut != 'livre' AND NEW.statut = 'livre' THEN
    -- Créer les mouvements de stock pour chaque item de la livraison
    INSERT INTO public.stock_movements (product_id, type, quantite, motif, reference_document, date_mouvement)
    SELECT 
      di.product_id,
      'sortie',
      di.quantite,
      'Livraison effectuée',
      NEW.numero_livraison,
      COALESCE(NEW.date_livraison_reelle, now())
    FROM public.delivery_items di
    WHERE di.delivery_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour les livraisons
DROP TRIGGER IF EXISTS trigger_handle_delivery_stock ON public.deliveries;
CREATE TRIGGER trigger_handle_delivery_stock
  AFTER UPDATE ON public.deliveries
  FOR EACH ROW EXECUTE FUNCTION handle_delivery_stock();

-- Insérer quelques produits de test
INSERT INTO public.products (nom, categorie, longueur_cm, largeur_cm, hauteur_cm, prix_unitaire, stock_actuel, stock_minimum) VALUES
('Brique 15 Creux', 'creuse', 40, 20, 15, 150, 5000, 500),
('Brique 20 Creux', 'creuse', 40, 20, 20, 200, 3000, 300),
('Brique Pleine 10', 'pleine', 40, 20, 10, 120, 2000, 200),
('Hourdis 16', 'hourdis', 60, 20, 16, 180, 1500, 150),
('Brique 12 Creux', 'creuse', 40, 20, 12, 130, 4000, 400)
ON CONFLICT (nom) DO NOTHING;
