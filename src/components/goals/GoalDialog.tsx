
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useBrickTypes } from '@/hooks/useTypedDatabase';
import type { MonthlyGoal } from '@/types/database';

type GoalStatus = 'active' | 'completed' | 'cancelled';

interface GoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: MonthlyGoal | null;
  onSubmit: (data: Partial<MonthlyGoal>) => void;
  isEditing: boolean;
}

export const GoalDialog = ({ open, onOpenChange, goal, onSubmit, isEditing }: GoalDialogProps) => {
  const { data: brickTypes } = useBrickTypes();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_quantity: 0,
    current_quantity: 0,
    target_amount: 0,
    current_amount: 0,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    brick_type_id: '',
    status: 'active' as GoalStatus,
  });

  useEffect(() => {
    if (goal && isEditing) {
      setFormData({
        title: goal.title,
        description: goal.description || '',
        target_quantity: goal.target_quantity,
        current_quantity: goal.current_quantity || 0,
        target_amount: Number(goal.target_amount || 0),
        current_amount: Number(goal.current_amount || 0),
        month: goal.month,
        year: goal.year,
        brick_type_id: goal.brick_type_id || '',
        status: (goal.status as GoalStatus) || 'active',
      });
    } else if (!isEditing) {
      setFormData({
        title: '',
        description: '',
        target_quantity: 0,
        current_quantity: 0,
        target_amount: 0,
        current_amount: 0,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        brick_type_id: '',
        status: 'active',
      });
    }
  }, [goal, isEditing, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      brick_type_id: formData.brick_type_id || null,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Modifier l\'objectif' : 'Nouvel objectif'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Titre</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="target_quantity">Objectif quantité</Label>
              <Input
                id="target_quantity"
                type="number"
                value={formData.target_quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, target_quantity: parseInt(e.target.value) || 0 }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="current_quantity">Réalisé quantité</Label>
              <Input
                id="current_quantity"
                type="number"
                value={formData.current_quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, current_quantity: parseInt(e.target.value) || 0 }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="target_amount">Objectif montant (FCFA)</Label>
              <Input
                id="target_amount"
                type="number"
                value={formData.target_amount}
                onChange={(e) => setFormData(prev => ({ ...prev, target_amount: parseFloat(e.target.value) || 0 }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="current_amount">Réalisé montant (FCFA)</Label>
              <Input
                id="current_amount"
                type="number"
                value={formData.current_amount}
                onChange={(e) => setFormData(prev => ({ ...prev, current_amount: parseFloat(e.target.value) || 0 }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="month">Mois</Label>
              <Select value={formData.month.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, month: parseInt(value) }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {new Date(2023, i).toLocaleDateString('fr-FR', { month: 'long' })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="year">Année</Label>
              <Input
                id="year"
                type="number"
                value={formData.year}
                onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) || new Date().getFullYear() }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="brick_type_id">Type de brique (optionnel)</Label>
              <Select value={formData.brick_type_id} onValueChange={(value) => setFormData(prev => ({ ...prev, brick_type_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Objectif général</SelectItem>
                  {brickTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name} - {type.dimensions}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Statut</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as GoalStatus }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="completed">Terminé</SelectItem>
                  <SelectItem value="cancelled">Annulé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">
              {isEditing ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
