'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useMealFeedback, useMealSuggestions } from '@/hooks/useAI';
import { useSubscription } from '@/hooks/useUser';
import type { Meal } from '@/types';

interface AIFeedbackPanelProps {
  meal?: Meal;
  onUpgrade?: () => void;
}

export function AIFeedbackPanel({ meal, onUpgrade }: AIFeedbackPanelProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { feedback, getFeedback, loading: feedbackLoading } = useMealFeedback();
  const { suggestions, getSuggestions, loading: suggestionsLoading } = useMealSuggestions();
  const { subscription } = useSubscription();
  
  const isPremium = subscription?.plan === 'premium' && subscription?.status === 'active';

  useEffect(() => {
    if (meal?.id) {
      getFeedback(meal.id);
    }
  }, [meal?.id, getFeedback]);

  const handleGetSuggestions = async () => {
    if (!isPremium) {
      onUpgrade?.();
      return;
    }
    
    if (meal?.id) {
      setShowSuggestions(true);
      await getSuggestions(meal.id);
    }
  };

  if (!meal) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-neutral-400 text-4xl mb-4">🤖</div>
          <p className="text-neutral-600">Select a meal to get AI feedback</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <span className="mr-2">🎯</span>
            AI Feedback
          </span>
          {!isPremium && (
            <Button size="sm" onClick={onUpgrade}>
              Upgrade
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Instant Feedback */}
        <div>
          <h4 className="font-medium text-neutral-900 mb-2">Nutrition Analysis</h4>
          {feedbackLoading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-neutral-200 rounded w-full" />
              <div className="h-4 bg-neutral-200 rounded w-3/4" />
            </div>
          ) : feedback ? (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">{feedback}</p>
            </div>
          ) : (
            <div className="bg-neutral-50 p-3 rounded-lg">
              <p className="text-sm text-neutral-600">
                No feedback available for this meal
              </p>
            </div>
          )}
        </div>

        {/* Meal Improvements (Premium) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-neutral-900">Improvement Suggestions</h4>
            {!showSuggestions && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleGetSuggestions}
                loading={suggestionsLoading}
                disabled={!isPremium && !onUpgrade}
              >
                {isPremium ? 'Get Suggestions' : '🔒 Premium'}
              </Button>
            )}
          </div>
          
          {showSuggestions && suggestionsLoading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-neutral-200 rounded w-full" />
              <div className="h-4 bg-neutral-200 rounded w-2/3" />
            </div>
          ) : showSuggestions && suggestions ? (
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-green-800">{suggestions}</p>
            </div>
          ) : !isPremium ? (
            <div className="bg-neutral-50 p-3 rounded-lg border-2 border-dashed border-neutral-200">
              <p className="text-sm text-neutral-600 text-center">
                🔒 Premium feature: Get personalized meal improvement suggestions
              </p>
            </div>
          ) : null}
        </div>

        {/* Quick Insights */}
        <div>
          <h4 className="font-medium text-neutral-900 mb-2">Quick Insights</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-primary-50 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-primary-600">
                {Math.round((meal.protein || 0) / (meal.calories || 1) * 100)}%
              </div>
              <div className="text-xs text-primary-700">Protein ratio</div>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-orange-600">
                {meal.calories && meal.calories > 600 ? 'High' : 
                 meal.calories && meal.calories > 300 ? 'Medium' : 'Light'}
              </div>
              <div className="text-xs text-orange-700">Calorie density</div>
            </div>
          </div>
        </div>

        {/* Nutrition Score */}
        <div>
          <h4 className="font-medium text-neutral-900 mb-2">Nutrition Score</h4>
          <div className="space-y-2">
            {/* Simple scoring based on balance */}
            {(() => {
              const protein = meal.protein || 0;
              const carbs = meal.carbs || 0;
              const fat = meal.fat || 0;
              const fiber = meal.fiber || 0;
              
              const totalMacros = protein + carbs + fat;
              const proteinRatio = totalMacros > 0 ? protein / totalMacros : 0;
              const fiberScore = fiber > 5 ? 1 : fiber / 5;
              
              let score = 60; // Base score
              if (proteinRatio > 0.15 && proteinRatio < 0.4) score += 20; // Good protein
              if (fiber > 3) score += 10; // Good fiber
              if (meal.calories && meal.calories < 800) score += 10; // Reasonable calories
              
              const scoreColor = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600';
              const scoreBg = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500';
              
              return (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-neutral-600">Overall Score</span>
                    <span className={`text-sm font-medium ${scoreColor}`}>{score}/100</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${scoreBg}`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => window.open('/dashboard/history', '_blank')}
          >
            View Similar Meals
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => window.open('/dashboard/add-meal', '_blank')}
          >
            Log Another Meal
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}