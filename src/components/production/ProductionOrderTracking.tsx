
import { useState } from 'react';
import { Play, Pause, CheckCircle, Clock, User, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useProducts, useProductionSteps } from '@/hooks/useSupabaseDatabase';
import type { Database } from '@/integrations/supabase/types';

type ProductionOrder = Database['public']['Tables']['production_orders']['Row'];

interface ProductionOrderTrackingProps {
  orders: ProductionOrder[];
  onUpdate: (id: string, data: any) => Promise<void>;
  getStatusBadge: (status: string) => React.ReactNode;
}

export const ProductionOrderTracking = ({ orders, onUpdate, getStatusBadge }: ProductionOrderTrackingProps) => {
  const { data: products } = useProducts();
  const { data: steps } = useProductionSteps();
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(null);
  const [showStepsDialog, setShowStepsDialog] = useState(false);
  const [selectedStep, setSelectedStep] = useState<any>(null);
  const [showStepDialog, setShowStepDialog] = useState(false);
  const [stepNotes, setStepNotes] = useState('');
  const [responsiblePerson, setResponsiblePerson] = useState('');

  const getProduct = (productId: string) => {
    return products.find(p => p.id === productId);
  };

  const getOrderSteps = (orderId: string) => {
    return steps.filter(step => step.production_order_id === orderId)
                .sort((a, b) => (a.step_order || 0) - (b.step_order || 0));
  };

  const startOrder = async (order: ProductionOrder) => {
    if (window.confirm('Démarrer la production de cet ordre ?')) {
      await onUpdate(order.id, {
        status: 'in_progress',
        start_date: new Date().toISOString().split('T')[0]
      });
    }
  };

  const completeOrder = async (order: ProductionOrder) => {
    if (window.confirm('Marquer cet ordre comme terminé ?')) {
      await onUpdate(order.id, {
        status: 'completed',
        completion_date: new Date().toISOString().split('T')[0]
      });
    }
  };

  const viewOrderSteps = (order: ProductionOrder) => {
    setSelectedOrder(order);
    setShowStepsDialog(true);
  };

  const updateStep = async (stepId: string, newStatus: string) => {
    const stepData: any = {
      status: newStatus,
      updated_at: new Date().toISOString()
    };

    if (newStatus === 'in_progress') {
      stepData.start_date = new Date().toISOString();
    } else if (newStatus === 'completed') {
      stepData.completion_date = new Date().toISOString();
    }

    if (stepNotes) {
      stepData.notes = stepNotes;
    }
    
    if (responsiblePerson) {
      stepData.responsible_person = responsiblePerson;
    }

    // Mise à jour via l'API Supabase directement
    const { error } = await supabase
      .from('production_steps')
      .update(stepData)
      .eq('id', stepId);

    if (!error) {
      setStepNotes('');
      setResponsiblePerson('');
      setShowStepDialog(false);
      // Recharger les données
      window.location.reload();
    }
  };

  const openStepDialog = (step: any) => {
    setSelectedStep(step);
    setStepNotes(step.notes || '');
    setResponsiblePerson(step.responsible_person || '');
    setShowStepDialog(true);
  };

  const getStepStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'En attente', variant: 'secondary' as const },
      in_progress: { label: 'En cours', variant: 'default' as const },
      completed: { label: 'Terminé', variant: 'default' as const },
      blocked: { label: 'Bloqué', variant: 'destructive' as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'default' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">Aucun ordre en cours de production</p>
            <p className="text-muted-foreground">Les ordres approuvés apparaîtront ici</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4">
        {orders.map((order) => {
          const product = getProduct(order.product_id || '');
          const orderSteps = getOrderSteps(order.id);
          
          return (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{order.order_number}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {product?.name} • {order.quantity?.toLocaleString()} unités
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(order.status || 'pending')}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Progression</span>
                      <span className="text-sm">{order.progress_percentage || 0}%</span>
                    </div>
                    <Progress value={order.progress_percentage || 0} className="w-full" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Demandé: {order.requested_date ? new Date(order.requested_date).toLocaleDateString('fr-FR') : 'N/A'}</span>
                  </div>
                  {order.start_date && (
                    <div className="flex items-center gap-2">
                      <Play className="h-4 w-4" />
                      <span>Démarré: {new Date(order.start_date).toLocaleDateString('fr-FR')}</span>
                    </div>
                  )}
                  {order.completion_date && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Terminé: {new Date(order.completion_date).toLocaleDateString('fr-FR')}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => viewOrderSteps(order)}
                  >
                    Voir les étapes
                  </Button>
                  
                  {order.status === 'approved' && (
                    <Button
                      size="sm"
                      onClick={() => startOrder(order)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Démarrer
                    </Button>
                  )}
                  
                  {order.status === 'in_progress' && order.progress_percentage === 100 && (
                    <Button
                      size="sm"
                      onClick={() => completeOrder(order)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Terminer
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Dialog des étapes */}
      <Dialog open={showStepsDialog} onOpenChange={setShowStepsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Étapes de production - {selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4">
              {getOrderSteps(selectedOrder.id).map((step, index) => (
                <Card key={step.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">
                            {index + 1}. {step.step_name}
                          </span>
                          {getStepStatusBadge(step.status || 'pending')}
                        </div>
                        
                        {step.responsible_person && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <User className="h-4 w-4" />
                            <span>Responsable: {step.responsible_person}</span>
                          </div>
                        )}
                        
                        {step.estimated_duration && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <Clock className="h-4 w-4" />
                            <span>Durée estimée: {step.estimated_duration}h</span>
                          </div>
                        )}
                        
                        {step.notes && (
                          <p className="text-sm text-muted-foreground">{step.notes}</p>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        {step.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => openStepDialog(step)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Démarrer
                          </Button>
                        )}
                        
                        {step.status === 'in_progress' && (
                          <Button
                            size="sm"
                            onClick={() => openStepDialog(step)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Terminer
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de mise à jour d'étape */}
      <Dialog open={showStepDialog} onOpenChange={setShowStepDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedStep?.status === 'pending' ? 'Démarrer l\'étape' : 'Terminer l\'étape'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedStep && (
            <div className="space-y-4">
              <div>
                <Label>Étape</Label>
                <p className="text-sm">{selectedStep.step_name}</p>
              </div>
              
              <div>
                <Label htmlFor="responsible_person">Responsable</Label>
                <Input
                  id="responsible_person"
                  value={responsiblePerson}
                  onChange={(e) => setResponsiblePerson(e.target.value)}
                  placeholder="Nom du responsable"
                />
              </div>
              
              <div>
                <Label htmlFor="step_notes">Notes</Label>
                <Textarea
                  id="step_notes"
                  value={stepNotes}
                  onChange={(e) => setStepNotes(e.target.value)}
                  placeholder="Ajoutez des notes sur cette étape..."
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowStepDialog(false)}>
                  Annuler
                </Button>
                <Button 
                  onClick={() => updateStep(
                    selectedStep.id,
                    selectedStep.status === 'pending' ? 'in_progress' : 'completed'
                  )}
                  className={selectedStep.status === 'pending' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}
                >
                  {selectedStep.status === 'pending' ? 'Démarrer' : 'Terminer'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
