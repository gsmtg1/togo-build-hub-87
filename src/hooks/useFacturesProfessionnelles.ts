
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

export const useFacturesProfessionnelles = () => {
  const [factures, setFactures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchFactures = async () => {
    try {
      const { data, error } = await supabase
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
      setFactures(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des factures:', error);
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

  const create = async (factureData: FactureData, items: FactureItem[]) => {
    try {
      console.log('Création de facture avec données:', factureData);
      console.log('Items:', items);

      // Créer la facture principale
      const { data: factureCreated, error: factureError } = await supabase
        .from('factures_professionnelles')
        .insert([factureData])
        .select()
        .single();

      if (factureError) {
        console.error('Erreur lors de la création de la facture:', factureError);
        throw factureError;
      }

      console.log('Facture créée:', factureCreated);

      // Créer les items de facture
      if (items.length > 0) {
        const itemsToInsert = items.map(item => ({
          facture_id: factureCreated.id,
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
          console.error('Erreur lors de la création des items:', itemsError);
          throw itemsError;
        }
      }

      await fetchFactures();
      return factureCreated;
    } catch (error) {
      console.error('Erreur complète lors de la création:', error);
      throw error;
    }
  };

  const update = async (id: string, factureData: Partial<FactureData>) => {
    try {
      const { data, error } = await supabase
        .from('factures_professionnelles')
        .update(factureData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      await fetchFactures();
      return data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      throw error;
    }
  };

  const remove = async (id: string) => {
    try {
      // Supprimer d'abord les items
      await supabase
        .from('facture_items')
        .delete()
        .eq('facture_id', id);

      // Puis supprimer la facture
      const { error } = await supabase
        .from('factures_professionnelles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchFactures();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      throw error;
    }
  };

  return {
    data: factures,
    loading,
    create,
    update,
    remove,
    refresh: fetchFactures
  };
};
