'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usersApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { profileSchema, type ProfileFormData } from '@/types';
import { getActivityLevelLabel, getGoalLabel } from '@/lib/utils';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    trigger,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const watchedValues = watch();

  const nextStep = async () => {
    let fieldsToValidate: (keyof ProfileFormData)[] = [];
    
    if (step === 1) {
      fieldsToValidate = ['age', 'height', 'weight'];
    } else if (step === 2) {
      fieldsToValidate = ['activity_level', 'goal'];
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

  const calculateCalorieGoal = () => {
    const { age, height, weight, activity_level, goal } = watchedValues;
    
    if (!age || !height || !weight || !activity_level || !goal) {
      return null;
    }

    // BMR calculation (Mifflin-St Jeor Equation - assuming male for simplicity)
    const bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    
    // Activity multipliers
    const activityMultipliers = {
      low: 1.2,
      medium: 1.55,
      high: 1.9,
    };
    
    const tdee = bmr * activityMultipliers[activity_level];
    
    // Goal adjustments
    let calorieGoal = tdee;
    if (goal === 'weight_loss') {
      calorieGoal = tdee - 500;
    } else if (goal === 'muscle_gain') {
      calorieGoal = tdee + 300;
    }

    return Math.round(calorieGoal);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-neutral-900">
            Let's set up your profile
          </h2>
          <p className="mt-2 text-center text-sm text-neutral-600">
            Step {step} of 3
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-neutral-200 rounded-full h-2">
          <div 
            className="bg-primary-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          {error && (
            <div className="rounded-md bg-error/10 p-4">
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-neutral-900">Basic Information</h3>
                <p className="text-sm text-neutral-600">Tell us about yourself</p>
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
          )}

          {/* Step 2: Activity & Goals */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-neutral-900">Activity & Goals</h3>
                <p className="text-sm text-neutral-600">How active are you and what's your goal?</p>
              </div>

              <div>
                <Label htmlFor="activity_level">Activity Level</Label>
                <select
                  id="activity_level"
                  className="form-input"
                  {...register('activity_level')}
                >
                  <option value="">Select activity level</option>
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
                  className="form-input"
                  {...register('goal')}
                >
                  <option value="">Select your goal</option>
                  <option value="weight_loss">Weight Loss</option>
                  <option value="muscle_gain">Muscle Gain</option>
                  <option value="maintain">Maintain Weight</option>
                </select>
                {errors.goal && (
                  <p className="text-sm text-error">{errors.goal.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Review & Calculation */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-neutral-900">Your Plan</h3>
                <p className="text-sm text-neutral-600">Review your information and daily calorie goal</p>
              </div>

              <div className="bg-white rounded-lg p-6 border border-neutral-200">
                <h4 className="font-semibold text-neutral-900 mb-4">Profile Summary</h4>
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
                    <span className="text-neutral-600">Activity Level:</span>
                    <span className="font-medium">{getActivityLevelLabel(watchedValues.activity_level || '')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Goal:</span>
                    <span className="font-medium">{getGoalLabel(watchedValues.goal || '')}</span>
                  </div>
                </div>
              </div>

              {calculateCalorieGoal() && (
                <div className="bg-primary-50 rounded-lg p-6 border border-primary-200">
                  <h4 className="font-semibold text-primary-900 mb-2">Your Daily Calorie Goal</h4>
                  <div className="text-3xl font-bold text-primary-600">
                    {calculateCalorieGoal()} calories
                  </div>
                  <p className="text-sm text-primary-700 mt-2">
                    This is calculated based on your profile and goals. You can adjust this later in your settings.
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
            
            {step < 3 ? (
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