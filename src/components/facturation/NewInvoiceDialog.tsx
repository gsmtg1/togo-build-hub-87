import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SimpleInvoiceForm } from './SimpleInvoiceForm';
import { CornerstoneInvoiceTemplate } from './CornerstoneInvoiceTemplate';
import { useInvoicesManager } from '@/hooks/useInvoicesManager';
import { useQuotationsManager } from '@/hooks/useQuotationsManager';
import { Printer, Download, Send, ArrowLeft, MessageCircle } from 'lucide-react';

interface NewInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type?: 'facture' | 'devis';
  initialData?: any;
  invoice?: any;
  onClose?: () => void;
}

export const NewInvoiceDialog = ({ 
  open, 
  onOpenChange, 
  type = 'facture',
  initialData,
  invoice, 
  onClose 
}: NewInvoiceDialogProps) => {
  const { createInvoice, isLoading: invoiceLoading } = useInvoicesManager();
  const { createQuotation, isLoading: quotationLoading } = useQuotationsManager();
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  const isLoading = type === 'facture' ? invoiceLoading : quotationLoading;

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      onOpenChange(false);
    }
  };

  const handleSubmit = async (formData: any, products: any[]) => {
    try {
      console.log(`🔄 NewInvoiceDialog - Création de ${type}:`, formData, products);
      
      if (type === 'facture') {
        const newInvoice = await createInvoice(formData, products);
        if (newInvoice) {
          console.log('✅ NewInvoiceDialog - Facture créée avec succès');
          handleClose();
        }
      } else {
        const newQuotation = await createQuotation(formData, products);
        if (newQuotation) {
          console.log('✅ NewInvoiceDialog - Devis créé avec succès');
          handleClose();
        }
      }
    } catch (error) {
      console.error(`❌ NewInvoiceDialog - Erreur création ${type}:`, error);
    }
  };

  const handlePreview = (formData: any, products: any[]) => {
    console.log(`👁️ NewInvoiceDialog - Aperçu ${type}:`, formData, products);
    
    setPreviewData({
      ...formData,
      products: products
    });
    setShowPreview(true);
  };

  const handlePrint = () => {
    const printContent = document.getElementById('invoice-template');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Facture ${previewData?.numero_facture}</title>
              <style>
                @page { margin: 15mm; }
                body { 
                  font-family: 'Arial', sans-serif; 
                  margin: 0; 
                  padding: 0; 
                  color: #333; 
                  line-height: 1.4;
                }
                .bg-orange-500 { background-color: #f97316 !important; }
                .text-white { color: white !important; }
                .bg-orange-50 { background-color: #fff7ed !important; }
                .text-orange-600 { color: #ea580c !important; }
                .border-orange-500 { border-color: #f97316 !important; }
                .border-orange-200 { border-color: #fed7aa !important; }
                .border-orange-300 { border-color: #fdba74 !important; }
                @media print {
                  .no-print { display: none !important; }
                  body { print-color-adjust: exact; }
                }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const handleDownloadPDF = () => {
    // Pour l'instant, on lance l'impression comme alternative
    console.log('📄 Téléchargement PDF demandé');
    handlePrint();
  };

  const handleSendEmail = () => {
    if (!previewData) return;
    
    const subject = `Facture ${previewData.numero_facture} - Cornerstone Briques`;
    const body = `Bonjour ${previewData.client_nom},\n\nVeuillez trouver ci-joint votre facture n° ${previewData.numero_facture}.\n\nMontant total: ${previewData.montant_total?.toLocaleString()} FCFA\n\nCordialement,\nCornerstone Briques\n\nTél: +228 71014747\nEmail: cornerstonebrique@gmail.com`;
    
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const handleWhatsAppShare = () => {
    if (!previewData) return;
    
    const message = `*Facture ${previewData.numero_facture}*\n\nClient: ${previewData.client_nom}\nMontant: ${previewData.montant_total?.toLocaleString()} FCFA\n\nCornerstone Briques\n+228 71014747`;
    
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`);
  };

  const handleBackToForm = () => {
    setShowPreview(false);
    setPreviewData(null);
  };

  const handleCreateFromPreview = async () => {
    if (!previewData) return;
    
    try {
      await handleSubmit(previewData, previewData.products);
    } catch (error) {
      console.error('❌ Erreur création depuis aperçu:', error);
    }
  };

  if (showPreview && previewData) {
    const documentType = type === 'facture' ? 'facture' : 'devis';
    const numeroField = type === 'facture' ? 'numero_facture' : 'numero_devis';
    
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle>Aperçu du {documentType} {previewData[numeroField]}</DialogTitle>
              <div className="flex gap-2 no-print">
                <Button onClick={() => setShowPreview(false)} variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
                <Button onClick={() => {
                  const message = `*${documentType.charAt(0).toUpperCase() + documentType.slice(1)} ${previewData[numeroField]}*\n\nClient: ${previewData.client_nom}\nMontant: ${previewData.montant_total?.toLocaleString()} FCFA\n\nCornerstone Briques\n+228 71014747`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(message)}`);
                }} variant="outline" size="sm" className="bg-green-50 text-green-700 hover:bg-green-100">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
                <Button onClick={() => {
                  const subject = `${documentType.charAt(0).toUpperCase() + documentType.slice(1)} ${previewData[numeroField]} - Cornerstone Briques`;
                  const body = `Bonjour ${previewData.client_nom},\n\nVeuillez trouver ci-joint votre ${documentType} n° ${previewData[numeroField]}.\n\nMontant total: ${previewData.montant_total?.toLocaleString()} FCFA\n\nCordialement,\nCornerstone Briques\n\nTél: +228 71014747\nEmail: cornerstonebrique@gmail.com`;
                  window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
                }} variant="outline" size="sm">
                  <Send className="h-4 w-4 mr-2" />
                  Email
                </Button>
                <Button onClick={() => {
                  const printContent = document.getElementById('invoice-template');
                  if (printContent) {
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                      printWindow.document.write(`
                        <html>
                          <head>
                            <title>${documentType.charAt(0).toUpperCase() + documentType.slice(1)} ${previewData[numeroField]}</title>
                            <style>
                              @page { margin: 15mm; }
                              body { 
                                font-family: 'Arial', sans-serif; 
                                margin: 0; 
                                padding: 0; 
                                color: #333; 
                                line-height: 1.4;
                              }
                              .bg-orange-500 { background-color: #f97316 !important; }
                              .text-white { color: white !important; }
                              .bg-orange-50 { background-color: #fff7ed !important; }
                              .text-orange-600 { color: #ea580c !important; }
                              .border-orange-500 { border-color: #f97316 !important; }
                              .border-orange-200 { border-color: #fed7aa !important; }
                              .border-orange-300 { border-color: #fdba74 !important; }
                              @media print {
                                .no-print { display: none !important; }
                                body { print-color-adjust: exact; }
                              }
                            </style>
                          </head>
                          <body>
                            ${printContent.innerHTML}
                          </body>
                        </html>
                      `);
                      printWindow.document.close();
                      printWindow.print();
                    }
                  }
                }} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                <Button onClick={() => {
                  const printContent = document.getElementById('invoice-template');
                  if (printContent) {
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                      printWindow.document.write(`
                        <html>
                          <head>
                            <title>${documentType.charAt(0).toUpperCase() + documentType.slice(1)} ${previewData[numeroField]}</title>
                            <style>
                              @page { margin: 15mm; }
                              body { 
                                font-family: 'Arial', sans-serif; 
                                margin: 0; 
                                padding: 0; 
                                color: #333; 
                                line-height: 1.4;
                              }
                              .bg-orange-500 { background-color: #f97316 !important; }
                              .text-white { color: white !important; }
                              .bg-orange-50 { background-color: #fff7ed !important; }
                              .text-orange-600 { color: #ea580c !important; }
                              .border-orange-500 { border-color: #f97316 !important; }
                              .border-orange-200 { border-color: #fed7aa !important; }
                              .border-orange-300 { border-color: #fdba74 !important; }
                              @media print {
                                .no-print { display: none !important; }
                                body { print-color-adjust: exact; }
                              }
                            </style>
                          </head>
                          <body>
                            ${printContent.innerHTML}
                          </body>
                        </html>
                      `);
                      printWindow.document.close();
                      printWindow.print();
                    }
                  }
                }} variant="outline" size="sm">
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimer
                </Button>
                <Button
                  onClick={handleCreateFromPreview}
                  disabled={isLoading}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {isLoading ? 'Création...' : `Créer le ${documentType}`}
                </Button>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-4">
            <CornerstoneInvoiceTemplate
              type={type}
              numero={previewData[numeroField]}
              date={type === 'facture' ? previewData.date_facture : previewData.date_devis}
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
            {initialData || invoice ? `Modifier le ${type}` : `Nouveau ${type}`}
          </DialogTitle>
        </DialogHeader>
        
        <SimpleInvoiceForm
          onSubmit={handleSubmit}
          onPreview={handlePreview}
          isLoading={isLoading}
          initialData={initialData || invoice}
          type={type}
        />
      </DialogContent>
    </Dialog>
  );
};
