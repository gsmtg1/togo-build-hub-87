
import { Bell, Menu, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OptimizedSystemAlerts } from '@/components/notifications/OptimizedSystemAlerts';

interface HeaderProps {
  onMenuToggle: () => void;
}

export const Header = ({ onMenuToggle }: HeaderProps) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between px-4 lg:px-6 py-3 lg:py-4">
        <div className="flex items-center gap-3 lg:gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuToggle}
            className="lg:hidden hover:bg-gray-100"
          >
            <Menu className="h-6 w-6" />
          </Button>
          
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/d4bf97e1-3f49-486b-8c13-934b3178f760.png" 
              alt="Cornerstone Briques Logo" 
              className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 object-contain"
            />
            <div className="flex flex-col">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 leading-tight">
                BrickFlow
              </h1>
              <span className="text-xs sm:text-sm text-orange-600 font-medium hidden sm:block">
                Cornerstone Briques
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 lg:gap-4">
          <OptimizedSystemAlerts />
          <div className="flex items-center gap-2 lg:gap-3 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors">
            <User className="h-5 w-5 lg:h-6 lg:w-6 text-gray-600" />
            <span className="text-sm lg:text-base text-gray-700 font-medium hidden sm:block">
              Admin
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
