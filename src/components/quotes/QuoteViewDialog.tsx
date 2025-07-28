
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Printer } from 'lucide-react';
import { Quote } from '@/lib/database';

interface QuoteViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote: Quote | null;
}

export const QuoteViewDialog = ({ open, onOpenChange, quote }: QuoteViewDialogProps) => {
  if (!quote) return null;

  const handlePrint = () => {
    const printContent = document.getElementById('quote-print-content');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Devis ${quote.id}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 20px; }
                .info { margin-bottom: 20px; }
                .products { margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .total { text-align: right; font-weight: bold; }
                .validity { margin-top: 20px; font-style: italic; }
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

  const getStatusBadge = (status: Quote['status']) => {
    const variants: Record<Quote['status'], 'default' | 'secondary' | 'destructive'> = {
      draft: 'secondary',
      sent: 'default',
      accepted: 'default',
      rejected: 'destructive',
      expired: 'destructive',
    };
    
    const labels: Record<Quote['status'], string> = {
      draft: 'Brouillon',
      sent: 'Envoyé',
      accepted: 'Accepté',
      rejected: 'Refusé',
      expired: 'Expiré',
    };

    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Détails du devis</DialogTitle>
            <Button onClick={handlePrint} variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Imprimer
            </Button>
          </div>
        </DialogHeader>

        <div id="quote-print-content">
          <div className="header">
            <h2>Cornerstone Briques</h2>
            <p>Lomé, Togo</p>
            <h3>DEVIS</h3>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Informations Client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div><strong>Nom:</strong> {quote.customerName}</div>
              <div><strong>Téléphone:</strong> {quote.customerPhone}</div>
              <div><strong>Adresse:</strong> {quote.customerAddress}</div>
              <div><strong>Date:</strong> {new Date(quote.date).toLocaleDateString()}</div>
              <div><strong>Valide jusqu'à:</strong> {new Date(quote.validUntil).toLocaleDateString()}</div>
              <div><strong>Statut:</strong> {getStatusBadge(quote.status)}</div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Produits</CardTitle>
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
                  {quote.products.map((product) => (
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
                <strong>Total général: {quote.totalAmount.toLocaleString()} FCFA</strong>
              </div>
              <div className="validity">
                <p>Ce devis est valable jusqu'au {new Date(quote.validUntil).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
