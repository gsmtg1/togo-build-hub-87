
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useAppSettings } from '@/hooks/useSupabaseDatabase';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const Parametres = () => {
  const { data, loading, getSetting, updateSetting, reload } = useAppSettings();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const defaultSettings = {
    app_name: 'Cornerstone Briques',
    theme: 'light',
    notifications_enabled: 'true',
    default_language: 'fr',
    default_tax_rate: '18.00',
    company_address: '',
    company_phone: '',
    company_email: '',
  };

  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    if (!loading && data.length >= 0) {
      const loadedSettings = {
        app_name: getSetting('app_name')?.valeur || defaultSettings.app_name,
        theme: getSetting('theme')?.valeur || defaultSettings.theme,
        notifications_enabled: getSetting('notifications_enabled')?.valeur || defaultSettings.notifications_enabled,
        default_language: getSetting('default_language')?.valeur || defaultSettings.default_language,
        default_tax_rate: getSetting('default_tax_rate')?.valeur || defaultSettings.default_tax_rate,
        company_address: getSetting('company_address')?.valeur || defaultSettings.company_address,
        company_phone: getSetting('company_phone')?.valeur || defaultSettings.company_phone,
        company_email: getSetting('company_email')?.valeur || defaultSettings.company_email,
      };
      
      setSettings(loadedSettings);
    }
  }, [data, loading]);

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleBooleanChange = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value.toString() }));
  };

  const getSettingDescription = (key: string) => {
    const descriptions: { [key: string]: string } = {
      app_name: 'Nom de l\'application affiché dans l\'en-tête',
      theme: 'Thème par défaut de l\'application (light ou dark)',
      notifications_enabled: 'Activer ou désactiver les notifications',
      default_language: 'Langue par défaut de l\'application',
      default_tax_rate: 'Taux de TVA par défaut (%)',
      company_address: 'Adresse de l\'entreprise',
      company_phone: 'Téléphone de l\'entreprise',
      company_email: 'Email de l\'entreprise',
    };
    return descriptions[key] || 'Paramètre de l\'application';
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Sauvegarder chaque paramètre
      for (const [key, value] of Object.entries(settings)) {
        await updateSetting(key, value, getSettingDescription(key));
      }
      
      // Recharger les données pour s'assurer de la synchronisation
      await reload();
      
      toast({
        title: "Succès",
        description: "Paramètres sauvegardés avec succès",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Chargement des paramètres...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">⚙️ Paramètres de l'application</h1>
          <p className="text-muted-foreground">
            Configurez les paramètres généraux de votre application
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Paramètres généraux</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="app_name">Nom de l'application</Label>
              <Input
                id="app_name"
                value={settings.app_name}
                onChange={(e) => handleChange('app_name', e.target.value)}
                placeholder="Nom de votre application"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="default_language">Langue par défaut</Label>
              <select
                id="default_language"
                value={settings.default_language}
                onChange={(e) => handleChange('default_language', e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="theme">Thème</Label>
              <select
                id="theme"
                value={settings.theme}
                onChange={(e) => handleChange('theme', e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md"
              >
                <option value="light">Clair</option>
                <option value="dark">Sombre</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="notifications_enabled">Notifications activées</Label>
              <Switch
                id="notifications_enabled"
                checked={settings.notifications_enabled === 'true'}
                onCheckedChange={(checked) => handleBooleanChange('notifications_enabled', checked)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informations entreprise</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company_address">Adresse</Label>
              <Input
                id="company_address"
                value={settings.company_address}
                onChange={(e) => handleChange('company_address', e.target.value)}
                placeholder="Adresse de l'entreprise"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_phone">Téléphone</Label>
              <Input
                id="company_phone"
                value={settings.company_phone}
                onChange={(e) => handleChange('company_phone', e.target.value)}
                placeholder="Numéro de téléphone"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_email">Email</Label>
              <Input
                id="company_email"
                type="email"
                value={settings.company_email}
                onChange={(e) => handleChange('company_email', e.target.value)}
                placeholder="Adresse email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="default_tax_rate">Taux de TVA par défaut (%)</Label>
              <Input
                id="default_tax_rate"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={settings.default_tax_rate}
                onChange={(e) => handleChange('default_tax_rate', e.target.value)}
                placeholder="18.00"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="min-w-32"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Sauvegarde...
            </>
          ) : (
            'Enregistrer les paramètres'
          )}
        </Button>
      </div>
    </div>
  );
};

export default Parametres;
