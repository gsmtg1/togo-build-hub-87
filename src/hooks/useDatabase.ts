
import { useState, useEffect } from 'react';
import { database, DatabaseSchema } from '@/lib/database';
import { useToast } from '@/hooks/use-toast';

export function useDatabase() {
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    database.init().then(() => {
      setIsInitialized(true);
    }).catch((error) => {
      console.error('Database initialization failed:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'initialiser la base de données",
        variant: "destructive",
      });
    });
  }, [toast]);

  return { isInitialized };
}

export function useLocalStorage<T>(storeName: keyof DatabaseSchema) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await database.readAll<T>(storeName);
      setData(result);
    } catch (error) {
      console.error(`Error loading ${storeName}:`, error);
      toast({
        title: "Erreur",
        description: `Impossible de charger les données de ${storeName}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const create = async (item: T) => {
    try {
      await database.create(storeName, item);
      await loadData();
      toast({
        title: "Succès",
        description: "Élément créé avec succès",
      });
    } catch (error) {
      console.error(`Error creating ${storeName}:`, error);
      toast({
        title: "Erreur",
        description: "Impossible de créer l'élément",
        variant: "destructive",
      });
    }
  };

  const update = async (item: T) => {
    try {
      await database.update(storeName, item);
      await loadData();
      toast({
        title: "Succès",
        description: "Élément mis à jour avec succès",
      });
    } catch (error) {
      console.error(`Error updating ${storeName}:`, error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'élément",
        variant: "destructive",
      });
    }
  };

  const remove = async (id: string) => {
    try {
      await database.delete(storeName, id);
      await loadData();
      toast({
        title: "Succès",
        description: "Élément supprimé avec succès",
      });
    } catch (error) {
      console.error(`Error deleting ${storeName}:`, error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'élément",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    data,
    loading,
    create,
    update,
    remove,
    reload: loadData
  };
}
