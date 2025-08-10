
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
              <title>Facture ${invoice.numero_facture || invoice.id.slice(-8)}</title>
              <style>
                @page { margin: 15mm; }
                body { 
                  font-family: 'Arial', sans-serif; 
                  margin: 0; 
                  padding: 0; 
                  color: #333; 
                  line-height: 1.4;
                  background: white;
                }
                .invoice-container { 
                  max-width: 210mm; 
                  margin: 0 auto; 
                  background: white;
                  border: 3px solid #f97316;
                  box-shadow: 0 0 10px rgba(0,0,0,0.1);
                }
                .header-section { 
                  background: #f97316;
                  color: white;
                  padding: 20px;
                  display: flex;
                  align-items: center;
                  position: relative;
                }
                .logo-container { 
                  width: 90px; 
                  height: 90px; 
                  background: white;
                  border-radius: 12px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  margin-right: 25px;
                  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                }
                .logo-image {
                  max-width: 75px;
                  max-height: 75px;
                  object-fit: contain;
                }
                .company-details { 
                  flex: 1;
                }
                .company-name { 
                  font-size: 28px; 
                  font-weight: bold; 
                  margin-bottom: 8px;
                  letter-spacing: 1px;
                }
                .company-slogan { 
                  font-style: italic; 
                  font-size: 14px;
                  margin-bottom: 12px;
                  opacity: 0.9;
                }
                .company-info { 
                  font-size: 13px; 
                  line-height: 1.4;
                }
                .company-info div {
                  margin-bottom: 3px;
                  display: flex;
                  align-items: center;
                }
                .company-info svg {
                  width: 12px;
                  height: 12px;
                  margin-right: 6px;
                }
                .invoice-header-right { 
                  text-align: right;
                  position: absolute;
                  top: 20px;
                  right: 20px;
                  background: rgba(255,255,255,0.15);
                  padding: 15px;
                  border-radius: 8px;
                }
                .invoice-number { 
                  font-size: 20px; 
                  font-weight: bold;
                  margin-bottom: 5px;
                }
                .invoice-date { 
                  font-size: 14px;
                  opacity: 0.9;
                }
                .client-section { 
                  padding: 25px;
                  background: linear-gradient(135deg, #fef7ed 0%, #fff7ed 100%);
                  border-bottom: 2px solid #fed7aa;
                }
                .client-info-wrapper { 
                  display: flex; 
                  justify-content: space-between;
                  gap: 40px;
                }
                .client-details, .invoice-details { 
                  flex: 1;
                  background: white;
                  padding: 20px;
                  border-radius: 10px;
                  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
                }
                .section-title { 
                  font-weight: bold; 
                  color: #f97316; 
                  font-size: 16px;
                  margin-bottom: 15px;
                  border-bottom: 2px solid #f97316;
                  padding-bottom: 8px;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                }
                .info-row { 
                  margin-bottom: 8px; 
                  font-size: 14px;
                  line-height: 1.5;
                }
                .info-row strong {
                  color: #1f2937;
                }
                .products-section { 
                  padding: 25px;
                  background: white;
                }
                .products-table { 
                  width: 100%; 
                  border-collapse: collapse; 
                  margin: 20px 0;
                  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
                  border-radius: 8px;
                  overflow: hidden;
                }
                .products-table th { 
                  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); 
                  color: white; 
                  padding: 15px 12px; 
                  text-align: left; 
                  font-size: 14px;
                  font-weight: bold;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                }
                .products-table td { 
                  padding: 15px 12px; 
                  border-bottom: 1px solid #f3f4f6; 
                  font-size: 13px;
                }
                .products-table tbody tr:nth-child(even) { 
                  background: #fef7ed;
                }
                .products-table tbody tr:hover { 
                  background: #fed7aa;
                  transition: background-color 0.2s ease;
                }
                .totals-section { 
                  background: linear-gradient(135deg, #fef7ed 0%, #fed7aa 100%);
                  padding: 30px 25px;
                  border-top: 3px solid #f97316;
                }
                .totals-wrapper {
                  display: flex;
                  justify-content: flex-end;
                }
                .totals-content {
                  background: white;
                  padding: 25px;
                  border-radius: 12px;
                  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                  min-width: 350px;
                }
                .total-row { 
                  display: flex; 
                  justify-content: space-between; 
                  margin-bottom: 12px;
                  font-size: 14px;
                  padding: 8px 0;
                }
                .total-row.subtotal {
                  border-top: 1px solid #e5e7eb;
                  padding-top: 15px;
                  margin-top: 15px;
                  font-weight: 600;
                }
                .total-row.final { 
                  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
                  color: white;
                  font-size: 18px; 
                  font-weight: bold; 
                  padding: 18px 20px;
                  margin: 20px -20px -20px -20px;
                  border-radius: 0 0 12px 12px;
                  text-transform: uppercase;
                  letter-spacing: 1px;
                }
                .payment-info-section { 
                  padding: 25px;
                  background: #f8fafc;
                  border-top: 1px solid #e5e7eb;
                }
                .payment-info { 
                  background: white;
                  padding: 20px;
                  border-left: 5px solid #f97316;
                  border-radius: 8px;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                  margin-bottom: 15px;
                }
                .payment-info h4 {
                  color: #f97316;
                  font-size: 16px;
                  font-weight: bold;
                  margin-bottom: 12px;
                  display: flex;
                  align-items: center;
                }
                .payment-info p {
                  margin: 8px 0;
                  font-size: 13px;
                  line-height: 1.5;
                }
                .footer-section { 
                  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
                  color: white;
                  padding: 25px;
                  text-align: center;
                }
                .footer-content {
                  max-width: 600px;
                  margin: 0 auto;
                }
                .footer-company {
                  font-size: 18px;
                  font-weight: bold;
                  margin-bottom: 8px;
                  color: #f97316;
                }
                .footer-details {
                  font-size: 13px;
                  line-height: 1.6;
                  opacity: 0.9;
                }
                .footer-note {
                  margin-top: 20px;
                  padding-top: 15px;
                  border-top: 1px solid rgba(255,255,255,0.2);
                  font-size: 12px;
                  font-style: italic;
                  opacity: 0.8;
                }
                @media print {
                  .no-print { display: none !important; }
                  body { print-color-adjust: exact; }
                  .invoice-container { border: 2px solid #f97316; }
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
    console.log('Téléchargement PDF - À implémenter avec jsPDF');
    alert('Fonctionnalité PDF en cours de développement');
  };

  const handleSendEmail = () => {
    const subject = `Facture ${invoice.numero_facture || invoice.id.slice(-8)} - ${COMPANY_INFO.name}`;
    const body = `Bonjour ${invoice.client_nom},\n\nVeuillez trouver ci-joint votre facture.\n\nCordialement,\n${COMPANY_INFO.name}`;
    window.open(`mailto:${COMPANY_INFO.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const products = (invoice as any).products || [];
  const subtotal = products.reduce((sum, product) => sum + (product.totalPrice || 0), 0);
  const tvaRate = 0.18;
  const tvaAmount = subtotal * tvaRate;
  const total = subtotal + tvaAmount;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl text-orange-600 font-bold">Aperçu de la facture professionnelle</DialogTitle>
            <div className="flex gap-2 no-print">
              <Button onClick={handleSendEmail} variant="outline" size="sm" className="hover:bg-orange-50">
                <Send className="h-4 w-4 mr-2" />
                Envoyer
              </Button>
              <Button onClick={handleDownloadPDF} variant="outline" size="sm" className="hover:bg-orange-50">
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button onClick={handlePrint} variant="outline" size="sm" className="hover:bg-orange-50">
                <Printer className="h-4 w-4 mr-2" />
                Imprimer
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div id="professional-invoice-print" className="invoice-container">
          {/* En-tête avec logo et informations entreprise */}
          <div className="header-section">
            <div className="logo-container">
              <img 
                src="/lovable-uploads/e960775f-1b0b-4dfe-8666-5154b7b3dd11.png" 
                alt="Cornerstone Briques Logo" 
                className="logo-image"
              />
            </div>
            <div className="company-details">
              <div className="company-name">{COMPANY_INFO.name}</div>
              <div className="company-slogan">"{COMPANY_INFO.slogan}"</div>
              <div className="company-info">
                <div>
                  <Phone className="inline w-3 h-3 mr-1" />
                  {COMPANY_INFO.phones.join(' / ')}
                </div>
                <div>
                  <MapPin className="inline w-3 h-3 mr-1" />
                  {COMPANY_INFO.address}
                </div>
                <div>
                  <Mail className="inline w-3 h-3 mr-1" />
                  {COMPANY_INFO.email}
                </div>
                <div>
                  Site: {COMPANY_INFO.website}
                </div>
              </div>
            </div>
            <div className="invoice-header-right">
              <div className="invoice-number">
                FACTURE N° {invoice.numero_facture || `FC${invoice.id.slice(-6).toUpperCase()}`}
              </div>
              <div className="invoice-date">
                {new Date(invoice.date_facture).toLocaleDateString('fr-FR')}
              </div>
            </div>
          </div>

          {/* Section informations client et facture */}
          <div className="client-section">
            <div className="client-info-wrapper">
              <div className="client-details">
                <div className="section-title">Facturer à</div>
                <div className="info-row"><strong>{invoice.client_nom}</strong></div>
                <div className="info-row">{invoice.client_telephone}</div>
                <div className="info-row">{invoice.client_adresse}</div>
              </div>
              <div className="invoice-details">
                <div className="section-title">Détails facture</div>
                <div className="info-row">
                  <strong>Date d'émission:</strong> {new Date(invoice.date_facture).toLocaleDateString('fr-FR')}
                </div>
                <div className="info-row">
                  <strong>Date d'échéance:</strong> {invoice.date_echeance ? new Date(invoice.date_echeance).toLocaleDateString('fr-FR') : 'À réception'}
                </div>
                <div className="info-row">
                  <strong>Statut:</strong> 
                  <span className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold ${
                    invoice.statut === 'payee' ? 'bg-green-100 text-green-800' :
                    invoice.statut === 'envoyee' ? 'bg-blue-100 text-blue-800' :
                    invoice.statut === 'en_retard' ? 'bg-red-100 text-red-800' :
                    invoice.statut === 'annulee' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {invoice.statut === 'brouillon' ? 'Brouillon' :
                     invoice.statut === 'envoyee' ? 'Envoyée' :
                     invoice.statut === 'payee' ? 'Payée' :
                     invoice.statut === 'en_retard' ? 'En retard' :
                     'Annulée'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section produits */}
          <div className="products-section">
            <table className="products-table">
              <thead>
                <tr>
                  <th>Désignation</th>
                  <th style={{width: '100px', textAlign: 'center'}}>Quantité</th>
                  <th style={{width: '120px', textAlign: 'right'}}>Prix Unit. HT</th>
                  <th style={{width: '120px', textAlign: 'right'}}>Total HT</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <tr key={product.id || index}>
                    <td><strong>{product.name}</strong></td>
                    <td style={{textAlign: 'center'}}>{product.quantity}</td>
                    <td style={{textAlign: 'right'}}>{formatCurrency(product.unitPrice || 0)}</td>
                    <td style={{textAlign: 'right'}}><strong>{formatCurrency(product.totalPrice || 0)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section totaux */}
          <div className="totals-section">
            <div className="totals-wrapper">
              <div className="totals-content">
                <div className="total-row subtotal">
                  <span>Sous-total HT:</span>
                  <span><strong>{formatCurrency(subtotal)}</strong></span>
                </div>
                <div className="total-row">
                  <span>TVA ({(tvaRate * 100).toFixed(0)}%):</span>
                  <span><strong>{formatCurrency(tvaAmount)}</strong></span>
                </div>
                <div className="total-row final">
                  <span>Total TTC à payer:</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Informations de paiement et notes */}
          <div className="payment-info-section">
            {(invoice as any).notes && (
              <div className="payment-info">
                <h4>📝 Notes</h4>
                <p>{(invoice as any).notes}</p>
              </div>
            )}
            
            <div className="payment-info">
              <h4>💳 Conditions de paiement</h4>
              <p><strong>Modalités:</strong> Paiement par espèces, chèque ou virement bancaire accepté.</p>
              <p><strong>Délai:</strong> {invoice.date_echeance ? `Échéance le ${new Date(invoice.date_echeance).toLocaleDateString('fr-FR')}` : 'Paiement à réception de facture'}</p>
              <p><strong>Pénalités:</strong> Toute facture impayée donnera lieu à des pénalités de retard conformément à la loi.</p>
            </div>

            <div className="payment-info">
              <h4>📍 Informations de retrait</h4>
              <p><strong>Adresse:</strong> {COMPANY_INFO.address}</p>
              <p><strong>Ville:</strong> {COMPANY_INFO.city}, {COMPANY_INFO.country}</p>
              <p><strong>Contact:</strong> {COMPANY_INFO.phones.join(' / ')}</p>
            </div>
          </div>

          {/* Pied de page */}
          <div className="footer-section">
            <div className="footer-content">
              <div className="footer-company">{COMPANY_INFO.name}</div>
              <div className="footer-details">
                <div>{COMPANY_INFO.slogan}</div>
                <div>{COMPANY_INFO.address} - {COMPANY_INFO.city}, {COMPANY_INFO.country}</div>
                <div>Tél: {COMPANY_INFO.phones.join(' / ')} - Email: {COMPANY_INFO.email}</div>
                <div>Site web: {COMPANY_INFO.website}</div>
              </div>
              <div className="footer-note">
                Merci de votre confiance ! Cette facture est générée électroniquement et est valide sans signature.
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
