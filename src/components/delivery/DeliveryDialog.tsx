
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProductionOrders } from '@/hooks/useSupabaseDatabase';
import type { Delivery } from '@/types/database';

interface DeliveryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  delivery: Delivery | null;
  onSubmit: (deliveryData: Partial<Delivery>) => Promise<void>;
}

export const DeliveryDialog = ({ open, onOpenChange, delivery, onSubmit }: DeliveryDialogProps) => {
  const { data: orders } = useProductionOrders();
  const [formData, setFormData] = useState({
    client_nom: '',
    client_telephone: '',
    client_adresse: '',
    lieu_livraison: '',
    date_livraison_prevue: '',
    commentaires: ''
  });

  useEffect(() => {
    if (delivery) {
      setFormData({
        client_nom: delivery.client_nom || '',
        client_telephone: delivery.client_telephone || '',
        client_adresse: delivery.client_adresse || '',
        lieu_livraison: delivery.lieu_livraison || '',
        date_livraison_prevue: delivery.date_livraison_prevue || '',
        commentaires: delivery.commentaires || ''
      });
    } else {
      setFormData({
        client_nom: '',
        client_telephone: '',
        client_adresse: '',
        lieu_livraison: '',
        date_livraison_prevue: '',
        commentaires: ''
      });
    }
  }, [delivery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const deliveryData: Partial<Delivery> = {
      client_nom: formData.client_nom,
      client_telephone: formData.client_telephone || undefined,
      client_adresse: formData.client_adresse,
      lieu_livraison: formData.lieu_livraison,
      date_livraison_prevue: formData.date_livraison_prevue || undefined,
      commentaires: formData.commentaires || undefined
    };

    await onSubmit(deliveryData);
  };

  const completedOrders = orders.filter(order => order.status === 'completed');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {delivery ? 'Modifier la livraison' : 'Nouvelle livraison'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informations client</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="client_nom">Nom du client</Label>
                <Input
                  id="client_nom"
                  value={formData.client_nom}
                  onChange={(e) => setFormData({ ...formData, client_nom: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="client_telephone">Téléphone</Label>
                <Input
                  id="client_telephone"
                  value={formData.client_telephone}
                  onChange={(e) => setFormData({ ...formData, client_telephone: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="client_adresse">Adresse du client</Label>
              <Textarea
                id="client_adresse"
                value={formData.client_adresse}
                onChange={(e) => setFormData({ ...formData, client_adresse: e.target.value })}
                rows={2}
                required
              />
            </div>

            <div>
              <Label htmlFor="lieu_livraison">Lieu de livraison</Label>
              <Textarea
                id="lieu_livraison"
                value={formData.lieu_livraison}
                onChange={(e) => setFormData({ ...formData, lieu_livraison: e.target.value })}
                rows={2}
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Planification</h3>
            <div>
              <Label htmlFor="date_livraison_prevue">Date de livraison prévue</Label>
              <Input
                id="date_livraison_prevue"
                type="date"
                value={formData.date_livraison_prevue}
                onChange={(e) => setFormData({ ...formData, date_livraison_prevue: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="commentaires">Commentaires</Label>
            <Textarea
              id="commentaires"
              value={formData.commentaires}
              onChange={(e) => setFormData({ ...formData, commentaires: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">
              {delivery ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
