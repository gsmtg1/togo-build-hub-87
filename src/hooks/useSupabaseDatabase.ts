
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Tables = Database['public']['Tables'];

// Base hook with proper typing
function useSupabaseTableBase<TTableName extends keyof Tables>(tableName: TTableName) {
  type TRow = Tables[TTableName]['Row'];
  type TInsert = Tables[TTableName]['Insert'];
  type TUpdate = Tables[TTableName]['Update'];

  const [data, setData] = useState<TRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: result, error } = await supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Properly cast the result to the expected type
      setData((result as TRow[]) || []);
    } catch (error) {
      console.error(`Error loading ${tableName}:`, error);
      toast({
        title: "Erreur",
        description: `Impossible de charger les données de ${tableName}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const create = async (item: TInsert) => {
    try {
      const { error } = await supabase
        .from(tableName)
        .insert(item);

      if (error) throw error;
      
      await loadData();
      toast({
        title: "Succès",
        description: "Élément créé avec succès",
      });
    } catch (error) {
      console.error(`Error creating ${tableName}:`, error);
      toast({
        title: "Erreur",
        description: "Impossible de créer l'élément",
        variant: "destructive",
      });
    }
  };

  const update = async (id: string, item: TUpdate) => {
    try {
      const { error } = await supabase
        .from(tableName)
        .update({ ...item, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      
      await loadData();
      toast({
        title: "Succès",
        description: "Élément mis à jour avec succès",
      });
    } catch (error) {
      console.error(`Error updating ${tableName}:`, error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'élément",
        variant: "destructive",
      });
    }
  };

  const remove = async (id: string) => {
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await loadData();
      toast({
        title: "Succès",
        description: "Élément supprimé avec succès",
      });
    } catch (error) {
      console.error(`Error deleting ${tableName}:`, error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'élément",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    data,
    loading,
    create,
    update,
    remove,
    reload: loadData
  };
}

// Individual hooks for each table with proper typing
export const useAccountingCategories = () => 
  useSupabaseTableBase('accounting_categories');

export const useAccountingEntries = () => 
  useSupabaseTableBase('accounting_entries');

export const useProductionMaterials = () => 
  useSupabaseTableBase('production_materials');

export const useBrickTypes = () => 
  useSupabaseTableBase('brick_types');

export const useProductionRecipes = () => 
  useSupabaseTableBase('production_recipes');

export const useProductionCosts = () => 
  useSupabaseTableBase('production_costs');

export const useMonthlyGoals = () => 
  useSupabaseTableBase('monthly_goals');

export const useAppSettings = () => 
  useSupabaseTableBase('app_settings');

export const useProducts = () => 
  useSupabaseTableBase('products');
