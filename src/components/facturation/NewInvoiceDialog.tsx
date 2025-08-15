
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SimpleInvoiceForm } from './SimpleInvoiceForm';
import { VueFactureComplete } from './VueFactureComplete';
import { useInvoicesManager } from '@/hooks/useInvoicesManager';
import { useState } from 'react';

interface NewInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice?: any;
  onClose: () => void;
}

export const NewInvoiceDialog = ({ open, onOpenChange, invoice, onClose }: NewInvoiceDialogProps) => {
  const { createInvoice, isLoading } = useInvoicesManager();
  const [showPreview, setShowPreview] = useState(false);
  const [savedInvoice, setSavedInvoice] = useState<any>(null);

  const handleSubmit = async (formData: any, products: any[]) => {
    try {
      console.log('🚀 Soumission nouvelle facture');
      console.log('Données:', formData);
      console.log('Produits:', products);

      // Préparer les produits pour l'API
      const productsData = products.map(p => ({
        nom_produit: p.nom,
        quantite: p.quantite,
        prix_unitaire: p.prix_unitaire,
        total_ligne: p.total_ligne,
        product_id: p.id.startsWith('custom-') ? null : p.id
      }));

      const result = await createInvoice(formData, productsData);
      
      console.log('✅ Facture créée:', result);
      
      // Préparer les données pour l'aperçu
      const invoiceForPreview = {
        ...result,
        ...formData,
        facture_items: productsData
      };
      
      setSavedInvoice(invoiceForPreview);
      
      // Fermer le dialogue et montrer l'aperçu
      onOpenChange(false);
      setShowPreview(true);
      
    } catch (error: any) {
      console.error('💥 Erreur lors de la soumission:', error);
      // L'erreur est gérée par le hook useInvoicesManager
    }
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setSavedInvoice(null);
    onClose();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-orange-600">
              {invoice ? 'Modifier la facture' : 'Nouvelle facture'}
            </DialogTitle>
          </DialogHeader>

          <SimpleInvoiceForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            initialData={invoice}
          />
        </DialogContent>
      </Dialog>

      {savedInvoice && (
        <VueFactureComplete
          open={showPreview}
          onOpenChange={setShowPreview}
          facture={savedInvoice}
          onClose={handleClosePreview}
        />
      )}
    </>
  );
};
