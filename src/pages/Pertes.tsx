
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DailyLossDialog } from '@/components/losses/DailyLossDialog';
import { DailyLossManagement } from '@/components/losses/DailyLossManagement';
import { useDailyLosses } from '@/hooks/useSupabaseDatabase';

const Pertes = () => {
  const [showDialog, setShowDialog] = useState(false);
  const { data: losses, loading, create, update, remove } = useDailyLosses();

  const handleCreate = async (lossData: any) => {
    await create(lossData);
    setShowDialog(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestion des pertes</h1>
          <p className="text-muted-foreground">
            Suivez et analysez les pertes quotidiennes de votre production
          </p>
        </div>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle perte
        </Button>
      </div>

      <DailyLossManagement 
        losses={losses}
        loading={loading}
        onUpdate={update}
        onDelete={remove}
      />

      <DailyLossDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onSubmit={handleCreate}
      />
    </div>
  );
};

export default Pertes;
