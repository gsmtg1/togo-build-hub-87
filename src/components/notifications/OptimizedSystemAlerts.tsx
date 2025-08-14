
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const OptimizedSystemAlerts = () => {
  // For now, we'll show no alerts since the system is new
  const alertCount = 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className={`h-5 w-5 text-gray-600 ${alertCount > 0 ? 'animate-pulse text-red-500' : ''}`} />
          {alertCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center text-xs"
            >
              {alertCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Alertes système</CardTitle>
            <CardDescription>
              Notifications et alertes importantes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <Bell className="h-12 w-12 text-gray-300 mb-3" />
              <p className="text-sm text-gray-500 mb-1">Aucune alerte</p>
              <p className="text-xs text-gray-400">
                Votre système fonctionne parfaitement
              </p>
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};
