/**
 * Analytics and tracking utilities for user engagement
 */

export interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  properties?: Record<string, any>;
  timestamp: string;
  userId?: string;
}

export class AnalyticsTracker {
  private events: AnalyticsEvent[] = [];
  private userId?: string;
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Set user ID for tracking
   */
  setUserId(userId: string): void {
    this.userId = userId;
  }

  /**
   * Track a custom event
   */
  track(
    event: string,
    category: string,
    action: string,
    label?: string,
    value?: number,
    properties?: Record<string, any>
  ): void {
    const analyticsEvent: AnalyticsEvent = {
      event,
      category,
      action,
      label,
      value,
      properties: {
        ...properties,
        sessionId: this.sessionId,
      },
      timestamp: new Date().toISOString(),
      userId: this.userId,
    };

    this.events.push(analyticsEvent);

    // In production, send to analytics service
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalyticsService(analyticsEvent);
    } else {
      console.log('📊 Analytics Event:', analyticsEvent);
    }
  }

  /**
   * Track user profile actions
   */
  trackProfileAction(action: string, properties?: Record<string, any>): void {
    this.track('profile_action', 'user_profile', action, undefined, undefined, properties);
  }

  /**
   * Track weight logging
   */
  trackWeightLog(weight: number, hasNotes: boolean): void {
    this.track('weight_logged', 'weight_tracking', 'log_weight', undefined, weight, {
      hasNotes,
      weightRange: this.getWeightRange(weight),
    });
  }

  /**
   * Track goal achievement
   */
  trackGoalAchievement(goalType: string, timeToAchieve?: number): void {
    this.track('goal_achieved', 'goals', 'achievement', goalType, timeToAchieve, {
      goalType,
    });
  }

  /**
   * Track feature usage
   */
  trackFeatureUsage(feature: string, action: string, properties?: Record<string, any>): void {
    this.track('feature_usage', 'features', action, feature, undefined, properties);
  }

  /**
   * Track onboarding progress
   */
  trackOnboardingStep(step: number, stepName: string, completed: boolean): void {
    this.track('onboarding_step', 'onboarding', completed ? 'completed' : 'started', stepName, step);
  }

  /**
   * Track engagement metrics
   */
  trackEngagement(type: 'daily_login' | 'streak_milestone' | 'data_export' | 'feedback_submitted', value?: number): void {
    this.track('engagement', 'user_engagement', type, undefined, value);
  }

  /**
   * Track errors for improvement
   */
  trackError(error: string, context?: string, severity: 'low' | 'medium' | 'high' = 'medium'): void {
    this.track('error_occurred', 'errors', severity, error, undefined, {
      context,
      userAgent: navigator.userAgent,
      url: window.location.href,
    });
  }

  /**
   * Track performance metrics
   */
  trackPerformance(metric: string, value: number, context?: string): void {
    this.track('performance_metric', 'performance', metric, context, value);
  }

  private getWeightRange(weight: number): string {
    if (weight < 50) return 'under_50kg';
    if (weight < 70) return '50_70kg';
    if (weight < 90) return '70_90kg';
    if (weight < 110) return '90_110kg';
    return 'over_110kg';
  }

  private async sendToAnalyticsService(event: AnalyticsEvent): Promise<void> {
    try {
      // Example: Send to Google Analytics, Mixpanel, etc.
      // await fetch('/api/analytics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(event),
      // });
    } catch (error) {
      console.error('Failed to send analytics event:', error);
    }
  }

  /**
   * Get session statistics
   */
  getSessionStats(): {
    totalEvents: number;
    sessionDuration: number;
    eventsByCategory: Record<string, number>;
    sessionId: string;
  } {
    const eventsByCategory = this.events.reduce((acc, event) => {
      acc[event.category] = (acc[event.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sessionStart = this.events.length > 0 ? 
      new Date(this.events[0].timestamp).getTime() : Date.now();
    const sessionDuration = Date.now() - sessionStart;

    return {
      totalEvents: this.events.length,
      sessionDuration,
      eventsByCategory,
      sessionId: this.sessionId,
    };
  }

  /**
   * Export analytics data
   */
  exportAnalyticsData(): AnalyticsEvent[] {
    return [...this.events];
  }

  /**
   * Clear session data (useful for testing)
   */
  clearSession(): void {
    this.events = [];
    this.sessionId = this.generateSessionId();
  }
}

// Global analytics instance
export const analytics = new AnalyticsTracker();

// Convenience functions for common tracking scenarios
export const trackProfileCompletion = (completionPercentage: number) => {
  analytics.trackProfileAction('profile_completion', { completionPercentage });
};

export const trackWeightGoalProgress = (progressPercentage: number, goalType: string) => {
  analytics.track('goal_progress', 'goals', 'progress_update', goalType, progressPercentage, {
    goalType,
  });
};

export const trackSubscriptionAction = (action: 'upgrade' | 'downgrade' | 'cancel', plan: string) => {
  analytics.track('subscription_action', 'subscription', action, plan, undefined, { plan });
};

export const trackDataExport = (format: 'json' | 'csv', itemCount: number) => {
  analytics.trackEngagement('data_export', itemCount);
  analytics.track('data_export', 'data', 'export', format, itemCount, { format });
};

export const trackMealLogging = (mealType: string, method: 'manual' | 'barcode' | 'photo') => {
  analytics.track('meal_logged', 'meal_tracking', 'log_meal', mealType, undefined, {
    mealType,
    method,
  });
};

export const trackSearchUsage = (query: string, resultCount: number, source: string) => {
  analytics.trackFeatureUsage('search', 'search_performed', {
    queryLength: query.length,
    resultCount,
    source,
  });
};

export const trackNavigationFlow = (from: string, to: string) => {
  analytics.track('navigation', 'user_flow', 'page_transition', `${from}_to_${to}`, undefined, {
    from,
    to,
  });
};

export const trackFormValidationError = (formName: string, fieldName: string, errorType: string) => {
  analytics.track('validation_error', 'forms', 'validation_failed', formName, undefined, {
    fieldName,
    errorType,
  });
};

// React hook for analytics in components
export function useAnalytics() {
  return {
    track: analytics.track.bind(analytics),
    trackProfileAction: analytics.trackProfileAction.bind(analytics),
    trackWeightLog: analytics.trackWeightLog.bind(analytics),
    trackFeatureUsage: analytics.trackFeatureUsage.bind(analytics),
    trackError: analytics.trackError.bind(analytics),
    setUserId: analytics.setUserId.bind(analytics),
  };
}