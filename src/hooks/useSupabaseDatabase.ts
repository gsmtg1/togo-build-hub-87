
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type {
  Product,
  ProductionOrder,
  Delivery,
  DeliveryItem,
  Sale,
  SaleItem,
  Quote,
  QuoteItem,
  Invoice,
  InvoiceItem,
  Employee,
  AccountingEntry,
  MonthlyGoal,
  AppSetting
} from '@/types/database';

// Hook générique pour les opérations CRUD
function useSupabaseTable<T extends { id: string }>(tableName: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: result, error } = await supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setData(result || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      console.error(`Erreur lors du chargement de ${tableName}:`, err);
      toast({
        title: "Erreur",
        description: `Impossible de charger les données: ${errorMessage}`,
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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error(`Erreur lors de la création dans ${tableName}:`, err);
      toast({
        title: "Erreur",
        description: `Impossible de créer l'élément: ${errorMessage}`,
        variant: "destructive",
      });
      throw err;
    }
  };

  const update = async (id: string, updates: Partial<T>) => {
    try {
      const { data: result, error } = await supabase
        .from(tableName)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      await loadData();
      toast({
        title: "Succès",
        description: "Élément mis à jour avec succès",
      });
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error(`Erreur lors de la mise à jour dans ${tableName}:`, err);
      toast({
        title: "Erreur",
        description: `Impossible de mettre à jour l'élément: ${errorMessage}`,
        variant: "destructive",
      });
      throw err;
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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error(`Erreur lors de la suppression dans ${tableName}:`, err);
      toast({
        title: "Erreur",
        description: `Impossible de supprimer l'élément: ${errorMessage}`,
        variant: "destructive",
      });
      throw err;
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    data,
    loading,
    error,
    create,
    update,
    remove,
    reload: loadData
  };
}

// Hooks spécifiques pour chaque table
export const useProducts = () => useSupabaseTable<Product>('products');
export const useProductionOrders = () => useSupabaseTable<ProductionOrder>('production_orders');
export const useDeliveries = () => useSupabaseTable<Delivery>('deliveries');
export const useDeliveryItems = () => useSupabaseTable<DeliveryItem>('delivery_items');
export const useSales = () => useSupabaseTable<Sale>('sales');
export const useSaleItems = () => useSupabaseTable<SaleItem>('sale_items');
export const useQuotes = () => useSupabaseTable<Quote>('quotes');
export const useQuoteItems = () => useSupabaseTable<QuoteItem>('quote_items');
export const useInvoices = () => useSupabaseTable<Invoice>('invoices');
export const useInvoiceItems = () => useSupabaseTable<InvoiceItem>('invoice_items');
export const useEmployees = () => useSupabaseTable<Employee>('employees');
export const useAccountingEntries = () => useSupabaseTable<AccountingEntry>('accounting_entries');
export const useMonthlyGoals = () => useSupabaseTable<MonthlyGoal>('monthly_goals');
export const useAppSettings = () => useSupabaseTable<AppSetting>('app_settings');

// Hook pour les catégories comptables (créer une liste statique pour l'instant)
export const useAccountingCategories = () => {
  const [data] = useState([
    { id: '1', name: 'Matières premières', description: 'Achat de matières premières' },
    { id: '2', name: 'Salaires', description: 'Salaires et charges sociales' },
    { id: '3', name: 'Transport', description: 'Frais de transport et livraison' },
    { id: '4', name: 'Maintenance', description: 'Maintenance et réparations' },
    { id: '5', name: 'Utilities', description: 'Électricité, eau, téléphone' },
    { id: '6', name: 'Marketing', description: 'Publicité et marketing' },
    { id: '7', name: 'Administration', description: 'Frais administratifs' },
    { id: '8', name: 'Autres', description: 'Autres dépenses' }
  ]);
  
  return {
    data,
    loading: false,
    error: null
  };
};
