'use client';

import { useRouter } from 'next/navigation';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { OnboardingCheck } from '@/components/onboarding/OnboardingCheck';
import { NutritionCard } from '@/components/dashboard/NutritionCard';
import { MealTimeline } from '@/components/dashboard/MealTimeline';
import { DailyTipCard } from '@/components/dashboard/DailyTipCard';
import { StatsOverview } from '@/components/dashboard/StatsOverview';
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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-neutral-900">EatWise</h1>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard/profile')}
              >
                Profile
              </Button>
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard/history')}
              >
                History
              </Button>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-neutral-900 mb-2">
            Good day! 👋
          </h2>
          <p className="text-neutral-600">
            Here's your nutrition overview for today
          </p>
        </div>

        {/* Stats Overview */}
        <div className="mb-8">
          <StatsOverview 
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
            streak={streak}
          />
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Nutrition Card */}
          <div className="lg:col-span-1">
            <NutritionCard 
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

          {/* Right Column - Meals and Tips */}
          <div className="lg:col-span-2 space-y-6">
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
            <Button size="lg" onClick={handleAddMeal}>
              + Log Meal
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => router.push('/dashboard/progress')}
            >
              View Progress
            </Button>
          </div>
        </div>
      </main>
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