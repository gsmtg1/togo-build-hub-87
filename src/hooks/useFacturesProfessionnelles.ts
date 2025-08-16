
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
  tva_applicable?: boolean;
  taux_tva?: number;
  montant_tva?: number;
}

export const useFacturesProfessionnelles = () => {
  const [factures, setFactures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchFactures = async () => {
    try {
      console.log('Chargement des factures...');
      
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
        console.error('Erreur lors du chargement des factures:', error);
        throw error;
      }
      
      console.log('Factures chargées avec succès:', data);
      setFactures(data || []);
    } catch (error: any) {
      console.error('Erreur lors du chargement des factures:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les factures: " + (error.message || 'Erreur inconnue'),
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
      console.log('=== DÉBUT CRÉATION FACTURE ===');
      console.log('Données de la facture:', factureData);
      console.log('Items à créer:', items);

      // Validation des données
      if (!factureData.numero_facture || !factureData.client_nom) {
        throw new Error('Numéro de facture et nom du client sont requis');
      }

      if (!items || items.length === 0) {
        throw new Error('Au moins un produit doit être ajouté à la facture');
      }

      // Valider chaque item
      for (const item of items) {
        if (!item.nom_produit || item.quantite <= 0 || item.prix_unitaire < 0) {
          throw new Error('Tous les produits doivent avoir un nom, une quantité > 0 et un prix >= 0');
        }
      }

      // Calculer les montants avec TVA si applicable
      const sousTotal = Number(factureData.sous_total) || 0;
      const tauxTva = factureData.tva_applicable ? (factureData.taux_tva || 18) : 0;
      const montantTva = factureData.tva_applicable ? (sousTotal * tauxTva / 100) : 0;
      const montantTotal = sousTotal + montantTva + (Number(factureData.frais_livraison) || 0) - (Number(factureData.remise_globale_montant) || 0);

      // Créer la facture principale
      console.log('Création de la facture principale...');
      const factureToInsert = {
        numero_facture: factureData.numero_facture,
        client_id: factureData.client_id || null,
        client_nom: factureData.client_nom,
        client_telephone: factureData.client_telephone || '',
        client_adresse: factureData.client_adresse || '',
        date_facture: factureData.date_facture,
        date_echeance: factureData.date_echeance || null,
        montant_total: montantTotal,
        statut: factureData.statut || 'brouillon',
        commentaires: factureData.commentaires || '',
        mode_livraison: factureData.mode_livraison || 'retrait_usine',
        frais_livraison: Number(factureData.frais_livraison) || 0,
        adresse_livraison: factureData.adresse_livraison || '',
        sous_total: sousTotal,
        remise_globale_montant: Number(factureData.remise_globale_montant) || 0,
        tva_applicable: factureData.tva_applicable || false,
        taux_tva: tauxTva,
        montant_tva: montantTva
      };

      console.log('Données à insérer pour la facture:', factureToInsert);

      const { data: factureCreated, error: factureError } = await supabase
        .from('factures_professionnelles')
        .insert([factureToInsert])
        .select()
        .single();

      if (factureError) {
        console.error('Erreur lors de la création de la facture:', factureError);
        throw new Error(`Erreur création facture: ${factureError.message}`);
      }

      if (!factureCreated) {
        throw new Error('Aucune facture créée - réponse vide');
      }

      console.log('Facture créée avec succès:', factureCreated);

      // Créer les items de facture
      console.log('Création des items de facture...');
      const itemsToInsert = items.map(item => ({
        facture_id: factureCreated.id,
        nom_produit: item.nom_produit,
        quantite: Number(item.quantite),
        prix_unitaire: Number(item.prix_unitaire),
        total_ligne: Number(item.total_ligne),
        product_id: item.product_id || null
      }));

      console.log('Items à insérer:', itemsToInsert);

      const { error: itemsError } = await supabase
        .from('facture_items')
        .insert(itemsToInsert);

      if (itemsError) {
        console.error('Erreur lors de la création des items:', itemsError);
        // Supprimer la facture créée si les items échouent
        await supabase
          .from('factures_professionnelles')
          .delete()
          .eq('id', factureCreated.id);
        
        throw new Error(`Erreur création items: ${itemsError.message}`);
      }

      console.log('Items créés avec succès');
      console.log('=== FIN CRÉATION FACTURE (SUCCÈS) ===');

      await fetchFactures();
      
      toast({
        title: "Succès",
        description: "Facture créée avec succès",
      });

      return factureCreated;
    } catch (error: any) {
      console.error('=== ERREUR CRÉATION FACTURE ===');
      console.error('Erreur complète:', error);
      
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer la facture",
        variant: "destructive",
      });
      
      throw error;
    }
  };

  const update = async (id: string, factureData: Partial<FactureData>) => {
    try {
      console.log('Mise à jour de la facture:', id, factureData);
      
      const { data, error } = await supabase
        .from('factures_professionnelles')
        .update(factureData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la mise à jour:', error);
        throw new Error(`Erreur mise à jour: ${error.message}`);
      }
      
      await fetchFactures();
      
      toast({
        title: "Succès",
        description: "Facture mise à jour avec succès",
      });
      
      return data;
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour la facture",
        variant: "destructive",
      });
      throw error;
    }
  };

  const remove = async (id: string) => {
    try {
      console.log('Suppression de la facture:', id);
      
      // Supprimer d'abord les items (cascade devrait le faire automatiquement mais on s'assure)
      const { error: itemsError } = await supabase
        .from('facture_items')
        .delete()
        .eq('facture_id', id);

      if (itemsError) {
        console.error('Erreur suppression items:', itemsError);
      }

      // Puis supprimer la facture
      const { error } = await supabase
        .from('factures_professionnelles')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erreur suppression facture:', error);
        throw new Error(`Erreur suppression: ${error.message}`);
      }
      
      await fetchFactures();
      
      toast({
        title: "Succès",
        description: "Facture supprimée avec succès",
      });
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer la facture",
        variant: "destructive",
      });
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
