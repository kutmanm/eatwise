'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usersApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { profileSchema, type ProfileFormData } from '@/types';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    trigger,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      water_goal: 2000,
      breakfast_time: '08:00',
      lunch_time: '12:30',
      dinner_time: '19:00',
    },
  });

  const watchedValues = watch();
  const watchedTimeFrame = watch('time_frame');
  const watchedGoal = watch('goal');

  // Auto-calculate target date when time frame changes
  useEffect(() => {
    if (watchedTimeFrame && watchedTimeFrame !== 'custom') {
      const now = new Date();
      let targetDate = new Date();
      
      switch (watchedTimeFrame) {
        case '2_weeks':
          targetDate.setDate(now.getDate() + 14);
          break;
        case '1_month':
          targetDate.setMonth(now.getMonth() + 1);
          break;
        case '3_months':
          targetDate.setMonth(now.getMonth() + 3);
          break;
        case '6_months':
          targetDate.setMonth(now.getMonth() + 6);
          break;
        case '1_year':
          targetDate.setFullYear(now.getFullYear() + 1);
          break;
      }
      
      setValue('target_date', targetDate.toISOString().split('T')[0]);
    }
  }, [watchedTimeFrame, setValue]);

  const nextStep = async () => {
    let fieldsToValidate: (keyof ProfileFormData)[] = [];
    
    if (step === 1) {
      fieldsToValidate = ['age', 'gender', 'height'];
    } else if (step === 2) {
      fieldsToValidate = ['initial_weight', 'current_weight', 'target_weight'];
    } else if (step === 3) {
      fieldsToValidate = ['activity_level', 'goal'];
    } else if (step === 4) {
      fieldsToValidate = ['time_frame', 'water_goal'];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const onSubmit = async (data: ProfileFormData) => {
    setLoading(true);
    setError('');

    try {
      const response = await usersApi.createUserProfile(data);
      if (response.error) {
        setError(response.error);
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('An error occurred while creating your profile');
    } finally {
      setLoading(false);
    }
  };

  const calculateGoals = () => {
    const { age, height, current_weight, activity_level, goal, gender } = watchedValues;
    
    if (!age || !height || !current_weight || !activity_level || !goal || !gender) {
      return null;
    }

    // Gender-specific BMR calculation
    const isMale = gender === 'male';
    const bmr = isMale 
      ? 88.362 + (13.397 * current_weight) + (4.799 * height) - (5.677 * age)
      : 447.593 + (9.247 * current_weight) + (3.098 * height) - (4.330 * age);
    
    // Enhanced activity multipliers
    const activityMultipliers = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extremely_active: 1.9,
    };
    
    const tdee = bmr * activityMultipliers[activity_level];
    
    // Goal-specific adjustments
    let calorieGoal = tdee;
    if (goal === 'weight_loss') {
      calorieGoal = tdee - 500;
    } else if (goal === 'muscle_gain') {
      calorieGoal = tdee + 300;
    } else if (goal === 'body_recomposition') {
      calorieGoal = tdee - 200;
    }

    // Macro calculations
    const proteinGoal = current_weight * (goal === 'muscle_gain' ? 2.2 : 1.6);
    const fatGoal = (calorieGoal * 0.25) / 9;
    const carbsGoal = (calorieGoal - (proteinGoal * 4) - (fatGoal * 9)) / 4;

    return {
      calories: Math.round(calorieGoal),
      protein: Math.round(proteinGoal),
      carbs: Math.round(carbsGoal),
      fat: Math.round(fatGoal),
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
    };
  };

  const getGenderLabel = (gender: string) => {
    const labels = { male: 'Male', female: 'Female', other: 'Other', prefer_not_to_say: 'Prefer not to say' } as const;
    return labels[gender as keyof typeof labels] ?? '';
  };

  const getActivityLabel = (level: string) => {
    const labels = {
      sedentary: 'Sedentary (little/no exercise)',
      lightly_active: 'Lightly Active (1-3 days/week)',
      moderately_active: 'Moderately Active (3-5 days/week)',
      very_active: 'Very Active (6-7 days/week)',
      extremely_active: 'Extremely Active (2x/day or intense)',
    } as const;
    return labels[level as keyof typeof labels] ?? '';
  };

  const getGoalLabel = (goal: string) => {
    const labels = {
      weight_loss: 'Weight Loss',
      muscle_gain: 'Muscle Gain',
      maintain: 'Maintain Weight',
      body_recomposition: 'Body Recomposition',
    } as const;
    return labels[goal as keyof typeof labels] ?? '';
  };

  const getTimeFrameLabel = (timeFrame: string) => {
    const labels = {
      '2_weeks': '2 Weeks',
      '1_month': '1 Month',
      '3_months': '3 Months',
      '6_months': '6 Months',
      '1_year': '1 Year',
      custom: 'Custom Date',
    } as const;
    return labels[timeFrame as keyof typeof labels] ?? '';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-neutral-900">
            Let's set up your profile
          </h2>
          <p className="mt-2 text-center text-sm text-neutral-600">
            Step {step} of 5
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-neutral-200 rounded-full h-2">
          <div 
            className="bg-[#00b800] h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          {error && (
            <div className="rounded-md bg-error/10 p-4">
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

          {/* Step 1: Basic Demographics */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-neutral-900">About You</h3>
                <p className="text-sm text-neutral-600">Let's start with some basic information</p>
              </div>

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
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
                {errors.gender && (
                  <p className="text-sm text-red-600">{errors.gender.message}</p>
                )}
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
            </div>
          )}

          {/* Step 2: Weight Information */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-neutral-900">Weight Tracking</h3>
                <p className="text-sm text-neutral-600">Help us understand your weight journey</p>
              </div>

              <div>
                <Label htmlFor="initial_weight">Starting Weight (kg)</Label>
                <Input
                  id="initial_weight"
                  type="number"
                  step="0.1"
                  placeholder="70.0"
                  error={errors.initial_weight?.message}
                  {...register('initial_weight', { valueAsNumber: true })}
                />
                <p className="text-xs text-gray-500 mt-1">What was your weight when you started your journey?</p>
              </div>

              <div>
                <Label htmlFor="current_weight">Current Weight (kg)</Label>
                <Input
                  id="current_weight"
                  type="number"
                  step="0.1"
                  placeholder="70.0"
                  error={errors.current_weight?.message}
                  {...register('current_weight', { valueAsNumber: true })}
                />
                <p className="text-xs text-gray-500 mt-1">What do you weigh right now?</p>
              </div>

              <div>
                <Label htmlFor="target_weight">Target Weight (kg)</Label>
                <Input
                  id="target_weight"
                  type="number"
                  step="0.1"
                  placeholder="65.0"
                  error={errors.target_weight?.message}
                  {...register('target_weight', { valueAsNumber: true })}
                />
                <p className="text-xs text-gray-500 mt-1">What's your goal weight?</p>
              </div>
            </div>
          )}

          {/* Step 3: Activity & Goals */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-neutral-900">Activity & Goals</h3>
                <p className="text-sm text-neutral-600">How active are you and what's your goal?</p>
              </div>

              <div>
                <Label htmlFor="activity_level">Activity Level</Label>
                <select
                  id="activity_level"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00b800] focus:border-transparent"
                  {...register('activity_level')}
                >
                  <option value="">Select activity level</option>
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

              <div>
                <Label htmlFor="goal">Primary Goal</Label>
                <select
                  id="goal"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00b800] focus:border-transparent"
                  {...register('goal')}
                >
                  <option value="">Select your goal</option>
                  <option value="weight_loss">Weight Loss</option>
                  <option value="muscle_gain">Muscle Gain</option>
                  <option value="maintain">Maintain Weight</option>
                  <option value="body_recomposition">Body Recomposition</option>
                </select>
                {errors.goal && (
                  <p className="text-sm text-red-600">{errors.goal.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Timeline & Preferences */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-neutral-900">Timeline & Goals</h3>
                <p className="text-sm text-neutral-600">Set your timeline and daily targets</p>
              </div>

              <div>
                <Label htmlFor="time_frame">Target Timeframe</Label>
                <select
                  id="time_frame"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00b800] focus:border-transparent"
                  {...register('time_frame')}
                >
                  <option value="">Select timeframe</option>
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
                <p className="text-xs text-gray-500 mt-1">Recommended: 2000-3000ml per day</p>
              </div>

              <div className="space-y-3">
                <Label>Meal Times (Optional)</Label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-gray-600">Breakfast</label>
                    <Input
                      type="time"
                      {...register('breakfast_time')}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Lunch</label>
                    <Input
                      type="time"
                      {...register('lunch_time')}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Dinner</label>
                    <Input
                      type="time"
                      {...register('dinner_time')}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Review & Summary */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-neutral-900">Your Personalized Plan</h3>
                <p className="text-sm text-neutral-600">Review your profile and calculated goals</p>
              </div>

              <div className="bg-white rounded-lg p-6 border border-neutral-200">
                <h4 className="font-semibold text-neutral-900 mb-4">Profile Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Age:</span>
                    <span className="font-medium">{watchedValues.age} years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Gender:</span>
                    <span className="font-medium">{watchedValues.gender ? getGenderLabel(watchedValues.gender) : ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Height:</span>
                    <span className="font-medium">{watchedValues.height} cm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Current Weight:</span>
                    <span className="font-medium">{watchedValues.current_weight} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Target Weight:</span>
                    <span className="font-medium">{watchedValues.target_weight} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Activity Level:</span>
                    <span className="font-medium">{watchedValues.activity_level ? getActivityLabel(watchedValues.activity_level) : ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Goal:</span>
                    <span className="font-medium">{watchedValues.goal ? getGoalLabel(watchedValues.goal) : ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Timeline:</span>
                    <span className="font-medium">{watchedValues.time_frame ? getTimeFrameLabel(watchedValues.time_frame) : ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Water Goal:</span>
                    <span className="font-medium">{(watchedValues.water_goal || 0) / 1000}L/day</span>
                  </div>
                </div>
              </div>

              {calculateGoals() && (
                <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-4">Your Calculated Goals</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {calculateGoals()?.calories}
                      </div>
                      <div className="text-xs text-green-700">Calories/day</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {calculateGoals()?.protein}g
                      </div>
                      <div className="text-xs text-blue-700">Protein/day</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {calculateGoals()?.carbs}g
                      </div>
                      <div className="text-xs text-yellow-700">Carbs/day</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {calculateGoals()?.fat}g
                      </div>
                      <div className="text-xs text-purple-700">Fat/day</div>
                    </div>
                  </div>
                  <p className="text-sm text-green-700 mt-4 text-center">
                    Based on your BMR of {calculateGoals()?.bmr} and TDEE of {calculateGoals()?.tdee} calories. 
                    You can adjust these later in your profile settings.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between space-x-4">
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                className="flex-1"
              >
                Previous
              </Button>
            )}
            
            {step < 5 ? (
              <Button
                type="button"
                onClick={nextStep}
                className={step === 1 ? 'w-full' : 'flex-1'}
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                loading={loading}
                className="flex-1"
              >
                Complete Setup
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}