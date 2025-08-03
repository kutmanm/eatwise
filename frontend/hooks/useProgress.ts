import useSWR from 'swr';
import { progressApi } from '@/lib/api';
import type { DailyNutritionSummary, WeeklyProgressData } from '@/types';

export function useDailyProgress(date: string) {
  const { data, error, mutate } = useSWR<DailyNutritionSummary>(
    ['daily-progress', date],
    async () => {
      const response = await progressApi.getDailyProgress(date);
      if (response.error) throw new Error(response.error);
      return response.data!;
    }
  );

  return {
    progress: data,
    loading: !error && !data,
    error,
    mutate,
  };
}

export function useWeeklyProgress(weekStart: string) {
  const { data, error, mutate } = useSWR<WeeklyProgressData>(
    ['weekly-progress', weekStart],
    async () => {
      const response = await progressApi.getWeeklyProgress(weekStart);
      if (response.error) throw new Error(response.error);
      return response.data!;
    }
  );

  return {
    progress: data,
    loading: !error && !data,
    error,
    mutate,
  };
}

export function useCalendarData(month: number, year: number) {
  const { data, error, mutate } = useSWR(
    ['calendar-data', month, year],
    async () => {
      const response = await progressApi.getCalendarData(month, year);
      if (response.error) throw new Error(response.error);
      return response.data!;
    }
  );

  return {
    calendarData: data,
    loading: !error && !data,
    error,
    mutate,
  };
}

export function useTodaysProgress() {
  const today = new Date().toISOString().split('T')[0];
  return useDailyProgress(today);
}