
-- Vérification et création/correction des tables principales
-- Table products (déjà existante, vérification de la structure)
DO $$ 
BEGIN
    -- Vérifier si la colonne stock_alert_threshold existe, sinon l'ajouter
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='stock_alert_threshold') THEN
        ALTER TABLE products ADD COLUMN stock_alert_threshold integer DEFAULT 10;
    END IF;
END $$;

-- Insérer les produits de briqueterie standard
INSERT INTO products (name, type, dimensions, description, price, unit, stock_alert_threshold, is_active) VALUES
-- Briques Creux
('10 Creux', 'Brique Creuse', '40 cm x 20 cm x 10 cm', 'Brique creuse standard 10cm', 150, 'pièce', 100, true),
('12 Creux', 'Brique Creuse', '40 cm x 20 cm x 12 cm', 'Brique creuse standard 12cm', 180, 'pièce', 100, true),
('15 Creux', 'Brique Creuse', '40 cm x 20 cm x 15 cm', 'Brique creuse standard 15cm', 220, 'pièce', 100, true),
('20 Creux', 'Brique Creuse', '40 cm x 20 cm x 20 cm', 'Brique creuse standard 20cm', 280, 'pièce', 100, true),
-- Briques Pleines
('10 Plein', 'Brique Pleine', '40 cm x 20 cm x 10 cm', 'Brique pleine standard 10cm', 200, 'pièce', 50, true),
('12 Plein', 'Brique Pleine', '40 cm x 20 cm x 12 cm', 'Brique pleine standard 12cm', 240, 'pièce', 50, true),
('15 Plein', 'Brique Pleine', '40 cm x 20 cm x 15 cm', 'Brique pleine standard 15cm', 300, 'pièce', 50, true),
('20 Plein', 'Brique Pleine', '40 cm x 20 cm x 20 cm', 'Brique pleine standard 20cm', 380, 'pièce', 50, true),
-- Hourdis
('Hourdis 12', 'Hourdis', '60 cm x 20 cm x 12 cm', 'Hourdis standard 12cm', 450, 'pièce', 30, true),
('Hourdis 15', 'Hourdis', '60 cm x 20 cm x 15 cm', 'Hourdis standard 15cm', 550, 'pièce', 30, true)
ON CONFLICT (name) DO UPDATE SET
    type = EXCLUDED.type,
    dimensions = EXCLUDED.dimensions,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    unit = EXCLUDED.unit,
    stock_alert_threshold = EXCLUDED.stock_alert_threshold,
    is_active = EXCLUDED.is_active;

-- Créer les stocks initiaux pour tous les produits
INSERT INTO stock (product_id, quantity, minimum_stock, location)
SELECT 
    p.id,
    0 as quantity,
    p.stock_alert_threshold as minimum_stock,
    'Entrepôt Principal' as location
FROM products p
WHERE NOT EXISTS (
    SELECT 1 FROM stock s WHERE s.product_id = p.id
);

-- Fonction pour automatiser la création de livraison et facture lors d'une vente
CREATE OR REPLACE FUNCTION create_delivery_and_invoice_for_sale()
RETURNS TRIGGER AS $$
DECLARE
    new_delivery_id uuid;
    new_invoice_id uuid;
    delivery_number text;
    invoice_number text;
BEGIN
    -- Générer les numéros
    SELECT 'LV' || TO_CHAR(CURRENT_DATE, 'YYMMDD') || LPAD(NEXTVAL('delivery_seq')::text, 4, '0') INTO delivery_number;
    SELECT 'FC' || TO_CHAR(CURRENT_DATE, 'YYMMDD') || LPAD(NEXTVAL('invoice_seq')::text, 4, '0') INTO invoice_number;
    
    -- Créer la livraison automatiquement
    INSERT INTO deliveries (
        sale_id,
        delivery_address,
        delivery_date,
        status,
        notes
    ) VALUES (
        NEW.id,
        'Adresse à définir',
        NEW.sale_date + INTERVAL '1 day',
        'scheduled',
        'Livraison générée automatiquement'
    ) RETURNING id INTO new_delivery_id;
    
    -- Créer la facture automatiquement
    INSERT INTO invoices (
        sale_id,
        invoice_number,
        issue_date,
        due_date,
        status,
        total_amount,
        tax_rate,
        tax_amount,
        notes
    ) VALUES (
        NEW.id,
        invoice_number,
        NEW.sale_date,
        NEW.sale_date + INTERVAL '30 days',
        'draft',
        NEW.total_amount,
        18.00,
        NEW.total_amount * 0.18,
        'Facture générée automatiquement'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer les séquences si elles n'existent pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename = 'delivery_seq') THEN
        CREATE SEQUENCE delivery_seq START 1;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename = 'invoice_seq') THEN
        CREATE SEQUENCE invoice_seq START 1;
    END IF;
END $$;

-- Trigger pour automatiser livraison et facture
DROP TRIGGER IF EXISTS trigger_create_delivery_invoice ON sales;
CREATE TRIGGER trigger_create_delivery_invoice
    AFTER INSERT ON sales
    FOR EACH ROW
    EXECUTE FUNCTION create_delivery_and_invoice_for_sale();

-- Fonction pour mettre à jour le stock après production
CREATE OR REPLACE FUNCTION update_stock_after_production()
RETURNS TRIGGER AS $$
BEGIN
    -- Mettre à jour le stock lors de la production
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        INSERT INTO stock (product_id, quantity, minimum_stock, location)
        VALUES (NEW.product_id, NEW.produced_quantity, 10, 'Production')
        ON CONFLICT (product_id) 
        DO UPDATE SET 
            quantity = stock.quantity + NEW.produced_quantity,
            last_restocked = now();
            
        -- Enregistrer le mouvement de stock
        INSERT INTO stock_movements (
            product_id,
            type,
            quantite,
            motif,
            commentaire
        ) VALUES (
            NEW.product_id,
            'entree',
            NEW.produced_quantity,
            'Production terminée',
            'Ordre de production #' || NEW.id
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mise à jour stock après production
DROP TRIGGER IF EXISTS trigger_update_stock_production ON production_orders;
CREATE TRIGGER trigger_update_stock_production
    AFTER UPDATE ON production_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_stock_after_production();

-- Fonction pour réduire le stock après perte
CREATE OR REPLACE FUNCTION reduce_stock_after_loss()
RETURNS TRIGGER AS $$
BEGIN
    -- Réduire le stock
    UPDATE stock 
    SET quantity = GREATEST(0, quantity - NEW.quantity_lost)
    WHERE product_id = NEW.product_id;
    
    -- Enregistrer le mouvement de stock
    INSERT INTO stock_movements (
        product_id,
        type,
        quantite,
        motif,
        commentaire
    ) VALUES (
        NEW.product_id,
        'sortie',
        NEW.quantity_lost,
        'Perte enregistrée',
        NEW.comments
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour réduction stock après perte
DROP TRIGGER IF EXISTS trigger_reduce_stock_loss ON daily_losses;
CREATE TRIGGER trigger_reduce_stock_loss
    AFTER INSERT ON daily_losses
    FOR EACH ROW
    EXECUTE FUNCTION reduce_stock_after_loss();

-- Fonction pour réduire le stock après vente
CREATE OR REPLACE FUNCTION reduce_stock_after_sale()
RETURNS TRIGGER AS $$
BEGIN
    -- Réduire le stock
    UPDATE stock 
    SET quantity = GREATEST(0, quantity - NEW.quantity)
    WHERE product_id = NEW.product_id;
    
    -- Enregistrer le mouvement de stock
    INSERT INTO stock_movements (
        product_id,
        type,
        quantite,
        motif,
        commentaire
    ) VALUES (
        NEW.product_id,
        'sortie',
        NEW.quantity,
        'Vente',
        'Vente #' || NEW.id
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour réduction stock après vente
DROP TRIGGER IF EXISTS trigger_reduce_stock_sale ON sales;
CREATE TRIGGER trigger_reduce_stock_sale
    AFTER INSERT ON sales
    FOR EACH ROW
    EXECUTE FUNCTION reduce_stock_after_sale();

-- Vue pour les alertes de stock bas
CREATE OR REPLACE VIEW stock_alerts AS
SELECT 
    p.id as product_id,
    p.name as product_name,
    p.type,
    s.quantity as current_stock,
    s.minimum_stock,
    (s.minimum_stock - s.quantity) as shortage
FROM products p
JOIN stock s ON p.id = s.product_id
WHERE s.quantity < s.minimum_stock AND p.is_active = true;

-- Vue pour les commandes en attente
CREATE OR REPLACE VIEW pending_orders AS
SELECT 
    s.id,
    s.sale_date,
    p.name as product_name,
    s.quantity,
    s.total_amount,
    d.status as delivery_status,
    EXTRACT(HOURS FROM (now() - s.sale_date)) as hours_pending
FROM sales s
JOIN products p ON s.product_id = p.id
LEFT JOIN deliveries d ON s.id = d.sale_id
WHERE s.status = 'pending' 
   OR (d.status IS NOT NULL AND d.status NOT IN ('delivered'));

-- Fonction pour mettre à jour les objectifs
CREATE OR REPLACE FUNCTION update_monthly_goals()
RETURNS void AS $$
DECLARE
    current_month integer := EXTRACT(MONTH FROM CURRENT_DATE);
    current_year integer := EXTRACT(YEAR FROM CURRENT_DATE);
    total_sales numeric;
    total_production numeric;
BEGIN
    -- Calculer les ventes du mois
    SELECT COALESCE(SUM(total_amount), 0) INTO total_sales
    FROM sales 
    WHERE EXTRACT(MONTH FROM sale_date) = current_month 
      AND EXTRACT(YEAR FROM sale_date) = current_year
      AND status = 'completed';
    
    -- Calculer la production du mois
    SELECT COALESCE(SUM(produced_quantity), 0) INTO total_production
    FROM production_orders 
    WHERE EXTRACT(MONTH FROM start_date) = current_month 
      AND EXTRACT(YEAR FROM start_date) = current_year
      AND status = 'completed';
    
    -- Mettre à jour les objectifs de vente
    UPDATE monthly_goals 
    SET current_value = total_sales
    WHERE category = 'ventes' 
      AND month = current_month 
      AND year = current_year;
    
    -- Mettre à jour les objectifs de production
    UPDATE monthly_goals 
    SET current_value = total_production
    WHERE category = 'production' 
      AND month = current_month 
      AND year = current_year;
END;
$$ LANGUAGE plpgsql;

-- Créer des objectifs par défaut pour le mois courant
INSERT INTO monthly_goals (title, description, category, month, year, target_value, current_value, unit, status)
VALUES 
    ('Chiffre d''affaires mensuel', 'Objectif de vente mensuel', 'ventes', EXTRACT(MONTH FROM CURRENT_DATE), EXTRACT(YEAR FROM CURRENT_DATE), 5000000, 0, 'FCFA', 'active'),
    ('Production mensuelle', 'Objectif de production mensuel', 'production', EXTRACT(MONTH FROM CURRENT_DATE), EXTRACT(YEAR FROM CURRENT_DATE), 10000, 0, 'pièces', 'active')
ON CONFLICT DO NOTHING;
