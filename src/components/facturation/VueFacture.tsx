
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CornerstoneInvoiceTemplate } from './CornerstoneInvoiceTemplate';
import { Download, Printer, Mail, MessageCircle, Share2 } from 'lucide-react';

interface VueFactureProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  facture: any;
  type: 'facture' | 'devis';
}

export const VueFacture = ({ open, onOpenChange, facture, type }: VueFactureProps) => {
  const [isExporting, setIsExporting] = useState(false);

  if (!facture) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    setIsExporting(true);
    try {
      // Ici on pourrait intégrer une librairie comme jsPDF ou html2pdf
      // Pour l'instant, on utilise la fonction d'impression du navigateur
      window.print();
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSendEmail = () => {
    const subject = `${type === 'facture' ? 'Facture' : 'Devis'} ${type === 'facture' ? facture.numero_facture : facture.numero_devis}`;
    const body = `Veuillez trouver ci-joint votre ${type} de la part de Cornerstone Briques.`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
  };

  const handleSendWhatsApp = () => {
    const message = `Bonjour, voici votre ${type} ${type === 'facture' ? facture.numero_facture : facture.numero_devis} de Cornerstone Briques. Montant: ${facture.montant_total.toLocaleString()} FCFA`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${type === 'facture' ? 'Facture' : 'Devis'} ${type === 'facture' ? facture.numero_facture : facture.numero_devis}`,
          text: `${type === 'facture' ? 'Facture' : 'Devis'} de Cornerstone Briques - ${facture.montant_total.toLocaleString()} FCFA`,
          url: window.location.href
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="text-2xl font-bold text-orange-600">
              {type === 'facture' ? 'Aperçu Facture' : 'Aperçu Devis'}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="flex items-center gap-2"
              >
                <Printer className="h-4 w-4" />
                Imprimer
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadPDF}
                disabled={isExporting}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {isExporting ? 'Export...' : 'PDF'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSendEmail}
                className="flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                Email
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSendWhatsApp}
                className="flex items-center gap-2 bg-green-50 hover:bg-green-100"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </Button>
              {navigator.share && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="flex items-center gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  Partager
                </Button>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="print:p-0">
          <CornerstoneInvoiceTemplate
            type={type}
            numero={type === 'facture' ? facture.numero_facture : facture.numero_devis}
            date={type === 'facture' ? facture.date_facture : facture.date_devis}
            dateEcheance={facture.date_echeance}
            clientNom={facture.client_nom}
            clientTelephone={facture.client_telephone}
            clientAdresse={facture.client_adresse}
            products={type === 'facture' ? facture.facture_items || [] : facture.devis_items || []}
            montantTotal={facture.montant_total}
            statut={facture.statut}
            commentaires={facture.commentaires}
          />
        </div>

        <div className="flex justify-end gap-2 print:hidden">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
