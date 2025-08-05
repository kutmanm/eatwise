'use client';

import { useState, useEffect } from 'react';
import { usersApi } from '@/lib/api';
import type { User, UserProfile, ProfileFormData, ProfileUpdateFormData } from '@/types';

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await usersApi.getCurrentUser();
      
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setUser(response.data);
      }
    } catch (err) {
      setError('Failed to fetch user');
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (data: { email?: string }) => {
    try {
      const response = await usersApi.updateCurrentUser(data);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data) {
        setUser(response.data);
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user';
      setError(errorMessage);
      throw err;
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return {
    user,
    loading,
    error,
    updateUser,
    refetch: fetchUser,
  };
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await usersApi.getUserProfile();
      
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setProfile(response.data);
      }
    } catch (err) {
      setError('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (data: ProfileFormData) => {
    try {
      const response = await usersApi.createUserProfile(data);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data) {
        setProfile(response.data);
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create profile';
      setError(errorMessage);
      throw err;
    }
  };

  const updateProfile = async (data: ProfileUpdateFormData) => {
    try {
      const response = await usersApi.updateUserProfile(data);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data) {
        setProfile(response.data);
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      throw err;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    loading,
    error,
    createProfile,
    updateProfile,
    refetch: fetchProfile,
  };
}

export function useUserGoals() {
  const [goals, setGoals] = useState<{
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
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await usersApi.getUserGoals();
      
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setGoals(response.data);
      }
    } catch (err) {
      setError('Failed to fetch goals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  return {
    goals,
    loading,
    error,
    refetch: fetchGoals,
  };
}

export function useUserStreak() {
  const [streak, setStreak] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStreak = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await usersApi.getUserStreak();
      
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setStreak(response.data.streak);
      }
    } catch (err) {
      setError('Failed to fetch streak');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStreak();
  }, []);

  return {
    streak,
    loading,
    error,
    refetch: fetchStreak,
  };
}