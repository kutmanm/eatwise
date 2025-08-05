'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { DailyNutritionSummary } from '@/types/api';

interface NutritionCirclesProps {
  progress: DailyNutritionSummary;
}

interface CircleProgressProps {
  value: number;
  max: number;
  size: number;
  strokeWidth: number;
  children: React.ReactNode;
}

function CircleProgress({ value, max, size, strokeWidth, children }: CircleProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min((value / max) * 100, 100);
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#f3f4f6"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#374151"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-in-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}

export function NutritionCircles({ progress }: NutritionCirclesProps) {
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
      current: Math.round(calories),
      goal: calorie_goal,
      unit: 'cal',
      color: 'text-gray-700',
    },
    {
      name: 'Carbs',
      current: Math.round(carbs),
      goal: carbs_goal,
      unit: 'g',
      color: 'text-gray-700',
    },
    {
      name: 'Protein',
      current: Math.round(protein),
      goal: protein_goal,
      unit: 'g',
      color: 'text-gray-700',
    },
    {
      name: 'Fat',
      current: Math.round(fat),
      goal: fat_goal,
      unit: 'g',
      color: 'text-gray-700',
    },
  ];

  return (
    <Card className="bg-white border-none shadow-sm">
      <CardContent className="p-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {nutritionData.map((item) => {
            const remaining = Math.max(item.goal - item.current, 0);
            
            return (
              <div key={item.name} className="flex flex-col items-center space-y-3">
                <CircleProgress
                  value={item.current}
                  max={item.goal}
                  size={100}
                  strokeWidth={8}
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {item.current}
                    </div>
                    <div className="text-xs text-gray-500 font-medium">
                      {item.unit}
                    </div>
                  </div>
                </CircleProgress>
                
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-900 mb-1">
                    {item.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {remaining} {item.unit} left
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}