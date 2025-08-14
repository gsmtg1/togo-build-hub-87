
import { Bell, Menu, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSystemAlerts } from '@/hooks/useSupabaseDatabase';

interface HeaderProps {
  onMenuToggle: () => void;
}

export const Header = ({ onMenuToggle }: HeaderProps) => {
  const { stockAlerts, pendingOrders } = useSystemAlerts();
  const totalAlerts = stockAlerts.length + pendingOrders.length;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuToggle}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">BrickFlow</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Bell className={`h-5 w-5 text-gray-600 ${totalAlerts > 0 ? 'animate-pulse text-red-500' : ''}`} />
            {totalAlerts > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center text-xs"
              >
                {totalAlerts}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-gray-600" />
            <span className="text-sm text-gray-700">Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
};
