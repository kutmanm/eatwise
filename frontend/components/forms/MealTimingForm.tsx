'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { z } from 'zod';

const mealTimingSchema = z.object({
  breakfast_time: z.string().optional(),
  lunch_time: z.string().optional(),
  dinner_time: z.string().optional(),
  snack_times: z.array(z.string()).optional(),
  eating_window_start: z.string().optional(),
  eating_window_end: z.string().optional(),
  intermittent_fasting: z.boolean().optional(),
  meal_frequency: z.enum(['3_meals', '4_meals', '5_meals', '6_meals']).optional(),
  late_night_eating: z.boolean().optional(),
});

export type MealTimingFormData = z.infer<typeof mealTimingSchema>;

interface MealTimingFormProps {
  initialData?: MealTimingFormData;
  onSubmit: (data: MealTimingFormData) => Promise<void>;
  loading?: boolean;
}

export function MealTimingForm({ initialData, onSubmit, loading = false }: MealTimingFormProps) {
  const [customSnackTime, setCustomSnackTime] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<MealTimingFormData>({
    resolver: zodResolver(mealTimingSchema),
    defaultValues: initialData || {
      breakfast_time: '08:00',
      lunch_time: '12:30',
      dinner_time: '19:00',
      snack_times: [],
      intermittent_fasting: false,
      meal_frequency: '3_meals',
      late_night_eating: false,
    },
  });

  const watchedValues = watch();
  const isIntermittentFasting = watch('intermittent_fasting');

  const addSnackTime = () => {
    if (customSnackTime.trim()) {
      const currentSnacks = watchedValues.snack_times || [];
      setValue('snack_times', [...currentSnacks, customSnackTime]);
      setCustomSnackTime('');
    }
  };

  const removeSnackTime = (timeToRemove: string) => {
    const currentSnacks = watchedValues.snack_times || [];
    setValue('snack_times', currentSnacks.filter(time => time !== timeToRemove));
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Meal Timing Preferences</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Meal Frequency */}
          <div>
            <Label htmlFor="meal_frequency">Preferred Meal Frequency</Label>
            <select
              id="meal_frequency"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00b800] focus:border-transparent"
              {...register('meal_frequency')}
            >
              <option value="3_meals">3 Meals per day</option>
              <option value="4_meals">4 Meals per day</option>
              <option value="5_meals">5 Meals per day</option>
              <option value="6_meals">6 Meals per day</option>
            </select>
          </div>

          {/* Intermittent Fasting */}
          <div className="space-y-3">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                {...register('intermittent_fasting')}
                className="rounded border-gray-300 text-[#00b800] focus:ring-[#00b800]"
              />
              <span className="font-medium">I practice intermittent fasting</span>
            </label>

            {isIntermittentFasting && (
              <div className="grid grid-cols-2 gap-4 pl-6">
                <div>
                  <Label htmlFor="eating_window_start">Eating Window Start</Label>
                  <Input
                    id="eating_window_start"
                    type="time"
                    {...register('eating_window_start')}
                  />
                </div>
                <div>
                  <Label htmlFor="eating_window_end">Eating Window End</Label>
                  <Input
                    id="eating_window_end"
                    type="time"
                    {...register('eating_window_end')}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Main Meal Times */}
          {!isIntermittentFasting && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Main Meal Times</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="breakfast_time">Breakfast</Label>
                  <Input
                    id="breakfast_time"
                    type="time"
                    {...register('breakfast_time')}
                  />
                  {watchedValues.breakfast_time && (
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTime(watchedValues.breakfast_time)}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="lunch_time">Lunch</Label>
                  <Input
                    id="lunch_time"
                    type="time"
                    {...register('lunch_time')}
                  />
                  {watchedValues.lunch_time && (
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTime(watchedValues.lunch_time)}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="dinner_time">Dinner</Label>
                  <Input
                    id="dinner_time"
                    type="time"
                    {...register('dinner_time')}
                  />
                  {watchedValues.dinner_time && (
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTime(watchedValues.dinner_time)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Snack Times */}
          <div className="space-y-3">
            <Label>Snack Times (Optional)</Label>
            <div className="flex space-x-2">
              <Input
                type="time"
                placeholder="Add snack time"
                value={customSnackTime}
                onChange={(e) => setCustomSnackTime(e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                onClick={addSnackTime}
                disabled={!customSnackTime}
              >
                Add
              </Button>
            </div>

            {watchedValues.snack_times && watchedValues.snack_times.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Your snack times:</p>
                <div className="flex flex-wrap gap-2">
                  {watchedValues.snack_times.map((time, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {formatTime(time)}
                      <button
                        type="button"
                        onClick={() => removeSnackTime(time)}
                        className="ml-2 hover:text-blue-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Additional Preferences */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Additional Preferences</h3>
            
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                {...register('late_night_eating')}
                className="rounded border-gray-300 text-[#00b800] focus:ring-[#00b800]"
              />
              <span className="text-sm">I sometimes eat late at night</span>
            </label>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Tips for Better Meal Timing</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Consistent meal times help regulate your metabolism</li>
              <li>• Eating every 3-4 hours can help maintain energy levels</li>
              <li>• Try to finish eating 2-3 hours before bedtime</li>
              <li>• If you practice intermittent fasting, stay hydrated during fasting periods</li>
            </ul>
          </div>

          <Button type="submit" loading={loading} className="w-full">
            Save Meal Timing Preferences
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}