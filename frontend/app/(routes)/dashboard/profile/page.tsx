'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { OnboardingCheck } from '@/components/onboarding/OnboardingCheck';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useUserProfile, useUser } from '@/hooks/useUser';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { usersApi } from '@/lib/api';
import { profileSchema, type ProfileFormData } from '@/types';
import { getActivityLevelLabel, getGoalLabel } from '@/lib/utils';

function ProfileContent() {
  const router = useRouter();
  const { user, updateUser } = useUser();
  const { profile, updateProfile, loading: profileLoading } = useUserProfile();
  const { signOut } = useAuthContext();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      age: profile?.age || 25,
      height: profile?.height || 170,
      weight: profile?.weight || 70,
      activity_level: profile?.activity_level || 'medium',
      goal: profile?.goal || 'maintain',
    }
  });

  const watchedValues = watch();

  const calculateGoals = () => {
    const { age, height, weight, activity_level, goal } = watchedValues;
    
    if (!age || !height || !weight || !activity_level || !goal) {
      return null;
    }

    // BMR calculation (Mifflin-St Jeor Equation)
    const bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    
    const activityMultipliers = {
      low: 1.2,
      medium: 1.55,
      high: 1.9,
    };
    
    const tdee = bmr * activityMultipliers[activity_level];
    
    let calorieGoal = tdee;
    if (goal === 'weight_loss') {
      calorieGoal = tdee - 500;
    } else if (goal === 'muscle_gain') {
      calorieGoal = tdee + 300;
    }

    const proteinGoal = weight * (goal === 'muscle_gain' ? 2.2 : 1.6);
    const fatGoal = (calorieGoal * 0.25) / 9;
    const carbsGoal = (calorieGoal - (proteinGoal * 4) - (fatGoal * 9)) / 4;

    return {
      calories: Math.round(calorieGoal),
      protein: Math.round(proteinGoal),
      carbs: Math.round(carbsGoal),
      fat: Math.round(fatGoal),
    };
  };

  const onSubmit = async (data: ProfileFormData) => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await usersApi.updateUserProfile(data);
      
      if (response.error) {
        setError(response.error);
      } else {
        setSuccess('Profile updated successfully!');
        updateProfile(response.data!);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };



  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#00b800]" />
      </div>
    );
  }

  const goals = calculateGoals();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Profile & Goals</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {error && (
                    <div className="rounded-md bg-error/10 p-4">
                      <p className="text-sm text-error">{error}</p>
                    </div>
                  )}

                  {success && (
                    <div className="rounded-md bg-green-50 p-4">
                      <p className="text-sm text-green-800">{success}</p>
                    </div>
                  )}

                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        placeholder="25"
                        error={errors.age?.message}
                        {...register('age', { valueAsNumber: true })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="height">Height (cm)</Label>
                      <Input
                        id="height"
                        type="number"
                        placeholder="170"
                        error={errors.height?.message}
                        {...register('height', { valueAsNumber: true })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="weight">Weight (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        placeholder="70"
                        error={errors.weight?.message}
                        {...register('weight', { valueAsNumber: true })}
                      />
                    </div>
                  </div>

                  {/* Activity & Goals */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="activity_level">Activity Level</Label>
                      <select
                        id="activity_level"
                        className="form-input w-full"
                        {...register('activity_level')}
                      >
                        <option value="low">Sedentary (little to no exercise)</option>
                        <option value="medium">Moderately Active (3-5 days/week)</option>
                        <option value="high">Very Active (6-7 days/week)</option>
                      </select>
                      {errors.activity_level && (
                        <p className="text-sm text-error">{errors.activity_level.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="goal">Primary Goal</Label>
                      <select
                        id="goal"
                        className="form-input w-full"
                        {...register('goal')}
                      >
                        <option value="weight_loss">Weight Loss</option>
                        <option value="muscle_gain">Muscle Gain</option>
                        <option value="maintain">Maintain Weight</option>
                      </select>
                      {errors.goal && (
                        <p className="text-sm text-error">{errors.goal.message}</p>
                      )}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    loading={saving}
                    className="w-full md:w-auto"
                  >
                    Save Changes
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Goals */}
            {goals && (
              <Card>
                <CardHeader>
                  <CardTitle>Calculated Goals</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#00b800]/10 p-3 rounded-lg text-center">
                      <div className="text-lg font-bold text-[#00b800]">
                        {goals.calories}
                      </div>
                      <div className="text-xs text-[#00b800]/80">Calories/day</div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg text-center">
                      <div className="text-lg font-bold text-blue-600">
                        {goals.protein}g
                      </div>
                      <div className="text-xs text-blue-700">Protein/day</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg text-center">
                      <div className="text-lg font-bold text-green-600">
                        {goals.carbs}g
                      </div>
                      <div className="text-xs text-green-700">Carbs/day</div>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg text-center">
                      <div className="text-lg font-bold text-yellow-600">
                        {goals.fat}g
                      </div>
                      <div className="text-xs text-yellow-700">Fat/day</div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-neutral-500 text-center">
                    Goals update automatically when you change your profile
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Profile Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Age:</span>
                    <span className="font-medium">{watchedValues.age} years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Height:</span>
                    <span className="font-medium">{watchedValues.height} cm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Weight:</span>
                    <span className="font-medium">{watchedValues.weight} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">BMI:</span>
                    <span className="font-medium">
                      {watchedValues.height && watchedValues.weight ? 
                        (watchedValues.weight / Math.pow(watchedValues.height / 100, 2)).toFixed(1) : 
                        'N/A'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Activity:</span>
                    <span className="font-medium">
                      {getActivityLevelLabel(watchedValues.activity_level || '')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Goal:</span>
                    <span className="font-medium">
                      {getGoalLabel(watchedValues.goal || '')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push('/dashboard/history')}
                >
                  Meal History
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full text-red-600 border-red-300 hover:bg-red-50"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <OnboardingCheck>
          <ProfileContent />
        </OnboardingCheck>
      </ProtectedRoute>
    </AuthProvider>
  );
}