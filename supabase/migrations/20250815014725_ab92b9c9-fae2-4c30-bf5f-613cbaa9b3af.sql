
-- Ajouter les colonnes manquantes à la table factures_professionnelles
ALTER TABLE factures_professionnelles 
ADD COLUMN IF NOT EXISTS mode_livraison TEXT DEFAULT 'retrait_usine',
ADD COLUMN IF NOT EXISTS frais_livraison NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS adresse_livraison TEXT,
ADD COLUMN IF NOT EXISTS sous_total NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS remise_globale_montant NUMERIC DEFAULT 0;

-- Vérifier que la table facture_items existe et a les bonnes colonnes
CREATE TABLE IF NOT EXISTS facture_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facture_id UUID NOT NULL REFERENCES factures_professionnelles(id) ON DELETE CASCADE,
    nom_produit TEXT NOT NULL,
    quantite INTEGER NOT NULL DEFAULT 1,
    prix_unitaire NUMERIC NOT NULL DEFAULT 0,
    total_ligne NUMERIC NOT NULL DEFAULT 0,
    product_id UUID REFERENCES products(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Activer RLS sur facture_items si ce n'est pas déjà fait
ALTER TABLE facture_items ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS pour facture_items
DROP POLICY IF EXISTS "Facture items are viewable by everyone" ON facture_items;
DROP POLICY IF EXISTS "Users can manage facture items" ON facture_items;

CREATE POLICY "Facture items are viewable by everyone" ON facture_items FOR SELECT USING (true);
CREATE POLICY "Users can manage facture items" ON facture_items FOR ALL USING (true);
