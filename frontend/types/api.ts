import { UUID } from 'crypto';

export type ApiResponse<T = any> = {
  data?: T;
  error?: string;
  status: number;
};

export interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
  profile?: UserProfile;
}

export type UserRole = 'free' | 'premium' | 'trial';

export interface ActivityLevel {
  value: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
  label: string;
}

export interface GoalType {
  value: 'weight_loss' | 'muscle_gain' | 'maintain' | 'body_recomposition';
  label: string;
}

export interface Gender {
  value: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  label: string;
}

export interface TimeFrame {
  value: '2_weeks' | '1_month' | '3_months' | '6_months' | '1_year' | 'custom';
  label: string;
}

export interface UserProfile {
  id: number;
  user_id: string;
  age: number;
  gender: string;
  height: number;
  initial_weight: number;
  current_weight: number;
  target_weight: number;
  activity_level: string;
  goal: string;
  time_frame: string;
  target_date?: string;
  water_goal: number;
  calorie_goal?: number;
  protein_goal?: number;
  carb_goal?: number;
  fat_goal?: number;
  diet_preferences?: Record<string, any>;
  breakfast_time?: string;
  lunch_time?: string;
  dinner_time?: string;
  snack_times?: string[];
  created_at: string;
  updated_at: string;
}

export interface Meal {
  id: string;
  user_id: string;
  description: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  water?: number;
  logged_at: string;
  photo_url?: string;
  ai_analysis?: Record<string, any>;
}

export interface SubscriptionStatus {
  is_active: boolean;
  is_trialing: boolean;
  is_canceled: boolean;
  plan: string;
  status: string;
  started_at: string;
  expires_at?: string;
}

export interface SubscriptionPlan {
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
}

export interface WeightLog {
  id: number;
  user_id: string;
  weight: number;
  logged_at: string;
  notes?: string;
}

export interface WeightStats {
  starting_weight: number;
  current_weight: number;
  target_weight: number;
  highest_weight: number;
  lowest_weight: number;
  entries_count: number;
}

// User Feedback interfaces
export interface UserFeedback {
  id: number;
  user_id?: string | null;  // Optional for anonymous feedback
  message: string;
  sent_at: string;
}

export interface UserFeedbackCreate {
  message: string;
}