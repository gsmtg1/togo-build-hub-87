
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, BarChart3, TrendingUp, Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Rapports = () => {
  const [reportType, setReportType] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  const reportTypes = [
    { value: 'ventes', label: 'Rapport de ventes', icon: TrendingUp },
    { value: 'production', label: 'Rapport de production', icon: BarChart3 },
    { value: 'stock', label: 'État des stocks', icon: FileText },
    { value: 'pertes', label: 'Rapport des pertes', icon: Calendar },
    { value: 'comptabilite', label: 'Rapport comptable', icon: FileText },
    { value: 'livraisons', label: 'Rapport de livraisons', icon: TrendingUp }
  ];

  const handleGenerateReport = () => {
    console.log('Génération du rapport:', { reportType, dateRange });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Rapports</h1>
          <p className="text-muted-foreground">
            Générez et téléchargez des rapports détaillés sur vos activités
          </p>
        </div>
        <Button onClick={handleGenerateReport} disabled={!reportType}>
          <Download className="h-4 w-4 mr-2" />
          Générer le rapport
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Configuration du rapport</CardTitle>
            <CardDescription>
              Sélectionnez le type de rapport et la période souhaitée
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="report-type">Type de rapport</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type de rapport" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-date">Date de début</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="end-date">Date de fin</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rapports rapides</CardTitle>
            <CardDescription>
              Accès rapide aux rapports les plus utilisés
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start">
              <FileText className="mr-2 h-4 w-4" />
              Rapport du jour
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              <BarChart3 className="mr-2 h-4 w-4" />
              Rapport hebdomadaire
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              <TrendingUp className="mr-2 h-4 w-4" />
              Rapport mensuel
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              <Calendar className="mr-2 h-4 w-4" />
              Bilan annuel
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((type) => (
          <Card key={type.value} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <type.icon className="h-5 w-5" />
                {type.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => setReportType(type.value)}
              >
                Sélectionner
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Rapports;
