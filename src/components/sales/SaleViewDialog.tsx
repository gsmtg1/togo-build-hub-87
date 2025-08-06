
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Printer } from 'lucide-react';
import type { Sale } from '@/types/database';
import { COMPANY_INFO } from '@/config/company';

interface SaleViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sale: Sale | null;
}

export const SaleViewDialog = ({ open, onOpenChange, sale }: SaleViewDialogProps) => {
  if (!sale) return null;

  // Helper function to safely format currency
  const formatCurrency = (amount: number | undefined | null): string => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '0 FCFA';
    }
    return `${amount.toLocaleString()} FCFA`;
  };

  const handlePrint = () => {
    const printContent = document.getElementById('sale-print-content');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Vente ${sale.id}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 20px; }
                .info { margin-bottom: 20px; }
                .products { margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .total { text-align: right; font-weight: bold; }
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

  const getStatusBadge = (status: Sale['status']) => {
    const variants: Record<Sale['status'], 'default' | 'secondary' | 'destructive'> = {
      pending: 'secondary',
      completed: 'default',
      cancelled: 'destructive',
    };
    
    const labels: Record<Sale['status'], string> = {
      pending: 'En attente',
      completed: 'Terminée',
      cancelled: 'Annulée',
    };

    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Détails de la vente</DialogTitle>
            <Button onClick={handlePrint} variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Imprimer
            </Button>
          </div>
        </DialogHeader>

        <div id="sale-print-content">
          <div className="header">
            <h2>{COMPANY_INFO.name}</h2>
            <p>{COMPANY_INFO.address}</p>
            <p>{COMPANY_INFO.phones.join(' / ')}</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Informations Client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div><strong>Date:</strong> {new Date(sale.sale_date).toLocaleDateString('fr-FR')}</div>
              <div><strong>Statut:</strong> {getStatusBadge(sale.status)}</div>
              {sale.notes && (
                <div><strong>Commentaires:</strong> {sale.notes}</div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Montant Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-center">
                {formatCurrency(sale.total_amount)}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
