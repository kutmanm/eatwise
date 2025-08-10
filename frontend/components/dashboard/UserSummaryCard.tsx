'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useUserProfile, useUserGoals } from '@/hooks/useUser';
import { useWeightLogs } from '@/hooks/useWeightLogs';
import type { UserProfile } from '@/types';

interface UserSummaryCardProps {
  onQuickAction?: (action: string) => void;
}

export function UserSummaryCard({ onQuickAction }: UserSummaryCardProps) {
  const { profile } = useUserProfile();
  const { goals } = useUserGoals();
  const { weightStats } = useWeightLogs();

  if (!profile) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-gray-500">Complete your profile to see your summary</p>
            <Button 
              className="mt-4"
              onClick={() => onQuickAction?.('complete-profile')}
            >
              Complete Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getProgressPercentage = () => {
    if (!profile) return 0;
    
    const { initial_weight, current_weight, target_weight, goal } = profile;
    
    if (goal === 'maintain') return 100;
    
    const totalChange = Math.abs(target_weight - initial_weight);
    const currentChange = Math.abs(current_weight - initial_weight);
    
    return Math.min(Math.round((currentChange / totalChange) * 100), 100);
  };

  const getDaysToGoal = () => {
    if (!profile.target_date) return null;
    
    const targetDate = new Date(profile.target_date);
    const today = new Date();
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };

  const getGoalMessage = () => {
    const progress = getProgressPercentage();
    const daysLeft = getDaysToGoal();
    
    if (profile.goal === 'maintain') {
      return "Keep up the great maintenance!";
    }
    
    if (progress >= 100) {
      return "🎉 Congratulations! You've reached your goal!";
    }
    
    if (progress >= 75) {
      return "🔥 So close! You're almost there!";
    }
    
    if (progress >= 50) {
      return "💪 Great progress! Keep it up!";
    }
    
    if (progress >= 25) {
      return "🌟 You're making steady progress!";
    }
    
    if (daysLeft && daysLeft < 30) {
      return "⏰ Time to accelerate your efforts!";
    }
    
    return "🚀 You've got this! Stay consistent!";
  };

  const getActivityBadge = () => {
    const labels = {
      sedentary: { label: 'Low Active', color: 'bg-gray-100 text-gray-800' },
      lightly_active: { label: 'Light Active', color: 'bg-blue-100 text-blue-800' },
      moderately_active: { label: 'Moderate', color: 'bg-green-100 text-green-800' },
      very_active: { label: 'Very Active', color: 'bg-yellow-100 text-yellow-800' },
      extremely_active: { label: 'Athlete', color: 'bg-red-100 text-red-800' },
    } as const;
    
    return labels[profile.activity_level as keyof typeof labels] || labels.sedentary;
  };

  const activityBadge = getActivityBadge();
  const progressPercentage = getProgressPercentage();
  const daysToGoal = getDaysToGoal();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Your Journey</CardTitle>
          <span className={`px-2 py-1 text-xs rounded-full ${activityBadge.color}`}>
            {activityBadge.label}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Overview */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Progress to Goal</span>
            <span className="text-sm text-gray-600">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-[#00b800] h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-sm text-center text-gray-600">
            {getGoalMessage()}
          </p>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">
              {profile.current_weight}kg
            </div>
            <div className="text-xs text-blue-700">Current Weight</div>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-600">
              {profile.target_weight}kg
            </div>
            <div className="text-xs text-green-700">Target Weight</div>
          </div>
        </div>

        {/* Timeline */}
        {daysToGoal !== null && (
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-lg font-bold text-purple-600">
              {daysToGoal}
            </div>
            <div className="text-xs text-purple-700">
              {daysToGoal === 0 ? 'Goal date reached!' : 
               daysToGoal === 1 ? 'day left' : 'days to goal'}
            </div>
          </div>
        )}

        {/* Weight Change */}
        {profile.current_weight !== profile.initial_weight && (
          <div className="flex justify-center">
            <div className={`px-3 py-2 rounded-lg text-sm font-medium ${
              profile.current_weight < profile.initial_weight 
                ? 'bg-green-100 text-green-800'
                : profile.current_weight > profile.initial_weight
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {profile.current_weight < profile.initial_weight ? '📉' : 
               profile.current_weight > profile.initial_weight ? '📈' : '➡️'}
              {' '}
              {(profile.current_weight - profile.initial_weight > 0 ? '+' : '')}
              {(profile.current_weight - profile.initial_weight).toFixed(1)}kg
              {' '}total change
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onQuickAction?.('log-weight')}
            className="text-xs"
          >
            📊 Log Weight
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onQuickAction?.('view-progress')}
            className="text-xs"
          >
            📈 View Progress
          </Button>
        </div>

        {/* Daily Goals */}
        {goals && (
          <div className="pt-3 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Today's Goals</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center">
                <div className="font-medium">{Math.round(goals.calorie_goal)}</div>
                <div className="text-gray-500">Calories</div>
              </div>
              <div className="text-center">
                <div className="font-medium">{(goals.water_goal / 1000).toFixed(1)}L</div>
                <div className="text-gray-500">Water</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}