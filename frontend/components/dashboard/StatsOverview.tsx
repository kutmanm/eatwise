'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import type { DailyNutritionSummary, UserProfile } from '@/types';

interface StatsOverviewProps {
  progress: DailyNutritionSummary;
  streak: number;
  profile?: UserProfile | null;
  goals?: {
    calorie_goal: number;
    water_goal: number;
    protein: number;
    carbs: number;
    fat: number;
  } | null;
}

export function StatsOverview({ progress, streak, profile, goals }: StatsOverviewProps) {
  const calorieProgress = goals?.calorie_goal ? 
    Math.round(((progress.calories || 0) / goals.calorie_goal) * 100) : 0;
  
  const waterProgress = goals?.water_goal ? 
    Math.round(((progress.water || 0) / goals.water_goal) * 100) : 0;

  const weightProgress = profile ? 
    Math.round(((profile.initial_weight - profile.current_weight) / (profile.initial_weight - profile.target_weight)) * 100) : 0;

  const stats = [
    {
      title: 'Current Streak',
      value: streak,
      unit: 'days',
      icon: '🔥',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Meals Today',
      value: progress.meal_count || 0,
      unit: 'meals',
      icon: '🍽️',
      color: 'text-[#00b800]',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Calories',
      value: Math.round(progress.calories || 0),
      unit: `/ ${goals?.calorie_goal ? Math.round(goals.calorie_goal) : '?'} cal`,
      progress: calorieProgress,
      icon: '⚡',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Water',
      value: Math.round((progress.water || 0) / 1000 * 10) / 10,
      unit: `/ ${goals?.water_goal ? (goals.water_goal / 1000).toFixed(1) : '?'} L`,
      progress: waterProgress,
      icon: '💧',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
  ];

  // Add weight progress if profile exists
  if (profile && profile.current_weight !== profile.target_weight) {
    stats.push({
      title: 'Weight Progress',
      value: Math.abs(weightProgress),
      unit: '% to goal',
      progress: Math.min(Math.abs(weightProgress), 100),
      icon: weightProgress >= 0 ? '📈' : '📉',
      color: weightProgress >= 0 ? 'text-green-600' : 'text-blue-600',
      bgColor: weightProgress >= 0 ? 'bg-green-50' : 'bg-blue-50',
    });
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title} className={stat.bgColor}>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl">{stat.icon}</span>
                {stat.progress !== undefined && (
                  <div className={`text-xs px-2 py-1 rounded-full ${stat.bgColor} ${stat.color}`}>
                    {stat.progress}%
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium">{stat.title}</p>
                <p className={`text-lg font-bold ${stat.color}`}>
                  {stat.value}
                  <span className="text-xs text-gray-600 ml-1 font-normal">{stat.unit}</span>
                </p>
              </div>
              {stat.progress !== undefined && (
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full ${
                      stat.progress >= 100 ? 'bg-green-500' :
                      stat.progress >= 80 ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min(stat.progress, 100)}%` }}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}