
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  type: string;
  dimensions: string;
  price: number;
  unit: string;
  description?: string;
  is_active: boolean;
}

export const useProductsManager = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadProducts = async () => {
    try {
      setLoading(true);
      console.log('🔄 Chargement des produits...');
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) {
        console.error('❌ Erreur chargement produits:', error);
        throw error;
      }
      
      console.log('✅ Produits chargés:', data?.length || 0);
      setProducts(data || []);
    } catch (error: any) {
      console.error('💥 Erreur dans loadProducts:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les produits: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return {
    products,
    loading,
    refreshProducts: loadProducts
  };
};
