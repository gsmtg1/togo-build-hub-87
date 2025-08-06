
import { useState } from 'react';
import { Plus, Target, TrendingUp, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useMonthlyGoals } from '@/hooks/useSupabaseDatabase';
import { GoalDialog } from '@/components/goals/GoalDialog';

const Objectifs = () => {
  const { data: goals, loading, create, update, remove } = useMonthlyGoals();
  const [dialogOpen, setDialogOpen] = useState(false);

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const currentGoals = goals.filter(
    goal => goal.month === currentMonth && goal.year === currentYear
  );

  const handleSubmit = async (goalData: any) => {
    const completeGoalData = {
      ...goalData,
      unit: goalData.unit || 'FCFA', // Ajouter une unité par défaut
      month: goalData.month || currentMonth,
      year: goalData.year || currentYear,
      current_value: goalData.current_value || 0,
      status: goalData.status || 'active',
      category: goalData.category || 'ventes'
    };

    await create(completeGoalData);
    setDialogOpen(false);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default' as const,
      completed: 'default' as const,
      cancelled: 'destructive' as const,
    };
    
    const labels = {
      active: 'Actif',
      completed: 'Terminé',
      cancelled: 'Annulé',
    };

    return <Badge variant={variants[status as keyof typeof variants] || 'default'}>
      {labels[status as keyof typeof labels] || status}
    </Badge>;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Objectifs</h1>
          <p className="text-muted-foreground">
            Définissez et suivez vos objectifs mensuels
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvel objectif
        </Button>
      </div>

      {/* Stats du mois */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Objectifs ce mois</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentGoals.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terminés</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {currentGoals.filter(g => g.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de réussite</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {currentGoals.length > 0 
                ? Math.round((currentGoals.filter(g => g.status === 'completed').length / currentGoals.length) * 100)
                : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des objectifs */}
      <div className="grid gap-4">
        {goals.map((goal) => {
          const progress = goal.target_value > 0 ? Math.min((goal.current_value / goal.target_value) * 100, 100) : 0;
          
          return (
            <Card key={goal.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{goal.title}</CardTitle>
                    {goal.description && (
                      <CardDescription>{goal.description}</CardDescription>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(goal.status)}
                    <Badge variant="outline">
                      {goal.month}/{goal.year}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Progression</span>
                    <span className="text-sm text-muted-foreground">
                      {goal.current_value.toLocaleString()} / {goal.target_value.toLocaleString()} {goal.unit}
                    </span>
                  </div>
                  <Progress value={progress} className="w-full" />
                  <div className="text-right text-sm font-medium">
                    {progress.toFixed(1)}%
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <GoalDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default Objectifs;
