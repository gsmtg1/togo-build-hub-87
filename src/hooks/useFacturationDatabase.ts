
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

  // Hook pour les clients complets
  const useClientsComplets = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const loadData = async () => {
      try {
        setLoading(true);
        const { data: clients, error } = await supabase
          .from('clients')
          .select('*')
          .order('nom_complet', { ascending: true });

        if (error) throw error;
        setData(clients || []);
      } catch (error: any) {
        console.error('Erreur chargement clients:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les clients",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      loadData();
    }, []);

    return { data, loading, refresh: loadData };
  };

  // Hook pour les ordres de production briques
  const useOrdresProductionBriques = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const loadData = async () => {
      try {
        setLoading(true);
        const { data: ordres, error } = await supabase
          .from('ordres_production')
          .select(`
            *,
            ordres_production_details (
              id,
              type_brique,
              quantite_prevue,
              quantite_produite,
              statut
            )
          `)
          .order('date_debut', { ascending: false });

        if (error) throw error;
        setData(ordres || []);
      } catch (error: any) {
        console.error('Erreur chargement ordres production:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les ordres de production",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      loadData();
    }, []);

    return { data, loading, refresh: loadData };
  };

  return {
    useFacturesProfessionnelles,
    useDevisProfessionnels,
    useClientsComplets,
    useOrdresProductionBriques
  };
};

// Export des hooks individuels pour faciliter l'utilisation
export const useFacturesProfessionnelles = () => {
  return useFacturationDatabase().useFacturesProfessionnelles();
};

export const useDevisProfessionnels = () => {
  return useFacturationDatabase().useDevisProfessionnels();
};

export const useClientsComplets = () => {
  return useFacturationDatabase().useClientsComplets();
};

export const useOrdresProductionBriques = () => {
  return useFacturationDatabase().useOrdresProductionBriques();
};
