
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Hook pour les clients complets
export const useClientsComplets = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: result, error } = await supabase
        .from('clients_complets')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setData(result || []);
    } catch (error) {
      console.error('Error loading clients:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les clients",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const create = async (item: any) => {
    try {
      const { data: result, error } = await supabase
        .from('clients_complets')
        .insert([item])
        .select()
        .single();
      
      if (error) throw error;
      await loadData();
      toast({
        title: "Succès",
        description: "Client créé avec succès",
      });
      return result;
    } catch (error) {
      console.error('Error creating client:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le client",
        variant: "destructive",
      });
      throw error;
    }
  };

  const update = async (id: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('clients_complets')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      await loadData();
      toast({
        title: "Succès",
        description: "Client mis à jour avec succès",
      });
    } catch (error) {
      console.error('Error updating client:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le client",
        variant: "destructive",
      });
      throw error;
    }
  };

  const remove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('clients_complets')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      await loadData();
      toast({
        title: "Succès",
        description: "Client supprimé avec succès",
      });
    } catch (error) {
      console.error('Error deleting client:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le client",
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

// Hook pour les factures professionnelles
export const useFacturesProfessionnelles = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: result, error } = await supabase
        .from('factures_professionnelles')
        .select(`
          *,
          facture_items (
            id,
            nom_produit,
            quantite,
            prix_unitaire,
            total_ligne
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setData(result || []);
    } catch (error) {
      console.error('Error loading factures:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les factures",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const create = async (factureData: any, items: any[]) => {
    try {
      const { data: facture, error: factureError } = await supabase
        .from('factures_professionnelles')
        .insert([factureData])
        .select()
        .single();
      
      if (factureError) throw factureError;

      if (items.length > 0) {
        const itemsToInsert = items.map(item => ({
          ...item,
          facture_id: facture.id
        }));

        const { error: itemsError } = await supabase
          .from('facture_items')
          .insert(itemsToInsert);
        
        if (itemsError) throw itemsError;
      }
      
      await loadData();
      toast({
        title: "Succès",
        description: "Facture créée avec succès",
      });
      return facture;
    } catch (error) {
      console.error('Error creating facture:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la facture",
        variant: "destructive",
      });
      throw error;
    }
  };

  const update = async (id: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('factures_professionnelles')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      await loadData();
      toast({
        title: "Succès",
        description: "Facture mise à jour avec succès",
      });
    } catch (error) {
      console.error('Error updating facture:', error);
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
        .from('factures_professionnelles')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      await loadData();
      toast({
        title: "Succès",
        description: "Facture supprimée avec succès",
      });
    } catch (error) {
      console.error('Error deleting facture:', error);
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

// Hook pour les devis professionnels
export const useDevisProfessionnels = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: result, error } = await supabase
        .from('devis_professionnels')
        .select(`
          *,
          devis_items (
            id,
            nom_produit,
            quantite,
            prix_unitaire,
            total_ligne
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setData(result || []);
    } catch (error) {
      console.error('Error loading devis:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les devis",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const create = async (devisData: any, items: any[]) => {
    try {
      const { data: devis, error: devisError } = await supabase
        .from('devis_professionnels')
        .insert([devisData])
        .select()
        .single();
      
      if (devisError) throw devisError;

      if (items.length > 0) {
        const itemsToInsert = items.map(item => ({
          ...item,
          devis_id: devis.id
        }));

        const { error: itemsError } = await supabase
          .from('devis_items')
          .insert(itemsToInsert);
        
        if (itemsError) throw itemsError;
      }
      
      await loadData();
      toast({
        title: "Succès",
        description: "Devis créé avec succès",
      });
      return devis;
    } catch (error) {
      console.error('Error creating devis:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le devis",
        variant: "destructive",
      });
      throw error;
    }
  };

  const update = async (id: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('devis_professionnels')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      await loadData();
      toast({
        title: "Succès",
        description: "Devis mis à jour avec succès",
      });
    } catch (error) {
      console.error('Error updating devis:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le devis",
        variant: "destructive",
      });
      throw error;
    }
  };

  const remove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('devis_professionnels')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      await loadData();
      toast({
        title: "Succès",
        description: "Devis supprimé avec succès",
      });
    } catch (error) {
      console.error('Error deleting devis:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le devis",
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

// Hook pour les ordres de production
export const useOrdresProductionBriques = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: result, error } = await supabase
        .from('ordres_production_briques')
        .select(`
          *,
          products (
            id,
            name,
            type,
            dimensions
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setData(result || []);
    } catch (error) {
      console.error('Error loading ordres production:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les ordres de production",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const create = async (item: any) => {
    try {
      const { data: result, error } = await supabase
        .from('ordres_production_briques')
        .insert([item])
        .select()
        .single();
      
      if (error) throw error;
      await loadData();
      toast({
        title: "Succès",
        description: "Ordre de production créé avec succès",
      });
      return result;
    } catch (error) {
      console.error('Error creating ordre production:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer l'ordre de production",
        variant: "destructive",
      });
      throw error;
    }
  };

  const update = async (id: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('ordres_production_briques')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      await loadData();
      toast({
        title: "Succès",
        description: "Ordre de production mis à jour avec succès",
      });
    } catch (error) {
      console.error('Error updating ordre production:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'ordre de production",
        variant: "destructive",
      });
      throw error;
    }
  };

  const terminerProduction = async (id: string, quantiteProduite: number) => {
    try {
      // Mettre à jour l'ordre de production
      const { data: ordre, error: ordreError } = await supabase
        .from('ordres_production_briques')
        .update({
          quantite_produite: quantiteProduite,
          statut: 'termine',
          date_fin_reelle: new Date().toISOString().split('T')[0]
        })
        .eq('id', id)
        .select('product_id')
        .single();
      
      if (ordreError) throw ordreError;

      // Mettre à jour le stock
      const { data: stock, error: stockSelectError } = await supabase
        .from('stock')
        .select('quantity')
        .eq('product_id', ordre.product_id)
        .single();

      if (stockSelectError && stockSelectError.code !== 'PGRST116') {
        throw stockSelectError;
      }

      if (stock) {
        // Mettre à jour le stock existant
        const { error: stockUpdateError } = await supabase
          .from('stock')
          .update({ quantity: stock.quantity + quantiteProduite })
          .eq('product_id', ordre.product_id);
        
        if (stockUpdateError) throw stockUpdateError;
      } else {
        // Créer une nouvelle entrée de stock
        const { error: stockCreateError } = await supabase
          .from('stock')
          .insert([{
            product_id: ordre.product_id,
            quantity: quantiteProduite,
            minimum_stock: 10
          }]);
        
        if (stockCreateError) throw stockCreateError;
      }

      await loadData();
      toast({
        title: "Succès",
        description: "Production terminée et stock mis à jour",
      });
    } catch (error) {
      console.error('Error terminating production:', error);
      toast({
        title: "Erreur",
        description: "Impossible de terminer la production",
        variant: "destructive",
      });
      throw error;
    }
  };

  const remove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ordres_production_briques')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      await loadData();
      toast({
        title: "Succès",
        description: "Ordre de production supprimé avec succès",
      });
    } catch (error) {
      console.error('Error deleting ordre production:', error);
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

  return { 
    data, 
    loading, 
    create, 
    update, 
    remove, 
    terminerProduction,
    reload: loadData 
  };
};
