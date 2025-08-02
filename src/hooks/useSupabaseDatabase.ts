
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { 
  Product, 
  StockMovement, 
  DailyLoss, 
  Sale, 
  Delivery, 
  Invoice, 
  ProductionOrder,
  AccountingEntry,
  AccountingCategory,
  MonthlyGoal,
  AppSetting
} from '@/types/supabase';

// Hook générique pour les opérations Supabase
function useSupabaseTable<T extends { id: string }>(tableName: string) {
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
      setData(result || []);
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

// Hooks spécialisés
export const useProducts = () => useSupabaseTable<Product>('products');
export const useStockMovements = () => useSupabaseTable<StockMovement>('stock_movements');
export const useDailyLosses = () => useSupabaseTable<DailyLoss>('daily_losses');
export const useMonthlyLossReports = () => useSupabaseTable<any>('monthly_loss_reports');
export const useSales = () => useSupabaseTable<Sale>('sales');
export const useDeliveries = () => useSupabaseTable<Delivery>('deliveries');
export const useInvoices = () => useSupabaseTable<Invoice>('invoices');
export const useProductionOrders = () => useSupabaseTable<ProductionOrder>('production_orders');

// Hooks pour comptabilité
export const useAccountingEntries = () => useSupabaseTable<AccountingEntry>('accounting_entries');
export const useAccountingCategories = () => useSupabaseTable<AccountingCategory>('accounting_categories');

// Hooks pour objectifs et paramètres
export const useMonthlyGoals = () => useSupabaseTable<MonthlyGoal>('monthly_goals');
export const useAppSettings = () => useSupabaseTable<AppSetting>('app_settings');

// Hooks manquants
export const useProductionMaterials = () => useSupabaseTable<any>('production_materials');
export const useBrickTypes = () => useSupabaseTable<any>('brick_types');
export const useProductionRecipes = () => useSupabaseTable<any>('production_recipes');
export const useProductionCosts = () => useSupabaseTable<any>('production_costs');
export const useEmployees = () => useSupabaseTable<any>('employees');

// Hook spécialisé pour les produits avec stock
export function useProductsWithStock() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('actif', true)
        .order('nom');
      
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les produits",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return { products, loading, reload: loadProducts };
}
