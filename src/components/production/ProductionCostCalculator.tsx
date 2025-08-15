
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, Save, Plus, Trash2 } from 'lucide-react';
import { useMateriauxProduction, useTypesBriques, useRecettesProduction, useCoutsProduction } from '@/hooks/useProductionDatabase';

export const ProductionCostCalculator = () => {
  const [selectedBrickType, setSelectedBrickType] = useState('');
  const [calculatedCost, setCalculatedCost] = useState(0);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [materialPrices, setMaterialPrices] = useState<{ [key: string]: number }>({});
  
  const { data: materials } = useMateriauxProduction();
  const { data: brickTypes } = useTypesBriques();
  const { data: productionRecipes } = useRecettesProduction();
  const { create: createCost } = useCoutsProduction();

  useEffect(() => {
    if (selectedBrickType) {
      const brickRecipes = productionRecipes.filter(r => r.product_id === selectedBrickType);
      setRecipes(brickRecipes);
      
      // Initialiser les prix des matériaux
      const initialPrices: { [key: string]: number } = {};
      brickRecipes.forEach(recipe => {
        const material = materials.find(m => m.id === recipe.material_id);
        if (material) {
          initialPrices[recipe.material_id] = material.prix_unitaire;
        }
      });
      setMaterialPrices(initialPrices);
    }
  }, [selectedBrickType, productionRecipes, materials]);

  const calculateCost = () => {
    let totalCost = 0;
    
    recipes.forEach(recipe => {
      const customPrice = materialPrices[recipe.material_id] || 0;
      totalCost += recipe.quantite_necessaire * customPrice;
    });
    
    setCalculatedCost(totalCost);
  };

  const saveCost = async () => {
    if (selectedBrickType && calculatedCost > 0) {
      await createCost({
        production_order_id: selectedBrickType,
        material_id: '',
        quantite_utilisee: 1,
        cout_unitaire: calculatedCost,
        cout_total: calculatedCost
      });
    }
  };

  const updateMaterialPrice = (materialId: string, price: number) => {
    setMaterialPrices(prev => ({
      ...prev,
      [materialId]: price
    }));
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
              <h3 className="font-semibold">Composition et coûts</h3>
              <div className="space-y-4">
                {recipes.map((recipe) => {
                  const material = materials.find(m => m.id === recipe.material_id);
                  const customPrice = materialPrices[recipe.material_id] || 0;
                  const totalCost = recipe.quantite_necessaire * customPrice;
                  
                  return (
                    <div key={recipe.id} className="grid grid-cols-4 gap-4 items-center p-4 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{material?.nom || 'Matériau inconnu'}</p>
                        <p className="text-sm text-gray-600">{recipe.quantite_necessaire} {material?.unite}</p>
                      </div>
                      <div>
                        <Label htmlFor={`price-${recipe.material_id}`}>Prix unitaire</Label>
                        <Input
                          id={`price-${recipe.material_id}`}
                          type="number"
                          value={customPrice}
                          onChange={(e) => updateMaterialPrice(recipe.material_id, parseFloat(e.target.value) || 0)}
                          placeholder="Prix par unité"
                        />
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Coût total</p>
                        <p className="font-medium">{formatCurrency(totalCost)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-2">
                <Button onClick={calculateCost} className="flex-1">
                  <Calculator className="mr-2 h-4 w-4" />
                  Calculer le coût
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
                  <h3 className="font-semibold text-green-800">Coût de production calculé</h3>
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
