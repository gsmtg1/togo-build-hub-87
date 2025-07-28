
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useAppSettings } from '@/hooks/useSupabaseDatabase';
import { Save, Settings, Bell, Database, Shield, Globe } from 'lucide-react';

export default function Parametres() {
  const { data: settings, create, update } = useAppSettings();
  
  const [formData, setFormData] = useState({
    company_name: '',
    company_address: '',
    company_phone: '',
    company_email: '',
    notifications_enabled: true,
    auto_backup: false,
    backup_frequency: 'daily',
    currency: 'XOF',
    language: 'fr',
    timezone: 'GMT'
  });

  useEffect(() => {
    // Load settings from the database
    if (settings) {
      const settingsMap = settings.reduce((acc, setting) => {
        acc[setting.cle] = setting.valeur;
        return acc;
      }, {} as Record<string, any>);
      
      setFormData(prev => ({
        ...prev,
        ...settingsMap
      }));
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      // Save or update each setting
      for (const [key, value] of Object.entries(formData)) {
        const existingSetting = settings.find(s => s.cle === key);
        
        if (existingSetting) {
          await update(existingSetting.id, { valeur: value });
        } else {
          await create({
            cle: key,
            valeur: value,
            description: `Paramètre ${key}`
          });
        }
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Paramètres</h1>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Sauvegarder
        </Button>
      </div>

      {/* Informations de l'entreprise */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Informations de l'entreprise
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company_name">Nom de l'entreprise</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => handleChange('company_name', e.target.value)}
                placeholder="Nom de votre entreprise"
              />
            </div>
            <div>
              <Label htmlFor="company_phone">Téléphone</Label>
              <Input
                id="company_phone"
                value={formData.company_phone}
                onChange={(e) => handleChange('company_phone', e.target.value)}
                placeholder="+225 XX XX XX XX"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="company_address">Adresse</Label>
            <Textarea
              id="company_address"
              value={formData.company_address}
              onChange={(e) => handleChange('company_address', e.target.value)}
              placeholder="Adresse complète de l'entreprise"
            />
          </div>
          
          <div>
            <Label htmlFor="company_email">Email</Label>
            <Input
              id="company_email"
              type="email"
              value={formData.company_email}
              onChange={(e) => handleChange('company_email', e.target.value)}
              placeholder="contact@entreprise.com"
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifications_enabled">Notifications activées</Label>
              <p className="text-sm text-muted-foreground">
                Recevoir des notifications pour les événements importants
              </p>
            </div>
            <Switch
              id="notifications_enabled"
              checked={formData.notifications_enabled}
              onCheckedChange={(checked) => handleChange('notifications_enabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sauvegarde */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Sauvegarde
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto_backup">Sauvegarde automatique</Label>
              <p className="text-sm text-muted-foreground">
                Sauvegarder automatiquement les données
              </p>
            </div>
            <Switch
              id="auto_backup"
              checked={formData.auto_backup}
              onCheckedChange={(checked) => handleChange('auto_backup', checked)}
            />
          </div>
          
          {formData.auto_backup && (
            <div>
              <Label htmlFor="backup_frequency">Fréquence de sauvegarde</Label>
              <select
                id="backup_frequency"
                value={formData.backup_frequency}
                onChange={(e) => handleChange('backup_frequency', e.target.value)}
                className="w-full mt-1 p-2 border rounded"
              >
                <option value="daily">Quotidienne</option>
                <option value="weekly">Hebdomadaire</option>
                <option value="monthly">Mensuelle</option>
              </select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Paramètres régionaux */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Paramètres régionaux
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="currency">Devise</Label>
              <select
                id="currency"
                value={formData.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                className="w-full mt-1 p-2 border rounded"
              >
                <option value="XOF">FCFA (XOF)</option>
                <option value="EUR">Euro (EUR)</option>
                <option value="USD">Dollar US (USD)</option>
              </select>
            </div>
            
            <div>
              <Label htmlFor="language">Langue</Label>
              <select
                id="language"
                value={formData.language}
                onChange={(e) => handleChange('language', e.target.value)}
                className="w-full mt-1 p-2 border rounded"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>
            
            <div>
              <Label htmlFor="timezone">Fuseau horaire</Label>
              <select
                id="timezone"
                value={formData.timezone}
                onChange={(e) => handleChange('timezone', e.target.value)}
                className="w-full mt-1 p-2 border rounded"
              >
                <option value="GMT">GMT</option>
                <option value="GMT+1">GMT+1</option>
                <option value="GMT-1">GMT-1</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
