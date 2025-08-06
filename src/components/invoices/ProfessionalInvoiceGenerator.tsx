import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ProductSelector } from './ProductSelector';
import { ProfessionalInvoiceView } from './ProfessionalInvoiceView';
import { useProductsWithStock } from '@/hooks/useSupabaseDatabase';
import type { Sale } from '@/types/database';

interface InvoiceProduct {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isCustom?: boolean;
}

interface ProfessionalInvoiceGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (saleData: Partial<Sale>) => Promise<void>;
  editingSale?: Sale | null;
}

export const ProfessionalInvoiceGenerator = ({ 
  open, 
  onOpenChange, 
  onSubmit, 
  editingSale 
}: ProfessionalInvoiceGeneratorProps) => {
  const { products: availableProducts } = useProductsWithStock();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);

  const [formData, setFormData] = useState({
    client_nom: '',
    client_telephone: '',
    client_adresse: '',
    commentaires: ''
  });

  const [products, setProducts] = useState<InvoiceProduct[]>([]);

  useEffect(() => {
    if (editingSale) {
      setFormData({
        client_nom: editingSale.client_nom || '',
        client_telephone: editingSale.client_telephone || '',
        client_adresse: editingSale.client_adresse || '',
        commentaires: editingSale.commentaires || ''
      });
      // Load existing products if any
      const existingProducts: InvoiceProduct[] = [];
      setProducts(existingProducts);
    } else {
      setFormData({
        client_nom: '',
        client_telephone: '',
        client_adresse: '',
        commentaires: ''
      });
      setProducts([]);
    }
  }, [editingSale]);

  const handleSubmit = async () => {
    const totalAmount = products.reduce((sum, product) => sum + product.totalPrice, 0);
    
    const saleData: Partial<Sale> = {
      client_nom: formData.client_nom,
      client_telephone: formData.client_telephone || undefined,
      client_adresse: formData.client_adresse || undefined,
      date_vente: new Date().toISOString(),
      statut: 'en_attente',
      montant_total: totalAmount,
      commentaires: formData.commentaires || undefined
    };

    await onSubmit(saleData);
    onOpenChange(false);
    setCurrentStep(1);
    setShowPreview(false);
  };

  const addProductFromPredefined = (productId: string) => {
    const predefined = availableProducts.find(p => p.id === productId);
    if (predefined) {
      const newProduct: InvoiceProduct = {
        id: crypto.randomUUID(),
        name: `${predefined.name} (${predefined.dimensions})`,
        quantity: 1,
        unitPrice: predefined.price,
        totalPrice: predefined.price,
        isCustom: false,
      };
      setProducts([...products, newProduct]);
    }
  };

  if (showPreview) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Aperçu de la facture</DialogTitle>
          </DialogHeader>
          <ProfessionalInvoiceView 
            sale={{
              id: '',
              numero_vente: `VT-${Date.now()}`,
              client_nom: formData.client_nom,
              client_telephone: formData.client_telephone,
              client_adresse: formData.client_adresse,
              date_vente: new Date().toISOString(),
              statut: 'en_attente',
              montant_total: products.reduce((sum, p) => sum + p.totalPrice, 0),
              commentaires: formData.commentaires,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }}
            products={products}
            onBack={() => setShowPreview(false)}
            onConfirm={handleSubmit}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingSale ? 'Modifier la vente' : 'Nouvelle vente / facture'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>1. Informations client</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="client_nom">Nom du client</Label>
                  <Input
                    id="client_nom"
                    value={formData.client_nom}
                    onChange={(e) => setFormData({ ...formData, client_nom: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="client_telephone">Téléphone</Label>
                  <Input
                    id="client_telephone"
                    value={formData.client_telephone}
                    onChange={(e) => setFormData({ ...formData, client_telephone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="client_adresse">Adresse</Label>
                  <Textarea
                    id="client_adresse"
                    value={formData.client_adresse}
                    onChange={(e) => setFormData({ ...formData, client_adresse: e.target.value })}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="commentaires">Commentaires</Label>
                  <Textarea
                    id="commentaires"
                    value={formData.commentaires}
                    onChange={(e) => setFormData({ ...formData, commentaires: e.target.value })}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>2. Produits</CardTitle>
              </CardHeader>
              <CardContent>
                <ProductSelector
                  products={products}
                  onProductsChange={setProducts}
                />
              </CardContent>
            </Card>
          )}

          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>3. Résumé</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Nom du client</Label>
                  <p className="font-bold">{formData.client_nom}</p>
                </div>
                <div>
                  <Label>Téléphone</Label>
                  <p className="font-bold">{formData.client_telephone || 'Non spécifié'}</p>
                </div>
                <div>
                  <Label>Adresse</Label>
                  <p className="font-bold">{formData.client_adresse || 'Non spécifiée'}</p>
                </div>
                <Separator />
                <div>
                  <Label>Produits</Label>
                  <ul className="list-none space-y-2">
                    {products.map((product) => (
                      <li key={product.id} className="flex justify-between">
                        <span>{product.name} x {product.quantity}</span>
                        <span>{product.totalPrice.toLocaleString()} FCFA</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Separator />
                <div className="text-xl font-bold text-right">
                  Total: {products.reduce((sum, product) => sum + product.totalPrice, 0).toLocaleString()} FCFA
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between">
            <div>
              {currentStep > 1 && (
                <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
                  Précédent
                </Button>
              )}
            </div>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              {currentStep < 3 && (
                <Button onClick={() => setCurrentStep(currentStep + 1)}>
                  Suivant
                </Button>
              )}
              {currentStep === 3 && (
                <>
                  <Button variant="outline" onClick={() => setShowPreview(true)}>
                    Aperçu
                  </Button>
                  <Button onClick={handleSubmit}>
                    {editingSale ? 'Modifier' : 'Créer la vente'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
