import { apiClient } from './client';
import type { User, UserProfile, ProfileFormData, GoalAchievementData } from '@/types';

export const usersApi = {
  getCurrentUser: () => 
    apiClient.get<User>('/api/users/me'),

  updateCurrentUser: (data: { email?: string }) =>
    apiClient.put<User>('/api/users/me', data),

  getUserProfile: () =>
    apiClient.get<UserProfile>('/api/users/profile'),

  createUserProfile: (data: ProfileFormData) =>
    apiClient.post<UserProfile>('/api/users/profile', data),

  updateUserProfile: (data: Partial<ProfileFormData>) =>
    apiClient.put<UserProfile>('/api/users/profile', data),

  getUserGoals: () =>
    apiClient.get<{
      bmr: number;
      tdee: number;
      calorie_goal: number;
      target_weight?: number;
      timeframe_days?: number;
      weight_progress: number;
      protein: number;
      carbs: number;
      fat: number;
    }>('/api/users/goals'),

  getGoalAchievement: () =>
    apiClient.get<GoalAchievementData>('/api/users/goal-achievement'),

  getSubscriptionInfo: () =>
    apiClient.get<{
      has_subscription: boolean;
      plan?: string;
      status: string;
      expires_at?: string;
    }>('/api/users/subscription'),

  getUserStreak: () =>
    apiClient.get<{ streak: number }>('/api/users/streak'),
};