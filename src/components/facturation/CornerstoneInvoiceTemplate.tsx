
import React from 'react';
import { COMPANY_INFO } from '@/config/company';
import { Separator } from '@/components/ui/separator';
import { Truck, MapPin, Gift } from 'lucide-react';

interface CornerstoneInvoiceTemplateProps {
  type: 'facture' | 'devis';
  numero: string;
  date: string;
  dateEcheance?: string;
  clientNom: string;
  clientTelephone?: string;
  clientAdresse?: string;
  products: Array<{
    nom_produit: string;
    quantite: number;
    prix_unitaire: number;
    prix_original?: number;
    remise_pourcentage?: number;
    remise_montant?: number;
    total_ligne: number;
  }>;
  montantTotal: number;
  statut?: string;
  commentaires?: string;
  modeLivraison?: string;
  fraisLivraison?: number;
  adresseLivraison?: string;
  sousTotal?: number;
  remiseGlobale?: number;
}

export const CornerstoneInvoiceTemplate = ({
  type,
  numero,
  date,
  dateEcheance,
  clientNom,
  clientTelephone,
  clientAdresse,
  products,
  montantTotal,
  statut,
  commentaires,
  modeLivraison = 'retrait_usine',
  fraisLivraison = 0,
  adresseLivraison,
  sousTotal,
  remiseGlobale = 0
}: CornerstoneInvoiceTemplateProps) => {
  const calculatedSousTotal = sousTotal || products.reduce((sum, product) => sum + product.total_ligne, 0);
  const totalAvecRemise = calculatedSousTotal - remiseGlobale;
  const totalFinal = totalAvecRemise + (fraisLivraison || 0);

  const getStatutColor = (statut?: string) => {
    switch (statut) {
      case 'payee':
      case 'accepte':
        return 'text-green-600 bg-green-50';
      case 'envoyee':
      case 'envoye':
        return 'text-blue-600 bg-blue-50';
      case 'en_retard':
      case 'refuse':
      case 'expire':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatutText = (statut?: string) => {
    switch (statut) {
      case 'brouillon':
        return 'Brouillon';
      case 'envoyee':
      case 'envoye':
        return type === 'facture' ? 'Envoyée' : 'Envoyé';
      case 'payee':
        return 'Payée';
      case 'accepte':
        return 'Accepté';
      case 'en_retard':
        return 'En retard';
      case 'refuse':
        return 'Refusé';
      case 'expire':
        return 'Expiré';
      default:
        return statut;
    }
  };

  const getModeIcone = (mode: string) => {
    switch (mode) {
      case 'livraison_payante':
        return <Truck className="h-4 w-4" />;
      case 'livraison_gratuite':
        return <Gift className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  const getModeText = (mode: string) => {
    switch (mode) {
      case 'livraison_payante':
        return 'Livraison payante';
      case 'livraison_gratuite':
        return 'Livraison gratuite';
      default:
        return 'Retrait à l\'usine';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white print:p-4">
      {/* En-tête */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center space-x-4">
          <img 
            src="/lovable-uploads/d4bf97e1-3f49-486b-8c13-934b3178f760.png" 
            alt="Cornerstone Briques" 
            className="h-16 w-auto"
          />
          <div>
            <h1 className="text-2xl font-bold text-orange-600">{COMPANY_INFO.name}</h1>
            <p className="text-sm text-gray-600">{COMPANY_INFO.slogan}</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-3xl font-bold text-gray-800 uppercase">
            {type === 'facture' ? 'FACTURE' : 'DEVIS'}
          </h2>
          <p className="text-lg font-semibold text-orange-600">{numero}</p>
          {statut && (
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${getStatutColor(statut)}`}>
              {getStatutText(statut)}
            </span>
          )}
        </div>
      </div>

      {/* Informations de l'entreprise et du client */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">De :</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p className="font-semibold">{COMPANY_INFO.name}</p>
            <p>{COMPANY_INFO.address}</p>
            <p>{COMPANY_INFO.city}, {COMPANY_INFO.country}</p>
            <p>Tél: {COMPANY_INFO.phones.join(' / ')}</p>
            <p>Email: {COMPANY_INFO.email}</p>
            <p>Site: {COMPANY_INFO.website}</p>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">À :</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p className="font-semibold">{clientNom}</p>
            {clientTelephone && <p>Tél: {clientTelephone}</p>}
            {clientAdresse && <p>{clientAdresse}</p>}
          </div>
        </div>
      </div>

      {/* Informations de dates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
        <div>
          <span className="text-sm font-medium text-gray-600">
            Date {type === 'facture' ? 'de facturation' : 'du devis'} :
          </span>
          <p className="font-semibold">{new Date(date).toLocaleDateString('fr-FR')}</p>
        </div>
        {dateEcheance && (
          <div>
            <span className="text-sm font-medium text-gray-600">
              {type === 'facture' ? 'Date d\'échéance' : 'Valable jusqu\'au'} :
            </span>
            <p className="font-semibold">{new Date(dateEcheance).toLocaleDateString('fr-FR')}</p>
          </div>
        )}
        <div>
          <span className="text-sm font-medium text-gray-600">Mode de livraison :</span>
          <div className="flex items-center gap-2 font-semibold">
            {getModeIcone(modeLivraison)}
            {getModeText(modeLivraison)}
          </div>
        </div>
      </div>

      {/* Adresse de livraison si applicable */}
      {(modeLivraison === 'livraison_payante' || modeLivraison === 'livraison_gratuite') && adresseLivraison && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">Adresse de livraison :</h4>
          <p className="text-blue-700">{adresseLivraison}</p>
        </div>
      )}

      {/* Tableau des produits */}
      <div className="mb-8">
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-orange-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left">Produit</th>
                <th className="px-4 py-3 text-center">Qté</th>
                <th className="px-4 py-3 text-right">Prix unit.</th>
                <th className="px-4 py-3 text-right">Remise</th>
                <th className="px-4 py-3 text-right">Prix final</th>
                <th className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{product.nom_produit}</div>
                  </td>
                  <td className="px-4 py-3 text-center">{product.quantite}</td>
                  <td className="px-4 py-3 text-right">
                    {product.prix_original && product.prix_original !== product.prix_unitaire ? (
                      <div>
                        <span className="line-through text-gray-500 text-sm">
                          {product.prix_original.toLocaleString()} FCFA
                        </span>
                        <br />
                        <span className="font-medium">
                          {product.prix_unitaire.toLocaleString()} FCFA
                        </span>
                      </div>
                    ) : (
                      <span className="font-medium">{product.prix_unitaire.toLocaleString()} FCFA</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {product.remise_pourcentage && product.remise_pourcentage > 0 ? (
                      <span className="text-red-600 font-medium">
                        -{product.remise_pourcentage.toFixed(1)}%
                      </span>
                    ) : product.remise_montant && product.remise_montant > 0 ? (
                      <span className="text-red-600 font-medium">
                        -{product.remise_montant.toLocaleString()} FCFA
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {product.prix_unitaire.toLocaleString()} FCFA
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-green-600">
                    {product.total_ligne.toLocaleString()} FCFA
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Récapitulatif des totaux */}
      <div className="flex justify-end mb-8">
        <div className="w-full md:w-1/2 space-y-3">
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Sous-total :</span>
            <span className="font-semibold">{calculatedSousTotal.toLocaleString()} FCFA</span>
          </div>
          
          {remiseGlobale > 0 && (
            <div className="flex justify-between py-2 text-red-600">
              <span>Remise globale :</span>
              <span className="font-semibold">-{remiseGlobale.toLocaleString()} FCFA</span>
            </div>
          )}
          
          {totalAvecRemise !== calculatedSousTotal && (
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Sous-total après remise :</span>
              <span className="font-semibold">{totalAvecRemise.toLocaleString()} FCFA</span>
            </div>
          )}
          
          {fraisLivraison > 0 && (
            <div className="flex justify-between py-2 text-blue-600">
              <span>Frais de livraison :</span>
              <span className="font-semibold">+{fraisLivraison.toLocaleString()} FCFA</span>
            </div>
          )}
          
          <Separator />
          
          <div className="flex justify-between py-3 text-lg">
            <span className="font-bold">TOTAL {type.toUpperCase()} :</span>
            <span className="font-bold text-orange-600 text-xl">
              {totalFinal.toLocaleString()} FCFA
            </span>
          </div>
        </div>
      </div>

      {/* Commentaires */}
      {commentaires && (
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">Commentaires :</h4>
          <p className="text-gray-700 whitespace-pre-wrap">{commentaires}</p>
        </div>
      )}

      {/* Conditions et signatures */}
      <div className="mt-12 space-y-6">
        {type === 'devis' && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">📋 Conditions du devis :</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Ce devis est valable jusqu'au {dateEcheance ? new Date(dateEcheance).toLocaleDateString('fr-FR') : '30 jours'}</li>
              <li>• Les prix sont exprimés en Francs CFA TTC</li>
              <li>• Devis gratuit et sans engagement</li>
              <li>• Conditions de paiement à définir lors de la commande</li>
            </ul>
          </div>
        )}
        
        {type === 'facture' && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">💳 Conditions de paiement :</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Paiement à {dateEcheance ? `échéance le ${new Date(dateEcheance).toLocaleDateString('fr-FR')}` : 'réception'}</li>
              <li>• Modes de paiement acceptés : Espèces, Virement, Mobile Money</li>
              <li>• En cas de retard de paiement, des pénalités pourront être appliquées</li>
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-12">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-12">Signature du client :</p>
            <div className="border-t border-gray-300 pt-2">
              <p className="text-sm font-medium">{clientNom}</p>
              <p className="text-xs text-gray-500">Date : _______________</p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-12">Pour Cornerstone Briques :</p>
            <div className="border-t border-gray-300 pt-2">
              <p className="text-sm font-medium">Gérant</p>
              <p className="text-xs text-gray-500">Date : {new Date().toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pied de page */}
      <div className="mt-12 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
        <p className="mb-2">
          {COMPANY_INFO.name} - {COMPANY_INFO.address}, {COMPANY_INFO.city}, {COMPANY_INFO.country}
        </p>
        <p>
          Tél: {COMPANY_INFO.phones.join(' / ')} | Email: {COMPANY_INFO.email} | Web: {COMPANY_INFO.website}
        </p>
        <p className="mt-2 italic">
          {type === 'facture' ? 'Facture' : 'Devis'} générée le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}
        </p>
      </div>
    </div>
  );
};
