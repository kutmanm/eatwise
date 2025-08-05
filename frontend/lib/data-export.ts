/**
 * Data export utilities for user data
 */

import type { UserProfile, WeightLog, UserFeedback } from '@/types';

export interface ExportOptions {
  format: 'json' | 'csv';
  dateRange?: {
    start: string;
    end: string;
  };
  includePersonalInfo?: boolean;
}

export interface UserDataExport {
  profile?: Partial<UserProfile>;
  weightLogs?: WeightLog[];
  feedback?: UserFeedback[];
  exportedAt: string;
  exportVersion: string;
}

/**
 * Export user profile data
 */
export function exportUserProfile(
  profile: UserProfile,
  options: ExportOptions
): UserDataExport {
  const exportData: UserDataExport = {
    exportedAt: new Date().toISOString(),
    exportVersion: '1.0.0',
  };

  // Include profile data (with privacy options)
  if (options.includePersonalInfo) {
    exportData.profile = {
      age: profile.age,
      gender: profile.gender,
      height: profile.height,
      initial_weight: profile.initial_weight,
      current_weight: profile.current_weight,
      target_weight: profile.target_weight,
      activity_level: profile.activity_level,
      goal: profile.goal,
      time_frame: profile.time_frame,
      target_date: profile.target_date,
      water_goal: profile.water_goal,
      calorie_goal: profile.calorie_goal,
      protein_goal: profile.protein_goal,
      carb_goal: profile.carb_goal,
      fat_goal: profile.fat_goal,
      diet_preferences: profile.diet_preferences,
      breakfast_time: profile.breakfast_time,
      lunch_time: profile.lunch_time,
      dinner_time: profile.dinner_time,
      snack_times: profile.snack_times,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    };
  } else {
    // Export only non-personal data
    exportData.profile = {
      activity_level: profile.activity_level,
      goal: profile.goal,
      time_frame: profile.time_frame,
      water_goal: profile.water_goal,
      calorie_goal: profile.calorie_goal,
      protein_goal: profile.protein_goal,
      carb_goal: profile.carb_goal,
      fat_goal: profile.fat_goal,
      diet_preferences: profile.diet_preferences,
    };
  }

  return exportData;
}

/**
 * Export weight logs with date filtering
 */
export function exportWeightLogs(
  weightLogs: WeightLog[],
  options: ExportOptions
): WeightLog[] {
  let filteredLogs = weightLogs;

  // Apply date range filter if specified
  if (options.dateRange) {
    const startDate = new Date(options.dateRange.start);
    const endDate = new Date(options.dateRange.end);

    filteredLogs = weightLogs.filter(log => {
      const logDate = new Date(log.logged_at);
      return logDate >= startDate && logDate <= endDate;
    });
  }

  return filteredLogs.map(log => ({
    id: log.id,
    weight: log.weight,
    notes: log.notes,
    logged_at: log.logged_at,
    user_id: options.includePersonalInfo ? log.user_id : 'redacted',
  }));
}

/**
 * Export user feedback
 */
export function exportUserFeedback(
  feedback: UserFeedback[],
  options: ExportOptions
): UserFeedback[] {
  let filteredFeedback = feedback;

  // Apply date range filter if specified
  if (options.dateRange) {
    const startDate = new Date(options.dateRange.start);
    const endDate = new Date(options.dateRange.end);

    filteredFeedback = feedback.filter(item => {
      const feedbackDate = new Date(item.sent_at);
      return feedbackDate >= startDate && feedbackDate <= endDate;
    });
  }

  return filteredFeedback.map(item => ({
    id: item.id,
    message: item.message,
    sent_at: item.sent_at,
    user_id: options.includePersonalInfo ? item.user_id : 'redacted',
  }));
}

/**
 * Generate complete user data export
 */
export function generateUserDataExport(
  profile: UserProfile,
  weightLogs: WeightLog[],
  feedback: UserFeedback[],
  options: ExportOptions
): UserDataExport {
  const exportData = exportUserProfile(profile, options);
  
  exportData.weightLogs = exportWeightLogs(weightLogs, options);
  exportData.feedback = exportUserFeedback(feedback, options);

  return exportData;
}

/**
 * Convert data to CSV format
 */
export function convertToCSV(data: any[], headers: string[]): string {
  const csvHeaders = headers.join(',');
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      // Handle special characters and commas in CSV
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value || '';
    }).join(',');
  });

  return [csvHeaders, ...csvRows].join('\n');
}

/**
 * Export weight logs as CSV
 */
export function exportWeightLogsAsCSV(weightLogs: WeightLog[]): string {
  const headers = ['logged_at', 'weight', 'notes'];
  const csvData = weightLogs.map(log => ({
    logged_at: new Date(log.logged_at).toLocaleDateString(),
    weight: log.weight,
    notes: log.notes || '',
  }));

  return convertToCSV(csvData, headers);
}

/**
 * Export profile summary as CSV
 */
export function exportProfileSummaryAsCSV(profile: UserProfile): string {
  const headers = ['metric', 'value', 'unit'];
  const csvData = [
    { metric: 'Current Weight', value: profile.current_weight, unit: 'kg' },
    { metric: 'Target Weight', value: profile.target_weight, unit: 'kg' },
    { metric: 'Height', value: profile.height, unit: 'cm' },
    { metric: 'Age', value: profile.age, unit: 'years' },
    { metric: 'Activity Level', value: profile.activity_level, unit: '' },
    { metric: 'Goal', value: profile.goal, unit: '' },
    { metric: 'Water Goal', value: profile.water_goal, unit: 'ml' },
    { metric: 'Calorie Goal', value: profile.calorie_goal || 'Not set', unit: 'cal' },
    { metric: 'Protein Goal', value: profile.protein_goal || 'Not set', unit: 'g' },
    { metric: 'Carb Goal', value: profile.carb_goal || 'Not set', unit: 'g' },
    { metric: 'Fat Goal', value: profile.fat_goal || 'Not set', unit: 'g' },
  ];

  return convertToCSV(csvData, headers);
}

/**
 * Download data as file
 */
export function downloadData(data: string, filename: string, mimeType: string): void {
  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Download user data export
 */
export function downloadUserDataExport(
  profile: UserProfile,
  weightLogs: WeightLog[],
  feedback: UserFeedback[],
  options: ExportOptions
): void {
  const timestamp = new Date().toISOString().split('T')[0];
  
  if (options.format === 'json') {
    const exportData = generateUserDataExport(profile, weightLogs, feedback, options);
    const jsonString = JSON.stringify(exportData, null, 2);
    downloadData(
      jsonString,
      `eatwise-data-export-${timestamp}.json`,
      'application/json'
    );
  } else if (options.format === 'csv') {
    // Create a zip-like structure with multiple CSV files
    const profileCSV = exportProfileSummaryAsCSV(profile);
    const weightLogsCSV = exportWeightLogsAsCSV(exportWeightLogs(weightLogs, options));
    
    // For simplicity, we'll download the weight logs CSV
    // In a real implementation, you might want to zip multiple files
    downloadData(
      weightLogsCSV,
      `eatwise-weight-logs-${timestamp}.csv`,
      'text/csv'
    );
  }
}

/**
 * Generate data summary statistics
 */
export function generateDataSummary(
  profile: UserProfile,
  weightLogs: WeightLog[]
): {
  profileCompleteness: number;
  weightTrackingDays: number;
  totalWeightChange: number;
  averageWeeklyChange: number;
  dataQualityScore: number;
} {
  // Calculate profile completeness
  const requiredFields = [
    'age', 'gender', 'height', 'current_weight', 'target_weight',
    'activity_level', 'goal', 'water_goal'
  ];
  const completedFields = requiredFields.filter(field => 
    profile[field as keyof UserProfile] !== null && 
    profile[field as keyof UserProfile] !== undefined
  );
  const profileCompleteness = Math.round((completedFields.length / requiredFields.length) * 100);

  // Calculate weight tracking statistics
  const sortedLogs = [...weightLogs].sort((a, b) => 
    new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime()
  );
  
  const weightTrackingDays = weightLogs.length > 0 ? 
    Math.ceil((new Date(sortedLogs[sortedLogs.length - 1].logged_at).getTime() - 
               new Date(sortedLogs[0].logged_at).getTime()) / (1000 * 60 * 60 * 24)) + 1 : 0;

  const totalWeightChange = weightLogs.length >= 2 ?
    sortedLogs[sortedLogs.length - 1].weight - sortedLogs[0].weight : 0;

  const averageWeeklyChange = weightTrackingDays > 0 ?
    totalWeightChange / (weightTrackingDays / 7) : 0;

  // Calculate data quality score
  let dataQualityScore = 0;
  dataQualityScore += profileCompleteness * 0.4; // 40% weight for profile
  dataQualityScore += Math.min(weightLogs.length / 30, 1) * 30; // 30% for weight logs frequency
  dataQualityScore += weightLogs.filter(log => log.notes && log.notes.length > 0).length / weightLogs.length * 30; // 30% for detailed logs

  return {
    profileCompleteness,
    weightTrackingDays,
    totalWeightChange: Math.round(totalWeightChange * 10) / 10,
    averageWeeklyChange: Math.round(averageWeeklyChange * 100) / 100,
    dataQualityScore: Math.round(dataQualityScore),
  };
}

/**
 * Generate shareable progress summary
 */
export function generateProgressSummary(
  profile: UserProfile,
  weightLogs: WeightLog[]
): string {
  const summary = generateDataSummary(profile, weightLogs);
  const goalEmoji = {
    weight_loss: '📉',
    muscle_gain: '💪',
    maintain: '⚖️',
    body_recomposition: '🔄',
  }[profile.goal] || '🎯';

  return `My EatWise Progress ${goalEmoji}

🎯 Goal: ${profile.goal.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
📊 Current: ${profile.current_weight}kg → Target: ${profile.target_weight}kg
📈 Total Change: ${summary.totalWeightChange > 0 ? '+' : ''}${summary.totalWeightChange}kg
📅 Tracking: ${summary.weightTrackingDays} days
💯 Profile: ${summary.profileCompleteness}% complete

#EatWise #HealthJourney #Progress`;
}