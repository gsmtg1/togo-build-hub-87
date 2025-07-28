
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PlayCircle, PauseCircle, CheckCircle, AlertCircle, Plus, Edit, Package } from 'lucide-react';
import { useProductionOrders, useProductionSteps, useProducts } from '@/hooks/useTypedDatabase';
import { supabase } from '@/integrations/supabase/client';
import type { ProductionOrder, ProductionStep } from '@/types/database';

export const ProductionOrderTracking = () => {
  const { data: orders, update: updateOrder } = useProductionOrders();
  const { data: steps, create: createStep, update: updateStep } = useProductionSteps();
  const { data: products } = useProducts();
  
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(null);
  const [showStepDialog, setShowStepDialog] = useState(false);
  const [editingStep, setEditingStep] = useState<ProductionStep | null>(null);

  const approvedOrders = orders.filter(order => order.status === 'approved' || order.status === 'in_progress');

  const getOrderSteps = (orderId: string) => {
    return steps.filter(step => step.production_order_id === orderId)
      .sort((a, b) => (a.step_order || 0) - (b.step_order || 0));
  };

  const updateOrderProgress = async (orderId: string) => {
    const orderSteps = getOrderSteps(orderId);
    const completedSteps = orderSteps.filter(step => step.status === 'completed');
    const progressPercentage = orderSteps.length > 0 ? (completedSteps.length / orderSteps.length) * 100 : 0;
    
    const newStatus = progressPercentage === 100 ? 'completed' : 'in_progress';
    
    await updateOrder(orderId, {
      progress_percentage: progressPercentage,
      status: newStatus,
      completion_date: progressPercentage === 100 ? new Date().toISOString() : null
    });
  };

  const startStep = async (stepId: string) => {
    await updateStep(stepId, {
      status: 'in_progress',
      start_date: new Date().toISOString()
    });
    
    // Update order progress
    const step = steps.find(s => s.id === stepId);
    if (step) {
      await updateOrderProgress(step.production_order_id);
    }
  };

  const completeStep = async (stepId: string) => {
    await updateStep(stepId, {
      status: 'completed',
      completion_date: new Date().toISOString()
    });
    
    // Update order progress
    const step = steps.find(s => s.id === stepId);
    if (step) {
      await updateOrderProgress(step.production_order_id);
    }
  };

  const getProduct = (productId: string | null) => {
    if (!productId) return null;
    return products.find(p => p.id === productId);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-gray-100 text-gray-800"><AlertCircle className="w-3 h-3 mr-1" />En attente</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800"><PlayCircle className="w-3 h-3 mr-1" />En cours</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Terminé</Badge>;
      case 'blocked':
        return <Badge className="bg-red-100 text-red-800"><PauseCircle className="w-3 h-3 mr-1" />Bloqué</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const StepDialog = () => {
    const [formData, setFormData] = useState({
      step_name: '',
      step_order: '',
      responsible_person: '',
      estimated_duration: '',
      notes: '',
      status: 'pending'
    });

    useEffect(() => {
      if (editingStep) {
        setFormData({
          step_name: editingStep.step_name || '',
          step_order: editingStep.step_order?.toString() || '',
          responsible_person: editingStep.responsible_person || '',
          estimated_duration: editingStep.estimated_duration?.toString() || '',
          notes: editingStep.notes || '',
          status: editingStep.status || 'pending'
        });
      } else {
        setFormData({
          step_name: '',
          step_order: '',
          responsible_person: '',
          estimated_duration: '',
          notes: '',
          status: 'pending'
        });
      }
    }, [editingStep]);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!selectedOrder) return;

      const stepData = {
        production_order_id: selectedOrder.id,
        step_name: formData.step_name,
        step_order: parseInt(formData.step_order),
        responsible_person: formData.responsible_person,
        estimated_duration: formData.estimated_duration ? parseInt(formData.estimated_duration) : null,
        notes: formData.notes,
        status: formData.status as 'pending' | 'in_progress' | 'completed' | 'blocked'
      };

      if (editingStep) {
        await updateStep(editingStep.id, stepData);
      } else {
        await createStep(stepData);
      }

      setShowStepDialog(false);
      setEditingStep(null);
    };

    return (
      <Dialog open={showStepDialog} onOpenChange={setShowStepDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingStep ? 'Modifier l\'étape' : 'Nouvelle étape'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="step_name">Nom de l'étape</Label>
              <Input
                id="step_name"
                value={formData.step_name}
                onChange={(e) => setFormData({ ...formData, step_name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="step_order">Ordre</Label>
                <Input
                  id="step_order"
                  type="number"
                  value={formData.step_order}
                  onChange={(e) => setFormData({ ...formData, step_order: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="responsible_person">Responsable</Label>
                <Input
                  id="responsible_person"
                  value={formData.responsible_person}
                  onChange={(e) => setFormData({ ...formData, responsible_person: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="estimated_duration">Durée estimée (heures)</Label>
              <Input
                id="estimated_duration"
                type="number"
                value={formData.estimated_duration}
                onChange={(e) => setFormData({ ...formData, estimated_duration: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="status">Statut</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="in_progress">En cours</SelectItem>
                  <SelectItem value="completed">Terminé</SelectItem>
                  <SelectItem value="blocked">Bloqué</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowStepDialog(false)}>
                Annuler
              </Button>
              <Button type="submit">
                {editingStep ? 'Modifier' : 'Créer'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  if (approvedOrders.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">Aucun ordre de production approuvé</p>
            <p className="text-muted-foreground">Les ordres approuvés apparaîtront ici</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Suivi de production</h2>
        <Badge variant="outline">
          {approvedOrders.length} ordre(s) en cours
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ordres de production</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numéro</TableHead>
                <TableHead>Produit</TableHead>
                <TableHead>Quantité</TableHead>
                <TableHead>Progression</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {approvedOrders.map((order) => {
                const product = getProduct(order.product_id);
                const orderSteps = getOrderSteps(order.id);
                
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.order_number}</TableCell>
                    <TableCell>{product?.name || 'Produit inconnu'}</TableCell>
                    <TableCell>{order.quantity?.toLocaleString()} unités</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${order.progress_percentage || 0}%` }}
                          />
                        </div>
                        <span className="text-sm">{order.progress_percentage || 0}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status || 'pending')}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                      >
                        Voir détails
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedOrder && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              Étapes - {selectedOrder.order_number}
            </CardTitle>
            <Button
              onClick={() => {
                setEditingStep(null);
                setShowStepDialog(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle étape
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ordre</TableHead>
                  <TableHead>Étape</TableHead>
                  <TableHead>Responsable</TableHead>
                  <TableHead>Durée estimée</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getOrderSteps(selectedOrder.id).map((step) => (
                  <TableRow key={step.id}>
                    <TableCell>{step.step_order}</TableCell>
                    <TableCell>{step.step_name}</TableCell>
                    <TableCell>{step.responsible_person || 'Non assigné'}</TableCell>
                    <TableCell>{step.estimated_duration ? `${step.estimated_duration}h` : 'N/A'}</TableCell>
                    <TableCell>{getStatusBadge(step.status || 'pending')}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {step.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => startStep(step.id)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <PlayCircle className="h-4 w-4 mr-1" />
                            Démarrer
                          </Button>
                        )}
                        {step.status === 'in_progress' && (
                          <Button
                            size="sm"
                            onClick={() => completeStep(step.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Terminer
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingStep(step);
                            setShowStepDialog(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <StepDialog />
    </div>
  );
};
