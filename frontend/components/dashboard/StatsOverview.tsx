'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import type { DailyNutritionSummary } from '@/types';

interface StatsOverviewProps {
  progress: DailyNutritionSummary;
  streak: number;
}

export function StatsOverview({ progress, streak }: StatsOverviewProps) {
  const stats = [
    {
      title: 'Current Streak',
      value: streak,
      unit: 'days',
      icon: '🔥',
      color: 'text-orange-600',
    },
    {
      title: 'Meals Today',
      value: progress.meal_count || 0,
      unit: 'meals',
      icon: '🍽️',
      color: 'text-primary-600',
    },
    {
      title: 'Calories',
      value: Math.round(progress.calories || 0),
      unit: 'cal',
      icon: '⚡',
      color: 'text-yellow-600',
    },
    {
      title: 'Water',
      value: Math.round((progress.water || 0) / 1000 * 10) / 10,
      unit: 'L',
      icon: '💧',
      color: 'text-blue-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{stat.icon}</span>
              <div>
                <p className="text-xs text-neutral-600">{stat.title}</p>
                <p className={`text-lg font-bold ${stat.color}`}>
                  {stat.value}
                  <span className="text-xs text-neutral-600 ml-1">{stat.unit}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}