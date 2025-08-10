export interface SymptomLog {
  id: number;
  user_id: string;
  symptom_type: string;
  symptom_domain: string;
  severity: number;
  occurred_at: string;
  logged_at: string;
  duration_minutes?: number;
  notes?: string;
  triggers?: string[];
}

export interface LifestyleLog {
  id: number;
  user_id: string;
  date: string;
  sleep_hours?: number;
  sleep_quality?: number;
  stress_level?: number;
  exercise_minutes?: number;
  exercise_type?: string;
  water_intake?: number;
  alcohol_servings?: number;
  medications?: string[];
  supplements?: string[];
  notes?: string;
  logged_at: string;
}

export interface SymptomLogCreate {
  symptom_type: string;
  symptom_domain: string;
  severity: number;
  occurred_at: string;
  duration_minutes?: number;
  notes?: string;
  triggers?: string[];
}

export interface LifestyleLogCreate {
  date: string;
  sleep_hours?: number;
  sleep_quality?: number;
  stress_level?: number;
  exercise_minutes?: number;
  exercise_type?: string;
  water_intake?: number;
  alcohol_servings?: number;
  medications?: string[];
  supplements?: string[];
  notes?: string;
}

export interface SymptomType {
  value: string;
  label: string;
}

export interface SymptomDomain {
  value: string;
  label: string;
}

export interface SymptomCorrelationData {
  symptom_logs: SymptomLog[];
  lifestyle_logs: LifestyleLog[];
  meal_data: any[];
  analysis_period_days: number;
  patterns_found: CorrelationPattern[];
}

export interface CorrelationPattern {
  type: string;
  description: string;
  data: any;
}

export interface SymptomSummary {
  total_symptoms: number;
  avg_severity: number;
  most_common_symptom: string | null;
  most_affected_domain: string | null;
  trend: 'improving' | 'worsening' | 'stable' | 'insufficient_data' | 'no_data';
  symptom_counts: Record<string, number>;
  domain_counts: Record<string, number>;
}

export interface SymptomAnalysisRequest {
  symptom_domain?: string;
  date_range_days: number;
  include_lifestyle: boolean;
}

export const SYMPTOM_TYPES: SymptomType[] = [
  { value: 'bloating', label: 'Bloating' },
  { value: 'stomach_pain', label: 'Stomach Pain' },
  { value: 'nausea', label: 'Nausea' },
  { value: 'heartburn', label: 'Heartburn' },
  { value: 'diarrhea', label: 'Diarrhea' },
  { value: 'constipation', label: 'Constipation' },
  { value: 'gas', label: 'Gas' },
  { value: 'indigestion', label: 'Indigestion' },
  { value: 'acne', label: 'Acne' },
  { value: 'eczema', label: 'Eczema' },
  { value: 'rash', label: 'Rash' },
  { value: 'itching', label: 'Itching' },
  { value: 'dryness', label: 'Skin Dryness' },
  { value: 'inflammation', label: 'Skin Inflammation' },
  { value: 'fatigue', label: 'Fatigue' },
  { value: 'low_energy', label: 'Low Energy' },
  { value: 'brain_fog', label: 'Brain Fog' },
  { value: 'drowsiness', label: 'Drowsiness' },
  { value: 'restlessness', label: 'Restlessness' },
  { value: 'anxiety', label: 'Anxiety' },
  { value: 'irritability', label: 'Irritability' },
  { value: 'mood_swings', label: 'Mood Swings' },
  { value: 'depression', label: 'Depression' },
  { value: 'headache', label: 'Headache' },
  { value: 'joint_pain', label: 'Joint Pain' },
  { value: 'muscle_pain', label: 'Muscle Pain' },
  { value: 'inflammation_general', label: 'General Inflammation' },
  { value: 'insomnia', label: 'Insomnia' },
  { value: 'poor_sleep_quality', label: 'Poor Sleep Quality' },
  { value: 'sleep_disturbances', label: 'Sleep Disturbances' },
  { value: 'other', label: 'Other' },
];

export const SYMPTOM_DOMAINS: SymptomDomain[] = [
  { value: 'digestion', label: 'Digestion' },
  { value: 'skin', label: 'Skin' },
  { value: 'fatigue', label: 'Energy/Fatigue' },
  { value: 'mood', label: 'Mood' },
  { value: 'sleep', label: 'Sleep' },
  { value: 'physical', label: 'Physical Pain' },
  { value: 'other', label: 'Other' },
];

export const EXERCISE_TYPES = [
  'Walking',
  'Running',
  'Cycling',
  'Swimming',
  'Weight Training',
  'Yoga',
  'Pilates',
  'Dancing',
  'Sports',
  'Hiking',
  'Other',
];
