'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
// import { Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatNutrition } from '@/lib/utils';
import type { DailyNutritionSummary } from '@/types';

interface MacroChartProps {
  data: DailyNutritionSummary;
  title?: string;
}

const MACRO_COLORS = {
  protein: '#3b82f6',    // Blue
  carbs: '#10b981',      // Green  
  fat: '#f59e0b',        // Yellow
};

export function MacroChart({ data, title = "Today's Macros" }: MacroChartProps) {
  const { protein = 0, carbs = 0, fat = 0 } = data;
  
  const totalMacros = protein + carbs + fat;
  
  const chartData = [
    { name: 'Protein', value: protein, color: MACRO_COLORS.protein },
    { name: 'Carbs', value: carbs, color: MACRO_COLORS.carbs },
    { name: 'Fat', value: fat, color: MACRO_COLORS.fat },
  ].filter(item => item.value > 0);

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Don't show labels for < 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="600"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {totalMacros === 0 ? (
          <div className="flex items-center justify-center h-64 text-neutral-500">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p>No macro data available</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${formatNutrition(value)}g`, '']}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Macro breakdown */}
            <div className="space-y-2">
              {chartData.map((macro) => {
                const percentage = totalMacros > 0 ? (macro.value / totalMacros) * 100 : 0;
                return (
                  <div key={macro.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: macro.color }}
                      />
                      <span className="font-medium">{macro.name}</span>
                    </div>
                    <div className="text-neutral-600">
                      {formatNutrition(macro.value)}g ({percentage.toFixed(1)}%)
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total */}
            <div className="pt-2 border-t border-neutral-200">
              <div className="flex justify-between text-sm font-medium">
                <span>Total Macros</span>
                <span>{formatNutrition(totalMacros)}g</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}