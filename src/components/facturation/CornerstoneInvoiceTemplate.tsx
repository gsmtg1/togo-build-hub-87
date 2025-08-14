
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface InvoiceProduct {
  id: string;
  nom_produit: string;
  quantite: number;
  prix_unitaire: number;
  total_ligne: number;
}

interface CornerstoneInvoiceTemplateProps {
  type: 'facture' | 'devis';
  numero: string;
  date: string;
  dateEcheance?: string;
  clientNom: string;
  clientTelephone?: string;
  clientAdresse?: string;
  products: InvoiceProduct[];
  montantTotal: number;
  statut: string;
  commentaires?: string;
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
  commentaires 
}: CornerstoneInvoiceTemplateProps) => {
  const tva = montantTotal * 0.18;
  const sousTotal = montantTotal - tva;

  return (
    <Card className="w-full max-w-4xl mx-auto bg-white shadow-lg print:shadow-none print:border-none">
      <CardContent className="p-8">
        {/* En-tête avec logo et informations entreprise */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-2xl">CB</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">CORNERSTONE</h1>
              <h2 className="text-xl font-semibold text-orange-600">BRIQUES</h2>
              <p className="text-sm text-gray-600 mt-1">Excellence en matériaux de construction</p>
            </div>
          </div>
          <div className="text-right">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {type === 'facture' ? 'FACTURE' : 'DEVIS'}
            </h3>
            <p className="text-lg font-semibold text-orange-600">{numero}</p>
            <p className="text-sm text-gray-600">Date: {new Date(date).toLocaleDateString('fr-FR')}</p>
            {dateEcheance && (
              <p className="text-sm text-gray-600">
                {type === 'facture' ? 'Échéance' : 'Valide jusqu\'au'}: {new Date(dateEcheance).toLocaleDateString('fr-FR')}
              </p>
            )}
            <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 ${
              statut === 'brouillon' ? 'bg-gray-100 text-gray-800' :
              statut === 'envoyee' || statut === 'envoye' ? 'bg-blue-100 text-blue-800' :
              statut === 'payee' || statut === 'accepte' ? 'bg-green-100 text-green-800' :
              statut === 'en_retard' || statut === 'expire' ? 'bg-red-100 text-red-800' :
              statut === 'refuse' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {statut.replace('_', ' ').toUpperCase()}
            </div>
          </div>
        </div>

        {/* Informations entreprise et client */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h4 className="font-semibold text-gray-800 mb-3 border-b border-orange-200 pb-1">
              DE : CORNERSTONE BRIQUES
            </h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>📍 Zone Industrielle de Kigali</p>
              <p>📞 +250 788 123 456</p>
              <p>✉️ info@cornerstonebriques.rw</p>
              <p>🌐 www.cornerstonebriques.rw</p>
              <p className="font-semibold">NIF: 123456789</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-3 border-b border-orange-200 pb-1">
              {type === 'facture' ? 'FACTURER À' : 'CLIENT'}
            </h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-semibold text-gray-800">{clientNom}</p>
              {clientTelephone && <p>📞 {clientTelephone}</p>}
              {clientAdresse && <p>📍 {clientAdresse}</p>}
            </div>
          </div>
        </div>

        {/* Tableau des produits */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-3 rounded-t-lg">
            <div className="grid grid-cols-12 gap-4 font-semibold">
              <div className="col-span-5">PRODUIT</div>
              <div className="col-span-2 text-center">QUANTITÉ</div>
              <div className="col-span-2 text-right">PRIX UNIT.</div>
              <div className="col-span-3 text-right">TOTAL</div>
            </div>
          </div>
          <div className="border border-gray-200 rounded-b-lg">
            {products.map((product, index) => (
              <div 
                key={product.id} 
                className={`grid grid-cols-12 gap-4 p-3 text-sm ${
                  index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                }`}
              >
                <div className="col-span-5">
                  <p className="font-medium text-gray-800">{product.nom_produit}</p>
                </div>
                <div className="col-span-2 text-center text-gray-600">
                  {product.quantite.toLocaleString()}
                </div>
                <div className="col-span-2 text-right text-gray-600">
                  {product.prix_unitaire.toLocaleString()} FCFA
                </div>
                <div className="col-span-3 text-right font-semibold text-gray-800">
                  {product.total_ligne.toLocaleString()} FCFA
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totaux */}
        <div className="flex justify-end mb-8">
          <div className="w-80">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Sous-total HT:</span>
                <span className="font-medium">{sousTotal.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">TVA (18%):</span>
                <span className="font-medium">{tva.toLocaleString()} FCFA</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold text-gray-800">
                <span>TOTAL TTC:</span>
                <span className="text-orange-600">{montantTotal.toLocaleString()} FCFA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Commentaires */}
        {commentaires && (
          <div className="mb-8">
            <h4 className="font-semibold text-gray-800 mb-2">Commentaires:</h4>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{commentaires}</p>
          </div>
        )}

        {/* Conditions et signature */}
        <div className="grid grid-cols-2 gap-8 mt-8">
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Conditions de paiement:</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <p>• Paiement à {type === 'facture' ? '30 jours' : 'la commande'}</p>
              <p>• Mobile Money: +250 788 123 456</p>
              <p>• Compte bancaire: BK 123456789</p>
              <p>• Chèque à l'ordre de "Cornerstone Briques"</p>
            </div>
          </div>
          <div className="text-right">
            <div className="border-t border-gray-300 pt-4 mt-8">
              <p className="text-sm font-semibold text-gray-800">Signature et cachet</p>
              <p className="text-xs text-gray-600 mt-2">Cornerstone Briques</p>
            </div>
          </div>
        </div>

        {/* Pied de page */}
        <div className="mt-8 pt-4 border-t border-gray-200 text-center">
          <div className="text-xs text-gray-500">
            <p className="font-semibold">CORNERSTONE BRIQUES - Excellence en matériaux de construction</p>
            <p>Zone Industrielle de Kigali | +250 788 123 456 | info@cornerstonebriques.rw</p>
            <p className="mt-1">Merci de votre confiance !</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
