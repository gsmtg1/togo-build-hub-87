
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Hook pour les factures professionnelles
export const useFacturesProfessionnelles = () => {
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

  const create = async (factureData: any) => {
    try {
      const { data: result, error } = await supabase
        .from('factures_professionnelles')
        .insert([factureData])
        .select()
        .single();

      if (error) throw error;
      await loadData();
      toast({
        title: "Succès",
        description: "Facture créée avec succès",
      });
      return result;
    } catch (error: any) {
      console.error('Erreur création facture:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la facture",
        variant: "destructive",
      });
      throw error;
    }
  };

  const update = async (id: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('factures_professionnelles')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await loadData();
      toast({
        title: "Succès",
        description: "Facture mise à jour avec succès",
      });
    } catch (error: any) {
      console.error('Erreur mise à jour facture:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la facture",
        variant: "destructive",
      });
      throw error;
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

  return { data, loading, create, update, remove, refresh: loadData };
};

// Hook pour les devis professionnels
export const useDevisProfessionnels = () => {
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

  const create = async (devisData: any) => {
    try {
      const { data: result, error } = await supabase
        .from('devis_professionnels')
        .insert([devisData])
        .select()
        .single();

      if (error) throw error;
      await loadData();
      toast({
        title: "Succès",
        description: "Devis créé avec succès",
      });
      return result;
    } catch (error: any) {
      console.error('Erreur création devis:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le devis",
        variant: "destructive",
      });
      throw error;
    }
  };

  const update = async (id: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('devis_professionnels')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await loadData();
      toast({
        title: "Succès",
        description: "Devis mis à jour avec succès",
      });
    } catch (error: any) {
      console.error('Erreur mise à jour devis:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le devis",
        variant: "destructive",
      });
      throw error;
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

  return { data, loading, create, update, remove, refresh: loadData };
};

// Hook pour les clients complets
export const useClientsComplets = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: clients, error } = await supabase
        .from('clients_complets')
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

  const create = async (clientData: any) => {
    try {
      const { data: result, error } = await supabase
        .from('clients_complets')
        .insert([clientData])
        .select()
        .single();

      if (error) throw error;
      await loadData();
      toast({
        title: "Succès",
        description: "Client créé avec succès",
      });
      return result;
    } catch (error: any) {
      console.error('Erreur création client:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le client",
        variant: "destructive",
      });
      throw error;
    }
  };

  const update = async (id: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('clients_complets')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await loadData();
      toast({
        title: "Succès",
        description: "Client mis à jour avec succès",
      });
    } catch (error: any) {
      console.error('Erreur mise à jour client:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le client",
        variant: "destructive",
      });
      throw error;
    }
  };

  const remove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('clients_complets')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadData();
      toast({
        title: "Succès",
        description: "Client supprimé avec succès",
      });
    } catch (error: any) {
      console.error('Erreur suppression client:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le client",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return { data, loading, create, update, remove, refresh: loadData };
};

// Hook pour les ordres de production briques
export const useOrdresProductionBriques = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: ordres, error } = await supabase
        .from('ordres_production_briques')
        .select(`
          *,
          products (
            id,
            name,
            dimensions,
            price
          )
        `)
        .order('date_lancement', { ascending: false });

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

  const create = async (ordreData: any) => {
    try {
      const { data: result, error } = await supabase
        .from('ordres_production_briques')
        .insert([ordreData])
        .select()
        .single();

      if (error) throw error;
      await loadData();
      toast({
        title: "Succès",
        description: "Ordre de production créé avec succès",
      });
      return result;
    } catch (error: any) {
      console.error('Erreur création ordre:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer l'ordre de production",
        variant: "destructive",
      });
      throw error;
    }
  };

  const update = async (id: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('ordres_production_briques')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await loadData();
      toast({
        title: "Succès",
        description: "Ordre de production mis à jour avec succès",
      });
    } catch (error: any) {
      console.error('Erreur mise à jour ordre:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'ordre de production",
        variant: "destructive",
      });
      throw error;
    }
  };

  const terminerProduction = async (id: string, quantiteProduite: number) => {
    try {
      const { error } = await supabase
        .from('ordres_production_briques')
        .update({
          statut: 'termine',
          quantite_produite: quantiteProduite,
          date_fin_reelle: new Date().toISOString().split('T')[0]
        })
        .eq('id', id);

      if (error) throw error;
      await loadData();
      toast({
        title: "Succès",
        description: "Production terminée avec succès",
      });
    } catch (error: any) {
      console.error('Erreur terminer production:', error);
      toast({
        title: "Erreur",
        description: "Impossible de terminer la production",
        variant: "destructive",
      });
      throw error;
    }
  };

  const remove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ordres_production_briques')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadData();
      toast({
        title: "Succès",
        description: "Ordre de production supprimé avec succès",
      });
    } catch (error: any) {
      console.error('Erreur suppression ordre:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'ordre de production",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return { data, loading, create, update, terminerProduction, remove, refresh: loadData };
};
