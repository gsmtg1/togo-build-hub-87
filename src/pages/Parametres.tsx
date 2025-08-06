import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useAppSettings } from '@/hooks/useSupabaseDatabase';
import { useToast } from '@/hooks/use-toast';

const Parametres = () => {
  const { data, loading, update, create } = useAppSettings();
  const { toast } = useToast();

  const initialSettings = {
    app_name: 'Mon Application',
    theme: 'light',
    notifications_enabled: true,
    default_language: 'fr',
  };

  const [settings, setSettings] = useState(initialSettings);

  useEffect(() => {
    if (data && data.length > 0) {
      const loadedSettings: { [key: string]: string | boolean } = {};
      data.forEach(item => {
        loadedSettings[item.cle] = item.valeur === 'true' ? true : (item.valeur === 'false' ? false : item.valeur);
      });
      setSettings({ ...initialSettings, ...loadedSettings });
    } else {
      setSettings(initialSettings);
    }
  }, [data]);

  const handleChange = (key: string, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const getSettingDescription = (key: string) => {
    const descriptions: { [key: string]: string } = {
      app_name: 'Nom de l\'application affiché dans l\'en-tête',
      theme: 'Thème par défaut de l\'application (light ou dark)',
      notifications_enabled: 'Activer ou désactiver les notifications',
      default_language: 'Langue par défaut de l\'application',
    };
    return descriptions[key] || 'Pas de description disponible';
  };

  const handleSave = async () => {
    try {
      for (const [key, value] of Object.entries(settings)) {
        const settingData = {
          cle: key,
          valeur: typeof value === 'boolean' ? value.toString() : value,
          description: getSettingDescription(key),
        };

        const existing = data.find(item => item.cle === key);
        if (existing) {
          await update(existing.id, settingData);
        } else {
          await create(settingData);
        }
      }
      
      toast({
        title: "Succès",
        description: "Paramètres sauvegardés avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Chargement...</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Paramètres de l'application</h1>
      <Card>
        <CardHeader>
          <CardTitle>Paramètres généraux</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(settings).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <Label htmlFor={key}>{key}</Label>
              {typeof value === 'boolean' ? (
                <Switch
                  id={key}
                  checked={value}
                  onCheckedChange={(checked) => handleChange(key, checked)}
                />
              ) : (
                <Input
                  type="text"
                  id={key}
                  value={value as string}
                  onChange={(e) => handleChange(key, e.target.value)}
                />
              )}
            </div>
          ))}
        </CardContent>
      </Card>
      <Button onClick={handleSave}>Enregistrer les paramètres</Button>
    </div>
  );
};

export default Parametres;
