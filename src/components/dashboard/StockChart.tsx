
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Briques 15x20x30', stock: 4200, seuil: 1000 },
  { name: 'Briques 10x20x30', stock: 3800, seuil: 800 },
  { name: 'Briques 8x20x30', stock: 2450, seuil: 500 },
  { name: 'Briques 6x20x30', stock: 1890, seuil: 400 },
  { name: 'Briques 20x20x30', stock: 2900, seuil: 600 },
];

export const StockChart = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Niveaux de Stock</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px'
                }}
              />
              <Bar 
                dataKey="stock" 
                fill="#f97316" 
                radius={[4, 4, 0, 0]}
                name="Stock actuel"
              />
              <Bar 
                dataKey="seuil" 
                fill="#ef4444" 
                radius={[4, 4, 0, 0]}
                name="Seuil d'alerte"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
