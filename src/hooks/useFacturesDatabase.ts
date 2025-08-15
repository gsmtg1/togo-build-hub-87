
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FactureItem {
  nom_produit: string;
  quantite: number;
  prix_unitaire: number;
  total_ligne: number;
  product_id?: string | null;
}

interface FactureData {
  numero_facture: string;
  client_id?: string | null;
  client_nom: string;
  client_telephone?: string;
  client_adresse?: string;
  date_facture: string;
  date_echeance?: string | null;
  montant_total: number;
  statut: string;
  commentaires?: string;
  mode_livraison?: string;
  frais_livraison?: number;
  adresse_livraison?: string;
  sous_total?: number;
  remise_globale_montant?: number;
}

export const useFacturesDatabase = () => {
  const [factures, setFactures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchFactures = async () => {
    try {
      setLoading(true);
      console.log('Fetching factures...');
      
      const { data, error } = await supabase
        .from('factures_professionnelles')
        .select(`
          *,
          facture_items (
            id,
            nom_produit,
            quantite,
            prix_unitaire,
            total_ligne,
            product_id
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching factures:', error);
        throw error;
      }
      
      console.log('Factures loaded successfully:', data);
      setFactures(data || []);
    } catch (error: any) {
      console.error('Error in fetchFactures:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les factures",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFactures();
  }, []);

  const createFacture = async (factureData: FactureData, items: FactureItem[]) => {
    try {
      console.log('Creating facture with data:', factureData);
      console.log('Items:', items);

      // Validate input data
      if (!factureData.numero_facture || !factureData.client_nom) {
        throw new Error('Numéro de facture et nom du client requis');
      }

      if (!items || items.length === 0) {
        throw new Error('Au moins un produit requis');
      }

      // Create the main invoice
      const { data: newFacture, error: factureError } = await supabase
        .from('factures_professionnelles')
        .insert([{
          numero_facture: factureData.numero_facture,
          client_id: factureData.client_id,
          client_nom: factureData.client_nom,
          client_telephone: factureData.client_telephone || '',
          client_adresse: factureData.client_adresse || '',
          date_facture: factureData.date_facture,
          date_echeance: factureData.date_echeance,
          montant_total: factureData.montant_total,
          statut: factureData.statut,
          commentaires: factureData.commentaires || '',
          mode_livraison: factureData.mode_livraison || 'retrait_usine',
          frais_livraison: factureData.frais_livraison || 0,
          adresse_livraison: factureData.adresse_livraison || '',
          sous_total: factureData.sous_total || 0,
          remise_globale_montant: factureData.remise_globale_montant || 0
        }])
        .select()
        .single();

      if (factureError) {
        console.error('Error creating facture:', factureError);
        throw new Error(`Erreur création facture: ${factureError.message}`);
      }

      console.log('Facture created:', newFacture);

      // Create invoice items
      const itemsToInsert = items.map(item => ({
        facture_id: newFacture.id,
        nom_produit: item.nom_produit,
        quantite: item.quantite,
        prix_unitaire: item.prix_unitaire,
        total_ligne: item.total_ligne,
        product_id: item.product_id
      }));

      const { error: itemsError } = await supabase
        .from('facture_items')
        .insert(itemsToInsert);

      if (itemsError) {
        console.error('Error creating items:', itemsError);
        // Delete the created invoice if items failed
        await supabase
          .from('factures_professionnelles')
          .delete()
          .eq('id', newFacture.id);
        throw new Error(`Erreur création items: ${itemsError.message}`);
      }

      console.log('Items created successfully');
      
      // Refresh the list
      await fetchFactures();
      
      toast({
        title: "Succès",
        description: "Facture créée avec succès",
      });

      return newFacture;
    } catch (error: any) {
      console.error('Error in createFacture:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer la facture",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateFacture = async (id: string, factureData: Partial<FactureData>) => {
    try {
      const { data, error } = await supabase
        .from('factures_professionnelles')
        .update(factureData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      await fetchFactures();
      
      toast({
        title: "Succès",
        description: "Facture mise à jour",
      });
      
      return data;
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la facture",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteFacture = async (id: string) => {
    try {
      const { error } = await supabase
        .from('factures_professionnelles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchFactures();
      
      toast({
        title: "Succès",
        description: "Facture supprimée",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la facture",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    factures,
    loading,
    createFacture,
    updateFacture,
    deleteFacture,
    refreshFactures: fetchFactures
  };
};
