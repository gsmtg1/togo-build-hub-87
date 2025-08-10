
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Hook générique pour toutes les tables
export const useSupabaseDatabase = (tableName: string) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: result, error } = await supabase
        .from(tableName as any)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error(`Error loading ${tableName}:`, error);
        throw error;
      }
      
      setData(result || []);
    } catch (error) {
      console.error(`Error loading ${tableName}:`, error);
      toast({
        title: "Erreur",
        description: `Impossible de charger les données de ${tableName}`,
        variant: "destructive",
      });
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const create = async (item: any) => {
    try {
      const { data: result, error } = await supabase
        .from(tableName as any)
        .insert([item])
        .select()
        .single();
      
      if (error) throw error;
      
      await loadData();
      toast({
        title: "Succès",
        description: "Élément créé avec succès",
      });
      return result;
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

  const update = async (id: string, updates: any) => {
    try {
      const { error } = await supabase
        .from(tableName as any)
        .update({ ...updates, updated_at: new Date().toISOString() })
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
        .from(tableName as any)
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
};

// Hooks spécifiques pour chaque table
export const useProducts = () => useSupabaseDatabase('products');
export const useProductionOrders = () => useSupabaseDatabase('production_orders');
export const useDeliveries = () => useSupabaseDatabase('deliveries');
export const useSales = () => useSupabaseDatabase('sales');
export const useEmployees = () => useSupabaseDatabase('employees');
export const useClients = () => useSupabaseDatabase('clients');
export const useQuotations = () => useSupabaseDatabase('quotations');
export const useInvoices = () => useSupabaseDatabase('invoices');
export const useExpenses = () => useSupabaseDatabase('expenses');
export const useAccountingEntries = () => useSupabaseDatabase('accounting_entries');
export const useStock = () => useSupabaseDatabase('stock');
export const useLosses = () => useSupabaseDatabase('losses');
export const useDailyLosses = () => useSupabaseDatabase('daily_losses');
export const useObjectives = () => useSupabaseDatabase('objectives');
export const useMonthlyGoals = () => useSupabaseDatabase('monthly_goals');

// Additional hooks for missing exports
export const useStockMovements = () => useSupabaseDatabase('stock_movements');
export const useProductsWithStock = () => {
  const { data: products, ...rest } = useSupabaseDatabase('products');
  return { products, ...rest };
};
export const useProductionMaterials = () => useSupabaseDatabase('production_materials');
export const useBrickTypes = () => useSupabaseDatabase('brick_types');
export const useProductionRecipes = () => useSupabaseDatabase('production_recipes');
export const useProductionCosts = () => useSupabaseDatabase('production_costs');
export const useAccountingCategories = () => useSupabaseDatabase('accounting_categories');
export const useAppSettings = () => useSupabaseDatabase('app_settings');
