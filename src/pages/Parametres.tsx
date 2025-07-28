
import { useState } from 'react';
import { Save, Settings, Database } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useAppSettings } from '@/hooks/useSupabaseDatabase';

export default function Parametres() {
  const { data: settings, create: createSetting, update: updateSetting } = useAppSettings();
  const [formData, setFormData] = useState({
    nom_entreprise: 'Briqueterie Moderne',
    adresse: '123 Rue des Artisans',
    telephone: '+221 77 123 45 67',
    email: 'contact@briqueterie.sn',
    devise: 'XOF',
    taux_tva: '18',
    stock_minimum_global: '50',
    notification_stock: true,
    sauvegarde_auto: true,
    theme_sombre: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Mise à jour ou création des paramètres
      const settingsToSave = Object.entries(formData).map(([key, value]) => ({
        cle: key,
        valeur: value,
        description: `Configuration ${key}`
      }));

      for (const setting of settingsToSave) {
        const existingSetting = settings.find(s => s.cle === setting.cle);
        if (existingSetting) {
          await updateSetting(existingSetting.id, setting);
        } else {
          await createSetting(setting);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleInputChange = (key: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Paramètres</h1>
        <Button onClick={handleSubmit}>
          <Save className="mr-2 h-4 w-4" />
          Sauvegarder
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Informations de l'entreprise
            </CardTitle>
            <CardDescription>
              Configurez les informations de base de votre entreprise
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nom_entreprise">Nom de l'entreprise</Label>
                <Input
                  id="nom_entreprise"
                  value={formData.nom_entreprise}
                  onChange={(e) => handleInputChange('nom_entreprise', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="telephone">Téléphone</Label>
                <Input
                  id="telephone"
                  value={formData.telephone}
                  onChange={(e) => handleInputChange('telephone', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="adresse">Adresse</Label>
              <Input
                id="adresse"
                value={formData.adresse}
                onChange={(e) => handleInputChange('adresse', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Paramètres financiers</CardTitle>
            <CardDescription>
              Configurez les paramètres liés à la facturation et aux finances
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="devise">Devise</Label>
                <Input
                  id="devise"
                  value={formData.devise}
                  onChange={(e) => handleInputChange('devise', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="taux_tva">Taux TVA (%)</Label>
                <Input
                  id="taux_tva"
                  type="number"
                  value={formData.taux_tva}
                  onChange={(e) => handleInputChange('taux_tva', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Paramètres de stock</CardTitle>
            <CardDescription>
              Configurez la gestion des stocks et des alertes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="stock_minimum_global">Stock minimum global</Label>
              <Input
                id="stock_minimum_global"
                type="number"
                value={formData.stock_minimum_global}
                onChange={(e) => handleInputChange('stock_minimum_global', e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notification_stock">Notifications de stock</Label>
                <p className="text-sm text-muted-foreground">
                  Recevoir des alertes quand le stock est faible
                </p>
              </div>
              <Switch
                id="notification_stock"
                checked={formData.notification_stock}
                onCheckedChange={(checked) => handleInputChange('notification_stock', checked)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Paramètres système
            </CardTitle>
            <CardDescription>
              Configurez les paramètres généraux du système
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sauvegarde_auto">Sauvegarde automatique</Label>
                <p className="text-sm text-muted-foreground">
                  Sauvegarder automatiquement les données
                </p>
              </div>
              <Switch
                id="sauvegarde_auto"
                checked={formData.sauvegarde_auto}
                onCheckedChange={(checked) => handleInputChange('sauvegarde_auto', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="theme_sombre">Thème sombre</Label>
                <p className="text-sm text-muted-foreground">
                  Activer le mode sombre de l'interface
                </p>
              </div>
              <Switch
                id="theme_sombre"
                checked={formData.theme_sombre}
                onCheckedChange={(checked) => handleInputChange('theme_sombre', checked)}
              />
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
