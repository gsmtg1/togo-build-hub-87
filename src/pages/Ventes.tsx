
import { EnhancedPOSSystem } from '@/components/sales/EnhancedPOSSystem';

export default function Ventes() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Point de Vente</h1>
        <p className="text-gray-600">Système de vente intégré</p>
      </div>
      
      <EnhancedPOSSystem />
    </div>
  );
}
