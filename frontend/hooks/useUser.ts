import useSWR from 'swr';
import { usersApi } from '@/lib/api';
import type { User, UserProfile, ProfileFormData } from '@/types';

export function useUser() {
  const { data, error, mutate } = useSWR<User>(
    'user',
    async () => {
      const response = await usersApi.getCurrentUser();
      if (response.error) throw new Error(response.error);
      return response.data!;
    }
  );

  const updateUser = async (userData: { email?: string }) => {
    try {
      const response = await usersApi.updateCurrentUser(userData);
      if (response.error) throw new Error(response.error);
      mutate(response.data, false);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  return {
    user: data,
    loading: !error && !data,
    error,
    mutate,
    updateUser,
  };
}

export function useUserProfile() {
  const { data, error, mutate } = useSWR<UserProfile | null>(
    'user-profile',
    async () => {
      const response = await usersApi.getUserProfile();
      if (response.error) {
        if (response.status === 404) return null;
        throw new Error(response.error);
      }
      return response.data!;
    }
  );

  const updateProfile = async (profileData: Partial<ProfileFormData>) => {
    try {
      const response = await usersApi.updateUserProfile(profileData);
      if (response.error) throw new Error(response.error);
      mutate(response.data, false);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  return {
    profile: data,
    loading: !error && data === undefined,
    error: error && error.message !== 'User profile not found' ? error : null,
    mutate,
    updateProfile,
  };
}

export function useUserGoals() {
  const { data, error, mutate } = useSWR(
    'user-goals',
    async () => {
      const response = await usersApi.getUserGoals();
      if (response.error) throw new Error(response.error);
      return response.data!;
    }
  );

  return {
    goals: data,
    loading: !error && !data,
    error,
    mutate,
  };
}

export function useSubscription() {
  const { data, error, mutate } = useSWR(
    'subscription',
    async () => {
      const response = await usersApi.getSubscriptionInfo();
      if (response.error) throw new Error(response.error);
      return response.data!;
    }
  );

  return {
    subscription: data,
    loading: !error && !data,
    error,
    mutate,
  };
}

export function useUserStreak() {
  const { data, error, mutate } = useSWR(
    'user-streak',
    async () => {
      const response = await usersApi.getUserStreak();
      if (response.error) throw new Error(response.error);
      return response.data!;
    }
  );

  return {
    streak: data?.streak || 0,
    loading: !error && !data,
    error,
    mutate,
  };
}