
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Printer, Send, FileText, MessageCircle, Mail } from 'lucide-react';
import { CornerstoneInvoiceTemplate } from './CornerstoneInvoiceTemplate';
import { useToast } from '@/hooks/use-toast';

interface VueFactureCompleteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  facture: any;
}

export const VueFactureComplete = ({ open, onOpenChange, facture }: VueFactureCompleteProps) => {
  const { toast } = useToast();

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
                body { 
                  font-family: Arial, sans-serif; 
                  margin: 0; 
                  padding: 20px; 
                  background: white;
                }
                .no-print { display: none !important; }
                @media print {
                  body { margin: 0; padding: 0; }
                  .no-print { display: none !important; }
                }
                table { width: 100%; border-collapse: collapse; }
                th, td { padding: 8px; text-align: left; border: 1px solid #ddd; }
                .bg-orange-500 { background-color: #f97316; color: white; }
                .bg-orange-50 { background-color: #fff7ed; }
                .text-orange-600 { color: #ea580c; }
                .border-orange-500 { border-color: #f97316; }
                .font-bold { font-weight: bold; }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
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

    toast({
      title: "Export PDF",
      description: "Utilisez Ctrl+P puis 'Enregistrer au format PDF' dans votre navigateur",
    });
  };

  const handleSendWhatsApp = () => {
    let message = `🧱 *Cornerstone Briques*\n\n`;
    message += `Bonjour ${facture.client_nom},\n\n`;
    message += `Voici votre facture :\n`;
    message += `📄 *Numéro:* ${facture.numero_facture}\n`;
    message += `📅 *Date:* ${new Date(facture.date_facture).toLocaleDateString('fr-FR')}\n`;
    message += `💰 *Montant total:* ${facture.montant_total.toLocaleString()} FCFA\n\n`;
    
    if (facture.mode_livraison === 'retrait_usine') {
      message += `🏭 *Retrait à l'usine*\n`;
      message += `📍 Akodessewa, après les rails, non loin de la station d'essence CM, Lomé\n\n`;
    } else if (facture.mode_livraison === 'livraison_gratuite') {
      message += `🚚 *Livraison gratuite*\n`;
      message += `📍 ${facture.adresse_livraison || 'Adresse à préciser'}\n\n`;
    } else if (facture.mode_livraison === 'livraison_payante') {
      message += `🚛 *Livraison payante* (${facture.frais_livraison?.toLocaleString() || 0} FCFA)\n`;
      message += `📍 ${facture.adresse_livraison || 'Adresse à préciser'}\n\n`;
    }
    
    message += `📞 *Contact:* +228 71014747\n`;
    message += `🌐 www.cornerstonebrique.com\n\n`;
    message += `Merci de votre confiance ! 🙏`;

    const phoneNumber = facture.client_telephone ? facture.client_telephone.replace(/\s/g, '').replace(/^\+/, '') : '';
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

  const handleSendEmail = () => {
    const subject = `Facture ${facture.numero_facture} - Cornerstone Briques`;
    
    let body = `Bonjour ${facture.client_nom},\n\n`;
    body += `Veuillez trouver ci-joint votre facture :\n\n`;
    body += `Numéro: ${facture.numero_facture}\n`;
    body += `Date: ${new Date(facture.date_facture).toLocaleDateString('fr-FR')}\n`;
    body += `Montant total: ${facture.montant_total.toLocaleString()} FCFA\n\n`;
    
    if (facture.mode_livraison === 'retrait_usine') {
      body += `Mode de livraison: Retrait à l'usine\n`;
      body += `Adresse: Akodessewa, après les rails, non loin de la station d'essence CM, Lomé, Togo\n\n`;
    } else if (facture.mode_livraison === 'livraison_gratuite') {
      body += `Mode de livraison: Livraison gratuite\n`;
      body += `Adresse de livraison: ${facture.adresse_livraison || 'À préciser'}\n\n`;
    } else if (facture.mode_livraison === 'livraison_payante') {
      body += `Mode de livraison: Livraison payante (${facture.frais_livraison?.toLocaleString() || 0} FCFA)\n`;
      body += `Adresse de livraison: ${facture.adresse_livraison || 'À préciser'}\n\n`;
    }
    
    body += `Cordialement,\n`;
    body += `L'équipe Cornerstone Briques\n`;
    body += `Téléphone: +228 71014747 / +228 90 96 49 93 / +228 99 87 01 95\n`;
    body += `Email: contact@cornerstonebrique.com`;

    const mailtoUrl = `mailto:${facture.client_email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
    
    toast({
      title: "Email préparé",
      description: "Votre client de messagerie va s'ouvrir avec le message pré-rempli",
    });
  };

  const handlePrint = () => {
    const printContent = document.getElementById('facture-print');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Facture ${facture.numero_facture}</title>
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  margin: 0; 
                  padding: 0; 
                  background: white;
                }
                @media print { 
                  body { margin: 0; padding: 0; } 
                  .no-print { display: none !important; }
                }
                table { width: 100%; border-collapse: collapse; }
                th, td { padding: 8px; text-align: left; border: 1px solid #ddd; }
                .bg-orange-500 { background-color: #f97316; color: white; }
                .bg-orange-50 { background-color: #fff7ed; }
                .text-orange-600 { color: #ea580c; }
                .border-orange-500 { border-color: #f97316; }
                .font-bold { font-weight: bold; }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
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

  const handleSaveDocument = () => {
    const documentData = {
      ...facture,
      type: 'facture',
      saved_at: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(documentData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `facture_${facture.numero_facture}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    
    toast({
      title: "Document sauvegardé",
      description: "La facture a été téléchargée en format JSON",
    });
  };

  // Préparer les produits pour le template
  const products = facture.facture_items?.map((item: any) => ({
    nom_produit: item.nom_produit,
    quantite: item.quantite,
    prix_unitaire: item.prix_unitaire,
    total_ligne: item.total_ligne,
    prix_original: item.prix_original,
    remise_pourcentage: item.remise_pourcentage,
    remise_montant: item.remise_montant
  })) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <div className="space-y-4">
          {/* Actions principales */}
          <div className="flex flex-wrap gap-3 p-4 bg-gray-50 rounded-lg border no-print">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="flex items-center gap-2 hover:bg-blue-50 h-10"
            >
              <Printer className="h-4 w-4" />
              Imprimer
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              className="flex items-center gap-2 hover:bg-red-50 h-10"
            >
              <Download className="h-4 w-4" />
              PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSendEmail}
              className="flex items-center gap-2 hover:bg-blue-50 h-10"
            >
              <Mail className="h-4 w-4" />
              Email
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSendWhatsApp}
              className="flex items-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 border-green-200 h-10"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveDocument}
              className="flex items-center gap-2 hover:bg-purple-50 h-10"
            >
              <FileText className="h-4 w-4" />
              Sauvegarder
            </Button>
          </div>

          {/* Facture */}
          <div id="facture-print">
            <CornerstoneInvoiceTemplate 
              type="facture"
              numero={facture.numero_facture}
              date={facture.date_facture}
              dateEcheance={facture.date_echeance}
              clientNom={facture.client_nom}
              clientTelephone={facture.client_telephone}
              clientAdresse={facture.client_adresse}
              products={products}
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

          {/* Bouton fermer */}
          <div className="flex justify-end pt-4 no-print">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="h-11 px-6">
              Fermer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
