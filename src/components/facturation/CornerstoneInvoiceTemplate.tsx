
import React from 'react';

interface Product {
  nom_produit: string;
  quantite: number;
  prix_unitaire: number;
  total_ligne: number;
  prix_original?: number;
  remise_pourcentage?: number;
  remise_montant?: number;
}

interface CornerstoneInvoiceTemplateProps {
  type: 'facture' | 'devis';
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
  const totalRemise = remiseGlobale || 0;
  const frais = fraisLivraison || 0;
  const totalFinal = calculatedSousTotal - totalRemise + frais;

  return (
    <div className="w-full max-w-4xl mx-auto bg-white border-2 border-orange-500 print:border-none print:shadow-none">
      {/* En-tête */}
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
              <p className="text-xs opacity-80">Tél: +228 71014747 / +228 90 96 49 93 / +228 99 87 01 95</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold">{type.toUpperCase()}</h2>
            <p className="text-lg">N° {numero}</p>
            <p className="text-sm">Date: {new Date(date).toLocaleDateString('fr-FR')}</p>
          </div>
        </div>
      </div>

      {/* Informations client */}
      <div className="p-6 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-orange-600 mb-3">FACTURER À:</h3>
            <div className="space-y-1">
              <p className="font-semibold">{clientNom}</p>
              {clientTelephone && <p>{clientTelephone}</p>}
              {clientAdresse && <p>{clientAdresse}</p>}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-orange-600 mb-3">DÉTAILS:</h3>
            <div className="space-y-1">
              <p><strong>Date d'émission:</strong> {new Date(date).toLocaleDateString('fr-FR')}</p>
              {dateEcheance && (
                <p><strong>Date d'échéance:</strong> {new Date(dateEcheance).toLocaleDateString('fr-FR')}</p>
              )}
              {statut && <p><strong>Statut:</strong> {statut}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Mode de livraison */}
      {modeLivraison && (
        <div className="px-6 py-4 bg-orange-50">
          <h3 className="text-lg font-semibold text-orange-600 mb-2">MODE DE LIVRAISON:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Type:</strong> {
                modeLivraison === 'retrait_usine' ? 'Retrait à l\'usine' :
                modeLivraison === 'livraison_gratuite' ? 'Livraison gratuite' :
                modeLivraison === 'livraison_payante' ? 'Livraison payante' :
                modeLivraison
              }</p>
              {frais > 0 && <p><strong>Frais de livraison:</strong> {formatCurrency(frais)}</p>}
            </div>
            {adresseLivraison && (
              <div>
                <p><strong>Adresse de livraison:</strong></p>
                <p>{adresseLivraison}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tableau des produits */}
      <div className="p-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-orange-500 text-white">
              <th className="border border-orange-500 p-3 text-left">DÉSIGNATION</th>
              <th className="border border-orange-500 p-3 text-center w-20">QTÉ</th>
              <th className="border border-orange-500 p-3 text-right w-32">P.U.</th>
              <th className="border border-orange-500 p-3 text-right w-32">TOTAL</th>
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
          <div className="w-80 bg-orange-50 p-4 rounded">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Sous-total:</span>
                <span className="font-semibold">{formatCurrency(calculatedSousTotal)}</span>
              </div>
              
              {totalRemise > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Remise:</span>
                  <span>-{formatCurrency(totalRemise)}</span>
                </div>
              )}
              
              {frais > 0 && (
                <div className="flex justify-between">
                  <span>Frais de livraison:</span>
                  <span>{formatCurrency(frais)}</span>
                </div>
              )}
              
              <hr className="border-orange-300" />
              <div className="flex justify-between text-xl font-bold text-orange-600">
                <span>TOTAL:</span>
                <span>{formatCurrency(montantTotal || totalFinal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Commentaires */}
      {commentaires && (
        <div className="px-6 pb-4">
          <h3 className="text-lg font-semibold text-orange-600 mb-2">COMMENTAIRES:</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{commentaires}</p>
        </div>
      )}

      {/* Pied de page */}
      <div className="bg-orange-500 text-white p-4 text-center">
        <div className="text-sm">
          <p><strong>Cornerstone Briques</strong> - Fabrication et vente de briques de qualité</p>
          <p>Akodessewa, après les rails, non loin de la station d'essence CM, Lomé, Togo</p>
          <p>Tél: +228 71014747 / +228 90 96 49 93 / +228 99 87 01 95</p>
          <p>Email: contact@cornerstonebrique.com - Site: www.cornerstonebrique.com</p>
          <p className="mt-2 text-xs opacity-90">Merci de votre confiance !</p>
        </div>
      </div>
    </div>
  );
};
