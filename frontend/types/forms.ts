import { z } from 'zod';
import type { ActivityLevel, GoalType, Gender, TimeFrame } from './api';

// Custom validation helpers
const timeStringSchema = z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format');

const weightValidation = z.number()
  .min(20, 'Weight must be at least 20 kg')
  .max(500, 'Weight cannot exceed 500 kg')
  .refine((val) => Number(val.toFixed(1)) === val, 'Weight can have at most 1 decimal place');

const heightValidation = z.number()
  .min(50, 'Height must be at least 50 cm')
  .max(300, 'Height cannot exceed 300 cm')
  .refine((val) => Number(val.toFixed(1)) === val, 'Height can have at most 1 decimal place');

const ageValidation = z.number()
  .int('Age must be a whole number')
  .min(13, 'Must be at least 13 years old')
  .max(120, 'Age cannot exceed 120 years');

const waterGoalValidation = z.number()
  .min(500, 'Water goal must be at least 500 ml')
  .max(10000, 'Water goal cannot exceed 10,000 ml');

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const profileSchema = z.object({
  // Basic demographics
  age: z.number().min(1).max(120),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say'] as const),
  height: z.number().min(50).max(300), // in cm
  
  // Weight information
  initial_weight: z.number().min(20).max(500), // in kg
  current_weight: z.number().min(20).max(500), // in kg
  target_weight: z.number().min(20).max(500),  // in kg
  
  // Goals and preferences
  activity_level: z.enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'] as const),
  goal: z.enum(['weight_loss', 'muscle_gain', 'maintain', 'body_recomposition'] as const),
  time_frame: z.enum(['2_weeks', '1_month', '3_months', '6_months', '1_year', 'custom'] as const),
  target_date: z.string().optional(), // for custom time frame
  
  // Nutrition goals
  water_goal: z.number().min(0).optional(),
  calorie_goal: z.number().min(0).optional(),
  protein_goal: z.number().min(0).optional(),
  carb_goal: z.number().min(0).optional(),
  fat_goal: z.number().min(0).optional(),
  
  // Meal preferences
  diet_preferences: z.record(z.any()).optional(),
  
  // Meal timing preferences
  breakfast_time: z.string().optional(),
  lunch_time: z.string().optional(),
  dinner_time: z.string().optional(),
  snack_times: z.array(z.string()).optional(),
});

export const mealSchema = z.object({
  description: z.string().optional(),
  calories: z.number().min(0).optional(),
  protein: z.number().min(0).optional(),
  carbs: z.number().min(0).optional(),
  fat: z.number().min(0).optional(),
  fiber: z.number().min(0).optional(),
  water: z.number().min(0).optional(),
  logged_at: z.string().optional(),
});

// Weight Log schemas
export const weightLogSchema = z.object({
  weight: weightValidation,
  notes: z.string()
    .max(500, 'Notes cannot exceed 500 characters')
    .optional()
    .transform((val) => val?.trim() || undefined),
});

export const weightLogUpdateSchema = z.object({
  weight: z.number().min(20).max(500).optional(),
  notes: z.string().optional(),
});

// Diet preferences schema
export const dietPreferencesSchema = z.object({
  dietary_restrictions: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  cuisine_preferences: z.array(z.string()).optional(),
  favorite_foods: z.array(z.string()).optional(),
  disliked_foods: z.array(z.string()).optional(),
});

// User feedback schema
export const userFeedbackSchema = z.object({
  message: z.string()
    .min(1, 'Message cannot be empty')
    .max(1000, 'Message cannot exceed 1000 characters')
    .transform((val) => val.trim())
    .refine((val) => val.length > 0, 'Message cannot be empty after removing whitespace'),
});

// Enhanced profile schema for updates (all optional)
export const profileUpdateSchema = z.object({
  age: z.number().min(1).max(120).optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say'] as const).optional(),
  height: z.number().min(50).max(300).optional(),
  initial_weight: z.number().min(20).max(500).optional(),
  current_weight: z.number().min(20).max(500).optional(),
  target_weight: z.number().min(20).max(500).optional(),
  activity_level: z.enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'] as const).optional(),
  goal: z.enum(['weight_loss', 'muscle_gain', 'maintain', 'body_recomposition'] as const).optional(),
  time_frame: z.enum(['2_weeks', '1_month', '3_months', '6_months', '1_year', 'custom'] as const).optional(),
  target_date: z.string().optional(),
  water_goal: z.number().min(0).optional(),
  calorie_goal: z.number().min(0).optional(),
  protein_goal: z.number().min(0).optional(),
  carb_goal: z.number().min(0).optional(),
  fat_goal: z.number().min(0).optional(),
  diet_preferences: z.record(z.any()).optional(),
  breakfast_time: z.string().optional(),
  lunch_time: z.string().optional(),
  dinner_time: z.string().optional(),
  snack_times: z.array(z.string()).optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
export type MealFormData = z.infer<typeof mealSchema>;
export type WeightLogFormData = z.infer<typeof weightLogSchema>;
export type WeightLogUpdateFormData = z.infer<typeof weightLogUpdateSchema>;
export type DietPreferencesFormData = z.infer<typeof dietPreferencesSchema>;
export type UserFeedbackFormData = z.infer<typeof userFeedbackSchema>;