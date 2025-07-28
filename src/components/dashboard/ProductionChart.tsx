
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', production: 2800, objectif: 3000 },
  { name: 'Fév', production: 3200, objectif: 3000 },
  { name: 'Mar', production: 2950, objectif: 3000 },
  { name: 'Avr', production: 3400, objectif: 3200 },
  { name: 'Mai', production: 3100, objectif: 3200 },
  { name: 'Jun', production: 3850, objectif: 3500 },
];

export const ProductionChart = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Production vs Objectifs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
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
              <Line 
                type="monotone" 
                dataKey="production" 
                stroke="#f97316" 
                strokeWidth={3}
                dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
                name="Production"
              />
              <Line 
                type="monotone" 
                dataKey="objectif" 
                stroke="#6b7280" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#6b7280', strokeWidth: 2, r: 4 }}
                name="Objectif"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
