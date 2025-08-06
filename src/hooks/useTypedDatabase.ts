
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { 
  Product, 
  DailyLoss, 
  ProductionCost,
  AccountingEntry,
  MonthlyGoal,
  AppSetting
} from '@/types/database';

// Generic hook for Supabase operations with better typing
function useSupabaseTypedTable<T extends { id: string }>(tableName: string) {
  const [data, setData] = useState<T[]>([]);
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
      setData((result as T[]) || []);
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

  const create = async (item: Omit<T, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: result, error } = await supabase
        .from(tableName)
        .insert([item as any])
        .select()
        .single();
      
      if (error) throw error;
      await loadData();
      toast({
        title: "Succès",
        description: "Élément créé avec succès",
      });
      return result as T;
    } catch (error) {
      console.error(`Error creating ${tableName}:`, error);
      toast({
        title: "Erreur",
        description: "Impossible de créer l'élément",
        variant: "destructive",
      });
      throw error;
    }
  };

  const update = async (id: string, updates: Partial<T>) => {
    try {
      const { error } = await supabase
        .from(tableName)
        .update({ ...updates, updated_at: new Date().toISOString() } as any)
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
      throw error;
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
      throw error;
    }
  };

  useEffect(() => {
    loadData();
  }, [tableName]);

  return {
    data,
    loading,
    create,
    update,
    remove,
    reload: loadData
  };
}

export const useProducts = () => useSupabaseTypedTable<Product>('products');
export const useDailyLosses = () => useSupabaseTypedTable<DailyLoss>('daily_losses');
export const useProductionCosts = () => useSupabaseTypedTable<ProductionCost>('production_costs');
export const useAccountingEntries = () => useSupabaseTypedTable<AccountingEntry>('accounting_entries');
export const useMonthlyGoals = () => useSupabaseTypedTable<MonthlyGoal>('monthly_goals');
export const useAppSettings = () => useSupabaseTypedTable<AppSetting>('app_settings');
