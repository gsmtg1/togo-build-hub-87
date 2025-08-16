
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SimpleInvoiceForm } from './SimpleInvoiceForm';
import { CornerstoneInvoiceTemplate } from './CornerstoneInvoiceTemplate';
import { useInvoicesManager } from '@/hooks/useInvoicesManager';

interface NewInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice?: any;
  onClose: () => void;
}

export const NewInvoiceDialog = ({ open, onOpenChange, invoice, onClose }: NewInvoiceDialogProps) => {
  const { createInvoice, isLoading } = useInvoicesManager();
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  const handleSubmit = async (formData: any, products: any[]) => {
    try {
      console.log('🔄 Création de la facture:', formData, products);
      
      // Transformer les produits pour la base de données
      const invoiceProducts = products.map(product => ({
        nom_produit: product.nom,
        quantite: product.quantite,
        prix_unitaire: product.prix_unitaire,
        total_ligne: product.total_ligne,
        product_id: product.id.startsWith('stock-') ? product.id.replace('stock-', '') : null
      }));

      // Créer la facture
      const newInvoice = await createInvoice(formData, invoiceProducts);
      
      if (newInvoice) {
        console.log('✅ Facture créée avec succès');
        onClose();
      }
    } catch (error) {
      console.error('❌ Erreur création facture:', error);
    }
  };

  const handlePreview = (formData: any, products: any[]) => {
    console.log('👁️ Aperçu facture:', formData, products);
    
    // Transformer les données pour l'aperçu
    const previewProducts = products.map(product => ({
      nom_produit: product.nom,
      quantite: product.quantite,
      prix_unitaire: product.prix_unitaire,
      total_ligne: product.total_ligne
    }));

    setPreviewData({
      ...formData,
      products: previewProducts
    });
    setShowPreview(true);
  };

  if (showPreview && previewData) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Aperçu de la facture</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <CornerstoneInvoiceTemplate
              type="facture"
              numero={previewData.numero_facture}
              date={previewData.date_facture}
              dateEcheance={previewData.date_echeance}
              clientNom={previewData.client_nom}
              clientTelephone={previewData.client_telephone}
              clientAdresse={previewData.client_adresse}
              products={previewData.products}
              montantTotal={previewData.montant_total}
              statut={previewData.statut}
              commentaires={previewData.commentaires}
              modeLivraison={previewData.mode_livraison}
              fraisLivraison={previewData.frais_livraison}
              adresseLivraison={previewData.adresse_livraison}
              sousTotal={previewData.sous_total}
              remiseGlobale={previewData.remise_globale_montant}
            />
            
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                Retour
              </button>
              <button
                onClick={() => handleSubmit(previewData, previewData.products)}
                disabled={isLoading}
                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
              >
                {isLoading ? 'Création...' : 'Créer la facture'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {invoice ? 'Modifier la facture' : 'Nouvelle facture'}
          </DialogTitle>
        </DialogHeader>
        
        <SimpleInvoiceForm
          onSubmit={handleSubmit}
          onPreview={handlePreview}
          isLoading={isLoading}
          initialData={invoice}
        />
      </DialogContent>
    </Dialog>
  );
};
