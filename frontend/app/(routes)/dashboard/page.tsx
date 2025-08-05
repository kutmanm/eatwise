'use client';

import { useRouter } from 'next/navigation';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { OnboardingCheck } from '@/components/onboarding/OnboardingCheck';

import { MealTimeline } from '@/components/dashboard/MealTimeline';
import { DailyTipCard } from '@/components/dashboard/DailyTipCard';
import { NutritionCircles } from '@/components/dashboard/NutritionCircles';
import { StatsOverview } from '@/components/dashboard/StatsOverview';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { WeightEntryForm, WeightStats } from '@/components/weight';
import { useTodaysProgress } from '@/hooks/useProgress';
import { useTodaysMeals } from '@/hooks/useMeals';
import { useUserStreak, useUserProfile, useUserGoals } from '@/hooks/useUser';
import { useAuthContext } from '@/components/auth/AuthProvider';

function DashboardContent() {
  const router = useRouter();
  const { signOut } = useAuthContext();
  const { progress, loading: progressLoading } = useTodaysProgress();
  const { meals, loading: mealsLoading } = useTodaysMeals();
  const { streak, loading: streakLoading } = useUserStreak();
  const { profile, loading: profileLoading } = useUserProfile();
  const { goals, loading: goalsLoading } = useUserGoals();

  const handleAddMeal = () => {
    router.push('/dashboard/add-meal');
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (progressLoading || mealsLoading || streakLoading || profileLoading) {
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Meals and Tips */}
          <div className="lg:col-span-3 space-y-6">
            <MealTimeline 
              meals={meals} 
              onAddMeal={handleAddMeal}
            />
            <DailyTipCard />
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Quick Weight Entry */}
            <WeightEntryForm showAsCard={true} />
            
            {/* Weight Stats */}
            <WeightStats />

            {/* Profile Summary */}
            {profile && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Goal:</span>
                      <span className="font-medium">
                        {profile.goal === 'weight_loss' ? 'Weight Loss' :
                         profile.goal === 'muscle_gain' ? 'Muscle Gain' :
                         profile.goal === 'maintain' ? 'Maintain' : 'Body Recomposition'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current:</span>
                      <span className="font-medium">{profile.current_weight} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Target:</span>
                      <span className="font-medium">{profile.target_weight} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Water Goal:</span>
                      <span className="font-medium">{profile.water_goal / 1000}L</span>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full text-sm"
                    onClick={() => router.push('/dashboard/profile')}
                  >
                    Update Profile
                  </Button>
                </CardContent>
              </Card>
            )}
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