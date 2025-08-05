'use client';

import { useRouter } from 'next/navigation';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { OnboardingCheck } from '@/components/onboarding/OnboardingCheck';

import { MealTimeline } from '@/components/dashboard/MealTimeline';
import { DailyTipCard } from '@/components/dashboard/DailyTipCard';
import { NutritionCircles } from '@/components/dashboard/NutritionCircles';
import { Button } from '@/components/ui/Button';
import { useTodaysProgress } from '@/hooks/useProgress';
import { useTodaysMeals } from '@/hooks/useMeals';
import { useUserStreak } from '@/hooks/useUser';
import { useAuthContext } from '@/components/auth/AuthProvider';

function DashboardContent() {
  const router = useRouter();
  const { signOut } = useAuthContext();
  const { progress, loading: progressLoading } = useTodaysProgress();
  const { meals, loading: mealsLoading } = useTodaysMeals();
  const { streak, loading: streakLoading } = useUserStreak();

  const handleAddMeal = () => {
    router.push('/dashboard/add-meal');
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (progressLoading || mealsLoading || streakLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-[#f9f9fa] min-h-screen">
        {/* Nutrition Circles */}
        <div className="mb-8">
          <NutritionCircles 
            progress={progress || {
              date: new Date().toISOString(),
              meal_count: 0,
              calories: 0,
              protein: 0,
              carbs: 0,
              fat: 0,
              fiber: 0,
              water: 0,
            }} 
          />
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 gap-8">
          {/* Meals and Tips */}
          <div className="space-y-6">
            <MealTimeline 
              meals={meals} 
              onAddMeal={handleAddMeal}
            />
            <DailyTipCard />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex justify-center">
          <div className="flex space-x-4">
            <Button 
              className="bg-gray-900 text-white hover:bg-gray-800 rounded-2xl px-6 py-3"
              onClick={handleAddMeal}
            >
              + Log Meal
            </Button>
            <Button 
              className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-900 rounded-2xl px-6 py-3"
              variant="outline"
              onClick={() => router.push('/dashboard/progress')}
            >
              View Progress
            </Button>
          </div>
        </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <OnboardingCheck>
          <DashboardContent />
        </OnboardingCheck>
      </ProtectedRoute>
    </AuthProvider>
  );
}