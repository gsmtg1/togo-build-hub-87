
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Hook générique pour toutes les tables
export const useSupabaseDatabase = (tableName: string) => {
  const [data, setData] = useState<any[]>([]);
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

// Hooks spécialisés avec fonctionnalités business
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
export const useStockMovements = () => useSupabaseDatabase('stock_movements');
export const useProductionMaterials = () => useSupabaseDatabase('production_materials');
export const useBrickTypes = () => useSupabaseDatabase('brick_types');
export const useProductionRecipes = () => useSupabaseDatabase('production_recipes');
export const useProductionCosts = () => useSupabaseDatabase('production_costs');
export const useAccountingCategories = () => useSupabaseDatabase('accounting_categories');

// Hook pour les produits avec stock
export const useProductsWithStock = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadProductsWithStock = async () => {
    try {
      setLoading(true);
      
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          stock (
            quantity,
            minimum_stock
          )
        `)
        .eq('is_active', true)
        .order('name');

      if (productsError) {
        console.error('Error loading products:', productsError);
        throw productsError;
      }

      const productsWithStock = (productsData || []).map(product => ({
        ...product,
        stock_quantity: product.stock?.[0]?.quantity || 0,
        minimum_stock: product.stock?.[0]?.minimum_stock || 0
      }));

      setProducts(productsWithStock);
    } catch (error) {
      console.error('Error loading products with stock:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const create = async (productData: any) => {
    try {
      const { data: result, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();
      
      if (error) throw error;
      
      await loadProductsWithStock();
      toast({
        title: "Succès",
        description: "Produit créé avec succès",
      });
      return result;
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le produit",
        variant: "destructive",
      });
      throw error;
    }
  };

  const update = async (id: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
      
      await loadProductsWithStock();
      toast({
        title: "Succès",
        description: "Produit mis à jour avec succès",
      });
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le produit",
        variant: "destructive",
      });
      throw error;
    }
  };

  const remove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      await loadProductsWithStock();
      toast({
        title: "Succès",
        description: "Produit supprimé avec succès",
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le produit",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    loadProductsWithStock();
  }, []);

  return {
    products,
    loading,
    create,
    update,
    remove,
    reload: loadProductsWithStock
  };
};

// Hook pour les alertes système
export const useSystemAlerts = () => {
  const [stockAlerts, setStockAlerts] = useState<any[]>([]);
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAlerts = async () => {
    try {
      setLoading(true);

      // Charger les alertes de stock
      const { data: stockData, error: stockError } = await supabase
        .from('stock_alerts')
        .select('*');

      if (stockError) {
        console.error('Error loading stock alerts:', stockError);
      } else {
        setStockAlerts(stockData || []);
      }

      // Charger les commandes en attente
      const { data: ordersData, error: ordersError } = await supabase
        .from('pending_orders')
        .select('*');

      if (ordersError) {
        console.error('Error loading pending orders:', ordersError);
      } else {
        setPendingOrders(ordersData || []);
      }

    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
    
    // Rafraîchir les alertes toutes les 30 secondes
    const interval = setInterval(loadAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  return {
    stockAlerts,
    pendingOrders,
    loading,
    reload: loadAlerts
  };
};

// Hook pour les paramètres d'application
export const useAppSettings = () => {
  const { data, loading, create, update, remove, reload } = useSupabaseDatabase('app_settings');
  
  const getSetting = (key: string) => {
    return data.find(setting => setting.cle === key);
  };

  const updateSetting = async (key: string, value: string, description?: string) => {
    const existing = getSetting(key);
    const settingData = {
      cle: key,
      valeur: value,
      description: description || existing?.description || ''
    };

    if (existing) {
      await update(existing.id, settingData);
    } else {
      await create(settingData);
    }
  };

  return {
    data,
    loading,
    create,
    update,
    remove,
    reload,
    getSetting,
    updateSetting
  };
};
