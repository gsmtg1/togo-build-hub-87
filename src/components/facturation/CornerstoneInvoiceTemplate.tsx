
import React from 'react';
import { COMPANY_INFO } from '@/config/company';

interface Product {
  nom_produit: string;
  quantite: number;
  prix_unitaire: number;
  total_ligne: number;
}

interface CornerstoneInvoiceTemplateProps {
  type?: 'facture' | 'devis' | string;
  numero: string;
  date: string;
  dateEcheance?: string;
  clientNom: string;
  clientTelephone?: string;
  clientAdresse?: string;
  products: Product[];
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
  type = 'facture',
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
  modeLivraison,
  fraisLivraison,
  adresseLivraison,
  sousTotal,
  remiseGlobale
}: CornerstoneInvoiceTemplateProps) => {
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculatedSousTotal = sousTotal || products.reduce((sum, product) => sum + product.total_ligne, 0);
  const frais = fraisLivraison || 0;
  const remise = remiseGlobale || 0;
  const tva = (calculatedSousTotal - remise) * 0.18; // TVA 18% après remise
  const totalFinal = calculatedSousTotal - remise + frais + tva;

  const getDocumentTitle = () => {
    switch (type) {
      case 'devis':
        return 'DEVIS';
      case 'facture':
      default:
        return 'FACTURE';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white shadow-lg print:shadow-none">
      {/* En-tête avec logo et informations */}
      <div className="bg-orange-500 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-white rounded-lg w-20 h-20 flex items-center justify-center mr-6">
              <img 
                src="/lovable-uploads/98d0456f-d0db-42ee-9486-b6f874061b8b.png" 
                alt="Cornerstone Briques Logo" 
                className="w-16 h-16 object-contain"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Cornerstone Briques</h1>
              <p className="text-sm opacity-90">Fabrication et vente de briques de qualité</p>
              <p className="text-xs opacity-80">Akodessewa, après les rails, Lomé, Togo</p>
              <p className="text-xs opacity-80">Tél: +228 71014747 / +228 90 96 49 93</p>
              <p className="text-xs opacity-80">Email: cornerstonebrique@gmail.com</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold">{getDocumentTitle()}</h2>
            <p className="text-lg">N° {numero}</p>
            <p className="text-sm">Date: {new Date(date).toLocaleDateString('fr-FR')}</p>
            {statut && (
              <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-2 ${
                statut === 'paye' ? 'bg-green-500' :
                statut === 'envoye' ? 'bg-blue-500' :
                statut === 'annule' ? 'bg-red-500' :
                'bg-yellow-500'
              }`}>
                {statut.charAt(0).toUpperCase() + statut.slice(1)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Informations client et facture */}
      <div className="p-6 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-orange-600 mb-3">FACTURER À:</h3>
            <div className="space-y-1">
              <p className="font-bold text-lg">{clientNom}</p>
              {clientTelephone && <p className="text-gray-600">{clientTelephone}</p>}
              {clientAdresse && <p className="text-gray-600">{clientAdresse}</p>}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-orange-600 mb-3">DÉTAILS {getDocumentTitle()}:</h3>
            <div className="space-y-1">
              <p><strong>Date d'émission:</strong> {new Date(date).toLocaleDateString('fr-FR')}</p>
              {dateEcheance && (
                <p><strong>Date d'échéance:</strong> {new Date(dateEcheance).toLocaleDateString('fr-FR')}</p>
              )}
              <p><strong>Conditions:</strong> Paiement à réception</p>
              {modeLivraison && (
                <p><strong>Livraison:</strong> {
                  modeLivraison === 'retrait_usine' ? 'Retrait à l\'usine' :
                  modeLivraison === 'livraison_gratuite' ? 'Livraison gratuite' :
                  modeLivraison === 'livraison_payante' ? 'Livraison payante' :
                  modeLivraison
                }</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des produits */}
      <div className="p-6">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-orange-500 text-white">
              <th className="border border-gray-300 p-3 text-left">DÉSIGNATION</th>
              <th className="border border-gray-300 p-3 text-center w-20">QTÉ</th>
              <th className="border border-gray-300 p-3 text-right w-32">P.U. HT</th>
              <th className="border border-gray-300 p-3 text-right w-32">TOTAL HT</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-orange-50'}>
                <td className="border border-gray-300 p-3">{product.nom_produit}</td>
                <td className="border border-gray-300 p-3 text-center">{product.quantite}</td>
                <td className="border border-gray-300 p-3 text-right">{formatCurrency(product.prix_unitaire)}</td>
                <td className="border border-gray-300 p-3 text-right font-semibold">{formatCurrency(product.total_ligne)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totaux */}
      <div className="px-6 pb-6">
        <div className="flex justify-end">
          <div className="w-80 bg-orange-50 p-4 rounded border-2 border-orange-200">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Montant HT:</span>
                <span className="font-semibold">{formatCurrency(calculatedSousTotal)}</span>
              </div>
              
              {remise > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Remise:</span>
                  <span className="font-semibold">-{formatCurrency(remise)}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span>TVA (18%):</span>
                <span className="font-semibold">{formatCurrency(tva)}</span>
              </div>
              
              {frais > 0 && (
                <div className="flex justify-between">
                  <span>Frais de livraison:</span>
                  <span className="font-semibold">{formatCurrency(frais)}</span>
                </div>
              )}
              
              <hr className="border-orange-300" />
              <div className="flex justify-between text-xl font-bold text-orange-600">
                <span>TOTAL TTC:</span>
                <span>{formatCurrency(montantTotal || totalFinal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Adresse de livraison si différente */}
      {adresseLivraison && (
        <div className="px-6 pb-4">
          <h3 className="text-lg font-semibold text-orange-600 mb-2">ADRESSE DE LIVRAISON:</h3>
          <p className="text-gray-700">{adresseLivraison}</p>
        </div>
      )}

      {/* Commentaires */}
      {commentaires && (
        <div className="px-6 pb-4">
          <h3 className="text-lg font-semibold text-orange-600 mb-2">COMMENTAIRES:</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{commentaires}</p>
        </div>
      )}

      {/* Informations de paiement */}
      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <div className="text-sm font-bold text-orange-600 mb-2">INFORMATIONS DE PAIEMENT:</div>
            <div className="text-xs text-gray-600 space-y-1">
              <div>• Paiement par espèces, chèque ou virement bancaire</div>
              <div>• Mobile Money: +228 71014747</div>
              <div>• Délai de paiement: {dateEcheance ? new Date(dateEcheance).toLocaleDateString('fr-FR') : 'À réception'}</div>
              <div>• Toute facture impayée donnera lieu à des pénalités de retard</div>
            </div>
          </div>
          <div className="text-center ml-8">
            <div className="w-16 h-16 bg-gray-300 mx-auto mb-2 flex items-center justify-center text-xs border">
              QR CODE
            </div>
            <div className="text-xs text-gray-500">Code QR</div>
          </div>
        </div>
      </div>

      {/* Pied de page */}
      <div className="bg-orange-500 text-white p-4 text-center">
        <div className="text-sm">
          <p><strong>Cornerstone Briques</strong> - Fabrication et vente de briques de qualité</p>
          <p>Akodessewa, après les rails, non loin de la station d'essence CM, Lomé, Togo</p>
          <p>Tél: +228 71014747 / +228 90 96 49 93 / +228 99 87 01 95</p>
          <p>Email: cornerstonebrique@gmail.com - Site: www.cornerstonebrique.com</p>
          <p className="mt-2 text-xs opacity-90">Merci de votre confiance ! Cette facture est générée électroniquement.</p>
        </div>
      </div>
    </div>
  );
};
