
-- Ajouter la colonne remise_globale_pourcentage manquante à la table factures_professionnelles
ALTER TABLE public.factures_professionnelles 
ADD COLUMN IF NOT EXISTS remise_globale_pourcentage numeric DEFAULT 0;

-- Ajouter également à la table devis_professionnels pour la cohérence
ALTER TABLE public.devis_professionnels 
ADD COLUMN IF NOT EXISTS remise_globale_pourcentage numeric DEFAULT 0;

-- Mettre à jour le trigger pour les timestamps si nécessaire
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- S'assurer que les triggers existent sur les tables
DROP TRIGGER IF EXISTS update_factures_professionnelles_updated_at ON public.factures_professionnelles;
CREATE TRIGGER update_factures_professionnelles_updated_at 
    BEFORE UPDATE ON public.factures_professionnelles 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_devis_professionnels_updated_at ON public.devis_professionnels;
CREATE TRIGGER update_devis_professionnels_updated_at 
    BEFORE UPDATE ON public.devis_professionnels 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
