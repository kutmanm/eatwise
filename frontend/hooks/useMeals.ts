import useSWR from 'swr';
import { mealsApi } from '@/lib/api';
import type { Meal } from '@/types';

interface UseMealsParams {
  skip?: number;
  limit?: number;
  start_date?: string;
  end_date?: string;
}

export function useMeals(params?: UseMealsParams) {
  const { data, error, mutate } = useSWR<Meal[]>(
    ['meals', params],
    async () => {
      const response = await mealsApi.getMeals(params);
      if (response.error) throw new Error(response.error);
      return response.data!;
    }
  );

  return {
    meals: data || [],
    loading: !error && !data,
    error,
    mutate,
  };
}

export function useMeal(id: number) {
  const { data, error, mutate } = useSWR<Meal>(
    id ? `meal-${id}` : null,
    async () => {
      const response = await mealsApi.getMealById(id);
      if (response.error) throw new Error(response.error);
      return response.data!;
    }
  );

  return {
    meal: data,
    loading: !error && !data,
    error,
    mutate,
  };
}

export function useSearchMeals(query: string, limit?: number) {
  const { data, error, mutate } = useSWR<Meal[]>(
    query ? ['search-meals', query, limit] : null,
    async () => {
      const response = await mealsApi.searchMeals(query, limit);
      if (response.error) throw new Error(response.error);
      return response.data!;
    }
  );

  return {
    meals: data || [],
    loading: !error && !data,
    error,
    mutate,
  };
}

export function useTodaysMeals() {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  
  return useMeals({
    start_date: today,
    end_date: tomorrow,
    limit: 50,
  });
}