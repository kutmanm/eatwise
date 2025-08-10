'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Button } from '@/components/ui/Button';
import { mealSchema, type MealFormData } from '@/types';

interface NutritionEditorProps {
  initialData?: Partial<MealFormData>;
  onSave: (data: MealFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function NutritionEditor({ 
  initialData, 
  onSave, 
  onCancel, 
  loading 
}: NutritionEditorProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<MealFormData>({
    resolver: zodResolver(mealSchema),
    defaultValues: {
      description: initialData?.description || '',
      calories: initialData?.calories || 0,
      protein: initialData?.protein || 0,
      carbs: initialData?.carbs || 0,
      fat: initialData?.fat || 0,
      fiber: initialData?.fiber || 0,
      water: initialData?.water || 0,
    }
  });

  const watchedValues = watch();
  const totalMacros = (watchedValues.protein || 0) + (watchedValues.carbs || 0) + (watchedValues.fat || 0);

  // Auto-grow description textarea height
  const adjustTextareaHeight = () => {
    const el = document.getElementById('description') as HTMLTextAreaElement | null;
    if (!el) return;
    el.style.height = 'auto';
    // Grow to fit content with no scrollbar
    el.style.height = el.scrollHeight + 'px';
  };

  useEffect(() => {
    // Adjust on mount to fit initial data if present
    adjustTextareaHeight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSave)} className="space-y-4">
        <div>
          <Label htmlFor="description">Meal Description</Label>
          <textarea
            id="description"
            placeholder="Describe your meal..."
            className="form-input resize-none min-h-[48px] overflow-hidden w-full"
            rows={2}
            onInput={adjustTextareaHeight}
            {...register('description')}
          />
          {errors.description?.message && (
            <p className="text-sm text-error mt-1">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="calories">Calories</Label>
            <Input
              id="calories"
              type="number"
              placeholder="0"
              error={errors.calories?.message}
              {...register('calories', { valueAsNumber: true })}
            />
          </div>
          <div>
            <Label htmlFor="water">Water (ml)</Label>
            <Input
              id="water"
              type="number"
              placeholder="0"
              error={errors.water?.message}
              {...register('water', { valueAsNumber: true })}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-neutral-900">Macronutrients (grams)</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="protein">Protein</Label>
              <Input
                id="protein"
                type="number"
                step="0.1"
                placeholder="0"
                error={errors.protein?.message}
                {...register('protein', { valueAsNumber: true })}
              />
            </div>
            <div>
              <Label htmlFor="carbs">Carbohydrates</Label>
              <Input
                id="carbs"
                type="number"
                step="0.1"
                placeholder="0"
                error={errors.carbs?.message}
                {...register('carbs', { valueAsNumber: true })}
              />
            </div>
            <div>
              <Label htmlFor="fat">Fat</Label>
              <Input
                id="fat"
                type="number"
                step="0.1"
                placeholder="0"
                error={errors.fat?.message}
                {...register('fat', { valueAsNumber: true })}
              />
            </div>
            <div>
              <Label htmlFor="fiber">Fiber</Label>
              <Input
                id="fiber"
                type="number"
                step="0.1"
                placeholder="0"
                error={errors.fiber?.message}
                {...register('fiber', { valueAsNumber: true })}
              />
            </div>
          </div>
        </div>

        {/* Macro breakdown visualization */}
        {totalMacros > 0 && (
          <div className="bg-neutral-50 p-4 rounded-lg">
            <h5 className="text-sm font-medium text-neutral-900 mb-2">Macro Breakdown</h5>
            <div className="space-y-2">
              {[
                { name: 'Protein', value: watchedValues.protein || 0, color: 'bg-blue-500' },
                { name: 'Carbs', value: watchedValues.carbs || 0, color: 'bg-green-500' },
                { name: 'Fat', value: watchedValues.fat || 0, color: 'bg-yellow-500' },
              ].map((macro) => {
                const percentage = totalMacros > 0 ? (macro.value / totalMacros) * 100 : 0;
                return (
                  <div key={macro.name} className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${macro.color}`} />
                    <span className="text-sm text-neutral-600 flex-1">
                      {macro.name}: {macro.value}g ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex space-x-3 pt-4">
          <Button
            type="submit"
            loading={loading}
            className="flex-1"
          >
            Save Meal
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}