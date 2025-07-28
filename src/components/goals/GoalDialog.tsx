
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { MonthlyGoal } from '@/types/database';

type GoalStatus = 'actif' | 'termine' | 'annule';

interface GoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: MonthlyGoal | null;
  onSubmit: (data: Partial<MonthlyGoal>) => void;
  isEditing: boolean;
}

export const GoalDialog = ({ open, onOpenChange, goal, onSubmit, isEditing }: GoalDialogProps) => {
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    objectif_montant: 0,
    montant_realise: 0,
    mois: new Date().getMonth() + 1,
    annee: new Date().getFullYear(),
    statut: 'actif' as GoalStatus,
  });

  useEffect(() => {
    if (goal && isEditing) {
      setFormData({
        titre: goal.titre,
        description: goal.description || '',
        objectif_montant: Number(goal.objectif_montant || 0),
        montant_realise: Number(goal.montant_realise || 0),
        mois: goal.mois,
        annee: goal.annee,
        statut: (goal.statut as GoalStatus) || 'actif',
      });
    } else if (!isEditing) {
      setFormData({
        titre: '',
        description: '',
        objectif_montant: 0,
        montant_realise: 0,
        mois: new Date().getMonth() + 1,
        annee: new Date().getFullYear(),
        statut: 'actif',
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
            <Label htmlFor="titre">Titre</Label>
            <Input
              id="titre"
              value={formData.titre}
              onChange={(e) => setFormData(prev => ({ ...prev, titre: e.target.value }))}
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
              <Label htmlFor="objectif_montant">Objectif montant (FCFA)</Label>
              <Input
                id="objectif_montant"
                type="number"
                value={formData.objectif_montant}
                onChange={(e) => setFormData(prev => ({ ...prev, objectif_montant: parseFloat(e.target.value) || 0 }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="montant_realise">Réalisé montant (FCFA)</Label>
              <Input
                id="montant_realise"
                type="number"
                value={formData.montant_realise}
                onChange={(e) => setFormData(prev => ({ ...prev, montant_realise: parseFloat(e.target.value) || 0 }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="mois">Mois</Label>
              <Select value={formData.mois.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, mois: parseInt(value) }))}>
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
              <Label htmlFor="annee">Année</Label>
              <Input
                id="annee"
                type="number"
                value={formData.annee}
                onChange={(e) => setFormData(prev => ({ ...prev, annee: parseInt(e.target.value) || new Date().getFullYear() }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="statut">Statut</Label>
            <Select value={formData.statut} onValueChange={(value) => setFormData(prev => ({ ...prev, statut: value as GoalStatus }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="actif">Actif</SelectItem>
                <SelectItem value="termine">Terminé</SelectItem>
                <SelectItem value="annule">Annulé</SelectItem>
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
