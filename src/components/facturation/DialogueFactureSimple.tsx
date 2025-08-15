
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { InvoiceForm } from './InvoiceForm';
import { VueFactureComplete } from './VueFactureComplete';
import { useFacturesDatabase } from '@/hooks/useFacturesDatabase';
import { useState } from 'react';

interface DialogueFactureSimpleProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  facture?: any;
  onClose: () => void;
}

export const DialogueFactureSimple = ({ open, onOpenChange, facture, onClose }: DialogueFactureSimpleProps) => {
  const { createFacture, updateFacture } = useFacturesDatabase();
  const [showPreview, setShowPreview] = useState(false);
  const [savedFacture, setSavedFacture] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: any, products: any[]) => {
    setIsLoading(true);
    
    try {
      console.log('Submitting invoice with data:', formData);
      console.log('Products:', products);

      const productsData = products.map(p => ({
        nom_produit: p.nom,
        quantite: p.quantite,
        prix_unitaire: p.prix_unitaire,
        total_ligne: p.total_ligne,
        product_id: p.id.startsWith('custom-') ? null : p.id
      }));

      let result;
      if (facture) {
        result = await updateFacture(facture.id, formData);
        result.facture_items = productsData;
      } else {
        result = await createFacture(formData, productsData);
        result.facture_items = productsData;
      }
      
      console.log('Invoice created/updated successfully:', result);
      
      // Prepare data for preview
      setSavedFacture({
        ...result,
        ...formData,
        facture_items: productsData
      });
      
      // Close dialog and show preview
      onOpenChange(false);
      setShowPreview(true);
      
    } catch (error: any) {
      console.error('Error submitting invoice:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-orange-600">
              {facture ? 'Modifier la facture' : 'Nouvelle facture'}
            </DialogTitle>
          </DialogHeader>

          <InvoiceForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            initialData={facture}
          />
        </DialogContent>
      </Dialog>

      {savedFacture && (
        <VueFactureComplete
          open={showPreview}
          onOpenChange={setShowPreview}
          facture={savedFacture}
        />
      )}
    </>
  );
};
