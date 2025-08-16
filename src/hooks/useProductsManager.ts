
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
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProducts = async () => {
    try {
      console.log('Chargement des produits...');
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) {
        console.error('Erreur lors du chargement des produits:', error);
        throw error;
      }
      
      console.log('Produits chargés:', data);
      setProducts(data || []);
    } catch (error: any) {
      console.error('Erreur lors du chargement des produits:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les produits: " + (error.message || 'Erreur inconnue'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    refresh: fetchProducts
  };
};
