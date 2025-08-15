
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CornerstoneInvoiceTemplate } from './CornerstoneInvoiceTemplate';
import { Download, Printer, Mail, MessageCircle, Share2, FileText, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VueFactureProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  facture: any;
  type: 'facture' | 'devis';
}

export const VueFacture = ({ open, onOpenChange, facture, type }: VueFactureProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  if (!facture) return null;

  const handlePrint = () => {
    const printContent = document.getElementById('invoice-content');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${type === 'facture' ? 'Facture' : 'Devis'} ${type === 'facture' ? facture.numero_facture : facture.numero_devis}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                @media print { body { margin: 0; padding: 0; } }
                .no-print { display: none !important; }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
      }
    }
  };

  const handleDownloadPDF = async () => {
    setIsExporting(true);
    try {
      // Pour une vraie implémentation PDF, vous pourriez utiliser jsPDF ou html2pdf
      // Pour l'instant, on utilise la fonction d'impression
      toast({
        title: "Export PDF",
        description: "Utilisez l'option d'impression de votre navigateur pour sauvegarder en PDF",
      });
      handlePrint();
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le PDF",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleSendEmail = () => {
    const subject = `${type === 'facture' ? 'Facture' : 'Devis'} ${type === 'facture' ? facture.numero_facture : facture.numero_devis} - Cornerstone Briques`;
    
    let body = `Bonjour ${facture.client_nom},\n\n`;
    body += `Veuillez trouver ci-joint votre ${type} :\n\n`;
    body += `Numéro: ${type === 'facture' ? facture.numero_facture : facture.numero_devis}\n`;
    body += `Date: ${new Date(type === 'facture' ? facture.date_facture : facture.date_devis).toLocaleDateString('fr-FR')}\n`;
    body += `Montant total: ${facture.montant_total.toLocaleString()} FCFA\n\n`;
    
    if (facture.mode_livraison === 'retrait_usine') {
      body += `Mode de livraison: Retrait à l'usine\n`;
      body += `Adresse: Akodessewa, après les rails, non loin de la station d'essence CM, Lomé, Togo\n\n`;
    } else if (facture.mode_livraison === 'livraison_gratuite') {
      body += `Mode de livraison: Livraison gratuite\n`;
      body += `Adresse de livraison: ${facture.adresse_livraison}\n\n`;
    } else if (facture.mode_livraison === 'livraison_payante') {
      body += `Mode de livraison: Livraison payante (${facture.frais_livraison.toLocaleString()} FCFA)\n`;
      body += `Adresse de livraison: ${facture.adresse_livraison}\n\n`;
    }
    
    if (type === 'devis') {
      body += `Ce devis est valable jusqu'au ${new Date(facture.date_echeance).toLocaleDateString('fr-FR')}\n\n`;
    }
    
    body += `Cordialement,\n`;
    body += `L'équipe Cornerstone Briques\n`;
    body += `Téléphone: +228 71014747 / +228 90 96 49 93 / +228 99 87 01 95\n`;
    body += `Email: contact@cornerstonebrique.com`;

    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
    
    toast({
      title: "Email préparé",
      description: "Votre client de messagerie va s'ouvrir avec le message pré-rempli",
    });
  };

  const handleSendWhatsApp = () => {
    let message = `🧱 *Cornerstone Briques*\n\n`;
    message += `Bonjour ${facture.client_nom},\n\n`;
    message += `Voici votre ${type} :\n`;
    message += `📄 *Numéro:* ${type === 'facture' ? facture.numero_facture : facture.numero_devis}\n`;
    message += `📅 *Date:* ${new Date(type === 'facture' ? facture.date_facture : facture.date_devis).toLocaleDateString('fr-FR')}\n`;
    message += `💰 *Montant total:* ${facture.montant_total.toLocaleString()} FCFA\n\n`;
    
    if (facture.mode_livraison === 'retrait_usine') {
      message += `🏭 *Retrait à l'usine*\n`;
      message += `📍 Akodessewa, après les rails, non loin de la station d'essence CM, Lomé\n\n`;
    } else if (facture.mode_livraison === 'livraison_gratuite') {
      message += `🚚 *Livraison gratuite*\n`;
      message += `📍 ${facture.adresse_livraison}\n\n`;
    } else if (facture.mode_livraison === 'livraison_payante') {
      message += `🚛 *Livraison payante* (${facture.frais_livraison.toLocaleString()} FCFA)\n`;
      message += `📍 ${facture.adresse_livraison}\n\n`;
    }
    
    if (type === 'devis') {
      message += `⏰ *Valable jusqu'au:* ${new Date(facture.date_echeance).toLocaleDateString('fr-FR')}\n\n`;
    }
    
    message += `📞 *Contact:* +228 71014747\n`;
    message += `🌐 www.cornerstonebrique.com\n\n`;
    message += `Merci de votre confiance ! 🙏`;

    // Si un numéro de téléphone client est disponible, l'utiliser
    const phoneNumber = facture.client_telephone ? facture.client_telephone.replace(/\s/g, '') : '';
    const whatsappUrl = phoneNumber 
      ? `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "WhatsApp ouvert",
      description: phoneNumber 
        ? `Message préparé pour ${facture.client_nom}` 
        : "Sélectionnez le contact à qui envoyer le message",
    });
  };

  const handleShare = async () => {
    const shareData = {
      title: `${type === 'facture' ? 'Facture' : 'Devis'} ${type === 'facture' ? facture.numero_facture : facture.numero_devis}`,
      text: `${type === 'facture' ? 'Facture' : 'Devis'} de Cornerstone Briques pour ${facture.client_nom} - ${facture.montant_total.toLocaleString()} FCFA`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast({
          title: "Partagé",
          description: "Le document a été partagé avec succès",
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback pour les navigateurs qui ne supportent pas l'API Web Share
      navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
      toast({
        title: "Copié",
        description: "Les informations ont été copiées dans le presse-papiers",
      });
    }
  };

  const handleSaveDocument = () => {
    // Sauvegarder le document dans le navigateur local
    const documentData = {
      ...facture,
      type,
      saved_at: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(documentData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type}_${type === 'facture' ? facture.numero_facture : facture.numero_devis}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    
    toast({
      title: "Document sauvegardé",
      description: `Le ${type} a été téléchargé en format JSON`,
    });
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
                className="flex items-center gap-2 hover:bg-blue-50"
              >
                <Printer className="h-4 w-4" />
                Imprimer
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadPDF}
                disabled={isExporting}
                className="flex items-center gap-2 hover:bg-red-50"
              >
                <Download className="h-4 w-4" />
                {isExporting ? 'Export...' : 'PDF'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveDocument}
                className="flex items-center gap-2 hover:bg-purple-50"
              >
                <FileText className="h-4 w-4" />
                Sauvegarder
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Actions de partage */}
        <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSendEmail}
            className="flex items-center gap-2 hover:bg-blue-50"
          >
            <Mail className="h-4 w-4" />
            Envoyer par Email
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSendWhatsApp}
            className="flex items-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
          >
            <MessageCircle className="h-4 w-4" />
            Envoyer par WhatsApp
          </Button>
          {navigator.share && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="flex items-center gap-2 hover:bg-orange-50"
            >
              <Share2 className="h-4 w-4" />
              Partager
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const text = `${type === 'facture' ? 'Facture' : 'Devis'} ${type === 'facture' ? facture.numero_facture : facture.numero_devis} - ${facture.montant_total.toLocaleString()} FCFA`;
              navigator.clipboard.writeText(text);
              toast({
                title: "Copié",
                description: "Informations copiées dans le presse-papiers",
              });
            }}
            className="flex items-center gap-2 hover:bg-gray-50"
          >
            <Send className="h-4 w-4" />
            Copier infos
          </Button>
        </div>

        <div id="invoice-content" className="print:p-0">
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
            modeLivraison={facture.mode_livraison}
            fraisLivraison={facture.frais_livraison}
            adresseLivraison={facture.adresse_livraison}
            sousTotal={facture.sous_total}
            remiseGlobale={facture.remise_globale_montant || 0}
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
