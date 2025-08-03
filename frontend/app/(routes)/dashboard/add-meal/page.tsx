'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { OnboardingCheck } from '@/components/onboarding/OnboardingCheck';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PhotoUpload } from '@/components/meal/PhotoUpload';
import { TextEntry } from '@/components/meal/TextEntry';
import { NutritionEditor } from '@/components/meal/NutritionEditor';
import { mealsApi } from '@/lib/api';
import { useMealFeedback } from '@/hooks/useAI';
import type { MealFormData, PhotoAnalysisResponse, ChatLogResponse } from '@/types';

type EntryMethod = 'photo' | 'text' | 'manual';

function AddMealContent() {
  const router = useRouter();
  const [entryMethod, setEntryMethod] = useState<EntryMethod | null>(null);
  const [analysisResult, setAnalysisResult] = useState<(PhotoAnalysisResponse | ChatLogResponse) | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const { feedback, getFeedback, loading: feedbackLoading } = useMealFeedback();

  const handleAnalysisComplete = (result: PhotoAnalysisResponse | ChatLogResponse) => {
    setAnalysisResult(result);
    setError('');
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleSaveMeal = async (data: MealFormData) => {
    setSaving(true);
    setError('');

    try {
      const response = await mealsApi.createMeal(data);
      
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        // Get AI feedback for the saved meal
        await getFeedback(response.data.id);
        
        // Redirect back to dashboard
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      }
    } catch (err) {
      setError('Failed to save meal. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard');
  };

  const getInitialMealData = (): Partial<MealFormData> => {
    if (!analysisResult) return {};
    
    const base = {
      calories: analysisResult.calories,
      protein: analysisResult.protein,
      carbs: analysisResult.carbs,
      fat: analysisResult.fat,
      fiber: analysisResult.fiber,
      water: analysisResult.water,
    };

    if ('description' in analysisResult) {
      return { ...base, description: analysisResult.description };
    } else {
      return { ...base, description: analysisResult.parsed_description };
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.back()}
              >
                ← Back
              </Button>
              <h1 className="text-xl font-semibold text-neutral-900">Add Meal</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 rounded-md bg-error/10 p-4">
            <p className="text-sm text-error">{error}</p>
          </div>
        )}

        {/* Success message with feedback */}
        {feedback && (
          <div className="mb-6 rounded-md bg-primary-50 p-4">
            <h3 className="text-sm font-medium text-primary-800 mb-2">
              🎉 Meal saved successfully!
            </h3>
            <p className="text-sm text-primary-700">{feedback}</p>
            <p className="text-xs text-primary-600 mt-2">
              Redirecting to dashboard...
            </p>
          </div>
        )}

        {!entryMethod ? (
          /* Method Selection */
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                How would you like to log your meal?
              </h2>
              <p className="text-neutral-600">
                Choose the method that works best for you
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setEntryMethod('photo')}
              >
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-4">📸</div>
                  <h3 className="font-semibold text-neutral-900 mb-2">Photo</h3>
                  <p className="text-sm text-neutral-600">
                    Take or upload a photo for AI analysis
                  </p>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setEntryMethod('text')}
              >
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-4">✍️</div>
                  <h3 className="font-semibold text-neutral-900 mb-2">Text</h3>
                  <p className="text-sm text-neutral-600">
                    Describe your meal in words
                  </p>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setEntryMethod('manual')}
              >
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-4">⌨️</div>
                  <h3 className="font-semibold text-neutral-900 mb-2">Manual</h3>
                  <p className="text-sm text-neutral-600">
                    Enter nutrition information manually
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : analysisResult || entryMethod === 'manual' ? (
          /* Nutrition Editor */
          <Card>
            <CardHeader>
              <CardTitle>
                {analysisResult && 'confidence' in analysisResult && (
                  <div className="flex items-center justify-between">
                    <span>Review & Edit Meal</span>
                    <span className="text-sm text-neutral-600">
                      Confidence: {Math.round((analysisResult.confidence || 0) * 100)}%
                    </span>
                  </div>
                )}
                {!analysisResult && 'Enter Meal Information'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <NutritionEditor
                initialData={getInitialMealData()}
                onSave={handleSaveMeal}
                onCancel={handleCancel}
                loading={saving || feedbackLoading}
              />
            </CardContent>
          </Card>
        ) : (
          /* Entry Method Content */
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>
                  {entryMethod === 'photo' && 'Upload Meal Photo'}
                  {entryMethod === 'text' && 'Describe Your Meal'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {entryMethod === 'photo' && (
                  <PhotoUpload
                    onAnalysisComplete={handleAnalysisComplete}
                    onError={handleError}
                  />
                )}
                {entryMethod === 'text' && (
                  <TextEntry
                    onAnalysisComplete={handleAnalysisComplete}
                    onError={handleError}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

export default function AddMealPage() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <OnboardingCheck>
          <AddMealContent />
        </OnboardingCheck>
      </ProtectedRoute>
    </AuthProvider>
  );
}