
import { NotificationCenter } from '@/components/common/NotificationCenter';

export default function Notifications() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">🔔 Notifications</h1>
        <p className="text-muted-foreground">
          Consultez toutes vos notifications et alertes système
        </p>
      </div>
      
      <NotificationCenter />
    </div>
  );
}
</tml>
