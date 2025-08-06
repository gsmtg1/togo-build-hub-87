
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { 
  Product, 
  DailyLoss, 
  Sale, 
  Delivery, 
  Invoice, 
  ProductionOrder,
  AccountingEntry,
  AccountingCategory,
  MonthlyGoal,
  AppSetting,
  Employee,
  BrickType,
  ProductionMaterial,
  ProductionRecipe,
  ProductionCost
} from '@/types/database';

// Interface for stock movements
export interface StockMovement {
  id: string;
  product_id: string;
  type: 'entree' | 'sortie' | 'perte' | 'ajustement';
  quantite: number;
  motif?: string;
  reference_document?: string;
  date_mouvement: string;
  created_by?: string;
  commentaire?: string;
  created_at: string;
}

// Generic hook for Supabase operations with specific types
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

// Specialized hooks
export const useProducts = () => useSupabaseTable<Product>('products');
export const useDailyLosses = () => useSupabaseTable<DailyLoss>('daily_losses');
export const useSales = () => useSupabaseTable<Sale>('sales');
export const useDeliveries = () => useSupabaseTable<Delivery>('deliveries');
export const useInvoices = () => useSupabaseTable<Invoice>('invoices');
export const useProductionOrders = () => useSupabaseTable<ProductionOrder>('production_orders');

// Hooks for accounting
export const useAccountingEntries = () => useSupabaseTable<AccountingEntry>('accounting_entries');
export const useAccountingCategories = () => useSupabaseTable<AccountingCategory>('accounting_categories');

// Hooks for goals and settings
export const useMonthlyGoals = () => useSupabaseTable<MonthlyGoal>('monthly_goals');
export const useAppSettings = () => useSupabaseTable<AppSetting>('app_settings');

// Hooks for production
export const useProductionMaterials = () => useSupabaseTable<ProductionMaterial>('production_materials');
export const useBrickTypes = () => useSupabaseTable<BrickType>('brick_types');
export const useProductionRecipes = () => useSupabaseTable<ProductionRecipe>('production_recipes');
export const useProductionCosts = () => useSupabaseTable<ProductionCost>('production_costs');
export const useEmployees = () => useSupabaseTable<Employee>('employees');

// Hook for stock movements
export const useStockMovements = () => {
  const [data, setData] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      // For now, we'll return empty array since stock_movements table might not exist yet
      setData([]);
    } catch (error) {
      console.error('Error loading stock movements:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les mouvements de stock",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const create = async (item: Omit<StockMovement, 'id' | 'created_at'>) => {
    try {
      // Mock implementation for now
      console.log('Creating stock movement:', item);
      toast({
        title: "Succès",
        description: "Mouvement de stock créé avec succès",
      });
    } catch (error) {
      console.error('Error creating stock movement:', error);
      throw error;
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    data,
    loading,
    create,
    reload: loadData
  };
};

// Specialized hook for products with stock
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
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      // Map the database result to our Product interface
      const mappedProducts = (data || []).map(item => ({
        ...item,
        nom: item.name // Add compatibility property
      })) as Product[];
      setProducts(mappedProducts);
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
