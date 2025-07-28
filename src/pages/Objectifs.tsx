
import { useState } from 'react';
import { Plus, Edit, Trash2, TrendingUp, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useMonthlyGoals } from '@/hooks/useSupabaseDatabase';
import { GoalDialog } from '@/components/goals/GoalDialog';
import type { MonthlyGoal } from '@/types/database';

const Objectifs = () => {
  const { data: goals, loading, create, update, remove } = useMonthlyGoals();
  const [selectedGoal, setSelectedGoal] = useState<MonthlyGoal | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Chargement des objectifs...</div>
      </div>
    );
  }

  const handleCreate = () => {
    setSelectedGoal(null);
    setIsEditing(false);
    setDialogOpen(true);
  };

  const handleEdit = (goal: MonthlyGoal) => {
    setSelectedGoal(goal);
    setIsEditing(true);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet objectif ?')) {
      await remove(id);
    }
  };

  const handleSubmit = async (goalData: Partial<MonthlyGoal>) => {
    if (isEditing && selectedGoal) {
      await update(selectedGoal.id, goalData);
    } else {
      // Ensure required fields have default values
      const completeGoalData = {
        ...goalData,
        statut: goalData.statut || 'actif',
        titre: goalData.titre || '',
        mois: goalData.mois || new Date().getMonth() + 1,
        annee: goalData.annee || new Date().getFullYear(),
        objectif_montant: goalData.objectif_montant || 0,
        montant_realise: goalData.montant_realise || 0
      };
      
      await create(completeGoalData);
    }
    setDialogOpen(false);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      actif: 'default',
      termine: 'default',
      annule: 'destructive',
    };
    
    const labels: Record<string, string> = {
      actif: 'Actif',
      termine: 'Terminé',
      annule: 'Annulé',
    };

    return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>;
  };

  const getProgress = (current: number, target: number) => {
    return target > 0 ? (current / target) * 100 : 0;
  };

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const currentMonthGoals = goals.filter(goal => goal.mois === currentMonth && goal.annee === currentYear);
  const totalTarget = currentMonthGoals.reduce((sum, goal) => sum + (goal.objectif_montant || 0), 0);
  const totalCurrent = currentMonthGoals.reduce((sum, goal) => sum + (goal.montant_realise || 0), 0);
  const completedGoals = goals.filter(goal => goal.statut === 'termine').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Objectifs Mensuels</h1>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouvel Objectif
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Objectif du Mois
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTarget.toLocaleString()} FCFA</div>
            <div className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Réalisé
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCurrent.toLocaleString()} FCFA</div>
            <Progress value={getProgress(totalCurrent, totalTarget)} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Objectifs Terminés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedGoals}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Objectifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{goals.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Objectifs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Période</TableHead>
                <TableHead>Objectif</TableHead>
                <TableHead>Réalisé</TableHead>
                <TableHead>Progression</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {goals.map((goal) => (
                <TableRow key={goal.id}>
                  <TableCell>{goal.titre}</TableCell>
                  <TableCell>
                    {new Date(goal.annee, goal.mois - 1).toLocaleDateString('fr-FR', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </TableCell>
                  <TableCell>{(goal.objectif_montant || 0).toLocaleString()} FCFA</TableCell>
                  <TableCell>{(goal.montant_realise || 0).toLocaleString()} FCFA</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={getProgress(goal.montant_realise || 0, goal.objectif_montant || 0)} 
                        className="w-16" 
                      />
                      <span className="text-sm">
                        {Math.round(getProgress(goal.montant_realise || 0, goal.objectif_montant || 0))}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(goal.statut || 'actif')}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(goal)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(goal.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <GoalDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        goal={selectedGoal}
        onSubmit={handleSubmit}
        isEditing={isEditing}
      />
    </div>
  );
};

export default Objectifs;
