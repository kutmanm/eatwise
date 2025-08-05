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
  target_weight?: number;
  timeframe_days?: number;
  activity_level: ActivityLevel;
  goal: GoalType;
  calorie_goal?: number;
  protein_goal?: number;
  carbs_goal?: number;
  fat_goal?: number;
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
  has_subscription: boolean;
  plan?: string;
  status: string;
  expires_at?: string;
  active?: boolean; // computed property for backward compatibility
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

export interface GoalAchievementData {
  progress_percentage: number;
  days_remaining: number;
  weight_to_go: number;
  on_track: boolean;
  daily_weight_change_needed: number;
  target_weight?: number;
  current_weight: number;
}