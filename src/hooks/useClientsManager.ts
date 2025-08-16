
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Client {
  id: string;
  nom_complet: string;
  telephone?: string;
  adresse?: string;
  email?: string;
  notes?: string;
}

export const useClientsManager = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadClients = async () => {
    try {
      setLoading(true);
      console.log('🔄 Chargement des clients...');
      
      const { data, error } = await supabase
        .from('clients_complets')
        .select('*')
        .order('nom_complet', { ascending: true });

      if (error) {
        console.error('❌ Erreur chargement clients:', error);
        throw error;
      }
      
      console.log('✅ Clients chargés:', data?.length || 0);
      setClients(data || []);
    } catch (error: any) {
      console.error('💥 Erreur dans loadClients:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les clients: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createClient = async (clientData: Omit<Client, 'id'>) => {
    try {
      setLoading(true);
      console.log('🔄 Création client:', clientData);

      if (!clientData.nom_complet?.trim()) {
        throw new Error('Le nom du client est obligatoire');
      }

      const { data: newClient, error } = await supabase
        .from('clients_complets')
        .insert([{
          nom_complet: clientData.nom_complet.trim(),
          telephone: clientData.telephone?.trim() || '',
          adresse: clientData.adresse?.trim() || '',
          email: clientData.email?.trim() || '',
          notes: clientData.notes?.trim() || ''
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur création client:', error);
        throw new Error(`Erreur création client: ${error.message}`);
      }

      console.log('✅ Client créé:', newClient);
      await loadClients(); // Recharger la liste
      
      toast({
        title: "Succès",
        description: `Client "${clientData.nom_complet}" créé avec succès`,
      });

      return newClient;
    } catch (error: any) {
      console.error('💥 Erreur dans createClient:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le client",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  return {
    clients,
    loading,
    createClient,
    refreshClients: loadClients
  };
};
