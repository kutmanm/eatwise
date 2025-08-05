import { z } from 'zod';
import type { ActivityLevel, GoalType } from './api';

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
  age: z.number().min(1).max(120),
  height: z.number().min(50).max(300),
  weight: z.number().min(20).max(500),
  target_weight: z.number().min(20).max(500).optional(),
  timeframe_days: z.number().min(1).max(3650).optional(), // От 1 дня до 10 лет
  activity_level: z.enum(['low', 'medium', 'high'] as const),
  goal: z.enum(['weight_loss', 'muscle_gain', 'maintain'] as const),
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

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type MealFormData = z.infer<typeof mealSchema>;