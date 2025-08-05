export type UserRole = 'free' | 'premium' | 'trial';
export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
export type GoalType = 'weight_loss' | 'muscle_gain' | 'maintain' | 'body_recomposition';
export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';
export type TimeFrame = '2_weeks' | '1_month' | '3_months' | '6_months' | '1_year' | 'custom';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
  profile?: UserProfile;
}

export interface UserProfile {
  id: number;
  user_id: string;
  
  // Basic demographics
  age: number;
  gender: Gender;
  height: number; // in cm
  
  // Weight information
  initial_weight: number; // in kg - starting weight
  current_weight: number; // in kg - current weight
  target_weight: number;  // in kg - goal weight
  
  // Goals and preferences
  activity_level: ActivityLevel;
  goal: GoalType;
  time_frame: TimeFrame;
  target_date?: string; // specific target date if time_frame is CUSTOM
  
  // Nutrition goals
  water_goal: number; // in ml per day
  calorie_goal?: number; // calculated daily calorie target
  protein_goal?: number; // in grams per day
  carb_goal?: number;    // in grams per day
  fat_goal?: number;     // in grams per day
  
  // Meal preferences
  diet_preferences?: { [key: string]: any }; // JSON field for flexible diet preferences
  
  // Meal timing preferences
  breakfast_time?: string;
  lunch_time?: string;
  dinner_time?: string;
  snack_times?: string[]; // Array of times for snacks
  
  // Metadata
  created_at: string;
  updated_at: string;
}

export interface Meal {
  id: number;
  user_id: string;
  description?: string;
  image_url?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  water?: number;
  logged_at: string;
}

export interface Subscription {
  id: number;
  user_id: string;
  plan: string;
  start_date: string;
  end_date?: string;
  status: string; // trialing, active, canceled, etc.
}

export interface SubscriptionStatus {
  has_subscription: boolean;
  plan?: string;
  status: string;
  started_at?: string;
  expires_at?: string;
}

export interface DailyNutritionSummary {
  date: string;
  meal_count: number;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  water?: number;
  calorie_goal?: number;
  protein_goal?: number;
  carbs_goal?: number;
  fat_goal?: number;
}

// Update WeeklyProgressData to be more flexible for chart usage
export interface WeeklyProgressData {
  week_start: string;
  daily_summaries: DailyNutritionSummary[];
  avg_calories: number;
  avg_protein: number;
  avg_carbs: number;
  avg_fat: number;
  // Add direct access properties for charts
  date?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export interface PhotoAnalysisResponse {
  description: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  water?: number;
  confidence: number;
}

export interface ChatLogResponse {
  parsed_description: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  water?: number;
  confidence: number;
}

// Weight Log interfaces
export interface WeightLog {
  id: number;
  user_id: string;
  weight: number; // in kg
  notes?: string;
  logged_at: string;
}

export interface WeightLogCreate {
  weight: number;
  notes?: string;
}

export interface WeightLogUpdate {
  weight?: number;
  notes?: string;
}

export interface WeightStats {
  total_entries: number;
  latest_weight?: number;
  weight_change?: number;
  trend?: 'increasing' | 'decreasing' | 'stable' | 'insufficient_data';
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