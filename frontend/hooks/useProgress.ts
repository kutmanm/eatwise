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

// Helper function to calculate week start date from time range
function getWeekStartFromTimeRange(timeRange: string): string {
  const now = new Date();
  let daysAgo = 0;
  
  switch (timeRange) {
    case '7d':
      daysAgo = 7;
      break;
    case '30d':
      daysAgo = 30;
      break;
    case '90d':
      daysAgo = 90;
      break;
    default:
      daysAgo = 7;
  }
  
  // Calculate the date X days ago
  const targetDate = new Date(now);
  targetDate.setDate(now.getDate() - daysAgo);
  
  // Get the start of the week (Monday) for that date
  const dayOfWeek = targetDate.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday = 0, Monday = 1
  const weekStart = new Date(targetDate);
  weekStart.setDate(targetDate.getDate() - daysToMonday);
  
  return weekStart.toISOString().split('T')[0];
}

export function useWeeklyProgress(timeRange: string) {
  // Convert time range to actual week start date
  const weekStart = getWeekStartFromTimeRange(timeRange);
  
  const { data, error, mutate } = useSWR<WeeklyProgressData>(
    ['weekly-progress', timeRange, weekStart], // Include both for proper cache key
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

// Alternative: If you want to pass actual date strings
export function useWeeklyProgressByDate(weekStartDate: string) {
  const { data, error, mutate } = useSWR<WeeklyProgressData>(
    ['weekly-progress', weekStartDate],
    async () => {
      const response = await progressApi.getWeeklyProgress(weekStartDate);
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