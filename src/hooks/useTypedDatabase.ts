
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type {
  ProductionOrder,
  ProductionStep,
  Delivery,
  DeliveryItem,
  Product,
  BrickType,
  ProductionMaterial,
  ProductionRecipe,
  ProductionCost,
  MonthlyGoal,
  AccountingCategory,
  AccountingEntry,
  AppSetting
} from '@/types/database';

function useTypedTable<T extends { id: string }>(tableName: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: result, error } = await (supabase as any)
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

  const create = async (item: Partial<T>) => {
    try {
      const { error } = await (supabase as any)
        .from(tableName)
        .insert([item]);

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

  const update = async (id: string, item: Partial<T>) => {
    try {
      const { error } = await (supabase as any)
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
      const { error } = await (supabase as any)
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

// Hooks typés pour chaque table
export const useProductionOrders = () => useTypedTable<ProductionOrder>('production_orders');
export const useProductionSteps = () => useTypedTable<ProductionStep>('production_steps');
export const useDeliveries = () => useTypedTable<Delivery>('deliveries');
export const useDeliveryItems = () => useTypedTable<DeliveryItem>('delivery_items');
export const useProducts = () => useTypedTable<Product>('products');
export const useBrickTypes = () => useTypedTable<BrickType>('brick_types');
export const useProductionMaterials = () => useTypedTable<ProductionMaterial>('production_materials');
export const useProductionRecipes = () => useTypedTable<ProductionRecipe>('production_recipes');
export const useProductionCosts = () => useTypedTable<ProductionCost>('production_costs');
export const useMonthlyGoals = () => useTypedTable<MonthlyGoal>('monthly_goals');
export const useAccountingCategories = () => useTypedTable<AccountingCategory>('accounting_categories');
export const useAccountingEntries = () => useTypedTable<AccountingEntry>('accounting_entries');
export const useAppSettings = () => useTypedTable<AppSetting>('app_settings');
