
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, Save } from 'lucide-react';
import { useProductionMaterials, useBrickTypes, useProductionRecipes, useProductionCosts } from '@/hooks/useTypedDatabase';

export const ProductionCostCalculator = () => {
  const [selectedBrickType, setSelectedBrickType] = useState('');
  const [calculatedCost, setCalculatedCost] = useState(0);
  const [recipes, setRecipes] = useState<any[]>([]);
  
  const { data: materials } = useProductionMaterials();
  const { data: brickTypes } = useBrickTypes();
  const { data: productionRecipes } = useProductionRecipes();
  const { create: createCost } = useProductionCosts();

  useEffect(() => {
    if (selectedBrickType) {
      const brickRecipes = productionRecipes.filter(r => r.product_id === selectedBrickType);
      setRecipes(brickRecipes);
    }
  }, [selectedBrickType, productionRecipes]);

  const calculateCost = () => {
    let totalCost = 0;
    
    recipes.forEach(recipe => {
      const material = materials.find(m => m.id === recipe.material_id);
      if (material) {
        totalCost += recipe.quantite_necessaire * material.prix_unitaire;
      }
    });
    
    setCalculatedCost(totalCost);
  };

  const saveCost = async () => {
    if (selectedBrickType && calculatedCost > 0) {
      await createCost({
        production_order_id: selectedBrickType,
        material_id: '',
        quantite_utilisee: 0,
        cout_unitaire: calculatedCost,
        cout_total: calculatedCost
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Calculateur de coût de production</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="brickType">Type de brique</Label>
            <Select value={selectedBrickType} onValueChange={setSelectedBrickType}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un type de brique" />
              </SelectTrigger>
              <SelectContent>
                {brickTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.nom} - {type.longueur_cm}x{type.largeur_cm}x{type.hauteur_cm}cm
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedBrickType && (
            <div className="space-y-4">
              <h3 className="font-semibold">Composition</h3>
              <div className="space-y-2">
                {recipes.map((recipe) => {
                  const material = materials.find(m => m.id === recipe.material_id);
                  return (
                    <div key={recipe.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span>{material?.nom || 'Matériau inconnu'}</span>
                      <span>{recipe.quantite_necessaire} {material?.unite}</span>
                      <span>{formatCurrency((recipe.quantite_necessaire * (material?.prix_unitaire || 0)))}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-2">
                <Button onClick={calculateCost} className="flex-1">
                  <Calculator className="mr-2 h-4 w-4" />
                  Calculer
                </Button>
                {calculatedCost > 0 && (
                  <Button onClick={saveCost} variant="outline">
                    <Save className="mr-2 h-4 w-4" />
                    Sauvegarder
                  </Button>
                )}
              </div>

              {calculatedCost > 0 && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-800">Coût calculé</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(calculatedCost)}
                  </p>
                  <p className="text-sm text-green-700">par brique</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
