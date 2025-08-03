export type UserRole = 'free' | 'premium';
export type ActivityLevel = 'low' | 'medium' | 'high';
export type GoalType = 'weight_loss' | 'muscle_gain' | 'maintain';

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
  age: number;
  height: number;
  weight: number;
  activity_level: ActivityLevel;
  goal: GoalType;
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
  active: boolean;
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

export interface WeeklyProgressData {
  week_start: string;
  daily_summaries: DailyNutritionSummary[];
  avg_calories: number;
  avg_protein: number;
  avg_carbs: number;
  avg_fat: number;
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