
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useFacturationDatabase = () => {
  // Hook pour les factures professionnelles
  const useFacturesProfessionnelles = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const loadData = async () => {
      try {
        setLoading(true);
        const { data: factures, error } = await supabase
          .from('factures_professionnelles')
          .select(`
            *,
            facture_produits (
              id,
              nom_produit,
              quantite,
              prix_unitaire,
              total_ligne,
              product_id
            )
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setData(factures || []);
      } catch (error: any) {
        console.error('Erreur chargement factures:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les factures",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    const remove = async (id: string) => {
      try {
        const { error } = await supabase
          .from('factures_professionnelles')
          .delete()
          .eq('id', id);

        if (error) throw error;
        
        await loadData();
        toast({
          title: "Succès",
          description: "Facture supprimée avec succès",
        });
      } catch (error: any) {
        console.error('Erreur suppression facture:', error);
        toast({
          title: "Erreur",
          description: "Impossible de supprimer la facture",
          variant: "destructive",
        });
      }
    };

    useEffect(() => {
      loadData();
    }, []);

    return { data, loading, remove, refresh: loadData };
  };

  // Hook pour les devis professionnels
  const useDevisProfessionnels = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const loadData = async () => {
      try {
        setLoading(true);
        const { data: devis, error } = await supabase
          .from('devis_professionnels')
          .select(`
            *,
            devis_produits (
              id,
              nom_produit,
              quantite,
              prix_unitaire,
              total_ligne,
              product_id
            )
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setData(devis || []);
      } catch (error: any) {
        console.error('Erreur chargement devis:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les devis",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    const remove = async (id: string) => {
      try {
        const { error } = await supabase
          .from('devis_professionnels')
          .delete()
          .eq('id', id);

        if (error) throw error;
        
        await loadData();
        toast({
          title: "Succès",
          description: "Devis supprimé avec succès",
        });
      } catch (error: any) {
        console.error('Erreur suppression devis:', error);
        toast({
          title: "Erreur",
          description: "Impossible de supprimer le devis",
          variant: "destructive",
        });
      }
    };

    useEffect(() => {
      loadData();
    }, []);

    return { data, loading, remove, refresh: loadData };
  };

  return {
    useFacturesProfessionnelles,
    useDevisProfessionnels
  };
};
