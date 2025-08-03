'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';

interface WeightEntry {
  date: string;
  weight: number;
}

interface WeightTrendChartProps {
  data: WeightEntry[];
  goalWeight?: number;
  title?: string;
}

export function WeightTrendChart({ 
  data, 
  goalWeight, 
  title = "Weight Trend" 
}: WeightTrendChartProps) {
  const chartData = data.map(item => ({
    date: formatDate(item.date, 'MMM dd'),
    weight: item.weight,
    goal: goalWeight,
  }));

  // Calculate trend
  const firstWeight = data[0]?.weight;
  const lastWeight = data[data.length - 1]?.weight;
  const weightChange = lastWeight && firstWeight ? lastWeight - firstWeight : 0;
  const trend = weightChange > 0 ? 'up' : weightChange < 0 ? 'down' : 'stable';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <div className="text-sm text-neutral-600 font-normal">
            {data.length > 1 && (
              <span className={`inline-flex items-center space-x-1 ${
                trend === 'up' ? 'text-red-600' : 
                trend === 'down' ? 'text-green-600' : 
                'text-neutral-600'
              }`}>
                <span>
                  {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
                </span>
                <span>
                  {Math.abs(weightChange).toFixed(1)}kg
                </span>
              </span>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-neutral-500">
            <div className="text-center">
              <div className="text-4xl mb-2">⚖️</div>
              <p>No weight data available</p>
              <p className="text-sm mt-1">Log your weight to see trends</p>
            </div>
          </div>
        ) : (
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
                domain={['dataMin - 2', 'dataMax + 2']}
                tickFormatter={(value) => `${value}kg`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                formatter={(value: number, name: string) => [
                  `${value}kg`,
                  name === 'weight' ? 'Weight' : 'Goal'
                ]}
              />
              
              {/* Goal line */}
              {goalWeight && (
                <Line 
                  type="monotone" 
                  dataKey="goal" 
                  stroke="#94a3b8" 
                  strokeDasharray="5 5"
                  name="Goal"
                  dot={false}
                />
              )}
              
              {/* Weight line */}
              <Line 
                type="monotone" 
                dataKey="weight" 
                stroke="#3b82f6" 
                strokeWidth={3}
                name="Weight"
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: 'white' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {/* Stats */}
        {data.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-4 text-sm text-center">
            <div>
              <div className="font-medium text-blue-600">
                {data[data.length - 1]?.weight}kg
              </div>
              <div className="text-neutral-600">Current</div>
            </div>
            <div>
              <div className={`font-medium ${
                trend === 'up' ? 'text-red-600' : 
                trend === 'down' ? 'text-green-600' : 
                'text-neutral-600'
              }`}>
                {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)}kg
              </div>
              <div className="text-neutral-600">Change</div>
            </div>
            <div>
              <div className="font-medium text-purple-600">
                {goalWeight ? `${goalWeight}kg` : 'Not set'}
              </div>
              <div className="text-neutral-600">Goal</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}