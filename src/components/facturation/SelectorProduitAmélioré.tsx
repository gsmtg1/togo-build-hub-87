
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus } from 'lucide-react';
import { useProductsWithStock } from '@/hooks/useSupabaseDatabase';
import { useTypesBriques } from '@/hooks/useProductionDatabase';

interface ProduitFacture {
  id: string;
  nom: string;
  quantite: number;
  prix_unitaire: number;
  total_ligne: number;
  type_produit?: 'produit' | 'brique';
}

interface SelectorProduitAmélioréProps {
  produits: ProduitFacture[];
  onProduitsChange: (produits: ProduitFacture[]) => void;
}

export const SelectorProduitAmélioré = ({ produits, onProduitsChange }: SelectorProduitAmélioréProps) => {
  const { products: produitsStock } = useProductsWithStock();
  const { data: typesBriques } = useTypesBriques();
  const [nouveauProduit, setNouveauProduit] = useState({
    id: '',
    nom: '',
    quantite: 1,
    prix_unitaire: 0,
    type_produit: 'produit' as 'produit' | 'brique'
  });

  const ajouterProduit = () => {
    if (!nouveauProduit.id && !nouveauProduit.nom) return;

    let nom = nouveauProduit.nom;
    let prix = nouveauProduit.prix_unitaire;

    if (nouveauProduit.id) {
      if (nouveauProduit.type_produit === 'produit') {
        const produit = produitsStock.find(p => p.id === nouveauProduit.id);
        if (produit) {
          nom = produit.name;
          prix = produit.price || 0;
        }
      } else {
        const brique = typesBriques.find(b => b.id === nouveauProduit.id);
        if (brique) {
          nom = `${brique.nom} (${brique.longueur_cm}x${brique.largeur_cm}x${brique.hauteur_cm}cm)`;
          prix = nouveauProduit.prix_unitaire; // Prix à définir manuellement pour les briques
        }
      }
    }

    const produit: ProduitFacture = {
      id: nouveauProduit.id || `custom-${Date.now()}`,
      nom,
      quantite: nouveauProduit.quantite,
      prix_unitaire: prix,
      total_ligne: nouveauProduit.quantite * prix,
      type_produit: nouveauProduit.type_produit
    };

    onProduitsChange([...produits, produit]);
    
    // Reset du formulaire
    setNouveauProduit({
      id: '',
      nom: '',
      quantite: 1,
      prix_unitaire: 0,
      type_produit: 'produit'
    });
  };

  const supprimerProduit = (index: number) => {
    const nouveauxProduits = produits.filter((_, i) => i !== index);
    onProduitsChange(nouveauxProduits);
  };

  const mettreAJourQuantite = (index: number, quantite: number) => {
    const nouveauxProduits = [...produits];
    nouveauxProduits[index].quantite = quantite;
    nouveauxProduits[index].total_ligne = quantite * nouveauxProduits[index].prix_unitaire;
    onProduitsChange(nouveauxProduits);
  };

  const mettreAJourPrix = (index: number, prix: number) => {
    const nouveauxProduits = [...produits];
    nouveauxProduits[index].prix_unitaire = prix;
    nouveauxProduits[index].total_ligne = nouveauxProduits[index].quantite * prix;
    onProduitsChange(nouveauxProduits);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Produits de la facture</h3>
      
      {/* Formulaire d'ajout */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
        <div>
          <Label>Type</Label>
          <Select 
            value={nouveauProduit.type_produit} 
            onValueChange={(value: 'produit' | 'brique') => 
              setNouveauProduit(prev => ({ ...prev, type_produit: value, id: '', nom: '', prix_unitaire: 0 }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="produit">Produit stock</SelectItem>
              <SelectItem value="brique">Type brique</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Produit</Label>
          {nouveauProduit.type_produit === 'produit' ? (
            <Select 
              value={nouveauProduit.id} 
              onValueChange={(value) => setNouveauProduit(prev => ({ ...prev, id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir un produit" />
              </SelectTrigger>
              <SelectContent>
                {produitsStock.map((produit) => (
                  <SelectItem key={produit.id} value={produit.id}>
                    {produit.name} - {formatCurrency(produit.price || 0)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Select 
              value={nouveauProduit.id} 
              onValueChange={(value) => setNouveauProduit(prev => ({ ...prev, id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir une brique" />
              </SelectTrigger>
              <SelectContent>
                {typesBriques.map((brique) => (
                  <SelectItem key={brique.id} value={brique.id}>
                    {brique.nom} ({brique.longueur_cm}x{brique.largeur_cm}x{brique.hauteur_cm}cm)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div>
          <Label>Quantité</Label>
          <Input
            type="number"
            value={nouveauProduit.quantite}
            onChange={(e) => setNouveauProduit(prev => ({ ...prev, quantite: parseInt(e.target.value) || 1 }))}
            min="1"
          />
        </div>

        {nouveauProduit.type_produit === 'brique' && (
          <div>
            <Label>Prix unitaire</Label>
            <Input
              type="number"
              value={nouveauProduit.prix_unitaire}
              onChange={(e) => setNouveauProduit(prev => ({ ...prev, prix_unitaire: parseFloat(e.target.value) || 0 }))}
              placeholder="Prix par brique"
            />
          </div>
        )}

        <div className="flex items-end">
          <Button onClick={ajouterProduit} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Ajouter
          </Button>
        </div>
      </div>

      {/* Liste des produits */}
      {produits.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Produits ajoutés:</h4>
          {produits.map((produit, index) => (
            <div key={index} className="grid grid-cols-6 gap-4 items-center p-3 bg-white border rounded">
              <div className="col-span-2">
                <p className="font-medium">{produit.nom}</p>
                <span className="text-xs text-gray-500">
                  {produit.type_produit === 'brique' ? 'Brique' : 'Produit'}
                </span>
              </div>
              
              <div>
                <Label className="text-xs">Quantité</Label>
                <Input
                  type="number"
                  value={produit.quantite}
                  onChange={(e) => mettreAJourQuantite(index, parseInt(e.target.value) || 1)}
                  min="1"
                  className="h-8"
                />
              </div>
              
              <div>
                <Label className="text-xs">Prix unitaire</Label>
                <Input
                  type="number"
                  value={produit.prix_unitaire}
                  onChange={(e) => mettreAJourPrix(index, parseFloat(e.target.value) || 0)}
                  className="h-8"
                />
              </div>
              
              <div>
                <Label className="text-xs">Total</Label>
                <p className="text-sm font-medium">{formatCurrency(produit.total_ligne)}</p>
              </div>
              
              <div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => supprimerProduit(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          
          <div className="text-right pt-4 border-t">
            <p className="text-lg font-bold">
              Total: {formatCurrency(produits.reduce((sum, p) => sum + p.total_ligne, 0))}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
