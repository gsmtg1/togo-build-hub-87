
import { useState, useEffect } from 'react';
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

// Mock data for development
const mockProducts: Product[] = [
  {
    id: '1',
    nom: 'Brique standard 15x20x30',
    categorie: 'Briques',
    longueur_cm: 30,
    largeur_cm: 20,
    hauteur_cm: 15,
    prix_unitaire: 250,
    stock_actuel: 1000,
    stock_minimum: 100,
    actif: true,
    date_creation: new Date().toISOString(),
    date_modification: new Date().toISOString()
  },
  {
    id: '2',
    nom: 'Brique creuse 10x20x30',
    categorie: 'Briques',
    longueur_cm: 30,
    largeur_cm: 20,
    hauteur_cm: 10,
    prix_unitaire: 200,
    stock_actuel: 500,
    stock_minimum: 50,
    actif: true,
    date_creation: new Date().toISOString(),
    date_modification: new Date().toISOString()
  }
];

const mockProductionOrders: ProductionOrder[] = [
  {
    id: '1',
    numero_ordre: 'OP-001',
    product_id: '1',
    quantite: 1000,
    date_demande: new Date().toISOString(),
    date_prevue: new Date().toISOString(),
    statut: 'en_attente',
    demandeur_id: 'Jean Dupont',
    cout_prevu: 250000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Hook générique pour les opérations CRUD
function useSupabaseTable<T extends { id: string }>(tableName: string, mockData: T[]) {
  const [data, setData] = useState<T[]>(mockData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setData(mockData);
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
      const newItem = {
        ...item,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as T;
      
      setData(prev => [newItem, ...prev]);
      toast({
        title: "Succès",
        description: "Élément créé avec succès",
      });
      
      return newItem;
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
      setData(prev => prev.map(item => 
        item.id === id 
          ? { ...item, ...updates, updated_at: new Date().toISOString() }
          : item
      ));
      
      toast({
        title: "Succès",
        description: "Élément mis à jour avec succès",
      });
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
      setData(prev => prev.filter(item => item.id !== id));
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
export const useProducts = () => useSupabaseTable<Product>('products', mockProducts);
export const useProductionOrders = () => useSupabaseTable<ProductionOrder>('production_orders', mockProductionOrders);
export const useDeliveries = () => useSupabaseTable<Delivery>('deliveries', []);
export const useDeliveryItems = () => useSupabaseTable<DeliveryItem>('delivery_items', []);
export const useSales = () => useSupabaseTable<Sale>('sales', []);
export const useSaleItems = () => useSupabaseTable<SaleItem>('sale_items', []);
export const useQuotes = () => useSupabaseTable<Quote>('quotes', []);
export const useQuoteItems = () => useSupabaseTable<QuoteItem>('quote_items', []);
export const useInvoices = () => useSupabaseTable<Invoice>('invoices', []);
export const useInvoiceItems = () => useSupabaseTable<InvoiceItem>('invoice_items', []);
export const useEmployees = () => useSupabaseTable<Employee>('employees', []);
export const useAccountingEntries = () => useSupabaseTable<AccountingEntry>('accounting_entries', []);
export const useMonthlyGoals = () => useSupabaseTable<MonthlyGoal>('monthly_goals', []);
export const useAppSettings = () => useSupabaseTable<AppSetting>('app_settings', []);

// Hook pour les catégories comptables
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
