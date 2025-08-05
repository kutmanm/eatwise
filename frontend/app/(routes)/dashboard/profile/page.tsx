'use client';
import { useState, useEffect } from 'react';
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
import { useUserProfile, useUser, useUserGoals } from '@/hooks/useUser';
import { useWeightLogs } from '@/hooks/useWeightLogs';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { usersApi } from '@/lib/api';
import { profileUpdateSchema, type ProfileUpdateFormData, type Gender, type ActivityLevel, type GoalType, type TimeFrame } from '@/types';

function ProfileContent() {
  const router = useRouter();
  const { user } = useUser();
  const { profile, updateProfile, loading: profileLoading } = useUserProfile();
  const { goals, refetch: refetchGoals } = useUserGoals();
  const { weightStats } = useWeightLogs();
  const { signOut } = useAuthContext();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'basic' | 'goals' | 'preferences' | 'timing'>('basic');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset
  } = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {}
  });

  // Reset form when profile loads
  useEffect(() => {
    if (profile) {
      reset({
        age: profile.age,
        gender: profile.gender,
        height: profile.height,
        initial_weight: profile.initial_weight,
        current_weight: profile.current_weight,
        target_weight: profile.target_weight,
        activity_level: profile.activity_level,
        goal: profile.goal,
        time_frame: profile.time_frame,
        target_date: profile.target_date,
        water_goal: profile.water_goal,
        breakfast_time: profile.breakfast_time,
        lunch_time: profile.lunch_time,
        dinner_time: profile.dinner_time,
      });
    }
  }, [profile, reset]);

  const watchedValues = watch();
  const watchedTimeFrame = watch('time_frame');

  const onSubmit = async (data: ProfileUpdateFormData) => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await updateProfile(data);
      
      setSuccess('Profile updated successfully!');
      refetchGoals(); // Refresh calculated goals
      setTimeout(() => setSuccess(''), 3000);
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

  const getGenderLabel = (gender: Gender) => {
    const labels = {
      male: 'Male',
      female: 'Female',
      other: 'Other',
      prefer_not_to_say: 'Prefer not to say'
    };
    return labels[gender];
  };

  const getActivityLabel = (level: ActivityLevel) => {
    const labels = {
      sedentary: 'Sedentary',
      lightly_active: 'Lightly Active',
      moderately_active: 'Moderately Active',
      very_active: 'Very Active',
      extremely_active: 'Extremely Active'
    };
    return labels[level];
  };

  const getGoalLabel = (goal: GoalType) => {
    const labels = {
      weight_loss: 'Weight Loss',
      muscle_gain: 'Muscle Gain',
      maintain: 'Maintain Weight',
      body_recomposition: 'Body Recomposition'
    };
    return labels[goal];
  };

  const getTimeFrameLabel = (timeFrame: TimeFrame) => {
    const labels = {
      '2_weeks': '2 Weeks',
      '1_month': '1 Month',
      '3_months': '3 Months',
      '6_months': '6 Months',
      '1_year': '1 Year',
      custom: 'Custom Date'
    };
    return labels[timeFrame];
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Profile Form */}
        <div className="lg:col-span-3 space-y-6">
          {/* Navigation Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'basic', label: 'Basic Info' },
                { id: 'goals', label: 'Goals & Timeline' },
                { id: 'preferences', label: 'Diet Preferences' },
                { id: 'timing', label: 'Meal Timing' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-[#00b800] text-[#00b800]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {success && (
              <div className="rounded-md bg-green-50 p-4">
                <p className="text-sm text-green-800">{success}</p>
              </div>
            )}

            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Demographics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <Label htmlFor="gender">Gender</Label>
                      <select
                        id="gender"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00b800] focus:border-transparent"
                        {...register('gender')}
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer_not_to_say">Prefer not to say</option>
                      </select>
                      {errors.gender && (
                        <p className="text-sm text-red-600">{errors.gender.message}</p>
                      )}
                    </div>
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

                  {/* Weight Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Weight Tracking</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="initial_weight">Starting Weight (kg)</Label>
                        <Input
                          id="initial_weight"
                          type="number"
                          placeholder="70"
                          error={errors.initial_weight?.message}
                          {...register('initial_weight', { valueAsNumber: true })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="current_weight">Current Weight (kg)</Label>
                        <Input
                          id="current_weight"
                          type="number"
                          placeholder="70"
                          error={errors.current_weight?.message}
                          {...register('current_weight', { valueAsNumber: true })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="target_weight">Target Weight (kg)</Label>
                        <Input
                          id="target_weight"
                          type="number"
                          placeholder="65"
                          error={errors.target_weight?.message}
                          {...register('target_weight', { valueAsNumber: true })}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="activity_level">Activity Level</Label>
                    <select
                      id="activity_level"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00b800] focus:border-transparent"
                      {...register('activity_level')}
                    >
                      <option value="sedentary">Sedentary (little to no exercise)</option>
                      <option value="lightly_active">Lightly Active (1-3 days/week)</option>
                      <option value="moderately_active">Moderately Active (3-5 days/week)</option>
                      <option value="very_active">Very Active (6-7 days/week)</option>
                      <option value="extremely_active">Extremely Active (2x/day or intense)</option>
                    </select>
                    {errors.activity_level && (
                      <p className="text-sm text-red-600">{errors.activity_level.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Goals & Timeline Tab */}
            {activeTab === 'goals' && (
              <Card>
                <CardHeader>
                  <CardTitle>Goals & Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="goal">Primary Goal</Label>
                    <select
                      id="goal"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00b800] focus:border-transparent"
                      {...register('goal')}
                    >
                      <option value="weight_loss">Weight Loss</option>
                      <option value="muscle_gain">Muscle Gain</option>
                      <option value="maintain">Maintain Weight</option>
                      <option value="body_recomposition">Body Recomposition</option>
                    </select>
                    {errors.goal && (
                      <p className="text-sm text-red-600">{errors.goal.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="time_frame">Time Frame</Label>
                    <select
                      id="time_frame"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00b800] focus:border-transparent"
                      {...register('time_frame')}
                    >
                      <option value="2_weeks">2 Weeks</option>
                      <option value="1_month">1 Month</option>
                      <option value="3_months">3 Months</option>
                      <option value="6_months">6 Months</option>
                      <option value="1_year">1 Year</option>
                      <option value="custom">Custom Date</option>
                    </select>
                    {errors.time_frame && (
                      <p className="text-sm text-red-600">{errors.time_frame.message}</p>
                    )}
                  </div>

                  {watchedTimeFrame === 'custom' && (
                    <div>
                      <Label htmlFor="target_date">Target Date</Label>
                      <Input
                        id="target_date"
                        type="date"
                        error={errors.target_date?.message}
                        {...register('target_date')}
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="water_goal">Daily Water Goal (ml)</Label>
                    <Input
                      id="water_goal"
                      type="number"
                      placeholder="2000"
                      error={errors.water_goal?.message}
                      {...register('water_goal', { valueAsNumber: true })}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Diet Preferences Tab */}
            {activeTab === 'preferences' && (
              <Card>
                <CardHeader>
                  <CardTitle>Diet Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-sm text-gray-600">
                    Diet preferences will be implemented in the next update. This will include dietary restrictions, allergies, cuisine preferences, and food likes/dislikes.
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Meal Timing Tab */}
            {activeTab === 'timing' && (
              <Card>
                <CardHeader>
                  <CardTitle>Meal Timing Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="breakfast_time">Breakfast Time</Label>
                      <Input
                        id="breakfast_time"
                        type="time"
                        error={errors.breakfast_time?.message}
                        {...register('breakfast_time')}
                      />
                    </div>

                    <div>
                      <Label htmlFor="lunch_time">Lunch Time</Label>
                      <Input
                        id="lunch_time"
                        type="time"
                        error={errors.lunch_time?.message}
                        {...register('lunch_time')}
                      />
                    </div>

                    <div>
                      <Label htmlFor="dinner_time">Dinner Time</Label>
                      <Input
                        id="dinner_time"
                        type="time"
                        error={errors.dinner_time?.message}
                        {...register('dinner_time')}
                      />
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    Snack timing preferences will be implemented in the next update.
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end">
              <Button
                type="submit"
                loading={saving}
                className="px-8"
              >
                Save Changes
              </Button>
            </div>
          </form>
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
                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-[#00b800]/10 p-3 rounded-lg text-center">
                    <div className="text-xl font-bold text-[#00b800]">
                      {Math.round(goals.calorie_goal)}
                    </div>
                    <div className="text-xs text-[#00b800]/80">Calories/day</div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-blue-50 p-2 rounded text-center">
                      <div className="text-sm font-bold text-blue-600">
                        {Math.round(goals.protein)}g
                      </div>
                      <div className="text-xs text-blue-700">Protein</div>
                    </div>
                    <div className="bg-green-50 p-2 rounded text-center">
                      <div className="text-sm font-bold text-green-600">
                        {Math.round(goals.carbs)}g
                      </div>
                      <div className="text-xs text-green-700">Carbs</div>
                    </div>
                    <div className="bg-yellow-50 p-2 rounded text-center">
                      <div className="text-sm font-bold text-yellow-600">
                        {Math.round(goals.fat)}g
                      </div>
                      <div className="text-xs text-yellow-700">Fat</div>
                    </div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <div className="text-lg font-bold text-blue-600">
                      {goals.water_goal / 1000}L
                    </div>
                    <div className="text-xs text-blue-700">Water/day</div>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 text-center">
                  Goals update automatically when you change your profile
                </div>
              </CardContent>
            </Card>
          )}

          {/* Weight Progress */}
          {profile && (
            <Card>
              <CardHeader>
                <CardTitle>Weight Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Starting:</span>
                    <span className="font-medium">{profile.initial_weight} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current:</span>
                    <span className="font-medium">{profile.current_weight} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Target:</span>
                    <span className="font-medium">{profile.target_weight} kg</span>
                  </div>
                  {profile.current_weight !== profile.initial_weight && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Progress:</span>
                      <span className={`font-medium ${
                        profile.current_weight < profile.initial_weight ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {(profile.current_weight - profile.initial_weight > 0 ? '+' : '')}
                        {(profile.current_weight - profile.initial_weight).toFixed(1)} kg
                      </span>
                    </div>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full text-sm"
                  onClick={() => router.push('/dashboard/progress')}
                >
                  View Weight History
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Profile Summary */}
          {profile && (
            <Card>
              <CardHeader>
                <CardTitle>Profile Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Age:</span>
                    <span className="font-medium">{profile.age} years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gender:</span>
                    <span className="font-medium">{getGenderLabel(profile.gender)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Height:</span>
                    <span className="font-medium">{profile.height} cm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">BMI:</span>
                    <span className="font-medium">
                      {(profile.current_weight / Math.pow(profile.height / 100, 2)).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Activity:</span>
                    <span className="font-medium text-xs">
                      {getActivityLabel(profile.activity_level)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Goal:</span>
                    <span className="font-medium text-xs">
                      {getGoalLabel(profile.goal)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Timeline:</span>
                    <span className="font-medium text-xs">
                      {getTimeFrameLabel(profile.time_frame)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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