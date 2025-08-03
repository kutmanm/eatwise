'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { formatNutrition, calculatePercentage } from '@/lib/utils';
import type { DailyNutritionSummary } from '@/types';

interface NutritionCardProps {
  progress: DailyNutritionSummary;
}

export function NutritionCard({ progress }: NutritionCardProps) {
  const {
    calories = 0,
    protein = 0,
    carbs = 0,
    fat = 0,
    calorie_goal = 2000,
    protein_goal = 150,
    carbs_goal = 200,
    fat_goal = 65,
  } = progress;

  const nutritionData = [
    {
      name: 'Calories',
      current: calories,
      goal: calorie_goal,
      unit: 'cal',
      color: 'text-primary-600',
      bgColor: 'bg-primary-100',
    },
    {
      name: 'Protein',
      current: protein,
      goal: protein_goal,
      unit: 'g',
      color: 'text-secondary-600',
      bgColor: 'bg-secondary-100',
    },
    {
      name: 'Carbs',
      current: carbs,
      goal: carbs_goal,
      unit: 'g',
      color: 'text-warning',
      bgColor: 'bg-yellow-100',
    },
    {
      name: 'Fat',
      current: fat,
      goal: fat_goal,
      unit: 'g',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Today's Nutrition</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {nutritionData.map((item) => {
          const percentage = calculatePercentage(item.current, item.goal);
          
          return (
            <div key={item.name} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-neutral-900">
                  {item.name}
                </span>
                <span className="text-sm text-neutral-600">
                  {formatNutrition(item.current)} / {formatNutrition(item.goal)} {item.unit}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Progress
                  value={item.current}
                  max={item.goal}
                  className="flex-1"
                />
                <span className={`text-sm font-medium ${item.color}`}>
                  {percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}