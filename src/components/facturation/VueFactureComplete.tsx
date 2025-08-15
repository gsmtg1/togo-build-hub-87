
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Printer, Send, FileText } from 'lucide-react';
import { CornerstoneInvoiceTemplate } from './CornerstoneInvoiceTemplate';

interface VueFactureCompleteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  facture: any;
}

export const VueFactureComplete = ({ open, onOpenChange, facture }: VueFactureCompleteProps) => {
  const handleExportPDF = () => {
    const printContent = document.getElementById('facture-print');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Facture ${facture.numero_facture}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                .no-print { display: none !important; }
                @media print {
                  body { margin: 0; }
                  .no-print { display: none !important; }
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

  const handleSendWhatsApp = () => {
    const message = `Voici votre facture ${facture.numero_facture} d'un montant de ${facture.montant_total} FCFA.`;
    const phoneNumber = facture.client_telephone?.replace(/\D/g, '') || '';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSendEmail = () => {
    const subject = `Facture ${facture.numero_facture}`;
    const body = `Bonjour,\n\nVeuillez trouver ci-joint votre facture ${facture.numero_facture} d'un montant de ${facture.montant_total} FCFA.\n\nCordialement,\nCornerstone`;
    const emailUrl = `mailto:${facture.client_email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = emailUrl;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="space-y-4">
          {/* Actions */}
          <div className="flex gap-2 justify-end no-print">
            <Button variant="outline" onClick={handleExportPDF}>
              <Download className="mr-2 h-4 w-4" />
              PDF
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimer
            </Button>
            <Button variant="outline" onClick={handleSendWhatsApp}>
              <Send className="mr-2 h-4 w-4" />
              WhatsApp
            </Button>
            <Button variant="outline" onClick={handleSendEmail}>
              <FileText className="mr-2 h-4 w-4" />
              Email
            </Button>
          </div>

          {/* Facture */}
          <div id="facture-print">
            <CornerstoneInvoiceTemplate 
              facture={facture}
              type="facture"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
