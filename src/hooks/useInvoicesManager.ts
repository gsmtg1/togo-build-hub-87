
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface InvoiceProduct {
  nom_produit: string;
  quantite: number;
  prix_unitaire: number;
  total_ligne: number;
  product_id?: string | null;
}

interface InvoiceData {
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

export const useInvoicesManager = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Charger toutes les factures
  const loadInvoices = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Chargement des factures...');
      
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
        console.error('❌ Erreur chargement factures:', error);
        throw error;
      }
      
      console.log('✅ Factures chargées:', data?.length || 0);
      setInvoices(data || []);
    } catch (error: any) {
      console.error('💥 Erreur dans loadInvoices:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les factures",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Créer une nouvelle facture avec produits
  const createInvoice = async (invoiceData: InvoiceData, products: InvoiceProduct[]) => {
    try {
      setIsLoading(true);
      console.log('🔄 Création facture:', invoiceData.numero_facture);
      console.log('📦 Produits:', products);

      // Validation stricte
      if (!invoiceData.numero_facture?.trim()) {
        throw new Error('Le numéro de facture est obligatoire');
      }
      if (!invoiceData.client_nom?.trim()) {
        throw new Error('Le nom du client est obligatoire');
      }
      if (!products || products.length === 0) {
        throw new Error('Au moins un produit doit être ajouté');
      }

      // Valider chaque produit
      for (const product of products) {
        if (!product.nom_produit?.trim()) {
          throw new Error('Tous les produits doivent avoir un nom');
        }
        if (!product.quantite || product.quantite <= 0) {
          throw new Error('La quantité doit être supérieure à 0');
        }
        if (product.prix_unitaire < 0) {
          throw new Error('Le prix ne peut pas être négatif');
        }
      }

      // Créer la facture principale
      const invoicePayload = {
        numero_facture: invoiceData.numero_facture.trim(),
        client_id: invoiceData.client_id || null,
        client_nom: invoiceData.client_nom.trim(),
        client_telephone: invoiceData.client_telephone?.trim() || '',
        client_adresse: invoiceData.client_adresse?.trim() || '',
        date_facture: invoiceData.date_facture,
        date_echeance: invoiceData.date_echeance || null,
        montant_total: Number(invoiceData.montant_total) || 0,
        statut: invoiceData.statut || 'brouillon',
        commentaires: invoiceData.commentaires?.trim() || '',
        mode_livraison: invoiceData.mode_livraison || 'retrait_usine',
        frais_livraison: Number(invoiceData.frais_livraison) || 0,
        adresse_livraison: invoiceData.adresse_livraison?.trim() || '',
        sous_total: Number(invoiceData.sous_total) || 0,
        remise_globale_montant: Number(invoiceData.remise_globale_montant) || 0,
        montant_paye: 0
      };

      console.log('📝 Données facture à insérer:', invoicePayload);

      const { data: newInvoice, error: invoiceError } = await supabase
        .from('factures_professionnelles')
        .insert([invoicePayload])
        .select()
        .single();

      if (invoiceError) {
        console.error('❌ Erreur création facture:', invoiceError);
        throw new Error(`Erreur création facture: ${invoiceError.message}`);
      }

      if (!newInvoice) {
        throw new Error('Aucune facture créée');
      }

      console.log('✅ Facture créée:', newInvoice.id);

      // Créer les items de facture
      const itemsPayload = products.map(product => ({
        facture_id: newInvoice.id,
        nom_produit: product.nom_produit.trim(),
        quantite: Number(product.quantite),
        prix_unitaire: Number(product.prix_unitaire),
        total_ligne: Number(product.total_ligne),
        product_id: product.product_id || null
      }));

      console.log('📦 Items à insérer:', itemsPayload);

      const { error: itemsError } = await supabase
        .from('facture_items')
        .insert(itemsPayload);

      if (itemsError) {
        console.error('❌ Erreur création items:', itemsError);
        // Supprimer la facture créée en cas d'échec
        await supabase
          .from('factures_professionnelles')
          .delete()
          .eq('id', newInvoice.id);
        throw new Error(`Erreur création produits: ${itemsError.message}`);
      }

      console.log('✅ Items créés avec succès');
      
      // Recharger les factures
      await loadInvoices();
      
      toast({
        title: "Succès",
        description: `Facture ${invoiceData.numero_facture} créée avec succès`,
      });

      return newInvoice;
    } catch (error: any) {
      console.error('💥 Erreur dans createInvoice:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer la facture",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Supprimer une facture
  const deleteInvoice = async (id: string) => {
    try {
      setIsLoading(true);
      console.log('🗑️ Suppression facture:', id);

      // Supprimer les items en premier
      const { error: itemsError } = await supabase
        .from('facture_items')
        .delete()
        .eq('facture_id', id);

      if (itemsError) {
        console.error('❌ Erreur suppression items:', itemsError);
      }

      // Supprimer la facture
      const { error } = await supabase
        .from('factures_professionnelles')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Erreur suppression facture:', error);
        throw new Error(`Erreur suppression: ${error.message}`);
      }
      
      console.log('✅ Facture supprimée');
      await loadInvoices();
      
      toast({
        title: "Succès",
        description: "Facture supprimée avec succès",
      });
    } catch (error: any) {
      console.error('💥 Erreur dans deleteInvoice:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer la facture",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les factures au montage
  useEffect(() => {
    loadInvoices();
  }, []);

  return {
    invoices,
    isLoading,
    createInvoice,
    deleteInvoice,
    refreshInvoices: loadInvoices
  };
};
