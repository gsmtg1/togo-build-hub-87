
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
  AppSetting,
  BrickType,
  ProductionMaterial,
  ProductionRecipe,
  ProductionCost
} from '@/types/database';

// Mock data pour les types de briques
const mockBrickTypes: BrickType[] = [
  {
    id: '1',
    nom: 'Brique standard',
    description: 'Brique standard pour construction',
    longueur_cm: 30,
    largeur_cm: 20,
    hauteur_cm: 15,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    nom: 'Brique creuse',
    description: 'Brique creuse pour isolation',
    longueur_cm: 30,
    largeur_cm: 20,
    hauteur_cm: 10,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Mock data pour les matériaux de production
const mockProductionMaterials: ProductionMaterial[] = [
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
  },
  {
    id: '2',
    nom: 'Ciment',
    description: 'Ciment Portland',
    unite: 'kg',
    prix_unitaire: 150,
    stock_actuel: 500,
    stock_minimum: 50,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    nom: 'Eau',
    description: 'Eau pour mélange',
    unite: 'litre',
    prix_unitaire: 5,
    stock_actuel: 2000,
    stock_minimum: 200,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    nom: 'Électricité',
    description: 'Énergie électrique',
    unite: 'kWh',
    prix_unitaire: 100,
    stock_actuel: 1000,
    stock_minimum: 100,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Mock data pour les recettes de production
const mockProductionRecipes: ProductionRecipe[] = [
  {
    id: '1',
    product_id: '1',
    material_id: '1',
    quantite_necessaire: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    product_id: '1',
    material_id: '2',
    quantite_necessaire: 0.5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    product_id: '1',
    material_id: '3',
    quantite_necessaire: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    product_id: '1',
    material_id: '4',
    quantite_necessaire: 0.1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Mock data pour les produits
const mockProducts: Product[] = [
  {
    id: '1',
    nom: 'Brique standard 15x20x30',
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
  },
  {
    id: '2',
    nom: 'Brique creuse 10x20x30',
    categorie: 'creuse',
    longueur_cm: 30,
    largeur_cm: 20,
    hauteur_cm: 10,
    prix_unitaire: 0,
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
    cout_prevu: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const mockDeliveries: Delivery[] = [
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
];

// Hook générique pour les opérations CRUD avec mock data uniquement
function useLocalTable<T extends { id: string }>(mockData: T[]) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simuler un délai de chargement
      await new Promise(resolve => setTimeout(resolve, 300));
      setData(mockData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      console.error('Erreur lors du chargement des données:', err);
      setData(mockData);
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
      
      setData(prev => [newItem, ...prev]);
      
      toast({
        title: "Succès",
        description: "Élément créé avec succès",
      });
      
      return newItem;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('Erreur lors de la création:', err);
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
      const updatedItem = { ...updates, updated_at: new Date().toISOString() };
      
      setData(prev => prev.map(item => 
        item.id === id 
          ? { ...item, ...updatedItem } as T
          : item
      ));
      
      toast({
        title: "Succès",
        description: "Élément mis à jour avec succès",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('Erreur lors de la mise à jour:', err);
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
      console.error('Erreur lors de la suppression:', err);
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
    useLocal: true,
    create,
    update,
    remove,
    reload: loadData
  };
}

// Hooks spécifiques pour chaque table
export const useProducts = () => useLocalTable<Product>(mockProducts);
export const useProductionOrders = () => useLocalTable<ProductionOrder>(mockProductionOrders);
export const useDeliveries = () => useLocalTable<Delivery>(mockDeliveries);
export const useDeliveryItems = () => useLocalTable<DeliveryItem>([]);
export const useSales = () => useLocalTable<Sale>([]);
export const useSaleItems = () => useLocalTable<SaleItem>([]);
export const useQuotes = () => useLocalTable<Quote>([]);
export const useQuoteItems = () => useLocalTable<QuoteItem>([]);
export const useInvoices = () => useLocalTable<Invoice>([]);
export const useInvoiceItems = () => useLocalTable<InvoiceItem>([]);
export const useEmployees = () => useLocalTable<Employee>([]);
export const useAccountingEntries = () => useLocalTable<AccountingEntry>([]);
export const useMonthlyGoals = () => useLocalTable<MonthlyGoal>([]);
export const useAppSettings = () => useLocalTable<AppSetting>([]);
export const useBrickTypes = () => useLocalTable<BrickType>(mockBrickTypes);
export const useProductionMaterials = () => useLocalTable<ProductionMaterial>(mockProductionMaterials);
export const useProductionRecipes = () => useLocalTable<ProductionRecipe>(mockProductionRecipes);
export const useProductionCosts = () => useLocalTable<ProductionCost>([]);

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
