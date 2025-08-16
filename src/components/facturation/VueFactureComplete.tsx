
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, Download, Send } from 'lucide-react';
import { CornerstoneInvoiceTemplate } from './CornerstoneInvoiceTemplate';

interface VueFactureCompleteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  facture: any;
  onClose?: () => void;
}

export const VueFactureComplete = ({ 
  open, 
  onOpenChange, 
  facture, 
  onClose 
}: VueFactureCompleteProps) => {
  
  if (!facture) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    alert('Fonctionnalité PDF en cours de développement');
  };

  const handleSendEmail = () => {
    const subject = `Facture ${facture.numero_facture} - Cornerstone Briques`;
    const body = `Bonjour ${facture.client_nom},\n\nVeuillez trouver ci-joint votre facture.\n\nCordialement,\nCornerstone Briques`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const handleClose = () => {
    onClose?.();
    onOpenChange(false);
  };

  // Transformer les items de facture pour le template
  const products = (facture.facture_items || []).map((item: any) => ({
    nom_produit: item.nom_produit,
    quantite: item.quantite,
    prix_unitaire: item.prix_unitaire,
    total_ligne: item.total_ligne
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl">Aperçu de la facture {facture.numero_facture}</DialogTitle>
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
              <Button onClick={handleClose} variant="outline" size="sm">
                Fermer
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
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
            fraisLivraison={facture.frais_livraison || 0}
            adresseLivraison={facture.adresse_livraison}
            sousTotal={facture.sous_total}
            remiseGlobale={facture.remise_globale_montant || 0}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
