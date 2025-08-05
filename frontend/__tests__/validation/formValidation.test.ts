/**
 * Tests for form validation utilities
 */
import { 
  validateWeightInput, 
  validateHeightInput, 
  validateAgeInput,
  validateTimeFormat,
  validateFutureDate,
  validateWeightGoalConsistency,
  validateMacroConsistency,
  sanitizeTextInput 
} from '@/lib/validation';

describe('Form Validation', () => {
  describe('validateWeightInput', () => {
    it('validates correct weight values', () => {
      expect(validateWeightInput('75')).toBe(null);
      expect(validateWeightInput('75.5')).toBe(null);
      expect(validateWeightInput('20')).toBe(null);
      expect(validateWeightInput('500')).toBe(null);
    });

    it('rejects invalid weight values', () => {
      expect(validateWeightInput('19')).toBe('Weight must be at least 20 kg');
      expect(validateWeightInput('501')).toBe('Weight cannot exceed 500 kg');
      expect(validateWeightInput('abc')).toBe('Please enter a valid number');
      expect(validateWeightInput('75.55')).toBe('Weight can have at most 1 decimal place');
    });
  });

  describe('validateHeightInput', () => {
    it('validates correct height values', () => {
      expect(validateHeightInput('170')).toBe(null);
      expect(validateHeightInput('175.5')).toBe(null);
      expect(validateHeightInput('50')).toBe(null);
      expect(validateHeightInput('300')).toBe(null);
    });

    it('rejects invalid height values', () => {
      expect(validateHeightInput('49')).toBe('Height must be at least 50 cm');
      expect(validateHeightInput('301')).toBe('Height cannot exceed 300 cm');
      expect(validateHeightInput('abc')).toBe('Please enter a valid number');
    });
  });

  describe('validateAgeInput', () => {
    it('validates correct age values', () => {
      expect(validateAgeInput('25')).toBe(null);
      expect(validateAgeInput('13')).toBe(null);
      expect(validateAgeInput('120')).toBe(null);
    });

    it('rejects invalid age values', () => {
      expect(validateAgeInput('12')).toBe('Must be at least 13 years old');
      expect(validateAgeInput('121')).toBe('Age cannot exceed 120 years');
      expect(validateAgeInput('abc')).toBe('Please enter a valid number');
    });
  });

  describe('validateTimeFormat', () => {
    it('validates correct time formats', () => {
      expect(validateTimeFormat('08:00')).toBe(true);
      expect(validateTimeFormat('23:59')).toBe(true);
      expect(validateTimeFormat('00:00')).toBe(true);
      expect(validateTimeFormat('12:30')).toBe(true);
    });

    it('rejects invalid time formats', () => {
      expect(validateTimeFormat('24:00')).toBe(false);
      expect(validateTimeFormat('12:60')).toBe(false);
      expect(validateTimeFormat('abc')).toBe(false);
      expect(validateTimeFormat('12')).toBe(false);
      expect(validateTimeFormat('12:5')).toBe(false);
    });
  });

  describe('validateFutureDate', () => {
    it('validates future dates', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(validateFutureDate(tomorrow.toISOString().split('T')[0])).toBe(true);
    });

    it('rejects past dates', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(validateFutureDate(yesterday.toISOString().split('T')[0])).toBe(false);
      
      const today = new Date();
      expect(validateFutureDate(today.toISOString().split('T')[0])).toBe(false);
    });
  });

  describe('validateWeightGoalConsistency', () => {
    it('validates weight loss goals', () => {
      const result = validateWeightGoalConsistency(80, 75, 'weight_loss');
      expect(result.isValid).toBe(true);
    });

    it('rejects inconsistent weight loss goals', () => {
      const result = validateWeightGoalConsistency(80, 85, 'weight_loss');
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('target weight should be less than current weight');
    });

    it('validates muscle gain goals', () => {
      const result = validateWeightGoalConsistency(70, 75, 'muscle_gain');
      expect(result.isValid).toBe(true);
    });

    it('rejects inconsistent muscle gain goals', () => {
      const result = validateWeightGoalConsistency(80, 75, 'muscle_gain');
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('target weight should be greater than current weight');
    });

    it('validates maintain goals', () => {
      const result = validateWeightGoalConsistency(80, 82, 'maintain');
      expect(result.isValid).toBe(true);
    });

    it('rejects inconsistent maintain goals', () => {
      const result = validateWeightGoalConsistency(80, 90, 'maintain');
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('within 5kg of current weight');
    });
  });

  describe('validateMacroConsistency', () => {
    it('validates consistent macro goals', () => {
      // 2000 calories: 150g protein (600 cal) + 200g carbs (800 cal) + 67g fat (600 cal) = 2000 cal
      const result = validateMacroConsistency(2000, 150, 200, 67);
      expect(result.isValid).toBe(true);
      expect(result.calculatedCalories).toBe(2003); // Close enough with rounding
    });

    it('rejects inconsistent macro goals', () => {
      const result = validateMacroConsistency(2000, 200, 300, 100); // Way too many calories
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('add up to');
    });

    it('allows reasonable variance', () => {
      // Allow 15% variance by default
      const result = validateMacroConsistency(2000, 140, 180, 70, 0.15);
      expect(result.isValid).toBe(true);
    });
  });

  describe('sanitizeTextInput', () => {
    it('trims whitespace', () => {
      expect(sanitizeTextInput('  hello world  ')).toBe('hello world');
    });

    it('replaces multiple spaces with single space', () => {
      expect(sanitizeTextInput('hello    world')).toBe('hello world');
    });

    it('truncates to max length', () => {
      const longText = 'a'.repeat(100);
      expect(sanitizeTextInput(longText, 50)).toBe('a'.repeat(50));
    });

    it('handles empty strings', () => {
      expect(sanitizeTextInput('')).toBe('');
      expect(sanitizeTextInput('   ')).toBe('');
    });
  });
});