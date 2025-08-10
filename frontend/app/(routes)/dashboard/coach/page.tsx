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
import { Input } from '@/components/ui/Input';
import { useMedicalCoach } from '@/hooks/useAI';
import { useSymptomCorrelation, useAISymptomAnalysis } from '@/hooks/useSymptoms';

function AICoachContent() {
  const router = useRouter();
  const { meals, loading } = useTodaysMeals();
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [conditionsInput, setConditionsInput] = useState('');
  const [symptomDomain, setSymptomDomain] = useState<string>('');
  const [conditionQuestion, setConditionQuestion] = useState<string>('');
  const { advice, loading: adviceLoading, error: adviceError, getAdvice, clearAdvice } = useMedicalCoach();
  
  // Symptom correlation analysis
  const { analyzeCorrelations, correlationData, loading: correlationLoading } = useSymptomCorrelation();
  const { getAIAnalysis, analysis: symptomAnalysis, loading: analysisLoading } = useAISymptomAnalysis();
  
  const handleSymptomAnalysis = async () => {
    const correlations = await analyzeCorrelations({
      date_range_days: 14,
      include_lifestyle: true,
    });
    
    if (correlations) {
      await getAIAnalysis(correlations);
    }
  };

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

            {/* Medical Conditions Coach */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="mr-2">🩺</span>
                  Medical Conditions Coach
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm text-neutral-700">Conditions</label>
                  <Input
                    placeholder="e.g., IBS, lactose intolerance, GERD"
                    value={conditionsInput}
                    onChange={(e) => setConditionsInput(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-neutral-700">Symptom Domain (optional)</label>
                  <select
                    className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm"
                    value={symptomDomain}
                    onChange={(e) => setSymptomDomain(e.target.value)}
                  >
                    <option value="">None</option>
                    <option value="digestion">Digestion</option>
                    <option value="skin">Skin</option>
                    <option value="fatigue">Fatigue</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-neutral-700">Question (optional)</label>
                  <textarea
                    className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm min-h-[80px]"
                    placeholder="Any specific concern to address?"
                    value={conditionQuestion}
                    onChange={(e) => setConditionQuestion(e.target.value)}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={async () => {
                      const conditions = conditionsInput
                        .split(',')
                        .map((c) => c.trim())
                        .filter((c) => c.length > 0);
                      if (conditions.length === 0) return;
                      await getAdvice(conditions, {
                        symptom_domain: symptomDomain || undefined,
                        question: conditionQuestion || undefined,
                      });
                    }}
                    loading={adviceLoading}
                    disabled={!conditionsInput.trim()}
                  >
                    Get Condition Advice
                  </Button>
                  {advice && (
                    <Button variant="ghost" onClick={() => clearAdvice()}>
                      Clear
                    </Button>
                  )}
                </div>
                {adviceError && (
                  <p className="text-xs text-error">{String(adviceError)}</p>
                )}
                {advice && (
                  <div className="bg-amber-50 p-3 rounded-md">
                    <p className="text-sm text-amber-900 whitespace-pre-line">{advice}</p>
                    <p className="mt-2 text-[11px] text-amber-700">
                      Informational only, not medical advice.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Symptom Correlation Analysis */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="mr-2">🔍</span>
                  Symptom Pattern Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-neutral-600">
                  Analyze correlations between your meals, lifestyle, and symptoms to identify potential triggers.
                </p>
                
                <Button
                  onClick={handleSymptomAnalysis}
                  loading={correlationLoading || analysisLoading}
                  className="w-full"
                >
                  Analyze My Patterns (Last 14 Days)
                </Button>
                
                {symptomAnalysis && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Pattern Analysis</h4>
                    <p className="text-sm text-blue-800 whitespace-pre-line">{symptomAnalysis}</p>
                    <p className="mt-2 text-[11px] text-blue-700">
                      Educational insights based on your logged data.
                    </p>
                  </div>
                )}
                
                {correlationData && correlationData.patterns_found.length > 0 && (
                  <div className="bg-neutral-50 p-3 rounded-lg">
                    <h4 className="font-medium text-neutral-900 mb-2">Detected Patterns</h4>
                    <ul className="text-sm text-neutral-700 space-y-1">
                      {correlationData.patterns_found.slice(0, 3).map((pattern, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{pattern.description}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
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