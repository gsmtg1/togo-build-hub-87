
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
  clientTelephone?: string;
  clientAdresse?: string;
  onClientSelect: (client: { id?: string; nom_complet: string; telephone?: string; adresse?: string }) => void;
  onManualClientChange?: (nom: string, telephone: string, adresse: string) => void;
}

export const ClientSelector = ({ 
  selectedClientId, 
  selectedClientName, 
  clientTelephone = '',
  clientAdresse = '',
  onClientSelect,
  onManualClientChange 
}: ClientSelectorProps) => {
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
        nom_complet: client.nom_complet,
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
        nom_complet: newClient.nom_complet,
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
    onClientSelect({ nom_complet: nom });
    if (onManualClientChange) {
      onManualClientChange(nom, clientTelephone, clientAdresse);
    }
  };

  const handleTelephoneChange = (telephone: string) => {
    if (onManualClientChange && selectedClientName) {
      onManualClientChange(selectedClientName, telephone, clientAdresse);
    }
  };

  const handleAdresseChange = (adresse: string) => {
    if (onManualClientChange && selectedClientName) {
      onManualClientChange(selectedClientName, clientTelephone, adresse);
    }
  };

  return (
    <Card className="border-primary/20">
      <CardContent className="pt-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Sélection client existant */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-primary flex items-center gap-2">
              <User className="h-4 w-4" />
              Client existant
            </Label>
            <Select value={selectedClientId || ''} onValueChange={handleExistingClientSelect}>
              <SelectTrigger className="border-primary/30 focus:border-primary">
                <SelectValue placeholder="Choisir un client existant..." />
              </SelectTrigger>
              <SelectContent className="max-h-60">
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
                    <SelectItem key={client.id} value={client.id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        <div>
                          <div className="font-medium">{client.nom_complet}</div>
                          {client.telephone && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
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
            <Label className="text-sm font-semibold text-primary">Ou saisir un nom</Label>
            <Input
              placeholder="Nom du client ponctuel..."
              value={selectedClientName || ''}
              onChange={(e) => handleManualClientInput(e.target.value)}
              className="border-primary/30 focus:border-primary"
            />
          </div>
        </div>

        {/* Informations complémentaires pour client ponctuel */}
        {selectedClientName && !selectedClientId && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div>
              <Label htmlFor="client_telephone" className="text-sm font-medium flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Téléphone
              </Label>
              <Input
                id="client_telephone"
                value={clientTelephone}
                onChange={(e) => handleTelephoneChange(e.target.value)}
                placeholder="+228 XX XX XX XX"
                className="border-primary/30 focus:border-primary"
              />
            </div>
            <div>
              <Label htmlFor="client_adresse" className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Adresse
              </Label>
              <Input
                id="client_adresse"
                value={clientAdresse}
                onChange={(e) => handleAdresseChange(e.target.value)}
                placeholder="Adresse du client"
                className="border-primary/30 focus:border-primary"
              />
            </div>
          </div>
        )}

        {/* Bouton nouveau client */}
        <div className="flex justify-center">
          <Dialog open={showNewClientDialog} onOpenChange={setShowNewClientDialog}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="border-primary/30 text-primary hover:bg-primary/10"
              >
                <Plus className="h-4 w-4 mr-2" />
                Créer un nouveau client
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-primary flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Nouveau Client
                </DialogTitle>
              </DialogHeader>
              
              <Card className="border-primary/20">
                <CardContent className="p-4 space-y-4">
                  <div>
                    <Label htmlFor="nom_complet" className="text-sm font-medium">Nom complet *</Label>
                    <Input
                      id="nom_complet"
                      value={newClientData.nom_complet}
                      onChange={(e) => setNewClientData(prev => ({ ...prev, nom_complet: e.target.value }))}
                      className="border-primary/30 focus:border-primary"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="telephone" className="text-sm font-medium">Téléphone</Label>
                    <Input
                      id="telephone"
                      value={newClientData.telephone}
                      onChange={(e) => setNewClientData(prev => ({ ...prev, telephone: e.target.value }))}
                      className="border-primary/30 focus:border-primary"
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
                      className="border-primary/30 focus:border-primary"
                      placeholder="client@example.com"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="adresse" className="text-sm font-medium">Adresse</Label>
                    <Textarea
                      id="adresse"
                      value={newClientData.adresse}
                      onChange={(e) => setNewClientData(prev => ({ ...prev, adresse: e.target.value }))}
                      className="border-primary/30 focus:border-primary"
                      rows={2}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
                    <Textarea
                      id="notes"
                      value={newClientData.notes}
                      onChange={(e) => setNewClientData(prev => ({ ...prev, notes: e.target.value }))}
                      className="border-primary/30 focus:border-primary"
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
                      className="flex-1 bg-primary hover:bg-primary/90"
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
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-primary" />
                <span className="font-medium text-muted-foreground">Client sélectionné :</span>
                <span className="text-primary font-semibold">
                  {selectedClientName || clients.find(c => c.id === selectedClientId)?.nom_complet}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};
