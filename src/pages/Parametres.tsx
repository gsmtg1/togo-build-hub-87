import { useState, useEffect } from 'react';
import { Save, RefreshCw, Upload, Palette, FileText, Settings as SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppSettings } from '@/hooks/useSupabaseDatabase';
import { useToast } from '@/hooks/use-toast';

const Parametres = () => {
  const { data: settings, loading, update } = useAppSettings();
  const { toast } = useToast();
  const [currentSettings, setCurrentSettings] = useState<Record<string, any>>({});
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (settings.length > 0) {
      const settingsObj: Record<string, any> = {};
      settings.forEach((setting: any) => {
        settingsObj[setting.setting_key] = setting.setting_value;
      });
      setCurrentSettings(settingsObj);
    }
  }, [settings]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Chargement des paramètres...</div>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      // Update each setting
      for (const [key, value] of Object.entries(currentSettings)) {
        const existingSetting = settings.find((s: any) => s.setting_key === key);
        if (existingSetting) {
          await update(existingSetting.id, {
            setting_value: value as any,
            updated_at: new Date().toISOString(),
          });
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

  const handleReset = async () => {
    setIsResetting(true);
    try {
      if (window.confirm('Êtes-vous sûr de vouloir réinitialiser toutes les données ? Cette action est irréversible.')) {
        toast({
          title: "Fonction à implémenter",
          description: "La réinitialisation des données sera implémentée prochainement",
        });
      }
    } finally {
      setIsResetting(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCurrentSettings((prev: any) => ({
          ...prev,
          invoice_settings: {
            ...prev.invoice_settings,
            logo: result
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const updateSetting = (key: string, value: any) => {
    setCurrentSettings((prev: any) => ({
      ...prev,
      [key]: value
    }));
  };

  const updateNestedSetting = (parentKey: string, childKey: string, value: any) => {
    setCurrentSettings((prev: any) => ({
      ...prev,
      [parentKey]: {
        ...prev[parentKey],
        [childKey]: value
      }
    }));
  };

  const companyInfo = currentSettings.company_info || {};
  const invoiceSettings = currentSettings.invoice_settings || {};

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Paramètres</h1>
        <div className="flex gap-2">
          <Button
            onClick={handleReset}
            variant="destructive"
            disabled={isResetting}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isResetting ? 'animate-spin' : ''}`} />
            Réinitialiser
          </Button>
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            Enregistrer
          </Button>
        </div>
      </div>

      <Tabs defaultValue="company" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="company">Entreprise</TabsTrigger>
          <TabsTrigger value="appearance">Apparence</TabsTrigger>
          <TabsTrigger value="templates">Modèles</TabsTrigger>
          <TabsTrigger value="advanced">Avancé</TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                Informations de l'entreprise
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">Nom de l'entreprise</Label>
                  <Input
                    id="companyName"
                    value={companyInfo.name || ''}
                    onChange={(e) => updateNestedSetting('company_info', 'name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="companyEmail">Email</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={companyInfo.email || ''}
                    onChange={(e) => updateNestedSetting('company_info', 'email', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyPhone">Téléphone</Label>
                  <Input
                    id="companyPhone"
                    value={companyInfo.phone || ''}
                    onChange={(e) => updateNestedSetting('company_info', 'phone', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="companyAddress">Adresse</Label>
                  <Input
                    id="companyAddress"
                    value={companyInfo.address || ''}
                    onChange={(e) => updateNestedSetting('company_info', 'address', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="logo">Logo de l'entreprise</Label>
                <div className="flex items-center gap-4 mt-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('logo-upload')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Télécharger un logo
                  </Button>
                  {invoiceSettings.logo && (
                    <div className="w-16 h-16 border rounded-lg overflow-hidden">
                      <img
                        src={invoiceSettings.logo}
                        alt="Logo"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Apparence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primaryColor">Couleur primaire</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={invoiceSettings.primary_color || '#ea580c'}
                      onChange={(e) => updateNestedSetting('invoice_settings', 'primary_color', e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={invoiceSettings.primary_color || '#ea580c'}
                      onChange={(e) => updateNestedSetting('invoice_settings', 'primary_color', e.target.value)}
                      placeholder="#ea580c"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="secondaryColor">Couleur secondaire</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={invoiceSettings.secondary_color || '#f97316'}
                      onChange={(e) => updateNestedSetting('invoice_settings', 'secondary_color', e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={invoiceSettings.secondary_color || '#f97316'}
                      onChange={(e) => updateNestedSetting('invoice_settings', 'secondary_color', e.target.value)}
                      placeholder="#f97316"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="headerText">Texte d'en-tête</Label>
                <Input
                  id="headerText"
                  value={invoiceSettings.header_text || ''}
                  onChange={(e) => updateNestedSetting('invoice_settings', 'header_text', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="footerText">Texte de pied de page</Label>
                <Input
                  id="footerText"
                  value={invoiceSettings.footer_text || ''}
                  onChange={(e) => updateNestedSetting('invoice_settings', 'footer_text', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Modèles de documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invoiceTemplate">Modèle de facture</Label>
                  <Select value="default">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Modèle par défaut</SelectItem>
                      <SelectItem value="minimal">Modèle minimal</SelectItem>
                      <SelectItem value="detailed">Modèle détaillé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="quoteTemplate">Modèle de devis</Label>
                  <Select value="default">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Modèle par défaut</SelectItem>
                      <SelectItem value="minimal">Modèle minimal</SelectItem>
                      <SelectItem value="detailed">Modèle détaillé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Aperçu des modèles</h3>
                <div className="border rounded-lg p-4 bg-muted/50">
                  <p className="text-sm text-muted-foreground">
                    L'aperçu des modèles sera affiché ici en fonction des sélections ci-dessus.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres avancés</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <h3 className="font-semibold text-destructive mb-2">Zone de danger</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  La réinitialisation supprimera définitivement toutes les données (ventes, devis, objectifs, employés, factures).
                  Cette action est irréversible.
                </p>
                <Button
                  onClick={handleReset}
                  variant="destructive"
                  disabled={isResetting}
                  className="gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isResetting ? 'animate-spin' : ''}`} />
                  Réinitialiser toutes les données
                </Button>
              </div>

              <div className="bg-muted/50 border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Sauvegarde et restauration</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Les données sont automatiquement sauvegardées dans Supabase.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" disabled>
                    Exporter les données
                  </Button>
                  <Button variant="outline" disabled>
                    Importer des données
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Parametres;
