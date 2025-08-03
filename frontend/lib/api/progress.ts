import { apiClient } from './client';
import type { DailyNutritionSummary, WeeklyProgressData } from '@/types';

export const progressApi = {
  getDailyProgress: (date: string) =>
    apiClient.get<DailyNutritionSummary>(`/api/progress/daily?target_date=${date}`),

  getWeeklyProgress: (weekStart: string) =>
    apiClient.get<WeeklyProgressData>(`/api/progress/weekly?week_start=${weekStart}`),

  getCalendarData: (month: number, year: number) =>
    apiClient.get<{
      month: number;
      year: number;
      days: Record<string, { meal_count: number; total_calories: number }>;
    }>(`/api/progress/calendar?month=${month}&year=${year}`),
};