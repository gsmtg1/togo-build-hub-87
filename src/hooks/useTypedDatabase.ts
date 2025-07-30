
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

// Données mock de base
const mockData: { [key: string]: any[] } = {
  production_orders: [
    {
      id: '1',
      numero_ordre: 'OP-001',
      product_id: '1',
      quantite: 1000,
      date_demande: new Date().toISOString(),
      statut: 'en_attente',
      demandeur_id: 'Jean Dupont',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  products: [
    {
      id: '1',
      nom: 'Brique standard',
      categorie: 'standard',
      longueur_cm: 30,
      largeur_cm: 20,
      hauteur_cm: 15,
      prix_unitaire: 0,
      stock_actuel: 1000,
      stock_minimum: 100,
      actif: true,
      date_creation: new Date().toISOString(),
      date_modification: new Date().toISOString()
    }
  ],
  deliveries: [
    {
      id: '1',
      numero_livraison: 'LIV-001',
      client_nom: 'Client Test',
      client_adresse: 'Adresse Test',
      lieu_livraison: 'Lieu Test',
      date_commande: new Date().toISOString(),
      statut: 'en_attente',
      montant_total: 50000,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  brick_types: [
    {
      id: '1',
      nom: 'Brique standard',
      description: 'Brique standard pour construction',
      longueur_cm: 30,
      largeur_cm: 20,
      hauteur_cm: 15,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  production_materials: [
    {
      id: '1',
      nom: 'Sable',
      description: 'Sable fin pour construction',
      unite: 'kg',
      prix_unitaire: 50,
      stock_actuel: 1000,
      stock_minimum: 100,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]
};

function useTypedTable<T extends { id: string }>(tableName: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [useLocal, setUseLocal] = useState(false);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      
      if (useLocal) {
        // Utiliser les données mock
        await new Promise(resolve => setTimeout(resolve, 200));
        setData((mockData[tableName] as T[]) || []);
      } else {
        try {
          const { data: result, error } = await supabase
            .from(tableName)
            .select('*')
            .order('created_at', { ascending: false });

          if (error) {
            console.warn(`Supabase error for ${tableName}, falling back to mock data:`, error);
            setUseLocal(true);
            setData((mockData[tableName] as T[]) || []);
          } else {
            setData((result as T[]) || []);
          }
        } catch (err) {
          console.warn(`Connection error for ${tableName}, using mock data:`, err);
          setUseLocal(true);
          setData((mockData[tableName] as T[]) || []);
        }
      }
    } catch (error) {
      console.error(`Error loading ${tableName}:`, error);
      setData((mockData[tableName] as T[]) || []);
    } finally {
      setLoading(false);
    }
  };

  const create = async (item: Partial<T>) => {
    try {
      const newItem = {
        ...item,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as unknown as T;

      if (useLocal) {
        setData(prev => [newItem, ...prev]);
      } else {
        try {
          const { error } = await supabase
            .from(tableName)
            .insert([newItem]);

          if (error) {
            console.warn(`Supabase insert error for ${tableName}, using local mode:`, error);
            setUseLocal(true);
            setData(prev => [newItem, ...prev]);
          } else {
            await loadData();
          }
        } catch (err) {
          console.warn(`Connection error during insert for ${tableName}, using local mode:`, err);
          setUseLocal(true);
          setData(prev => [newItem, ...prev]);
        }
      }
      
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
      const updatedItem = { ...item, updated_at: new Date().toISOString() };

      if (useLocal) {
        setData(prev => prev.map(existing => 
          existing.id === id ? { ...existing, ...updatedItem } as T : existing
        ));
      } else {
        try {
          const { error } = await supabase
            .from(tableName)
            .update(updatedItem)
            .eq('id', id);

          if (error) {
            console.warn(`Supabase update error for ${tableName}, using local mode:`, error);
            setUseLocal(true);
            setData(prev => prev.map(existing => 
              existing.id === id ? { ...existing, ...updatedItem } as T : existing
            ));
          } else {
            await loadData();
          }
        } catch (err) {
          console.warn(`Connection error during update for ${tableName}, using local mode:`, err);
          setUseLocal(true);
          setData(prev => prev.map(existing => 
            existing.id === id ? { ...existing, ...updatedItem } as T : existing
          ));
        }
      }
      
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
      if (useLocal) {
        setData(prev => prev.filter(item => item.id !== id));
      } else {
        try {
          const { error } = await supabase
            .from(tableName)
            .delete()
            .eq('id', id);

          if (error) {
            console.warn(`Supabase delete error for ${tableName}, using local mode:`, error);
            setUseLocal(true);
            setData(prev => prev.filter(item => item.id !== id));
          } else {
            await loadData();
          }
        } catch (err) {
          console.warn(`Connection error during delete for ${tableName}, using local mode:`, err);
          setUseLocal(true);
          setData(prev => prev.filter(item => item.id !== id));
        }
      }
      
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
