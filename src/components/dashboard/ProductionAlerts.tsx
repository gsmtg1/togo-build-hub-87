
import { useEffect } from 'react';
import { TrendingDown, Target, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMonthlyGoals } from '@/hooks/useSupabaseDatabase';
import { supabase } from '@/integrations/supabase/client';

export const ProductionAlerts = () => {
  const { data: goals, loading } = useMonthlyGoals();

  // Mettre à jour automatiquement les objectifs
  useEffect(() => {
    const updateGoals = async () => {
      try {
        await supabase.rpc('update_monthly_goals');
      } catch (error) {
        console.error('Error updating monthly goals:', error);
      }
    };

    // Mise à jour initiale
    updateGoals();

    // Mise à jour toutes les heures
    const interval = setInterval(updateGoals, 3600000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !goals.length) return null;

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  
  const currentGoals = goals.filter(goal => 
    goal.month === currentMonth && 
    goal.year === currentYear &&
    goal.status === 'active'
  );

  const underperformingGoals = currentGoals.filter(goal => {
    const progress = (goal.current_value / goal.target_value) * 100;
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const currentDay = new Date().getDate();
    const expectedProgress = (currentDay / daysInMonth) * 100;
    
    return progress < expectedProgress - 20; // 20% de retard
  });

  if (underperformingGoals.length === 0) return null;

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="text-orange-800 flex items-center gap-2">
          <Target className="h-5 w-5" />
          Objectifs en Retard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {underperformingGoals.map((goal) => {
          const progress = (goal.current_value / goal.target_value) * 100;
          const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
          const currentDay = new Date().getDate();
          const expectedProgress = (currentDay / daysInMonth) * 100;
          const gap = expectedProgress - progress;

          return (
            <div key={goal.id} className="flex items-center gap-3 p-3 bg-white rounded border-l-4 border-orange-400">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <div className="flex-1">
                <p className="font-medium text-sm">{goal.title}</p>
                <p className="text-xs text-gray-600">
                  {goal.current_value.toLocaleString()} / {goal.target_value.toLocaleString()} {goal.unit}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-orange-400 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="destructive">
                  -{Math.round(gap)}%
                </Badge>
                <p className="text-xs text-orange-600 mt-1">
                  {Math.round(progress)}% réalisé
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
