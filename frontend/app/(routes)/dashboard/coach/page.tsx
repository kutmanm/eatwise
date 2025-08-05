'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { OnboardingCheck } from '@/components/onboarding/OnboardingCheck';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { AICoachingCard } from '@/components/ai/AICoachingCard';
import { AIFeedbackPanel } from '@/components/ai/AIFeedbackPanel';
import { useTodaysMeals } from '@/hooks/useMeals';
import type { Meal } from '@/types';

function AICoachContent() {
  const router = useRouter();
  const { meals, loading } = useTodaysMeals();
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - AI Coaching */}
          <div className="lg:col-span-1">
            <AICoachingCard />
          </div>

          {/* Middle Column - Today's Meals */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Today's Meals</CardTitle>
              </CardHeader>
              <CardContent>
                {meals.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-neutral-400 text-4xl mb-4">🍽️</div>
                    <p className="text-neutral-600 mb-4">No meals logged today</p>
                    <Button onClick={() => router.push('/dashboard/add-meal')}>
                      Log your first meal
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {meals.map((meal) => (
                      <div 
                        key={meal.id}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                          selectedMeal?.id === meal.id 
                            ? 'border-primary-500 bg-primary-50' 
                            : 'border-neutral-200 hover:border-primary-300'
                        }`}
                        onClick={() => setSelectedMeal(meal)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-neutral-900 mb-1">
                              {meal.description || 'Untitled Meal'}
                            </h4>
                            <div className="flex space-x-4 text-xs text-neutral-600">
                              {meal.calories && (
                                <span>{Math.round(meal.calories)} cal</span>
                              )}
                              {meal.protein && (
                                <span>{Math.round(meal.protein)}g protein</span>
                              )}
                            </div>
                          </div>
                          <div className="text-xs text-neutral-500">
                            {new Date(meal.logged_at).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Nutrition Goals Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Progress</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const totalCalories = meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
                  const totalProtein = meals.reduce((sum, meal) => sum + (meal.protein || 0), 0);
                  const calorieGoal = 2000; // This would come from user profile
                  const proteinGoal = 150;

                  return (
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">Calories</span>
                          <span className="text-sm text-neutral-600">
                            {Math.round(totalCalories)} / {calorieGoal}
                          </span>
                        </div>
                        <div className="w-full bg-neutral-200 rounded-full h-2">
                          <div 
                            className="bg-primary-500 h-2 rounded-full transition-all"
                            style={{ width: `${Math.min((totalCalories / calorieGoal) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">Protein</span>
                          <span className="text-sm text-neutral-600">
                            {Math.round(totalProtein)}g / {proteinGoal}g
                          </span>
                        </div>
                        <div className="w-full bg-neutral-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${Math.min((totalProtein / proteinGoal) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - AI Feedback */}
          <div className="lg:col-span-1">
            <AIFeedbackPanel 
              meal={selectedMeal || undefined}
            />
          </div>
        </div>
    </div>
  );
}

export default function AICoachPage() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <OnboardingCheck>
          <AICoachContent />
        </OnboardingCheck>
      </ProtectedRoute>
    </AuthProvider>
  );
}