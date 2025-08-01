
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, Download, Send, Mail, Phone, MapPin } from 'lucide-react';
import { Invoice } from '@/lib/database';
import { COMPANY_INFO } from '@/config/company';

interface ProfessionalInvoiceViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice | null;
}

export const ProfessionalInvoiceView = ({ open, onOpenChange, invoice }: ProfessionalInvoiceViewProps) => {
  if (!invoice) return null;

  const handlePrint = () => {
    const printContent = document.getElementById('professional-invoice-print');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Facture ${invoice.id.slice(-8)}</title>
              <style>
                body { font-family: 'Arial', sans-serif; margin: 0; padding: 20px; color: #333; }
                .invoice-container { max-width: 800px; margin: 0 auto; }
                .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 3px solid #ea580c; padding-bottom: 20px; }
                .company-info { flex: 1; }
                .company-name { font-size: 28px; font-weight: bold; color: #ea580c; margin-bottom: 5px; }
                .company-slogan { font-style: italic; color: #666; margin-bottom: 10px; }
                .company-details { font-size: 12px; color: #666; }
                .logo-placeholder { width: 120px; height: 80px; background: #f3f4f6; border: 2px dashed #ea580c; display: flex; align-items: center; justify-content: center; color: #ea580c; font-size: 12px; }
                .invoice-title { text-align: center; font-size: 24px; font-weight: bold; color: #ea580c; margin: 30px 0; }
                .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
                .client-info, .invoice-info { flex: 1; }
                .client-info { margin-right: 20px; }
                .section-title { font-size: 16px; font-weight: bold; color: #ea580c; margin-bottom: 10px; border-bottom: 1px solid #ea580c; padding-bottom: 5px; }
                .info-line { margin-bottom: 5px; font-size: 14px; }
                .products-table { width: 100%; border-collapse: collapse; margin: 30px 0; }
                .products-table th, .products-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                .products-table th { background: #ea580c; color: white; font-weight: bold; }
                .products-table tr:nth-child(even) { background: #f9f9f9; }
                .total-section { margin-top: 30px; }
                .total-line { display: flex; justify-content: space-between; margin-bottom: 8px; padding: 5px 0; }
                .total-line.subtotal { border-top: 1px solid #ddd; padding-top: 10px; }
                .total-line.final { background: #ea580c; color: white; font-weight: bold; font-size: 18px; padding: 15px; margin-top: 15px; }
                .footer { margin-top: 50px; border-top: 2px solid #ea580c; padding-top: 20px; text-align: center; font-size: 12px; color: #666; }
                .payment-info { background: #fff7ed; padding: 15px; border-left: 4px solid #ea580c; margin: 20px 0; }
                @media print {
                  body { margin: 0; }
                  .no-print { display: none; }
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

  const handleDownloadPDF = async () => {
    // Cette fonction nécessiterait une bibliothèque comme jsPDF ou html2pdf
    console.log('Téléchargement PDF - À implémenter avec jsPDF');
    alert('Fonctionnalité PDF en cours de développement');
  };

  const handleSendEmail = () => {
    const subject = `Facture ${invoice.id.slice(-8)} - ${COMPANY_INFO.name}`;
    const body = `Bonjour ${invoice.customerName},\n\nVeuillez trouver ci-joint votre facture.\n\nCordialement,\n${COMPANY_INFO.name}`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const subtotal = invoice.products.reduce((sum, product) => sum + product.totalPrice, 0);
  const deliveryFee = (invoice as any).deliveryFee || 0;
  const deliveryType = (invoice as any).deliveryType || 'pickup';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl">Aperçu de la facture</DialogTitle>
            <div className="flex gap-2 no-print">
              <Button onClick={handleSendEmail} variant="outline" size="sm">
                <Send className="h-4 w-4 mr-2" />
                Envoyer
              </Button>
              <Button onClick={handleDownloadPDF} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button onClick={handlePrint} variant="outline" size="sm">
                <Printer className="h-4 w-4 mr-2" />
                Imprimer
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div id="professional-invoice-print" className="invoice-container">
          {/* En-tête avec logo et informations entreprise */}
          <div className="header">
            <div className="company-info">
              <div className="company-name">{COMPANY_INFO.name}</div>
              <div className="company-slogan">"{COMPANY_INFO.slogan}"</div>
              <div className="company-details">
                <div className="flex items-center gap-1 mb-1">
                  <Phone className="h-3 w-3" />
                  {COMPANY_INFO.phones.join(' / ')}
                </div>
                <div className="flex items-center gap-1 mb-1">
                  <MapPin className="h-3 w-3" />
                  {COMPANY_INFO.address}
                </div>
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {COMPANY_INFO.email}
                </div>
              </div>
            </div>
            <div className="logo-placeholder">
              LOGO
            </div>
          </div>

          {/* Titre de la facture */}
          <div className="invoice-title">
            FACTURE N° {invoice.id.slice(-8).toUpperCase()}
          </div>

          {/* Informations client et facture */}
          <div className="invoice-details">
            <div className="client-info">
              <div className="section-title">FACTURER À</div>
              <div className="info-line"><strong>{invoice.customerName}</strong></div>
              <div className="info-line">{invoice.customerPhone}</div>
              <div className="info-line">{invoice.customerAddress}</div>
            </div>
            <div className="invoice-info">
              <div className="section-title">DÉTAILS FACTURE</div>
              <div className="info-line"><strong>Date d'émission:</strong> {new Date(invoice.date).toLocaleDateString('fr-FR')}</div>
              <div className="info-line"><strong>Date d'échéance:</strong> {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}</div>
              <div className="info-line"><strong>Statut:</strong> 
                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                  invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                  invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                  invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {invoice.status === 'draft' ? 'Brouillon' :
                   invoice.status === 'sent' ? 'Envoyée' :
                   invoice.status === 'paid' ? 'Payée' :
                   'En retard'}
                </span>
              </div>
            </div>
          </div>

          {/* Tableau des produits */}
          <table className="products-table">
            <thead>
              <tr>
                <th>DESCRIPTION</th>
                <th style={{width: '80px'}}>QTÉ</th>
                <th style={{width: '120px'}}>PRIX UNIT.</th>
                <th style={{width: '120px'}}>TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {invoice.products.map((product, index) => (
                <tr key={product.id || index}>
                  <td>{product.name}</td>
                  <td style={{textAlign: 'center'}}>{product.quantity}</td>
                  <td style={{textAlign: 'right'}}>{product.unitPrice.toLocaleString()} FCFA</td>
                  <td style={{textAlign: 'right'}}>{product.totalPrice.toLocaleString()} FCFA</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totaux */}
          <div className="total-section">
            <div className="total-line subtotal">
              <span>Sous-total produits:</span>
              <span>{subtotal.toLocaleString()} FCFA</span>
            </div>
            <div className="total-line">
              <span>Livraison:</span>
              <span>
                {deliveryType === 'free' ? 'GRATUITE' : 
                 deliveryType === 'pickup' ? 'RETRAIT MAGASIN' :
                 `${deliveryFee.toLocaleString()} FCFA`}
              </span>
            </div>
            <div className="total-line final">
              <span>TOTAL À PAYER:</span>
              <span>{invoice.totalAmount.toLocaleString()} FCFA</span>
            </div>
          </div>

          {/* Informations de livraison */}
          {deliveryType === 'pickup' && (
            <div className="payment-info">
              <strong>📍 RETRAIT EN MAGASIN:</strong><br />
              {COMPANY_INFO.address}<br />
              {COMPANY_INFO.city}, {COMPANY_INFO.country}
            </div>
          )}

          {/* Notes */}
          {(invoice as any).notes && (
            <div className="payment-info">
              <strong>📝 NOTES:</strong><br />
              {(invoice as any).notes}
            </div>
          )}

          {/* Informations de paiement */}
          <div className="payment-info">
            <strong>💳 CONDITIONS DE PAIEMENT:</strong><br />
            Paiement à réception de facture. Merci de nous contacter pour tout renseignement.<br />
            <strong>Délai de paiement:</strong> {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
          </div>

          {/* Pied de page */}
          <div className="footer">
            <p><strong>{COMPANY_INFO.name}</strong> - {COMPANY_INFO.slogan}</p>
            <p>{COMPANY_INFO.address} - {COMPANY_INFO.phones.join(' / ')}</p>
            <p>{COMPANY_INFO.email} - {COMPANY_INFO.website}</p>
            <p style={{marginTop: '15px', fontSize: '11px'}}>
              Merci de votre confiance ! Cette facture est générée électroniquement.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
