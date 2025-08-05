'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useWeightLogs } from '@/hooks/useWeightLogs';
import { weightLogSchema, type WeightLogFormData } from '@/types';

interface WeightEntryFormProps {
  onSuccess?: () => void;
  showAsCard?: boolean;
}

export function WeightEntryForm({ onSuccess, showAsCard = true }: WeightEntryFormProps) {
  const { createWeightLog } = useWeightLogs();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<WeightLogFormData>({
    resolver: zodResolver(weightLogSchema),
    defaultValues: {
      weight: 0,
      notes: '',
    },
  });

  const onSubmit = async (data: WeightLogFormData) => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await createWeightLog(data);
      setSuccess('Weight logged successfully!');
      reset();
      setTimeout(() => setSuccess(''), 3000);
      onSuccess?.();
    } catch (err) {
      setError('Failed to log weight. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const formContent = (
    <>
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="weight">Weight (kg)</Label>
          <Input
            id="weight"
            type="number"
            step="0.1"
            placeholder="70.5"
            error={errors.weight?.message}
            {...register('weight', { valueAsNumber: true })}
          />
        </div>

        <div>
          <Label htmlFor="notes">Notes (optional)</Label>
          <textarea
            id="notes"
            rows={3}
            placeholder="How are you feeling? Any observations..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00b800] focus:border-transparent resize-none"
            {...register('notes')}
          />
          {errors.notes && (
            <p className="text-sm text-red-600">{errors.notes.message}</p>
          )}
        </div>

        <Button
          type="submit"
          loading={saving}
          className="w-full"
        >
          Log Weight
        </Button>
      </form>
    </>
  );

  if (!showAsCard) {
    return <div className="space-y-4">{formContent}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log Your Weight</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {formContent}
      </CardContent>
    </Card>
  );
}