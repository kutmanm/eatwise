'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { OnboardingCheck } from '@/components/onboarding/OnboardingCheck';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { CalorieChart } from '@/components/charts/CalorieChart';
import { MacroChart } from '@/components/charts/MacroChart';
import { WeeklyProgressChart } from '@/components/charts/WeeklyProgressChart';
import { GoalProgressChart } from '@/components/charts/GoalProgressChart';
import { WeightTrendChart } from '@/components/charts/WeightTrendChart';
import { useWeeklyProgress, useTodaysProgress } from '@/hooks/useProgress';
import { useUserProfile } from '@/hooks/useUser';

type TimeRange = '7d' | '30d' | '90d';
type ChartView = 'overview' | 'calories' | 'macros' | 'goals' | 'weight';

function ProgressContent() {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [activeView, setActiveView] = useState<ChartView>('overview');
  
  const { progress: weeklyProgress, loading: weeklyLoading } = useWeeklyProgress(timeRange);
  const { progress: todayProgress, loading: todayLoading } = useTodaysProgress();
  const { profile, loading: profileLoading } = useUserProfile();

  const loading = weeklyLoading || todayLoading || profileLoading;

  // Mock weight data - in real app this would come from backend
  const mockWeightData = [
    { date: '2024-01-01', weight: 75 },
    { date: '2024-01-03', weight: 74.8 },
    { date: '2024-01-05', weight: 74.5 },
    { date: '2024-01-07', weight: 74.3 },
    { date: '2024-01-09', weight: 74.1 },
    { date: '2024-01-11', weight: 73.9 },
    { date: '2024-01-13', weight: 73.7 },
  ];

  const goals = {
    calories: profile?.calorie_goal || 2000,
    protein: profile?.protein_goal || 150,
    carbs: profile?.carb_goal ?? 200,
    fat: profile?.fat_goal || 65,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#00b800]" />
      </div>
    );
  }

  const renderChartView = () => {
    switch (activeView) {
      case 'calories':
        return (
          <CalorieChart 
            data={weeklyProgress ? [weeklyProgress] : []} 
            calorieGoal={goals.calories}
          />
        );
      
      case 'macros':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MacroChart data={todayProgress || { date: new Date().toISOString().split('T')[0], meal_count: 0 }} />
            <WeeklyProgressChart data={weeklyProgress ? [weeklyProgress] : []} />
          </div>
        );
      
      case 'goals':
        return (
          <GoalProgressChart 
            data={weeklyProgress ? [weeklyProgress] : []} 
            goals={goals}
          />
        );
      
      case 'weight':
        return (
          <WeightTrendChart 
            data={mockWeightData}
            goalWeight={profile?.target_weight || undefined}
          />
        );
      
      default: // overview
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CalorieChart 
              data={weeklyProgress ? [weeklyProgress] : []} 
              calorieGoal={goals.calories}
            />
            <MacroChart data={todayProgress || { date: new Date().toISOString().split('T')[0], meal_count: 0 }} />
            <div className="lg:col-span-2">
              <GoalProgressChart 
                data={weeklyProgress ? [weeklyProgress] : []} 
                goals={goals}
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="mb-8 space-y-4">
          {/* Time Range Selector */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                <div className="flex space-x-2">
                  {[
                    { key: '7d' as TimeRange, label: 'Last 7 days' },
                    { key: '30d' as TimeRange, label: 'Last 30 days' },
                    { key: '90d' as TimeRange, label: 'Last 90 days' },
                  ].map((range) => (
                    <Button
                      key={range.key}
                      variant={timeRange === range.key ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTimeRange(range.key)}
                    >
                      {range.label}
                    </Button>
                  ))}
                </div>

                {/* Chart View Selector */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'overview' as ChartView, label: 'Overview', icon: '📊' },
                    { key: 'calories' as ChartView, label: 'Calories', icon: '⚡' },
                    { key: 'macros' as ChartView, label: 'Macros', icon: '🥗' },
                    { key: 'goals' as ChartView, label: 'Goals', icon: '🎯' },
                    { key: 'weight' as ChartView, label: 'Weight', icon: '⚖️' },
                  ].map((view) => (
                    <Button
                      key={view.key}
                      variant={activeView === view.key ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setActiveView(view.key)}
                    >
                      <span className="mr-1">{view.icon}</span>
                      {view.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="space-y-6">
          {renderChartView()}
        </div>

        {/* Summary Stats */}
        <div className="mt-8">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                {timeRange === '7d' ? 'Weekly' : timeRange === '30d' ? 'Monthly' : 'Quarterly'} Summary
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">
                    {weeklyProgress?.daily_summaries?.length || 0}
                  </div>
                  <div className="text-sm text-neutral-600">Days logged</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {Math.round(
                      (weeklyProgress?.daily_summaries?.reduce((sum: number, day: any) => sum + (day.calories || 0), 0) || 0) / 
                      (weeklyProgress?.daily_summaries?.length || 1)
                    )}
                  </div>
                  <div className="text-sm text-neutral-600">Avg calories/day</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(
                      (weeklyProgress?.daily_summaries?.reduce((sum: number, day: any) => sum + (day.protein || 0), 0) || 0) / 
                      (weeklyProgress?.daily_summaries?.length || 1)
                    )}g
                  </div>
                  <div className="text-sm text-neutral-600">Avg protein/day</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(
                      ((weeklyProgress?.daily_summaries?.filter((day: any) => (day.calories || 0) >= goals.calories * 0.9).length || 0) / 
                      (weeklyProgress?.daily_summaries?.length || 1)) * 100
                    )}%
                  </div>
                  <div className="text-sm text-neutral-600">Goal achievement</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex justify-center">
          <div className="flex space-x-4">
            <Button size="lg" onClick={() => router.push('/dashboard/add-meal')}>
              + Log Meal
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => router.push('/dashboard/history')}
            >
              View History
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => router.push('/dashboard/profile')}
            >
              Edit Goals
            </Button>
          </div>
        </div>
    </div>
  );
}

export default function ProgressPage() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <OnboardingCheck>
          <ProgressContent />
        </OnboardingCheck>
      </ProtectedRoute>
    </AuthProvider>
  );
}