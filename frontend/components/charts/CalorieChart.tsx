'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';
import type { WeeklyProgressData } from '@/types';

interface CalorieChartProps {
  data: WeeklyProgressData[];
  calorieGoal?: number;
}

export function CalorieChart({ data, calorieGoal = 2000 }: CalorieChartProps) {
  const chartData = data.map(item => ({
    date: formatDate(item.date || new Date().toISOString(), 'MMM dd'),
    calories: item.calories || 0,
    goal: calorieGoal,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Calorie Intake</span>
          <span className="text-sm text-neutral-600 font-normal">
            Goal: {calorieGoal} cal/day
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
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
                backgroundColor: '#white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
              formatter={(value: number, name: string) => [
                `${value} cal`,
                name === 'calories' ? 'Intake' : 'Goal'
              ]}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="goal" 
              stroke="#94a3b8" 
              strokeDasharray="5 5"
              name="Goal"
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="calories" 
              stroke="#10b981" 
              strokeWidth={3}
              name="Actual"
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#white' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}