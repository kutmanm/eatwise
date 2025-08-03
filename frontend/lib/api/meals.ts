import { apiClient } from './client';
import type { 
  Meal, 
  MealFormData, 
  PhotoAnalysisResponse, 
  ChatLogResponse 
} from '@/types';

export const mealsApi = {
  createMeal: (data: MealFormData) =>
    apiClient.post<Meal>('/api/meals', data),

  getMeals: (params?: {
    skip?: number;
    limit?: number;
    start_date?: string;
    end_date?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.skip) searchParams.set('skip', params.skip.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.start_date) searchParams.set('start_date', params.start_date);
    if (params?.end_date) searchParams.set('end_date', params.end_date);
    
    const query = searchParams.toString();
    return apiClient.get<Meal[]>(`/api/meals${query ? `?${query}` : ''}`);
  },

  searchMeals: (query: string, limit?: number) => {
    const params = new URLSearchParams({ q: query });
    if (limit) params.set('limit', limit.toString());
    return apiClient.get<Meal[]>(`/api/meals/search?${params.toString()}`);
  },

  getMealById: (id: number) =>
    apiClient.get<Meal>(`/api/meals/${id}`),

  updateMeal: (id: number, data: Partial<MealFormData>) =>
    apiClient.put<Meal>(`/api/meals/${id}`, data),

  deleteMeal: (id: number) =>
    apiClient.delete<{ message: string }>(`/api/meals/${id}`),

  analyzePhoto: (imageUrl: string) =>
    apiClient.post<PhotoAnalysisResponse>('/api/meals/photo-analysis', {
      image_url: imageUrl
    }),

  parseChatLog: (description: string) =>
    apiClient.post<ChatLogResponse>('/api/meals/chat-log', {
      description
    }),
};