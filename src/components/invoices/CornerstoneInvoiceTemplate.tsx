import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, Download, Send } from 'lucide-react';
import { Invoice } from '@/lib/database';
import { COMPANY_INFO } from '@/config/company';

interface CornerstoneInvoiceTemplateProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice | null;
}

export const CornerstoneInvoiceTemplate = ({ open, onOpenChange, invoice }: CornerstoneInvoiceTemplateProps) => {
  if (!invoice) return null;

  const handlePrint = () => {
    const printContent = document.getElementById('cornerstone-invoice-print');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Facture ${invoice.numero_facture || invoice.id.slice(-8)}</title>
              <style>
                @page { margin: 20mm; }
                body { 
                  font-family: 'Arial', sans-serif; 
                  margin: 0; 
                  padding: 0; 
                  color: #333; 
                  line-height: 1.4;
                }
                .invoice-container { 
                  max-width: 210mm; 
                  margin: 0 auto; 
                  background: white;
                  border: 2px solid #f97316;
                }
                .header-section { 
                  display: flex; 
                  background: #f97316;
                  color: white;
                  padding: 15px;
                }
                .company-logo { 
                  width: 80px; 
                  height: 80px; 
                  background: white;
                  border-radius: 8px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  margin-right: 20px;
                }
                .company-details { 
                  flex: 1;
                }
                .company-name { 
                  font-size: 24px; 
                  font-weight: bold; 
                  margin-bottom: 5px;
                }
                .company-info { 
                  font-size: 12px; 
                  line-height: 1.3;
                }
                .invoice-number { 
                  text-align: right;
                  font-size: 18px;
                  font-weight: bold;
                }
                .client-section { 
                  padding: 20px;
                  border-bottom: 1px solid #eee;
                }
                .client-info { 
                  display: flex; 
                  justify-content: space-between;
                }
                .client-details, .invoice-details { 
                  flex: 1; 
                }
                .section-title { 
                  font-weight: bold; 
                  color: #f97316; 
                  margin-bottom: 10px;
                  font-size: 14px;
                }
                .info-row { 
                  margin-bottom: 5px; 
                  font-size: 12px;
                }
                .products-section { 
                  padding: 0 20px;
                }
                .products-table { 
                  width: 100%; 
                  border-collapse: collapse; 
                  margin: 20px 0;
                }
                .products-table th { 
                  background: #f97316; 
                  color: white; 
                  padding: 12px 8px; 
                  text-align: left; 
                  font-size: 12px;
                  font-weight: bold;
                }
                .products-table td { 
                  padding: 10px 8px; 
                  border-bottom: 1px solid #eee; 
                  font-size: 11px;
                }
                .products-table tr:nth-child(even) { 
                  background: #fef7ed;
                }
                .totals-section { 
                  background: #fef7ed;
                  padding: 20px;
                  border-top: 2px solid #f97316;
                }
                .total-row { 
                  display: flex; 
                  justify-content: space-between; 
                  margin-bottom: 8px;
                  font-size: 12px;
                }
                .total-row.final { 
                  font-size: 16px; 
                  font-weight: bold; 
                  color: #f97316;
                  border-top: 2px solid #f97316;
                  padding-top: 10px;
                  margin-top: 10px;
                }
                .footer-section { 
                  background: #f97316;
                  color: white;
                  padding: 15px;
                  text-align: center;
                  font-size: 10px;
                }
                .qr-code { 
                  width: 60px; 
                  height: 60px; 
                  background: #ddd;
                  margin: 10px auto;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 8px;
                }
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
    alert('Fonctionnalité PDF en cours de développement');
  };

  const handleSendEmail = () => {
    const subject = `Facture ${invoice.numero_facture || invoice.id.slice(-8)} - ${COMPANY_INFO.name}`;
    const body = `Bonjour ${invoice.client_nom},\n\nVeuillez trouver ci-joint votre facture.\n\nCordialement,\n${COMPANY_INFO.name}`;
    window.open(`mailto:${COMPANY_INFO.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const products = (invoice as any).products || [];
  const subtotal = products.reduce((sum, product) => sum + (product.totalPrice || 0), 0);
  const tva = subtotal * 0.18;
  const total = subtotal + tva;

  const formatNumber = (num: number) => num.toLocaleString('fr-FR');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
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

        <div id="cornerstone-invoice-print" className="invoice-container border-2 border-orange-500">
          {/* En-tête avec logo et informations */}
          <div className="header-section bg-orange-500 text-white p-4">
            <div className="flex items-center">
              <div className="company-logo bg-white rounded-lg w-20 h-20 flex items-center justify-center mr-5">
                <img 
                  src="/lovable-uploads/98d0456f-d0db-42ee-9486-b6f874061b8b.png" 
                  alt="Cornerstone Briques Logo" 
                  className="w-16 h-16 object-contain"
                />
              </div>
              <div className="company-details flex-1">
                <div className="company-name text-2xl font-bold mb-1">
                  {COMPANY_INFO.name}
                </div>
                <div className="company-info text-xs leading-tight">
                  <div>{COMPANY_INFO.slogan}</div>
                  <div>{COMPANY_INFO.address}</div>
                  <div>{COMPANY_INFO.city}, {COMPANY_INFO.country}</div>
                  <div>Tél: {COMPANY_INFO.phones.join(' / ')}</div>
                  <div>Email: {COMPANY_INFO.email}</div>
                  <div>Site: {COMPANY_INFO.website}</div>
                </div>
              </div>
              <div className="invoice-number text-right">
                <div className="text-lg font-bold">
                  Facture N° {invoice.numero_facture || `FC${invoice.id.slice(-6).toUpperCase()}`}
                </div>
                <div className="text-sm">
                  {new Date(invoice.date_facture).toLocaleDateString('fr-FR')}
                </div>
              </div>
            </div>
          </div>

          {/* Section client */}
          <div className="client-section p-5 border-b border-gray-200">
            <div className="client-info flex justify-between">
              <div className="client-details flex-1 mr-8">
                <div className="section-title text-orange-500 font-bold mb-3">FACTURER À:</div>
                <div className="info-row text-sm mb-1">
                  <strong>{invoice.client_nom}</strong>
                </div>
                <div className="info-row text-sm mb-1">{invoice.client_telephone}</div>
                <div className="info-row text-sm">{invoice.client_adresse}</div>
              </div>
              <div className="invoice-details flex-1">
                <div className="section-title text-orange-500 font-bold mb-3">DÉTAILS FACTURE:</div>
                <div className="info-row text-sm mb-1">
                  <strong>Date d'émission:</strong> {new Date(invoice.date_facture).toLocaleDateString('fr-FR')}
                </div>
                <div className="info-row text-sm mb-1">
                  <strong>Date d'échéance:</strong> {invoice.date_echeance ? new Date(invoice.date_echeance).toLocaleDateString('fr-FR') : 'À réception'}
                </div>
                <div className="info-row text-sm">
                  <strong>Conditions:</strong> Paiement à réception
                </div>
              </div>
            </div>
          </div>

          {/* Section produits */}
          <div className="products-section">
            <table className="products-table w-full border-collapse my-5">
              <thead>
                <tr className="bg-orange-500 text-white">
                  <th className="p-3 text-left text-xs font-bold">DÉSIGNATION</th>
                  <th className="p-3 text-center text-xs font-bold w-20">QTÉ</th>
                  <th className="p-3 text-right text-xs font-bold w-28">P.U. HT</th>
                  <th className="p-3 text-right text-xs font-bold w-32">TOTAL HT</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <tr key={product.id || index} className={index % 2 === 1 ? 'bg-orange-50' : ''}>
                    <td className="p-2 text-xs">{product.name}</td>
                    <td className="p-2 text-xs text-center">{product.quantity}</td>
                    <td className="p-2 text-xs text-right">{formatNumber(product.unitPrice || 0)} FCFA</td>
                    <td className="p-2 text-xs text-right font-semibold">{formatNumber(product.totalPrice || 0)} FCFA</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section totaux */}
          <div className="totals-section bg-orange-50 p-5 border-t-2 border-orange-500">
            <div className="flex justify-end">
              <div className="w-80">
                <div className="total-row flex justify-between mb-2 text-sm">
                  <span>Montant HT:</span>
                  <span className="font-semibold">{formatNumber(subtotal)} FCFA</span>
                </div>
                <div className="total-row flex justify-between mb-2 text-sm">
                  <span>TVA (18%):</span>
                  <span className="font-semibold">{formatNumber(tva)} FCFA</span>
                </div>
                <div className="total-row final flex justify-between text-lg font-bold text-orange-600 border-t-2 border-orange-500 pt-3 mt-3">
                  <span>TOTAL TTC:</span>
                  <span>{formatNumber(total)} FCFA</span>
                </div>
              </div>
            </div>
          </div>

          {/* Code QR et informations de paiement */}
          <div className="p-5 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <div className="text-sm font-bold text-orange-600 mb-2">INFORMATIONS DE PAIEMENT:</div>
                <div className="text-xs text-gray-600">
                  <div>• Paiement par espèces, chèque ou virement bancaire</div>
                  <div>• Mobile Money: {COMPANY_INFO.phones[0]}</div>
                  <div>• Délai de paiement: {invoice.date_echeance ? new Date(invoice.date_echeance).toLocaleDateString('fr-FR') : 'À réception'}</div>
                  <div>• Toute facture impayée donnera lieu à des pénalités de retard</div>
                </div>
              </div>
              <div className="text-center ml-8">
                <div className="qr-code w-16 h-16 bg-gray-300 mx-auto mb-2 flex items-center justify-center text-xs">
                  QR CODE
                </div>
                <div className="text-xs text-gray-500">Code QR</div>
              </div>
            </div>
          </div>

          {/* Pied de page */}
          <div className="footer-section bg-orange-500 text-white p-4 text-center">
            <div className="text-xs">
              <strong>{COMPANY_INFO.name}</strong> - {COMPANY_INFO.slogan}
            </div>
            <div className="text-xs mt-1">
              {COMPANY_INFO.address} - {COMPANY_INFO.phones.join(' / ')} - {COMPANY_INFO.email}
            </div>
            <div className="text-xs mt-1">
              Site web: {COMPANY_INFO.website}
            </div>
            <div className="text-xs mt-2 opacity-90">
              Merci de votre confiance ! Cette facture est générée électroniquement.
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
