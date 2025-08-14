import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Minus, ShoppingCart, Receipt, Trash2 } from 'lucide-react';
import { useProductsWithStock, useSales, useClients } from '@/hooks/useSupabaseDatabase';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

export const POSSystem = () => {
  const { products } = useProductsWithStock();
  const { create: createSale } = useSales();
  const { data: clients, create: createClient } = useClients();
  const { toast } = useToast();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [newClientName, setNewClientName] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState<any>(null);

  const addToCart = (product: any) => {
    if (product.stock_quantity <= 0) {
      toast({
        title: "Stock insuffisant",
        description: "Ce produit n'est plus en stock",
        variant: "destructive",
      });
      return;
    }

    const existingItem = cart.find(item => item.product_id === product.id);
    
    if (existingItem) {
      // Check if adding one more would exceed stock
      const currentCartQuantity = cart
        .filter(item => item.product_id === product.id)
        .reduce((sum, item) => sum + item.quantity, 0);
      
      if (currentCartQuantity >= product.stock_quantity) {
        toast({
          title: "Stock insuffisant",
          description: `Stock disponible: ${product.stock_quantity}`,
          variant: "destructive",
        });
        return;
      }
      
      updateQuantity(existingItem.id, existingItem.quantity + 1);
    } else {
      const newItem: CartItem = {
        id: crypto.randomUUID(),
        product_id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        total: product.price
      };
      setCart([...cart, newItem]);
    }
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    // Check stock availability
    const cartItem = cart.find(item => item.id === itemId);
    if (cartItem) {
      const product = products.find(p => p.id === cartItem.product_id);
      if (product && newQuantity > product.stock_quantity) {
        toast({
          title: "Stock insuffisant",
          description: `Stock disponible: ${product.stock_quantity}`,
          variant: "destructive",
        });
        return;
      }
    }

    setCart(cart.map(item => 
      item.id === itemId 
        ? { ...item, quantity: newQuantity, total: item.price * newQuantity }
        : item
    ));
  };

  const updateQuantityInput = (itemId: string, value: string) => {
    const newQuantity = parseInt(value) || 0;
    updateQuantity(itemId, newQuantity);
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedClient('');
    setNewClientName('');
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.total, 0);
  };

  const handleClientCreation = async () => {
    if (newClientName.trim()) {
      try {
        const result = await createClient({
          name: newClientName.trim(),
          phone: '',
          email: '',
          address: '',
          company: '',
          is_active: true,
          notes: 'Client créé depuis POS'
        });
        
        if (result && result !== null && typeof result === 'object' && 'id' in result) {
          const clientId = (result as any).id;
          if (clientId && typeof clientId === 'string') {
            setSelectedClient(clientId);
            setNewClientName('');
            toast({
              title: "Succès",
              description: "Nouveau client créé",
            });
          } else {
            throw new Error('ID client invalide');
          }
        } else {
          throw new Error('Échec de la création du client');
        }
      } catch (error) {
        console.error('Erreur création client:', error);
        toast({
          title: "Erreur",
          description: "Impossible de créer le client",
          variant: "destructive",
        });
      }
    }
  };

  const processSale = async () => {
    if (cart.length === 0) {
      toast({
        title: "Erreur",
        description: "Le panier est vide",
        variant: "destructive",
      });
      return;
    }

    let clientId = selectedClient;

    // Créer un nouveau client si nécessaire
    if (!clientId && newClientName.trim()) {
      try {
        const result = await createClient({
          name: newClientName.trim(),
          phone: '',
          email: '',
          address: '',
          company: '',
          is_active: true,
          notes: 'Client créé depuis POS'
        });
        
        if (result && result !== null && typeof result === 'object' && 'id' in result) {
          const newClientId = (result as any).id;
          if (newClientId && typeof newClientId === 'string') {
            clientId = newClientId;
          } else {
            throw new Error('ID client invalide');
          }
        } else {
          throw new Error('Échec de la création du client');
        }
      } catch (error) {
        console.error('Erreur création client:', error);
        toast({
          title: "Erreur",
          description: "Impossible de créer le client",
          variant: "destructive",
        });
        return;
      }
    }

    if (!clientId) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner ou créer un client",
        variant: "destructive",
      });
      return;
    }

    try {
      const saleData = {
        client_id: clientId,
        product_id: cart[0].product_id, // Pour compatibilité avec le schéma actuel
        quantity: cart.reduce((sum, item) => sum + item.quantity, 0),
        unit_price: calculateTotal() / cart.reduce((sum, item) => sum + item.quantity, 0),
        total_amount: calculateTotal(),
        payment_method: paymentMethod,
        status: 'completed' as const,
        sale_date: new Date().toISOString(),
        notes: `Vente POS - ${cart.length} articles: ${cart.map(item => `${item.name} (${item.quantity})`).join(', ')}`
      };

      const result = await createSale(saleData);
      
      if (result && result !== null && typeof result === 'object' && 'id' in result) {
        const saleId = (result as any).id;
        if (saleId && typeof saleId === 'string') {
          const clientData = clients.find(c => c.id === clientId);
          
          setLastSale({ 
            id: saleId,
            sale_date: (result as any).sale_date || new Date().toISOString(),
            items: cart, 
            client: clientData,
            total_amount: calculateTotal(),
            payment_method: paymentMethod
          });
          setShowReceipt(true);
          clearCart();

          toast({
            title: "Succès",
            description: "Vente effectuée avec succès",
          });
        } else {
          throw new Error('ID vente invalide');
        }
      } else {
        throw new Error('Échec de la création de la vente');
      }
    } catch (error) {
      console.error('Erreur lors de la vente:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la vente",
        variant: "destructive",
      });
    }
  };

  const printReceipt = () => {
    window.print();
  };

  if (showReceipt && lastSale) {
    return (
      <div className="max-w-md mx-auto bg-white p-6 print:p-4">
        <div className="text-center mb-4">
          <h2 className="text-lg font-bold">REÇU DE VENTE</h2>
          <p className="text-sm text-gray-600">#{lastSale.id?.toString().slice(0, 8) || 'N/A'}</p>
          <p className="text-sm">{new Date(lastSale.sale_date).toLocaleString('fr-FR')}</p>
        </div>

        <Separator className="my-4" />

        <div className="mb-4">
          <p className="font-semibold">Client:</p>
          <p>{lastSale.client?.name || 'Client par défaut'}</p>
          {lastSale.client?.phone && <p>{lastSale.client.phone}</p>}
        </div>

        <Separator className="my-4" />

        <div className="mb-4">
          {lastSale.items.map((item: CartItem) => (
            <div key={item.id} className="flex justify-between py-1">
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-600">{item.quantity} × {item.price.toLocaleString()} FCFA</p>
              </div>
              <p className="font-medium">{item.total.toLocaleString()} FCFA</p>
            </div>
          ))}
        </div>

        <Separator className="my-4" />

        <div className="mb-4">
          <div className="flex justify-between font-bold text-lg">
            <span>TOTAL:</span>
            <span>{lastSale.total_amount.toLocaleString()} FCFA</span>
          </div>
          <p className="text-sm text-gray-600">Mode de paiement: {
            lastSale.payment_method === 'cash' ? 'Espèces' : 
            lastSale.payment_method === 'card' ? 'Carte' : 
            lastSale.payment_method === 'transfer' ? 'Virement' : lastSale.payment_method
          }</p>
        </div>

        <div className="flex gap-2 mt-6 print:hidden">
          <Button onClick={printReceipt} className="flex-1">
            <Receipt className="h-4 w-4 mr-2" />
            Imprimer
          </Button>
          <Button onClick={() => setShowReceipt(false)} variant="outline" className="flex-1">
            Nouvelle vente
          </Button>
        </div>

        <div className="text-center mt-4 text-xs text-gray-500">
          <p>Merci pour votre achat!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-screen p-4">
      {/* Liste des produits */}
      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Produits disponibles</CardTitle>
          </CardHeader>
          <CardContent className="overflow-y-auto max-h-[70vh]">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {products.map((product) => (
                <Card 
                  key={product.id} 
                  className={`cursor-pointer hover:shadow-md transition-shadow ${
                    product.stock_quantity <= 0 ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''
                  }`}
                  onClick={() => product.stock_quantity > 0 && addToCart(product)}
                >
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sm mb-2">{product.name}</h3>
                    <p className="text-xs text-gray-600 mb-2">{product.dimensions}</p>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-green-600">{product.price.toLocaleString()} FCFA</span>
                      <Badge variant={product.stock_quantity > 0 ? 'default' : 'destructive'}>
                        Stock: {product.stock_quantity}
                      </Badge>
                    </div>
                    {product.stock_quantity <= 0 && (
                      <p className="text-xs text-red-500 mt-1">Rupture de stock</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Panier et checkout */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Panier ({cart.length})
              </CardTitle>
              {cart.length > 0 && (
                <Button onClick={clearCart} variant="outline" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[40vh] overflow-y-auto">
            {cart.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Panier vide</p>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-gray-600">{item.price.toLocaleString()} FCFA</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateQuantityInput(item.id, e.target.value)}
                      className="w-16 text-center"
                      min="1"
                    />
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="w-20 text-right">
                    <p className="font-bold text-sm">{item.total.toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {cart.length > 0 && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label htmlFor="client">Client</Label>
                <select
                  id="client"
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full p-2 border rounded mb-2"
                >
                  <option value="">Sélectionner un client existant</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
                
                <div className="flex gap-2">
                  <Input
                    placeholder="Ou créer un nouveau client..."
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleClientCreation} 
                    variant="outline" 
                    size="sm"
                    disabled={!newClientName.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="payment">Mode de paiement</Label>
                <select
                  id="payment"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'card' | 'transfer')}
                  className="w-full p-2 border rounded"
                >
                  <option value="cash">Espèces</option>
                  <option value="card">Carte</option>
                  <option value="transfer">Virement</option>
                </select>
              </div>

              <Separator />

              <div className="text-center">
                <p className="text-2xl font-bold">
                  Total: {calculateTotal().toLocaleString()} FCFA
                </p>
              </div>

              <Button 
                onClick={processSale} 
                className="w-full"
                disabled={cart.length === 0 || (!selectedClient && !newClientName.trim())}
              >
                Finaliser la vente
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
