'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatTime, formatNutrition } from '@/lib/utils';
import type { Meal } from '@/types';

interface MealTimelineProps {
  meals: Meal[];
  onAddMeal: () => void;
}

export function MealTimeline({ meals, onAddMeal }: MealTimelineProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg">Today's Meals</CardTitle>
        <Button onClick={onAddMeal} size="sm">
          Add Meal
        </Button>
      </CardHeader>
      <CardContent>
        {meals.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-neutral-400 text-4xl mb-4">🍽️</div>
            <p className="text-neutral-600 mb-4">No meals logged today</p>
            <Button onClick={onAddMeal} variant="outline">
              Log your first meal
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {meals.map((meal) => (
              <div key={meal.id} className="flex items-start space-x-3 p-3 bg-neutral-50 rounded-lg">
                <div className="flex-shrink-0 w-2 h-2 bg-[#00b800] rounded-full mt-2" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-neutral-900 truncate">
                      {meal.description || 'Meal'}
                    </h4>
                    <span className="text-xs text-neutral-500">
                      {formatTime(meal.logged_at)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center space-x-4 text-xs text-neutral-600">
                    {meal.calories && (
                      <span>{formatNutrition(meal.calories)} cal</span>
                    )}
                    {meal.protein && (
                      <span>{formatNutrition(meal.protein)}g protein</span>
                    )}
                    {meal.carbs && (
                      <span>{formatNutrition(meal.carbs)}g carbs</span>
                    )}
                    {meal.fat && (
                      <span>{formatNutrition(meal.fat)}g fat</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}