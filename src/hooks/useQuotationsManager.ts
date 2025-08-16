
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface QuotationProduct {
  nom_produit: string;
  quantite: number;
  prix_unitaire: number;
  total_ligne: number;
  product_id?: string | null;
}

interface QuotationData {
  numero_devis: string;
  client_id?: string | null;
  client_nom: string;
  client_telephone?: string;
  client_adresse?: string;
  date_devis: string;
  date_echeance?: string | null;
  montant_total: number;
  statut: string;
  commentaires?: string;
}

export const useQuotationsManager = () => {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Charger tous les devis avec leurs produits
  const loadQuotations = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Chargement des devis...');
      
      const { data, error } = await supabase
        .from('devis_professionnels')
        .select(`
          *,
          devis_produits (
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
        console.error('❌ Erreur chargement devis:', error);
        throw error;
      }
      
      console.log('✅ Devis chargés:', data?.length || 0);
      setQuotations(data || []);
    } catch (error: any) {
      console.error('💥 Erreur dans loadQuotations:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les devis: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Créer un nouveau devis avec produits - VERSION CORRIGÉE
  const createQuotation = async (quotationData: QuotationData, products: QuotationProduct[]) => {
    try {
      setIsLoading(true);
      console.log('🔄 Création devis:', quotationData.numero_devis);
      console.log('📦 Produits:', products);

      // Validation stricte
      if (!quotationData.numero_devis?.trim()) {
        throw new Error('Le numéro de devis est obligatoire');
      }
      if (!quotationData.client_nom?.trim()) {
        throw new Error('Le nom du client est obligatoire');
      }
      if (!products || products.length === 0) {
        throw new Error('Au moins un produit doit être ajouté');
      }

      // Valider chaque produit
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        if (!product.nom_produit?.trim()) {
          throw new Error(`Le produit ${i + 1} doit avoir un nom`);
        }
        if (!product.quantite || product.quantite <= 0) {
          throw new Error(`Le produit ${i + 1} doit avoir une quantité supérieure à 0`);
        }
        if (product.prix_unitaire < 0) {
          throw new Error(`Le produit ${i + 1} ne peut pas avoir un prix négatif`);
        }
      }

      // Créer le devis principal
      const quotationPayload = {
        numero_devis: quotationData.numero_devis.trim(),
        client_id: quotationData.client_id || null,
        client_nom: quotationData.client_nom.trim(),
        client_telephone: quotationData.client_telephone?.trim() || '',
        client_adresse: quotationData.client_adresse?.trim() || '',
        date_devis: quotationData.date_devis,
        date_echeance: quotationData.date_echeance || null,
        montant_total: Number(quotationData.montant_total) || 0,
        statut: quotationData.statut || 'brouillon',
        commentaires: quotationData.commentaires?.trim() || ''
      };

      console.log('📝 Données devis à insérer:', quotationPayload);

      const { data: newQuotation, error: quotationError } = await supabase
        .from('devis_professionnels')
        .insert([quotationPayload])
        .select()
        .single();

      if (quotationError) {
        console.error('❌ Erreur création devis:', quotationError);
        throw new Error(`Erreur création devis: ${quotationError.message}`);
      }

      if (!newQuotation) {
        throw new Error('Aucun devis créé');
      }

      console.log('✅ Devis créé:', newQuotation.id);

      // Créer les produits de devis dans la table devis_produits
      const productsPayload = products.map(product => ({
        devis_id: newQuotation.id,
        nom_produit: product.nom_produit.trim(),
        quantite: Number(product.quantite),
        prix_unitaire: Number(product.prix_unitaire),
        total_ligne: Number(product.total_ligne),
        product_id: product.product_id || null
      }));

      console.log('📦 Produits à insérer:', productsPayload);

      const { error: productsError } = await supabase
        .from('devis_produits')
        .insert(productsPayload);

      if (productsError) {
        console.error('❌ Erreur création produits:', productsError);
        // Supprimer le devis créé en cas d'échec
        await supabase
          .from('devis_professionnels')
          .delete()
          .eq('id', newQuotation.id);
        throw new Error(`Erreur création produits: ${productsError.message}`);
      }

      console.log('✅ Produits créés avec succès');
      
      // Recharger les devis
      await loadQuotations();
      
      toast({
        title: "Succès",
        description: `Devis ${quotationData.numero_devis} créé avec succès`,
      });

      return newQuotation;
    } catch (error: any) {
      console.error('💥 Erreur dans createQuotation:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le devis",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Supprimer un devis
  const deleteQuotation = async (id: string) => {
    try {
      setIsLoading(true);
      console.log('🗑️ Suppression devis:', id);

      // Les produits sont supprimés automatiquement grâce à ON DELETE CASCADE
      const { error } = await supabase
        .from('devis_professionnels')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Erreur suppression devis:', error);
        throw new Error(`Erreur suppression: ${error.message}`);
      }
      
      console.log('✅ Devis supprimé');
      await loadQuotations();
      
      toast({
        title: "Succès",
        description: "Devis supprimé avec succès",
      });
    } catch (error: any) {
      console.error('💥 Erreur dans deleteQuotation:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer le devis",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les devis au montage
  useEffect(() => {
    loadQuotations();
  }, []);

  return {
    quotations,
    isLoading,
    createQuotation,
    deleteQuotation,
    refreshQuotations: loadQuotations
  };
};
