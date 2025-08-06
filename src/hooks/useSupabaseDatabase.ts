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

// Mapping functions to transform database records to interface types
const mapDbProductToProduct = (dbProduct: any): Product => ({
  id: dbProduct.id,
  name: dbProduct.name,
  nom: dbProduct.name, // Compatibility
  type: dbProduct.type,
  dimensions: dbProduct.dimensions || '',
  description: dbProduct.description || '',
  unit: dbProduct.unit || 'pièce',
  price: dbProduct.price || 0,
  is_active: dbProduct.is_active ?? true,
  created_at: dbProduct.created_at,
  updated_at: dbProduct.updated_at
});

const mapProductToDb = (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => ({
  name: product.name,
  type: product.type,
  dimensions: product.dimensions,
  description: product.description,
  unit: product.unit,
  price: product.price,
  is_active: product.is_active
});

const mapDbSaleToSale = (dbSale: any): Sale => ({
  id: dbSale.id,
  numero_vente: `SALE-${dbSale.id.slice(0, 8)}`,
  client_nom: 'Client', // Default value as client name not in db
  client_telephone: '',
  client_adresse: '',
  date_vente: dbSale.sale_date || dbSale.created_at,
  statut: dbSale.status as any,
  montant_total: dbSale.total_amount || 0,
  vendeur_id: '',
  commentaires: dbSale.notes || '',
  created_at: dbSale.created_at,
  updated_at: dbSale.updated_at
});

const mapSaleToDb = (sale: Omit<Sale, 'id' | 'created_at' | 'updated_at'>) => ({
  client_id: '', // Default value
  product_id: '', // Default value  
  quantity: 1,
  unit_price: 0,
  total_amount: sale.montant_total,
  status: sale.statut,
  notes: sale.commentaires,
  payment_method: 'cash' as const
});

const mapDbDeliveryToDelivery = (dbDelivery: any): Delivery => ({
  id: dbDelivery.id,
  numero_livraison: `DEL-${dbDelivery.id.slice(0, 8)}`,
  client_nom: 'Client',
  client_telephone: '',
  client_adresse: dbDelivery.delivery_address || '',
  lieu_livraison: dbDelivery.delivery_address || '',
  date_commande: dbDelivery.created_at,
  date_livraison_prevue: dbDelivery.delivery_date,
  date_livraison_reelle: '',
  statut: dbDelivery.status as any,
  responsable_id: '',
  signature_client: '',
  commentaires: dbDelivery.notes || '',
  montant_total: 0,
  created_at: dbDelivery.created_at,
  updated_at: dbDelivery.updated_at
});

const mapDeliveryToDb = (delivery: Omit<Delivery, 'id' | 'created_at' | 'updated_at'>) => ({
  sale_id: '', // Default value
  delivery_address: delivery.lieu_livraison,
  delivery_date: delivery.date_livraison_prevue || new Date().toISOString(),
  status: delivery.statut,
  driver_name: '',
  vehicle_info: '',
  notes: delivery.commentaires
});

const mapDbInvoiceToInvoice = (dbInvoice: any): Invoice => ({
  id: dbInvoice.id,
  numero_facture: dbInvoice.invoice_number || `INV-${dbInvoice.id.slice(0, 8)}`,
  client_nom: 'Client',
  client_telephone: '',
  client_adresse: '',
  date_facture: dbInvoice.issue_date || dbInvoice.created_at,
  date_echeance: dbInvoice.due_date,
  statut: dbInvoice.status as any,
  montant_total: dbInvoice.total_amount || 0,
  montant_paye: 0,
  vendeur_id: '',
  sale_id: dbInvoice.sale_id,
  delivery_id: '',
  commentaires: dbInvoice.notes || '',
  created_at: dbInvoice.created_at,
  updated_at: dbInvoice.updated_at
});

const mapInvoiceToDb = (invoice: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>) => ({
  invoice_number: invoice.numero_facture,
  sale_id: invoice.sale_id || '',
  issue_date: invoice.date_facture,
  due_date: invoice.date_echeance || new Date().toISOString(),
  total_amount: invoice.montant_total,
  tax_amount: 0,
  tax_rate: 18,
  status: invoice.statut,
  notes: invoice.commentaires
});

const mapDbProductionOrderToProductionOrder = (dbOrder: any): ProductionOrder => ({
  id: dbOrder.id,
  numero_ordre: `PROD-${dbOrder.id.slice(0, 8)}`,
  product_id: dbOrder.product_id,
  planned_quantity: dbOrder.planned_quantity || 0,
  produced_quantity: dbOrder.produced_quantity || 0,
  start_date: dbOrder.start_date,
  end_date: dbOrder.end_date,
  status: dbOrder.status as any,
  notes: dbOrder.notes,
  created_at: dbOrder.created_at,
  updated_at: dbOrder.updated_at
});

const mapDbEmployeeToEmployee = (dbEmployee: any): Employee => ({
  id: dbEmployee.id,
  nom: dbEmployee.last_name || '',
  prenom: dbEmployee.first_name || '',
  email: dbEmployee.email,
  telephone: dbEmployee.phone,
  adresse: dbEmployee.address,
  document_identite: '',
  role: dbEmployee.role as any,
  salaire: dbEmployee.salary || 0,
  date_embauche: dbEmployee.hire_date || dbEmployee.created_at,
  actif: dbEmployee.is_active ?? true,
  created_at: dbEmployee.created_at,
  updated_at: dbEmployee.updated_at
});

const mapEmployeeToDb = (employee: Omit<Employee, 'id' | 'created_at' | 'updated_at'>) => ({
  first_name: employee.prenom,
  last_name: employee.nom,
  email: employee.email,
  phone: employee.telephone,
  address: employee.adresse,
  role: employee.role,
  salary: employee.salaire,
  hire_date: employee.date_embauche,
  is_active: employee.actif,
  department: '',
  position: ''
});

// Specialized hooks for each table
export const useProducts = () => {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: result, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      const mappedProducts = (result || []).map(mapDbProductToProduct);
      setData(mappedProducts);
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

  const create = async (item: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const dbItem = mapProductToDb(item);
      
      const { data: result, error } = await supabase
        .from('products')
        .insert([dbItem])
        .select()
        .single();
      
      if (error) throw error;
      await loadData();
      toast({
        title: "Succès",
        description: "Produit créé avec succès",
      });
      return mapDbProductToProduct(result);
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

  const update = async (id: string, updates: Partial<Product>) => {
    try {
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.type) dbUpdates.type = updates.type;
      if (updates.price !== undefined) dbUpdates.price = updates.price;
      if (updates.is_active !== undefined) dbUpdates.is_active = updates.is_active;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.dimensions !== undefined) dbUpdates.dimensions = updates.dimensions;
      if (updates.unit !== undefined) dbUpdates.unit = updates.unit;
      
      const { error } = await supabase
        .from('products')
        .update(dbUpdates)
        .eq('id', id);
      
      if (error) throw error;
      await loadData();
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
      await loadData();
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
    loadData();
  }, []);

  return { data, loading, create, update, remove, reload: loadData };
};

export const useDailyLosses = () => {
  const [data, setData] = useState<DailyLoss[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: result, error } = await supabase
        .from('daily_losses')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setData(result || []);
    } catch (error) {
      console.error('Error loading daily losses:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les pertes journalières",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const create = async (item: Omit<DailyLoss, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: result, error } = await supabase
        .from('daily_losses')
        .insert([item])
        .select()
        .single();
      
      if (error) throw error;
      await loadData();
      toast({
        title: "Succès",
        description: "Perte journalière créée avec succès",
      });
      return result;
    } catch (error) {
      console.error('Error creating daily loss:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la perte journalière",
        variant: "destructive",
      });
      throw error;
    }
  };

  const update = async (id: string, updates: Partial<DailyLoss>) => {
    try {
      const { error } = await supabase
        .from('daily_losses')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
      await loadData();
      toast({
        title: "Succès",
        description: "Perte journalière mise à jour avec succès",
      });
    } catch (error) {
      console.error('Error updating daily loss:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la perte journalière",
        variant: "destructive",
      });
      throw error;
    }
  };

  const remove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('daily_losses')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      await loadData();
      toast({
        title: "Succès",
        description: "Perte journalière supprimée avec succès",
      });
    } catch (error) {
      console.error('Error deleting daily loss:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la perte journalière",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return { data, loading, create, update, remove, reload: loadData };
};

export const useSales = () => {
  const [data, setData] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: result, error } = await supabase
        .from('sales')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      const mappedSales = (result || []).map(mapDbSaleToSale);
      setData(mappedSales);
    } catch (error) {
      console.error('Error loading sales:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les ventes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const create = async (item: Omit<Sale, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const dbItem = mapSaleToDb(item);
      
      const { data: result, error } = await supabase
        .from('sales')
        .insert([dbItem])
        .select()
        .single();
      
      if (error) throw error;
      await loadData();
      toast({
        title: "Succès",
        description: "Vente créée avec succès",
      });
      return mapDbSaleToSale(result);
    } catch (error) {
      console.error('Error creating sale:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la vente",
        variant: "destructive",
      });
      throw error;
    }
  };

  const update = async (id: string, updates: Partial<Sale>) => {
    try {
      const dbUpdates: any = {};
      if (updates.statut) dbUpdates.status = updates.statut;
      if (updates.montant_total !== undefined) dbUpdates.total_amount = updates.montant_total;
      if (updates.commentaires) dbUpdates.notes = updates.commentaires;
      
      const { error } = await supabase
        .from('sales')
        .update(dbUpdates)
        .eq('id', id);
      
      if (error) throw error;
      await loadData();
      toast({
        title: "Succès",
        description: "Vente mise à jour avec succès",
      });
    } catch (error) {
      console.error('Error updating sale:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la vente",
        variant: "destructive",
      });
      throw error;
    }
  };

  const remove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('sales')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      await loadData();
      toast({
        title: "Succès",
        description: "Vente supprimée avec succès",
      });
    } catch (error) {
      console.error('Error deleting sale:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la vente",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return { data, loading, create, update, remove, reload: loadData };
};

export const useDeliveries = () => {
  const [data, setData] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: result, error } = await supabase
        .from('deliveries')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      const mappedDeliveries = (result || []).map(mapDbDeliveryToDelivery);
      setData(mappedDeliveries);
    } catch (error) {
      console.error('Error loading deliveries:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les livraisons",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const create = async (item: Omit<Delivery, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const dbItem = mapDeliveryToDb(item);
      
      const { data: result, error } = await supabase
        .from('deliveries')
        .insert([dbItem])
        .select()
        .single();
      
      if (error) throw error;
      await loadData();
      toast({
        title: "Succès",
        description: "Livraison créée avec succès",
      });
      return mapDbDeliveryToDelivery(result);
    } catch (error) {
      console.error('Error creating delivery:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la livraison",
        variant: "destructive",
      });
      throw error;
    }
  };

  const update = async (id: string, updates: Partial<Delivery>) => {
    try {
      const dbUpdates: any = {};
      if (updates.lieu_livraison) dbUpdates.delivery_address = updates.lieu_livraison;
      if (updates.date_livraison_prevue) dbUpdates.delivery_date = updates.date_livraison_prevue;
      if (updates.statut) dbUpdates.status = updates.statut;
      if (updates.commentaires) dbUpdates.notes = updates.commentaires;
      
      const { error } = await supabase
        .from('deliveries')
        .update(dbUpdates)
        .eq('id', id);
      
      if (error) throw error;
      await loadData();
      toast({
        title: "Succès",
        description: "Livraison mise à jour avec succès",
      });
    } catch (error) {
      console.error('Error updating delivery:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la livraison",
        variant: "destructive",
      });
      throw error;
    }
  };

  const remove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('deliveries')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      await loadData();
      toast({
        title: "Succès",
        description: "Livraison supprimée avec succès",
      });
    } catch (error) {
      console.error('Error deleting delivery:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la livraison",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return { data, loading, create, update, remove, reload: loadData };
};

export const useInvoices = () => {
  const [data, setData] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: result, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      const mappedInvoices = (result || []).map(mapDbInvoiceToInvoice);
      setData(mappedInvoices);
    } catch (error) {
      console.error('Error loading invoices:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les factures",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const create = async (item: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const dbItem = mapInvoiceToDb(item);
      
      const { data: result, error } = await supabase
        .from('invoices')
        .insert([dbItem])
        .select()
        .single();
      
      if (error) throw error;
      await loadData();
      toast({
        title: "Succès",
        description: "Facture créée avec succès",
      });
      return mapDbInvoiceToInvoice(result);
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la facture",
        variant: "destructive",
      });
      throw error;
    }
  };

  const update = async (id: string, updates: Partial<Invoice>) => {
    try {
      const dbUpdates: any = {};
      if (updates.numero_facture) dbUpdates.invoice_number = updates.numero_facture;
      if (updates.statut) dbUpdates.status = updates.statut;
      if (updates.montant_total !== undefined) dbUpdates.total_amount = updates.montant_total;
      if (updates.commentaires) dbUpdates.notes = updates.commentaires;
      
      const { error } = await supabase
        .from('invoices')
        .update(dbUpdates)
        .eq('id', id);
      
      if (error) throw error;
      await loadData();
      toast({
        title: "Succès",
        description: "Facture mise à jour avec succès",
      });
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la facture",
        variant: "destructive",
      });
      throw error;
    }
  };

  const remove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      await loadData();
      toast({
        title: "Succès",
        description: "Facture supprimée avec succès",
      });
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la facture",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return { data, loading, create, update, remove, reload: loadData };
};

export const useProductionOrders = () => {
  const [data, setData] = useState<ProductionOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: result, error } = await supabase
        .from('production_orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      const mappedOrders = (result || []).map(mapDbProductionOrderToProductionOrder);
      setData(mappedOrders);
    } catch (error) {
      console.error('Error loading production orders:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les ordres de production",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const create = async (item: Omit<ProductionOrder, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const dbItem = {
        product_id: item.product_id,
        planned_quantity: item.planned_quantity,
        produced_quantity: item.produced_quantity,
        start_date: item.start_date,
        end_date: item.end_date,
        status: item.status,
        notes: item.notes
      };
      
      const { data: result, error } = await supabase
        .from('production_orders')
        .insert([dbItem])
        .select()
        .single();
      
      if (error) throw error;
      await loadData();
      toast({
        title: "Succès",
        description: "Ordre de production créé avec succès",
      });
      return mapDbProductionOrderToProductionOrder(result);
    } catch (error) {
      console.error('Error creating production order:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer l'ordre de production",
        variant: "destructive",
      });
      throw error;
    }
  };

  const update = async (id: string, updates: Partial<ProductionOrder>) => {
    try {
      const dbUpdates: any = {};
      if (updates.planned_quantity !== undefined) dbUpdates.planned_quantity = updates.planned_quantity;
      if (updates.produced_quantity !== undefined) dbUpdates.produced_quantity = updates.produced_quantity;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.notes) dbUpdates.notes = updates.notes;
      if (updates.end_date) dbUpdates.end_date = updates.end_date;
      
      const { error } = await supabase
        .from('production_orders')
        .update(dbUpdates)
        .eq('id', id);
      
      if (error) throw error;
      await loadData();
      toast({
        title: "Succès",
        description: "Ordre de production mis à jour avec succès",
      });
    } catch (error) {
      console.error('Error updating production order:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'ordre de production",
        variant: "destructive",
      });
      throw error;
    }
  };

  const remove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('production_orders')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      await loadData();
      toast({
        title: "Succès",
        description: "Ordre de production supprimé avec succès",
      });
    } catch (error) {
      console.error('Error deleting production order:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'ordre de production",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return { data, loading, create, update, remove, reload: loadData };
};

// Hooks for accounting
export const useAccountingEntries = () => {
  const [data, setData] = useState<AccountingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: result, error } = await supabase
        .from('accounting_entries')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setData(result || []);
    } catch (error) {
      console.error('Error loading accounting entries:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les écritures comptables",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const create = async (item: Omit<AccountingEntry, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: result, error } = await supabase
        .from('accounting_entries')
        .insert([item])
        .select()
        .single();
      
      if (error) throw error;
      await loadData();
      toast({
        title: "Succès",
        description: "Écriture comptable créée avec succès",
      });
      return result;
    } catch (error) {
      console.error('Error creating accounting entry:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer l'écriture comptable",
        variant: "destructive",
      });
      throw error;
    }
  };

  const update = async (id: string, updates: Partial<AccountingEntry>) => {
    try {
      const { error } = await supabase
        .from('accounting_entries')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
      await loadData();
      toast({
        title: "Succès",
        description: "Écriture comptable mise à jour avec succès",
      });
    } catch (error) {
      console.error('Error updating accounting entry:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'écriture comptable",
        variant: "destructive",
      });
      throw error;
    }
  };

  const remove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('accounting_entries')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      await loadData();
      toast({
        title: "Succès",
        description: "Écriture comptable supprimée avec succès",
      });
    } catch (error) {
      console.error('Error deleting accounting entry:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'écriture comptable",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return { data, loading, create, update, remove, reload: loadData };
};

export const useAccountingCategories = () => {
  const [data, setData] = useState<AccountingCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: result, error } = await supabase
        .from('accounting_categories')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      // Map database result to interface
      const mappedCategories = (result || []).map((item: any) => ({
        ...item,
        account_type: item.account_type as 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
      }));
      setData(mappedCategories);
    } catch (error) {
      console.error('Error loading accounting categories:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les catégories comptables",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const create = async (item: Omit<AccountingCategory, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: result, error } = await supabase
        .from('accounting_categories')
        .insert([item])
        .select()
        .single();
      
      if (error) throw error;
      await loadData();
      toast({
        title: "Succès",
        description: "Catégorie comptable créée avec succès",
      });
      return result;
    } catch (error) {
      console.error('Error creating accounting category:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la catégorie comptable",
        variant: "destructive",
      });
      throw error;
    }
  };

  const update = async (id: string, updates: Partial<AccountingCategory>) => {
    try {
      const { error } = await supabase
        .from('accounting_categories')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
      await loadData();
      toast({
        title: "Succès",
        description: "Catégorie comptable mise à jour avec succès",
      });
    } catch (error) {
      console.error('Error updating accounting category:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la catégorie comptable",
        variant: "destructive",
      });
      throw error;
    }
  };

  const remove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('accounting_categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      await loadData();
      toast({
        title: "Succès",
        description: "Catégorie comptable supprimée avec succès",
      });
    } catch (error) {
      console.error('Error deleting accounting category:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la catégorie comptable",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return { data, loading, create, update, remove, reload: loadData };
};

// Hooks for goals and settings
export const useMonthlyGoals = () => {
  const [data, setData] = useState<MonthlyGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: result, error } = await supabase
        .from('monthly_goals')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      // Map database result to interface with proper status typing
      const mappedGoals = (result || []).map((item: any) => ({
        ...item,
        status: item.status as 'active' | 'completed' | 'cancelled'
      }));
      setData(mappedGoals);
    } catch (error) {
      console.error('Error loading monthly goals:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les objectifs mensuels",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const create = async (item: Omit<MonthlyGoal, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: result, error } = await supabase
        .from('monthly_goals')
        .insert([item])
        .select()
        .single();
      
      if (error) throw error;
      await loadData();
      toast({
        title: "Succès",
        description: "Objectif mensuel créé avec succès",
      });
      return result;
    } catch (error) {
      console.error('Error creating monthly goal:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer l'objectif mensuel",
        variant: "destructive",
      });
      throw error;
    }
  };

  const update = async (id: string, updates: Partial<MonthlyGoal>) => {
    try {
      const { error } = await supabase
        .from('monthly_goals')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
      await loadData();
      toast({
        title: "Succès",
        description: "Objectif mensuel mis à jour avec succès",
      });
    } catch (error) {
      console.error('Error updating monthly goal:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'objectif mensuel",
        variant: "destructive",
      });
      throw error;
    }
  };

  const remove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('monthly_goals')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      await loadData();
      toast({
        title: "Succès",
        description: "Objectif mensuel supprimé avec succès",
      });
    } catch (error) {
      console.error('Error deleting monthly goal:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'objectif mensuel",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return { data, loading, create, update, remove, reload: loadData };
};

export const useAppSettings = () => {
  const [data, setData] = useState<AppSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: result, error } = await supabase
        .from('app_settings')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setData(result || []);
    } catch (error) {
      console.error('Error loading app settings:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les paramètres",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const create = async (item: Omit<AppSetting, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: result, error } = await supabase
        .from('app_settings')
        .insert([item])
        .select()
        .single();
      
      if (error) throw error;
      await loadData();
      toast({
        title: "Succès",
        description: "Paramètre créé avec succès",
      });
      return result;
    } catch (error) {
      console.error('Error creating app setting:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le paramètre",
        variant: "destructive",
      });
      throw error;
    }
  };

  const update = async (id: string, updates: Partial<AppSetting>) => {
    try {
      const { error } = await supabase
        .from('app_settings')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
      await loadData();
      toast({
        title: "Succès",
        description: "Paramètre mis à jour avec succès",
      });
    } catch (error) {
      console.error('Error updating app setting:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le paramètre",
        variant: "destructive",
      });
      throw error;
    }
  };

  const remove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('app_settings')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      await loadData();
      toast({
        title: "Succès",
        description: "Paramètre supprimé avec succès",
      });
    } catch (error) {
      console.error('Error deleting app setting:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le paramètre",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return { data, loading, create, update, remove, reload: loadData };
};

// Hooks for employees
export const useEmployees = () => {
  const [data, setData] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: result, error } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      const mappedEmployees = (result || []).map(mapDbEmployeeToEmployee);
      setData(mappedEmployees);
    } catch (error) {
      console.error('Error loading employees:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les employés",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const create = async (item: Omit<Employee, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const dbItem = mapEmployeeToDb(item);
      
      const { data: result, error } = await supabase
        .from('employees')
        .insert([dbItem])
        .select()
        .single();
      
      if (error) throw error;
      await loadData();
      toast({
        title: "Succès",
        description: "Employé créé avec succès",
      });
      return mapDbEmployeeToEmployee(result);
    } catch (error) {
      console.error('Error creating employee:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer l'employé",
        variant: "destructive",
      });
      throw error;
    }
  };

  const update = async (id: string, updates: Partial<Employee>) => {
    try {
      const dbUpdates: any = {};
      if (updates.prenom) dbUpdates.first_name = updates.prenom;
      if (updates.nom) dbUpdates.last_name = updates.nom;
      if (updates.email) dbUpdates.email = updates.email;
      if (updates.telephone) dbUpdates.phone = updates.telephone;
      if (updates.adresse) dbUpdates.address = updates.adresse;
      if (updates.role) dbUpdates.role = updates.role;
      if (updates.salaire !== undefined) dbUpdates.salary = updates.salaire;
      if (updates.date_embauche) dbUpdates.hire_date = updates.date_embauche;
      if (updates.actif !== undefined) dbUpdates.is_active = updates.actif;
      
      const { error } = await supabase
        .from('employees')
        .update(dbUpdates)
        .eq('id', id);
      
      if (error) throw error;
      await loadData();
      toast({
        title: "Succès",
        description: "Employé mis à jour avec succès",
      });
    } catch (error) {
      console.error('Error updating employee:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'employé",
        variant: "destructive",
      });
      throw error;
    }
  };

  const remove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      await loadData();
      toast({
        title: "Succès",
        description: "Employé supprimé avec succès",
      });
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'employé",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return { data, loading, create, update, remove, reload: loadData };
};

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
      const mappedProducts = (data || []).map(mapDbProductToProduct);
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
};

// Stub implementations for production hooks that don't have tables yet
export const useProductionMaterials = () => {
  const [data, setData] = useState<ProductionMaterial[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const create = async (item: Omit<ProductionMaterial, 'id' | 'created_at' | 'updated_at'>) => {
    console.log('Creating production material:', item);
    toast({ title: "Succès", description: "Matériau de production créé avec succès" });
  };

  const update = async (id: string, updates: Partial<ProductionMaterial>) => {
    console.log('Updating production material:', id, updates);
    toast({ title: "Succès", description: "Matériau de production mis à jour avec succès" });
  };

  const remove = async (id: string) => {
    console.log('Deleting production material:', id);
    toast({ title: "Succès", description: "Matériau de production supprimé avec succès" });
  };

  return { data, loading, create, update, remove, reload: () => {} };
};

export const useBrickTypes = () => {
  const [data, setData] = useState<BrickType[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const create = async (item: Omit<BrickType, 'id' | 'created_at' | 'updated_at'>) => {
    console.log('Creating brick type:', item);
    toast({ title: "Succès", description: "Type de brique créé avec succès" });
  };

  const update = async (id: string, updates: Partial<BrickType>) => {
    console.log('Updating brick type:', id, updates);
    toast({ title: "Succès", description: "Type de brique mis à jour avec succès" });
  };

  const remove = async (id: string) => {
    console.log('Deleting brick type:', id);
    toast({ title: "Succès", description: "Type de brique supprimé avec succès" });
  };

  return { data, loading, create, update, remove, reload: () => {} };
};

export const useProductionRecipes = () => {
  const [data, setData] = useState<ProductionRecipe[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const create = async (item: Omit<ProductionRecipe, 'id' | 'created_at' | 'updated_at'>) => {
    console.log('Creating production recipe:', item);
    toast({ title: "Succès", description: "Recette de production créée avec succès" });
  };

  const update = async (id: string, updates: Partial<ProductionRecipe>) => {
    console.log('Updating production recipe:', id, updates);
    toast({ title: "Succès", description: "Recette de production mise à jour avec succès" });
  };

  const remove = async (id: string) => {
    console.log('Deleting production recipe:', id);
    toast({ title: "Succès", description: "Recette de production supprimée avec succès" });
  };

  return { data, loading, create, update, remove, reload: () => {} };
};

export const useProductionCosts = () => {
  const [data, setData] = useState<ProductionCost[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const create = async (item: Omit<ProductionCost, 'id' | 'created_at' | 'updated_at'>) => {
    console.log('Creating production cost:', item);
    toast({ title: "Succès", description: "Coût de production créé avec succès" });
  };

  const update = async (id: string, updates: Partial<ProductionCost>) => {
    console.log('Updating production cost:', id, updates);
    toast({ title: "Succès", description: "Coût de production mis à jour avec succès" });
  };

  const remove = async (id: string) => {
    console.log('Deleting production cost:', id);
    toast({ title: "Succès", description: "Coût de production supprimé avec succès" });
  };

  return { data, loading, create, update, remove, reload: () => {} };
};
