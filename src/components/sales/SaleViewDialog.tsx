
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

  const handlePrint = () => {
    const printContent = document.getElementById('sale-print-content');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Vente ${sale.numero_vente}</title>
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

  const getStatusBadge = (status: Sale['statut']) => {
    const variants: Record<Sale['statut'], 'default' | 'secondary' | 'destructive'> = {
      en_attente: 'secondary',
      confirmee: 'default',
      livree: 'default',
      annulee: 'destructive',
    };
    
    const labels: Record<Sale['statut'], string> = {
      en_attente: 'En attente',
      confirmee: 'Confirmée',
      livree: 'Livrée',
      annulee: 'Annulée',
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
              <div><strong>N° Vente:</strong> {sale.numero_vente}</div>
              <div><strong>Nom:</strong> {sale.client_nom}</div>
              <div><strong>Téléphone:</strong> {sale.client_telephone}</div>
              <div><strong>Adresse:</strong> {sale.client_adresse}</div>
              <div><strong>Date:</strong> {new Date(sale.date_vente).toLocaleDateString('fr-FR')}</div>
              <div><strong>Statut:</strong> {getStatusBadge(sale.statut)}</div>
              {sale.commentaires && (
                <div><strong>Commentaires:</strong> {sale.commentaires}</div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Montant Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-center">
                {sale.montant_total.toLocaleString()} FCFA
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
