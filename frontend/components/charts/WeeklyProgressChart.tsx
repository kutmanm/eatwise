'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';
import type { WeeklyProgressData } from '@/types';

interface WeeklyProgressChartProps {
  data: WeeklyProgressData[];
  title?: string;
}

export function WeeklyProgressChart({ data, title = "Weekly Progress" }: WeeklyProgressChartProps) {
  const chartData = data.map(item => ({
    date: formatDate(item.date || new Date().toISOString(), 'EEE'),
    protein: item.protein || 0,
    carbs: item.carbs || 0,
    fat: item.fat || 0,
    fiber: item.fiber || 0,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="date" 
              stroke="#64748b"
              fontSize={12}
            />
            <YAxis 
              stroke="#64748b"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
              formatter={(value: number, name: string) => [
                `${value}g`,
                name.charAt(0).toUpperCase() + name.slice(1)
              ]}
            />
            <Legend />
            <Bar 
              dataKey="protein" 
              fill="#3b82f6" 
              name="Protein"
              radius={[2, 2, 0, 0]}
            />
            <Bar 
              dataKey="carbs" 
              fill="#10b981" 
              name="Carbs"
              radius={[2, 2, 0, 0]}
            />
            <Bar 
              dataKey="fat" 
              fill="#f59e0b" 
              name="Fat"
              radius={[2, 2, 0, 0]}
            />
            <Bar 
              dataKey="fiber" 
              fill="#8b5cf6" 
              name="Fiber"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}