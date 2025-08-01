
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface DeliverySectionProps {
  deliveryType: 'free' | 'paid' | 'pickup';
  deliveryFee: number;
  onDeliveryTypeChange: (type: 'free' | 'paid' | 'pickup') => void;
  onDeliveryFeeChange: (fee: number) => void;
}

export const DeliverySection = ({ 
  deliveryType, 
  deliveryFee, 
  onDeliveryTypeChange, 
  onDeliveryFeeChange 
}: DeliverySectionProps) => {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <Label className="text-base font-semibold">Livraison</Label>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label>Type de livraison</Label>
          <Select value={deliveryType} onValueChange={onDeliveryTypeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="free">🚚 Livraison gratuite (nos frais)</SelectItem>
              <SelectItem value="paid">💰 Livraison payante</SelectItem>
              <SelectItem value="pickup">🏪 Retrait en magasin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {deliveryType === 'paid' && (
          <div>
            <Label>Frais de livraison (FCFA)</Label>
            <Input
              type="number"
              min="0"
              value={deliveryFee}
              onChange={(e) => onDeliveryFeeChange(parseFloat(e.target.value) || 0)}
              placeholder="Montant des frais"
            />
          </div>
        )}
      </div>
      
      {deliveryType === 'free' && (
        <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
          ✅ Livraison offerte par Cornerstone Briques
        </div>
      )}
      
      {deliveryType === 'pickup' && (
        <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
          📍 Retrait à effectuer à : Akodessewa, après les rails, non loin de la station d'essence CM
        </div>
      )}
    </div>
  );
};
