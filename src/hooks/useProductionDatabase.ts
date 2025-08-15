
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Hook pour les matériaux de production
export const useMateriauxProduction = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: result, error } = await supabase
        .from('materiaux_production')
        .select('*')
        .order('nom');
      
      if (error) throw error;
      setData(result || []);
    } catch (error) {
      console.error('Error loading materiaux production:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les matériaux",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const create = async (item: any) => {
    try {
      const { data: result, error } = await supabase
        .from('materiaux_production')
        .insert([item])
        .select()
        .single();
      
      if (error) throw error;
      await loadData();
      toast({
        title: "Succès",
        description: "Matériau créé avec succès",
      });
      return result;
    } catch (error) {
      console.error('Error creating materiau:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le matériau",
        variant: "destructive",
      });
      throw error;
    }
  };

  const update = async (id: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('materiaux_production')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      await loadData();
      toast({
        title: "Succès",
        description: "Matériau mis à jour avec succès",
      });
    } catch (error) {
      console.error('Error updating materiau:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le matériau",
        variant: "destructive",
      });
      throw error;
    }
  };

  const remove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('materiaux_production')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      await loadData();
      toast({
        title: "Succès",
        description: "Matériau supprimé avec succès",
      });
    } catch (error) {
      console.error('Error deleting materiau:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le matériau",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return { data, loading, create, update, remove, reload: loadData };
};

// Hook pour les types de briques
export const useTypesBriques = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: result, error } = await supabase
        .from('types_briques')
        .select('*')
        .order('nom');
      
      if (error) throw error;
      setData(result || []);
    } catch (error) {
      console.error('Error loading types briques:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les types de briques",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const create = async (item: any) => {
    try {
      const { data: result, error } = await supabase
        .from('types_briques')
        .insert([item])
        .select()
        .single();
      
      if (error) throw error;
      await loadData();
      toast({
        title: "Succès",
        description: "Type de brique créé avec succès",
      });
      return result;
    } catch (error) {
      console.error('Error creating type brique:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le type de brique",
        variant: "destructive",
      });
      throw error;
    }
  };

  const update = async (id: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('types_briques')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      await loadData();
      toast({
        title: "Succès",
        description: "Type de brique mis à jour avec succès",
      });
    } catch (error) {
      console.error('Error updating type brique:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le type de brique",
        variant: "destructive",
      });
      throw error;
    }
  };

  const remove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('types_briques')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      await loadData();
      toast({
        title: "Succès",
        description: "Type de brique supprimé avec succès",
      });
    } catch (error) {
      console.error('Error deleting type brique:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le type de brique",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return { data, loading, create, update, remove, reload: loadData };
};

// Hook pour les recettes de production
export const useRecettesProduction = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: result, error } = await supabase
        .from('recettes_production')
        .select(`
          *,
          materiaux_production(nom, unite, prix_unitaire),
          products(name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setData(result || []);
    } catch (error) {
      console.error('Error loading recettes production:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les recettes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const create = async (item: any) => {
    try {
      const { data: result, error } = await supabase
        .from('recettes_production')
        .insert([item])
        .select()
        .single();
      
      if (error) throw error;
      await loadData();
      toast({
        title: "Succès",
        description: "Recette créée avec succès",
      });
      return result;
    } catch (error) {
      console.error('Error creating recette:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la recette",
        variant: "destructive",
      });
      throw error;
    }
  };

  const update = async (id: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('recettes_production')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      await loadData();
      toast({
        title: "Succès",
        description: "Recette mise à jour avec succès",
      });
    } catch (error) {
      console.error('Error updating recette:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la recette",
        variant: "destructive",
      });
      throw error;
    }
  };

  const remove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('recettes_production')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      await loadData();
      toast({
        title: "Succès",
        description: "Recette supprimée avec succès",
      });
    } catch (error) {
      console.error('Error deleting recette:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la recette",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return { data, loading, create, update, remove, reload: loadData };
};

// Hook pour les coûts de production
export const useCoutsProduction = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: result, error } = await supabase
        .from('couts_production')
        .select(`
          *,
          materiaux_production(nom, unite)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setData(result || []);
    } catch (error) {
      console.error('Error loading couts production:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les coûts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const create = async (item: any) => {
    try {
      const { data: result, error } = await supabase
        .from('couts_production')
        .insert([item])
        .select()
        .single();
      
      if (error) throw error;
      await loadData();
      toast({
        title: "Succès",
        description: "Coût créé avec succès",
      });
      return result;
    } catch (error) {
      console.error('Error creating cout:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le coût",
        variant: "destructive",
      });
      throw error;
    }
  };

  const update = async (id: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('couts_production')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      await loadData();
      toast({
        title: "Succès",
        description: "Coût mis à jour avec succès",
      });
    } catch (error) {
      console.error('Error updating cout:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le coût",
        variant: "destructive",
      });
      throw error;
    }
  };

  const remove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('couts_production')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      await loadData();
      toast({
        title: "Succès",
        description: "Coût supprimé avec succès",
      });
    } catch (error) {
      console.error('Error deleting cout:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le coût",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return { data, loading, create, update, remove, reload: loadData };
};
