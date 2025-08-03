'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatTime, formatNutrition, formatDate } from '@/lib/utils';
import { useMealFeedback } from '@/hooks/useAI';
import type { Meal } from '@/types';

interface MealDetailModalProps {
  meal: Meal | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (meal: Meal) => void;
}

export function MealDetailModal({ meal, isOpen, onClose, onEdit }: MealDetailModalProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const { feedback, getFeedback, loading: feedbackLoading } = useMealFeedback();

  if (!isOpen || !meal) return null;

  const handleGetFeedback = async () => {
    setShowFeedback(true);
    await getFeedback(meal.id);
  };

  const totalMacros = (meal.protein || 0) + (meal.carbs || 0) + (meal.fat || 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-xl">
              {meal.description || 'Meal Details'}
            </CardTitle>
            <Button variant="ghost" onClick={onClose}>
              ✕
            </Button>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-neutral-500">Date:</span>
                <p className="font-medium">{formatDate(meal.logged_at)}</p>
              </div>
              <div>
                <span className="text-neutral-500">Time:</span>
                <p className="font-medium">{formatTime(meal.logged_at)}</p>
              </div>
            </div>

            {/* Image */}
            {meal.image_url && (
              <div>
                <h4 className="font-medium text-neutral-900 mb-2">Photo</h4>
                <img 
                  src={meal.image_url} 
                  alt="Meal" 
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}

            {/* Nutrition Summary */}
            <div>
              <h4 className="font-medium text-neutral-900 mb-3">Nutrition Summary</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-neutral-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-primary-600">
                    {formatNutrition(meal.calories || 0)}
                  </div>
                  <div className="text-sm text-neutral-600">Calories</div>
                </div>
                <div className="bg-neutral-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatNutrition(meal.water || 0)}ml
                  </div>
                  <div className="text-sm text-neutral-600">Water</div>
                </div>
              </div>
            </div>

            {/* Macronutrients */}
            <div>
              <h4 className="font-medium text-neutral-900 mb-3">Macronutrients</h4>
              <div className="space-y-3">
                {[
                  { name: 'Protein', value: meal.protein || 0, color: 'bg-blue-500', textColor: 'text-blue-600' },
                  { name: 'Carbohydrates', value: meal.carbs || 0, color: 'bg-green-500', textColor: 'text-green-600' },
                  { name: 'Fat', value: meal.fat || 0, color: 'bg-yellow-500', textColor: 'text-yellow-600' },
                  { name: 'Fiber', value: meal.fiber || 0, color: 'bg-purple-500', textColor: 'text-purple-600' },
                ].map((macro) => {
                  const percentage = totalMacros > 0 ? (macro.value / totalMacros) * 100 : 0;
                  return (
                    <div key={macro.name} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{macro.name}</span>
                        <span className={`text-sm font-medium ${macro.textColor}`}>
                          {formatNutrition(macro.value)}g {totalMacros > 0 && `(${percentage.toFixed(1)}%)`}
                        </span>
                      </div>
                      <div className="w-full bg-neutral-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${macro.color}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Feedback Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-neutral-900">AI Feedback</h4>
                {!showFeedback && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleGetFeedback}
                    loading={feedbackLoading}
                  >
                    Get Feedback
                  </Button>
                )}
              </div>
              
              {showFeedback && (
                <div className="bg-primary-50 p-4 rounded-lg">
                  {feedbackLoading ? (
                    <div className="animate-pulse">
                      <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2" />
                      <div className="h-4 bg-neutral-200 rounded w-1/2" />
                    </div>
                  ) : feedback ? (
                    <p className="text-sm text-primary-800">{feedback}</p>
                  ) : (
                    <p className="text-sm text-neutral-600">
                      Unable to generate feedback. Please try again.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-4 border-t">
              <Button 
                onClick={() => onEdit(meal)}
                className="flex-1"
              >
                Edit Meal
              </Button>
              <Button 
                variant="outline" 
                onClick={onClose}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}