'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatDate, calculatePercentage } from '@/lib/utils';
import type { WeeklyProgressData } from '@/types';

interface GoalProgressChartProps {
  data: WeeklyProgressData[];
  goals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  title?: string;
}

export function GoalProgressChart({ 
  data, 
  goals, 
  title = "Goal Achievement" 
}: GoalProgressChartProps) {
  const chartData = data.map(item => ({
    date: formatDate(item.date || new Date().toISOString(), 'MMM dd'),
    calorieProgress: calculatePercentage(item.calories || 0, goals.calories),
    proteinProgress: calculatePercentage(item.protein || 0, goals.protein),
    carbsProgress: calculatePercentage(item.carbs || 0, goals.carbs),
    fatProgress: calculatePercentage(item.fat || 0, goals.fat),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <span className="text-sm text-neutral-600 font-normal">
            % of daily goals achieved
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="calorieGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="proteinGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="carbsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="fatGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="date" 
              stroke="#64748b"
              fontSize={12}
            />
            <YAxis 
              stroke="#64748b"
              fontSize={12}
              domain={[0, 120]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
              formatter={(value: number, name: string) => [
                `${value}%`,
                name.replace('Progress', '').charAt(0).toUpperCase() + name.replace('Progress', '').slice(1)
              ]}
            />
            
            {/* Goal line at 100% */}
            <Area
              dataKey={() => 100}
              stroke="#ef4444"
              strokeWidth={2}
              strokeDasharray="5 5"
              fill="none"
              name="Goal (100%)"
            />
            
            <Area
              type="monotone"
              dataKey="calorieProgress"
              stackId="1"
              stroke="#10b981"
              fill="url(#calorieGradient)"
              name="Calories"
            />
            <Area
              type="monotone"
              dataKey="proteinProgress"
              stackId="2"
              stroke="#3b82f6"
              fill="url(#proteinGradient)"
              name="Protein"
            />
            <Area
              type="monotone"
              dataKey="carbsProgress"
              stackId="3"
              stroke="#f59e0b"
              fill="url(#carbsGradient)"
              name="Carbs"
            />
            <Area
              type="monotone"
              dataKey="fatProgress"
              stackId="4"
              stroke="#8b5cf6"
              fill="url(#fatGradient)"
              name="Fat"
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Goal summary */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="font-medium text-primary-600">{goals.calories}</div>
            <div className="text-neutral-600">Cal goal</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-blue-600">{goals.protein}g</div>
            <div className="text-neutral-600">Protein goal</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-yellow-600">{goals.carbs}g</div>
            <div className="text-neutral-600">Carbs goal</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-purple-600">{goals.fat}g</div>
            <div className="text-neutral-600">Fat goal</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}