
import { Play, Pause, CheckCircle, Package, MapPin, Calendar, User, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { Delivery } from '@/types/database';

interface DeliveryTrackingProps {
  deliveries: Delivery[];
  onUpdate: (id: string, item: Partial<Delivery>) => Promise<void>;
  getStatusBadge: (status: string) => React.ReactNode;
}

export const DeliveryTracking = ({ deliveries, onUpdate, getStatusBadge }: DeliveryTrackingProps) => {
  const handleStartDelivery = async (deliveryId: string) => {
    try {
      await onUpdate(deliveryId, {
        statut: 'en_cours',
        date_livraison_prevue: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error starting delivery:', error);
    }
  };

  const handleCompleteDelivery = async (deliveryId: string) => {
    try {
      await onUpdate(deliveryId, {
        statut: 'livre',
        date_livraison_reelle: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error completing delivery:', error);
    }
  };

  const getProgressValue = (status: string) => {
    switch (status) {
      case 'en_attente': return 0;
      case 'approuve': return 25;
      case 'en_cours': return 75;
      case 'livre': return 100;
      default: return 0;
    }
  };

  if (deliveries.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Package className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucune livraison active</h3>
          <p className="text-muted-foreground text-center">
            Les livraisons en cours apparaîtront ici pour un suivi en temps réel
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {deliveries.map((delivery) => (
          <Card key={delivery.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">{delivery.numero_livraison}</CardTitle>
                </div>
                {getStatusBadge(delivery.statut)}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Informations client */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{delivery.client_nom}</span>
                </div>
                {delivery.client_telephone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{delivery.client_telephone}</span>
                  </div>
                )}
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Adresse client:</p>
                    <p className="text-muted-foreground">{delivery.client_adresse}</p>
                    <p className="font-medium mt-1">Lieu de livraison:</p>
                    <p className="text-muted-foreground">{delivery.lieu_livraison}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Dates importantes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="font-medium flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Commande
                  </p>
                  <p className="text-muted-foreground">
                    {delivery.date_commande 
                      ? new Date(delivery.date_commande).toLocaleDateString('fr-FR')
                      : 'Non définie'
                    }
                  </p>
                </div>
                <div>
                  <p className="font-medium">Livraison prévue</p>
                  <p className="text-muted-foreground">
                    {delivery.date_livraison_prevue
                      ? new Date(delivery.date_livraison_prevue).toLocaleDateString('fr-FR')
                      : 'Non planifiée'
                    }
                  </p>
                </div>
              </div>

              {/* Montant */}
              <div className="flex justify-between items-center py-2 bg-muted/20 rounded px-3">
                <span className="font-medium">Montant total</span>
                <span className="text-lg font-bold text-green-600">
                  {delivery.montant_total?.toLocaleString('fr-FR')} FCFA
                </span>
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">Progression</span>
                  <span className="text-muted-foreground">
                    {getProgressValue(delivery.statut)}%
                  </span>
                </div>
                <Progress 
                  value={getProgressValue(delivery.statut)} 
                  className="h-2"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                {delivery.statut === 'approuve' && (
                  <Button
                    onClick={() => handleStartDelivery(delivery.id)}
                    className="flex-1 h-9"
                    size="sm"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Démarrer livraison
                  </Button>
                )}
                
                {delivery.statut === 'en_cours' && (
                  <Button
                    onClick={() => handleCompleteDelivery(delivery.id)}
                    className="flex-1 h-9"
                    size="sm"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Marquer comme livrée
                  </Button>
                )}

                {delivery.statut === 'livre' && (
                  <div className="flex-1 flex items-center justify-center text-green-600 font-medium">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Livraison terminée
                  </div>
                )}
              </div>

              {/* Commentaires */}
              {delivery.commentaires && (
                <div className="text-xs">
                  <p className="font-medium mb-1">Commentaires:</p>
                  <p className="text-muted-foreground bg-muted/30 p-2 rounded">
                    {delivery.commentaires}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
