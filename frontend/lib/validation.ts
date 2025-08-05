/**
 * Frontend validation utilities and helpers
 */

export const ValidationMessages = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_TIME: 'Time must be in HH:MM format (24-hour)',
  INVALID_DATE: 'Please enter a valid date',
  WEIGHT_TOO_LOW: 'Weight must be at least 20 kg',
  WEIGHT_TOO_HIGH: 'Weight cannot exceed 500 kg',
  HEIGHT_TOO_LOW: 'Height must be at least 50 cm',
  HEIGHT_TOO_HIGH: 'Height cannot exceed 300 cm',
  AGE_TOO_LOW: 'Must be at least 13 years old',
  AGE_TOO_HIGH: 'Age cannot exceed 120 years',
  WATER_TOO_LOW: 'Water goal must be at least 500 ml',
  WATER_TOO_HIGH: 'Water goal cannot exceed 10,000 ml',
  CALORIES_TOO_LOW: 'Calorie goal must be at least 800',
  CALORIES_TOO_HIGH: 'Calorie goal cannot exceed 5,000',
  WEIGHT_GOAL_INCONSISTENT: 'Target weight is not consistent with your goal',
  MACRO_INCONSISTENT: 'Macro goals don\'t add up to calorie goal',
  DATE_IN_PAST: 'Target date must be in the future',
  DATE_TOO_FAR: 'Target date cannot be more than 5 years away',
  TIME_FRAME_MISMATCH: 'Target date doesn\'t match selected time frame',
} as const;

/**
 * Validate time string format (HH:MM)
 */
export function validateTimeFormat(timeString: string): boolean {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(timeString);
}

/**
 * Validate date is in the future
 */
export function validateFutureDate(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Reset time to start of day for comparison
  return date > now;
}

/**
 * Validate weight consistency with goals
 */
export function validateWeightGoalConsistency(
  currentWeight: number,
  targetWeight: number,
  goal: string
): { isValid: boolean; message?: string } {
  if (goal === 'weight_loss' && targetWeight >= currentWeight) {
    return {
      isValid: false,
      message: 'For weight loss, target weight should be less than current weight'
    };
  }
  
  if (goal === 'muscle_gain' && targetWeight <= currentWeight) {
    return {
      isValid: false,
      message: 'For muscle gain, target weight should be greater than current weight'
    };
  }
  
  if (goal === 'maintain') {
    const weightDiff = Math.abs(targetWeight - currentWeight);
    if (weightDiff > 5) {
      return {
        isValid: false,
        message: 'For weight maintenance, target should be within 5kg of current weight'
      };
    }
  }
  
  return { isValid: true };
}

/**
 * Validate macro consistency with calorie goals
 */
export function validateMacroConsistency(
  calories: number,
  protein: number,
  carbs: number,
  fat: number,
  allowedVariance: number = 0.15
): { isValid: boolean; message?: string; calculatedCalories?: number } {
  const calculatedCalories = (protein * 4) + (carbs * 4) + (fat * 9);
  const variance = calories * allowedVariance;
  const difference = Math.abs(calculatedCalories - calories);
  
  if (difference > variance) {
    return {
      isValid: false,
      message: `Macros add up to ${Math.round(calculatedCalories)} calories, but goal is ${calories} calories`,
      calculatedCalories: Math.round(calculatedCalories)
    };
  }
  
  return { 
    isValid: true, 
    calculatedCalories: Math.round(calculatedCalories)
  };
}

/**
 * Validate target date consistency with time frame
 */
export function validateTimeFrameConsistency(
  targetDate: string,
  timeFrame: string
): { isValid: boolean; message?: string } {
  if (timeFrame === 'custom') {
    return { isValid: true };
  }
  
  const target = new Date(targetDate);
  const now = new Date();
  const daysDiff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  const expectedDays: Record<string, number> = {
    '2_weeks': 14,
    '1_month': 30,
    '3_months': 90,
    '6_months': 180,
    '1_year': 365,
  };
  
  const expected = expectedDays[timeFrame];
  if (!expected) {
    return { isValid: true };
  }
  
  const minDays = expected * 0.8;
  const maxDays = expected * 1.2;
  
  if (daysDiff < minDays || daysDiff > maxDays) {
    return {
      isValid: false,
      message: `For ${timeFrame.replace('_', ' ')}, target date should be approximately ${expected} days from now`
    };
  }
  
  return { isValid: true };
}

/**
 * Format validation error messages for display
 */
export function formatValidationError(error: any): string {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  if (Array.isArray(error)) {
    return error.map(e => formatValidationError(e)).join(', ');
  }
  
  return 'Invalid input';
}

/**
 * Real-time weight validation for forms
 */
export function validateWeightInput(value: string): string | null {
  const num = parseFloat(value);
  
  if (isNaN(num)) {
    return 'Please enter a valid number';
  }
  
  if (num < 20) {
    return ValidationMessages.WEIGHT_TOO_LOW;
  }
  
  if (num > 500) {
    return ValidationMessages.WEIGHT_TOO_HIGH;
  }
  
  // Check decimal places
  const decimalPlaces = (value.split('.')[1] || '').length;
  if (decimalPlaces > 1) {
    return 'Weight can have at most 1 decimal place';
  }
  
  return null;
}

/**
 * Real-time height validation for forms
 */
export function validateHeightInput(value: string): string | null {
  const num = parseFloat(value);
  
  if (isNaN(num)) {
    return 'Please enter a valid number';
  }
  
  if (num < 50) {
    return ValidationMessages.HEIGHT_TOO_LOW;
  }
  
  if (num > 300) {
    return ValidationMessages.HEIGHT_TOO_HIGH;
  }
  
  return null;
}

/**
 * Real-time age validation for forms
 */
export function validateAgeInput(value: string): string | null {
  const num = parseInt(value);
  
  if (isNaN(num)) {
    return 'Please enter a valid number';
  }
  
  if (num < 13) {
    return ValidationMessages.AGE_TOO_LOW;
  }
  
  if (num > 120) {
    return ValidationMessages.AGE_TOO_HIGH;
  }
  
  return null;
}

/**
 * Sanitize and validate text input
 */
export function sanitizeTextInput(value: string, maxLength: number = 1000): string {
  return value
    .trim()
    .substring(0, maxLength)
    .replace(/\s+/g, ' '); // Replace multiple spaces with single space
}

/**
 * Validate JSON structure for diet preferences
 */
export function validateDietPreferencesStructure(data: any): { isValid: boolean; message?: string } {
  if (!data || typeof data !== 'object') {
    return { isValid: false, message: 'Diet preferences must be an object' };
  }
  
  const allowedKeys = [
    'dietary_restrictions',
    'allergies', 
    'dislikes',
    'cuisine_preferences',
    'cooking_skill',
    'meal_prep_time',
    'budget_preference'
  ];
  
  const invalidKeys = Object.keys(data).filter(key => !allowedKeys.includes(key));
  
  if (invalidKeys.length > 0) {
    return { 
      isValid: false, 
      message: `Invalid keys in diet preferences: ${invalidKeys.join(', ')}` 
    };
  }
  
  return { isValid: true };
}