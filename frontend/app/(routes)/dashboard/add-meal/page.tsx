'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { OnboardingCheck } from '@/components/onboarding/OnboardingCheck';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PhotoUpload } from '@/components/meal/PhotoUpload';
import { TextEntry } from '@/components/meal/TextEntry';
import { NutritionEditor } from '@/components/meal/NutritionEditor';
import { CameraCapture } from '@/components/mobile/CameraCapture';
import { mealsApi } from '@/lib/api';
import { useMealFeedback } from '@/hooks/useAI';
import type { MealFormData, PhotoAnalysisResponse, ChatLogResponse } from '@/types';
import { GoImage } from 'react-icons/go';
import { FaRegKeyboard } from 'react-icons/fa';
import { IoArrowBack } from 'react-icons/io5';

type EntryMethod = 'camera' | 'text';

function AddMealContent() {
  const router = useRouter();
  const [entryMethod, setEntryMethod] = useState<EntryMethod>('camera');
  const [analysisResult, setAnalysisResult] = useState<(PhotoAnalysisResponse | ChatLogResponse) | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [capturedImage, setCapturedImage] = useState<Blob | null>(null);
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

  const handleCameraCapture = async (imageBlob: Blob) => {
    setCapturedImage(imageBlob);
    
    try {
      setError('');
      
      // Convert blob to base64 for API
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Image = reader.result as string;
        
        try {
          const response = await mealsApi.analyzePhoto(base64Image);
          
          if (response.error) {
            setError(response.error);
          } else if (response.data) {
            handleAnalysisComplete(response.data);
          }
        } catch (err) {
          setError('Failed to analyze image. Please try again.');
        }
      };
      reader.readAsDataURL(imageBlob);
    } catch (err) {
      setError('Failed to process image. Please try again.');
    }
  };

  const handleCameraError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleGalleryUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          setError('');
          
          // Convert blob to base64 for API
          const reader = new FileReader();
          reader.onload = async () => {
            const base64Image = reader.result as string;
            
            try {
              const response = await mealsApi.analyzePhoto(base64Image);
              
              if (response.error) {
                setError(response.error);
              } else if (response.data) {
                handleAnalysisComplete(response.data);
              }
            } catch (err) {
              setError('Failed to analyze image. Please try again.');
            }
          };
          reader.readAsDataURL(file);
        } catch (err) {
          setError('Failed to process image. Please try again.');
        }
      }
    };
    input.click();
  };

  const handleTextEntry = () => {
    setEntryMethod('text');
  };

  const handleBackToCamera = () => {
    setEntryMethod('camera');
    setCapturedImage(null);
    setAnalysisResult(null);
    setError('');
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
    <div className="h-screen w-screen fixed inset-0 bg-black overflow-hidden">
      {/* Back Button in NavBar will be handled by AppLayout */}

      {/* Success Message */}
      {feedback && (
        <div className="absolute top-16 left-4 right-4 z-40">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-green-600 text-4xl mb-3">✅</div>
                <h3 className="text-lg font-semibold text-green-800 mb-2">Meal Saved Successfully!</h3>
                <p className="text-green-700 mb-4">{feedback}</p>
                <p className="text-xs text-green-600 mt-2">
                  Redirecting to dashboard...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="absolute top-16 left-4 right-4 z-40">
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      {analysisResult ? (
        /* Nutrition Editor */
        <div className="h-full pt-16 pb-24 px-4 overflow-y-auto bg-white">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>
                  {analysisResult ? 'Review & Edit Meal' : 'Enter Meal Information'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <NutritionEditor
                  initialData={getInitialMealData()}
                  onSave={handleSaveMeal}
                  onCancel={handleBackToCamera}
                  loading={saving || feedbackLoading}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* Camera/Entry Method Content */
        <div className="h-full">
          {entryMethod === 'camera' && (
            <CameraCapture
              onCapture={handleCameraCapture}
              onError={handleCameraError}
            />
          )}
          {entryMethod === 'text' && (
            <div className="h-full pt-16 pb-24 px-4 bg-white overflow-y-auto">
              <TextEntry
                onAnalysisComplete={handleAnalysisComplete}
                onError={handleError}
              />
            </div>
          )}
        </div>
      )}

      {/* Floating Action Buttons */}
      {!analysisResult && (
        <div className="fixed bottom-24 left-0 right-0 flex justify-between px-6 z-50">
          {/* Gallery Button - Bottom Left */}
          <button
            onClick={handleGalleryUpload}
            className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center"
          >
            <GoImage size={24} className="text-gray-700" />
          </button>

          {/* Text Entry Button - Bottom Right */}
          <button
            onClick={handleTextEntry}
            className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center"
          >
            <FaRegKeyboard size={24} className="text-gray-700" />
          </button>
        </div>
      )}
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