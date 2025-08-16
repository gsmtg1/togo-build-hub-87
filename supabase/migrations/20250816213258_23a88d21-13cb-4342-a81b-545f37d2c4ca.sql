
-- Ajouter les colonnes TVA manquantes à la table factures_professionnelles
ALTER TABLE public.factures_professionnelles 
ADD COLUMN IF NOT EXISTS tva_applicable boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS taux_tva numeric DEFAULT 18,
ADD COLUMN IF NOT EXISTS montant_tva numeric DEFAULT 0;

-- Ajouter les colonnes TVA manquantes à la table devis_professionnels
ALTER TABLE public.devis_professionnels 
ADD COLUMN IF NOT EXISTS tva_applicable boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS taux_tva numeric DEFAULT 18,
ADD COLUMN IF NOT EXISTS montant_tva numeric DEFAULT 0;

-- Ajouter les colonnes de livraison manquantes à devis_professionnels pour cohérence
ALTER TABLE public.devis_professionnels 
ADD COLUMN IF NOT EXISTS mode_livraison text DEFAULT 'retrait_usine',
ADD COLUMN IF NOT EXISTS frais_livraison numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS adresse_livraison text,
ADD COLUMN IF NOT EXISTS sous_total numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS remise_globale_montant numeric DEFAULT 0;
