import { apiClient } from './client';
import type { 
  User, UserProfile, SubscriptionStatus, UserFeedback,
  ProfileFormData, ProfileUpdateFormData, UserFeedbackFormData
} from '@/types';

export const usersApi = {
  getCurrentUser: () => 
    apiClient.get<User>('/api/users/me'),

  updateCurrentUser: (data: { email?: string }) =>
    apiClient.put<User>('/api/users/me', data),

  getUserProfile: () =>
    apiClient.get<UserProfile>('/api/users/profile'),

  createUserProfile: (data: ProfileFormData) =>
    apiClient.post<UserProfile>('/api/users/profile', data),

  updateUserProfile: (data: ProfileUpdateFormData) =>
    apiClient.put<UserProfile>('/api/users/profile', data),

  getUserGoals: () =>
    apiClient.get<{
      bmr: number;
      tdee: number;
      calorie_goal: number;
      target_weight: number;
      initial_weight: number;
      current_weight: number;
      water_goal: number;
      protein: number;
      carbs: number;
      fat: number;
    }>('/api/users/goals'),

  getSubscriptionInfo: () =>
    apiClient.get<SubscriptionStatus>('/api/users/subscription'),

  getUserStreak: () =>
    apiClient.get<{ streak: number }>('/api/users/streak'),

  // User Feedback endpoints
  createUserFeedback: (data: UserFeedbackFormData) =>
    apiClient.post<UserFeedback>('/api/users/feedback', data),

  getUserFeedback: (limit: number = 20) =>
    apiClient.get<UserFeedback[]>(`/api/users/feedback?limit=${limit}`),
};