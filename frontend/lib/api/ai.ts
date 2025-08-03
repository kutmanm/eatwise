import { apiClient } from './client';

export const aiApi = {
  getMealFeedback: (mealId: number) =>
    apiClient.post<{ feedback: string }>('/api/ai/feedback', { meal_id: mealId }),

  getDailyTip: () =>
    apiClient.get<{ tip: string }>('/api/ai/daily-tip'),

  askNutritionQuestion: (question: string) =>
    apiClient.post<{ answer: string }>('/api/ai/qna', { question }),

  getMealSuggestions: (mealId: number) =>
    apiClient.post<{ suggestions: string }>('/api/ai/meal-adjustment', { meal_id: mealId }),
};