
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { MonthlyGoal } from '@/types/database';

type GoalStatus = 'active' | 'completed' | 'cancelled';

interface GoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal?: MonthlyGoal | null;
  onSubmit: (data: Partial<MonthlyGoal>) => void;
  isEditing?: boolean;
}

export const GoalDialog = ({ open, onOpenChange, goal, onSubmit, isEditing = false }: GoalDialogProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_value: 0,
    current_value: 0,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    status: 'active' as GoalStatus,
    category: 'ventes',
    unit: 'FCFA',
  });

  useEffect(() => {
    if (goal && isEditing) {
      setFormData({
        title: goal.title,
        description: goal.description || '',
        target_value: Number(goal.target_value || 0),
        current_value: Number(goal.current_value || 0),
        month: goal.month,
        year: goal.year,
        status: (goal.status as GoalStatus) || 'active',
        category: goal.category,
        unit: goal.unit,
      });
    } else if (!isEditing) {
      setFormData({
        title: '',
        description: '',
        target_value: 0,
        current_value: 0,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        status: 'active',
        category: 'ventes',
        unit: 'FCFA',
      });
    }
  }, [goal, isEditing, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
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
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="target_value">Objectif montant (FCFA)</Label>
              <Input
                id="target_value"
                type="number"
                value={formData.target_value}
                onChange={(e) => setFormData(prev => ({ ...prev, target_value: parseFloat(e.target.value) || 0 }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="current_value">Réalisé montant (FCFA)</Label>
              <Input
                id="current_value"
                type="number"
                value={formData.current_value}
                onChange={(e) => setFormData(prev => ({ ...prev, current_value: parseFloat(e.target.value) || 0 }))}
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
