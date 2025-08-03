'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatTime, formatNutrition } from '@/lib/utils';
import type { Meal } from '@/types';

interface MealCardProps {
  meal: Meal;
  onEdit: (meal: Meal) => void;
  onDelete: (id: string) => void;
  onViewDetails: (meal: Meal) => void;
}

export function MealCard({ meal, onEdit, onDelete, onViewDetails }: MealCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-medium text-neutral-900 truncate">
                {meal.description || 'Untitled Meal'}
              </h3>
              <span className="text-sm text-neutral-500">
                {formatTime(meal.logged_at)}
              </span>
            </div>
            
            {meal.image_url && (
              <div className="mb-3">
                <img 
                  src={meal.image_url} 
                  alt="Meal" 
                  className="w-full h-32 object-cover rounded-lg"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 text-sm text-neutral-600 mb-3">
              {meal.calories && (
                <div className="flex items-center space-x-1">
                  <span className="text-orange-500">⚡</span>
                  <span>{formatNutrition(meal.calories)} cal</span>
                </div>
              )}
              {meal.protein && (
                <div className="flex items-center space-x-1">
                  <span className="text-blue-500">🥩</span>
                  <span>{formatNutrition(meal.protein)}g protein</span>
                </div>
              )}
              {meal.carbs && (
                <div className="flex items-center space-x-1">
                  <span className="text-green-500">🌾</span>
                  <span>{formatNutrition(meal.carbs)}g carbs</span>
                </div>
              )}
              {meal.fat && (
                <div className="flex items-center space-x-1">
                  <span className="text-yellow-500">🥑</span>
                  <span>{formatNutrition(meal.fat)}g fat</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col space-y-2 ml-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onViewDetails(meal)}
            >
              View
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onEdit(meal)}
            >
              Edit
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onDelete(meal.id.toString())}
              className="text-error hover:text-error"
            >
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}