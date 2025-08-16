
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, User, Phone, MapPin, Mail } from 'lucide-react';
import { useClientsManager } from '@/hooks/useClientsManager';

interface ClientSelectorProps {
  selectedClientId?: string;
  selectedClientName?: string;
  onClientSelect: (client: { id?: string; nom: string; telephone?: string; adresse?: string }) => void;
}

export const ClientSelector = ({ selectedClientId, selectedClientName, onClientSelect }: ClientSelectorProps) => {
  const { clients, loading, createClient } = useClientsManager();
  const [showNewClientDialog, setShowNewClientDialog] = useState(false);
  const [newClientData, setNewClientData] = useState({
    nom_complet: '',
    telephone: '',
    adresse: '',
    email: '',
    notes: ''
  });

  const handleExistingClientSelect = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      onClientSelect({
        id: client.id,
        nom: client.nom_complet,
        telephone: client.telephone,
        adresse: client.adresse
      });
    }
  };

  const handleNewClientSubmit = async () => {
    try {
      const newClient = await createClient(newClientData);
      onClientSelect({
        id: newClient.id,
        nom: newClient.nom_complet,
        telephone: newClient.telephone,
        adresse: newClient.adresse
      });
      setNewClientData({ nom_complet: '', telephone: '', adresse: '', email: '', notes: '' });
      setShowNewClientDialog(false);
    } catch (error) {
      console.error('Erreur création client:', error);
    }
  };

  const handleManualClientInput = (nom: string) => {
    onClientSelect({ nom });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sélection client existant */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-700">Client existant</Label>
          <Select value={selectedClientId || ''} onValueChange={handleExistingClientSelect}>
            <SelectTrigger className="w-full border-2 border-orange-100 focus:border-orange-400 transition-colors">
              <SelectValue placeholder="Choisir un client existant..." />
            </SelectTrigger>
            <SelectContent className="max-h-60 bg-white border-orange-200 z-50">
              {loading ? (
                <SelectItem value="loading" disabled>
                  Chargement des clients...
                </SelectItem>
              ) : clients.length === 0 ? (
                <SelectItem value="empty" disabled>
                  Aucun client trouvé
                </SelectItem>
              ) : (
                clients.map((client) => (
                  <SelectItem key={client.id} value={client.id} className="hover:bg-orange-50">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-orange-500" />
                      <div>
                        <div className="font-medium">{client.nom_complet}</div>
                        {client.telephone && (
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {client.telephone}
                          </div>
                        )}
                      </div>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Client ponctuel */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-700">Ou saisir un nom</Label>
          <Input
            placeholder="Nom du client ponctuel..."
            value={selectedClientName || ''}
            onChange={(e) => handleManualClientInput(e.target.value)}
            className="border-2 border-orange-100 focus:border-orange-400 transition-colors"
          />
        </div>
      </div>

      {/* Bouton nouveau client */}
      <div className="flex justify-center">
        <Dialog open={showNewClientDialog} onOpenChange={setShowNewClientDialog}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              className="border-2 border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Créer un nouveau client
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-orange-600 flex items-center gap-2">
                <User className="h-5 w-5" />
                Nouveau Client
              </DialogTitle>
            </DialogHeader>
            
            <Card className="border-orange-100">
              <CardContent className="p-4 space-y-4">
                <div>
                  <Label htmlFor="nom_complet" className="text-sm font-medium">Nom complet *</Label>
                  <Input
                    id="nom_complet"
                    value={newClientData.nom_complet}
                    onChange={(e) => setNewClientData(prev => ({ ...prev, nom_complet: e.target.value }))}
                    className="border-orange-100 focus:border-orange-400"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="telephone" className="text-sm font-medium">Téléphone</Label>
                  <Input
                    id="telephone"
                    value={newClientData.telephone}
                    onChange={(e) => setNewClientData(prev => ({ ...prev, telephone: e.target.value }))}
                    className="border-orange-100 focus:border-orange-400"
                    placeholder="+228 XX XX XX XX"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newClientData.email}
                    onChange={(e) => setNewClientData(prev => ({ ...prev, email: e.target.value }))}
                    className="border-orange-100 focus:border-orange-400"
                    placeholder="client@example.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor="adresse" className="text-sm font-medium">Adresse</Label>
                  <Textarea
                    id="adresse"
                    value={newClientData.adresse}
                    onChange={(e) => setNewClientData(prev => ({ ...prev, adresse: e.target.value }))}
                    className="border-orange-100 focus:border-orange-400"
                    rows={2}
                  />
                </div>
                
                <div>
                  <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
                  <Textarea
                    id="notes"
                    value={newClientData.notes}
                    onChange={(e) => setNewClientData(prev => ({ ...prev, notes: e.target.value }))}
                    className="border-orange-100 focus:border-orange-400"
                    rows={2}
                    placeholder="Informations supplémentaires..."
                  />
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button 
                    onClick={() => setShowNewClientDialog(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                  <Button 
                    onClick={handleNewClientSubmit}
                    disabled={!newClientData.nom_complet.trim() || loading}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
                  >
                    {loading ? 'Création...' : 'Créer Client'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </DialogContent>
        </Dialog>
      </div>

      {/* Affichage client sélectionné */}
      {(selectedClientId || selectedClientName) && (
        <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-orange-500" />
              <span className="font-medium text-gray-700">Client sélectionné :</span>
              <span className="text-orange-600 font-semibold">
                {selectedClientName || clients.find(c => c.id === selectedClientId)?.nom_complet}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
