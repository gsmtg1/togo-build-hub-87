
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Printer, Download, Send } from 'lucide-react';
import { Invoice } from '@/lib/database';

interface InvoiceViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice | null;
}

export const InvoiceViewDialog = ({ open, onOpenChange, invoice }: InvoiceViewDialogProps) => {
  if (!invoice) return null;

  const handlePrint = () => {
    const printContent = document.getElementById('invoice-print-content');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Facture ${invoice.id}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 20px; }
                .info { margin-bottom: 20px; }
                .products { margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .total { text-align: right; font-weight: bold; }
                .due-date { margin-top: 20px; font-weight: bold; }
                .payment-info { margin-top: 20px; background-color: #f9f9f9; padding: 10px; }
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

  const handleDownload = () => {
    // Implementation for PDF download would go here
    console.log('Download PDF functionality');
  };

  const handleSend = () => {
    // Implementation for sending invoice would go here
    console.log('Send invoice functionality');
  };

  const getStatusBadge = (status: Invoice['status']) => {
    const variants: Record<Invoice['status'], 'default' | 'secondary' | 'destructive'> = {
      draft: 'secondary',
      sent: 'default',
      paid: 'default',
      overdue: 'destructive',
    };
    
    const labels: Record<Invoice['status'], string> = {
      draft: 'Brouillon',
      sent: 'Envoyée',
      paid: 'Payée',
      overdue: 'En retard',
    };

    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Facture #{invoice.id.slice(-8)}</DialogTitle>
            <div className="flex gap-2">
              <Button onClick={handleSend} variant="outline" size="sm">
                <Send className="h-4 w-4 mr-2" />
                Envoyer
              </Button>
              <Button onClick={handleDownload} variant="outline" size="sm">
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

        <div id="invoice-print-content">
          <div className="header">
            <h2>Cornerstone Briques</h2>
            <p>Lomé, Togo</p>
            <h3>FACTURE #{invoice.id.slice(-8)}</h3>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Informations Client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div><strong>Nom:</strong> {invoice.customerName}</div>
              <div><strong>Téléphone:</strong> {invoice.customerPhone}</div>
              <div><strong>Adresse:</strong> {invoice.customerAddress}</div>
              <div><strong>Date:</strong> {new Date(invoice.date).toLocaleDateString()}</div>
              <div><strong>Date d'échéance:</strong> {new Date(invoice.dueDate).toLocaleDateString()}</div>
              <div><strong>Statut:</strong> {getStatusBadge(invoice.status)}</div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Détail des produits</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full">
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>Quantité</th>
                    <th>Prix unitaire</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.products.map((product) => (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>{product.quantity}</td>
                      <td>{product.unitPrice.toLocaleString()} FCFA</td>
                      <td>{product.totalPrice.toLocaleString()} FCFA</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="total mt-4">
                <strong>Total à payer: {invoice.totalAmount.toLocaleString()} FCFA</strong>
              </div>
              <div className="due-date">
                <p>Date limite de paiement: {new Date(invoice.dueDate).toLocaleDateString()}</p>
              </div>
              <div className="payment-info">
                <h4>Informations de paiement</h4>
                <p>Veuillez effectuer le paiement avant la date d'échéance.</p>
                <p>Merci pour votre confiance.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
