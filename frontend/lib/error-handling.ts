/**
 * Enhanced error handling utilities for the EatWise application
 */

export interface AppError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
  timestamp: string;
}

export class EatWiseError extends Error {
  public readonly code?: string;
  public readonly status?: number;
  public readonly details?: any;
  public readonly timestamp: string;

  constructor(message: string, code?: string, status?: number, details?: any) {
    super(message);
    this.name = 'EatWiseError';
    this.code = code;
    this.status = status;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }

  toJSON(): AppError {
    return {
      message: this.message,
      code: this.code,
      status: this.status,
      details: this.details,
      timestamp: this.timestamp,
    };
  }
}

export const ErrorCodes = {
  // Authentication errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',

  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',

  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',

  // Profile specific errors
  PROFILE_INCOMPLETE: 'PROFILE_INCOMPLETE',
  INVALID_WEIGHT_RANGE: 'INVALID_WEIGHT_RANGE',
  INVALID_GOAL_COMBINATION: 'INVALID_GOAL_COMBINATION',
  WEIGHT_GOAL_INCONSISTENT: 'WEIGHT_GOAL_INCONSISTENT',

  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  TIMEOUT: 'TIMEOUT',
  CONNECTION_FAILED: 'CONNECTION_FAILED',

  // Feature specific errors
  PREMIUM_REQUIRED: 'PREMIUM_REQUIRED',
  FEATURE_DISABLED: 'FEATURE_DISABLED',
  RATE_LIMITED: 'RATE_LIMITED',
} as const;

export const ErrorMessages = {
  [ErrorCodes.UNAUTHORIZED]: 'Please sign in to access this feature',
  [ErrorCodes.FORBIDDEN]: 'You don\'t have permission to perform this action',
  [ErrorCodes.TOKEN_EXPIRED]: 'Your session has expired. Please sign in again',
  [ErrorCodes.INVALID_CREDENTIALS]: 'Invalid email or password',

  [ErrorCodes.VALIDATION_ERROR]: 'Please check your input and try again',
  [ErrorCodes.INVALID_INPUT]: 'The provided information is not valid',
  [ErrorCodes.MISSING_REQUIRED_FIELD]: 'Please fill in all required fields',
  [ErrorCodes.INVALID_FORMAT]: 'Please check the format of your input',

  [ErrorCodes.NOT_FOUND]: 'The requested resource was not found',
  [ErrorCodes.ALREADY_EXISTS]: 'This item already exists',
  [ErrorCodes.RESOURCE_CONFLICT]: 'There was a conflict with your request',

  [ErrorCodes.PROFILE_INCOMPLETE]: 'Please complete your profile to continue',
  [ErrorCodes.INVALID_WEIGHT_RANGE]: 'Weight must be between 20 and 500 kg',
  [ErrorCodes.INVALID_GOAL_COMBINATION]: 'Your weight goals don\'t match your selected fitness goal',
  [ErrorCodes.WEIGHT_GOAL_INCONSISTENT]: 'Your target weight is not consistent with your selected goal',

  [ErrorCodes.NETWORK_ERROR]: 'Network connection failed. Please check your internet connection',
  [ErrorCodes.SERVER_ERROR]: 'Something went wrong on our end. Please try again later',
  [ErrorCodes.TIMEOUT]: 'Request timed out. Please try again',
  [ErrorCodes.CONNECTION_FAILED]: 'Unable to connect to the server',

  [ErrorCodes.PREMIUM_REQUIRED]: 'This feature requires a premium subscription',
  [ErrorCodes.FEATURE_DISABLED]: 'This feature is currently unavailable',
  [ErrorCodes.RATE_LIMITED]: 'Too many requests. Please wait a moment and try again',
} as const;

/**
 * Parse API error response and create structured error
 */
export function parseAPIError(error: any): EatWiseError {
  // Network errors
  if (!error.response) {
    if (error.code === 'NETWORK_ERR' || error.message?.includes('Network Error')) {
      return new EatWiseError(
        ErrorMessages[ErrorCodes.NETWORK_ERROR],
        ErrorCodes.NETWORK_ERROR,
        0,
        error.message
      );
    }
    
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return new EatWiseError(
        ErrorMessages[ErrorCodes.TIMEOUT],
        ErrorCodes.TIMEOUT,
        0,
        error.message
      );
    }
    
    return new EatWiseError(
      ErrorMessages[ErrorCodes.CONNECTION_FAILED],
      ErrorCodes.CONNECTION_FAILED,
      0,
      error.message
    );
  }

  const { status, data } = error.response;

  // Handle different HTTP status codes
  switch (status) {
    case 400:
      if (data?.code === ErrorCodes.VALIDATION_ERROR) {
        return new EatWiseError(
          data.message || ErrorMessages[ErrorCodes.VALIDATION_ERROR],
          ErrorCodes.VALIDATION_ERROR,
          400,
          data.errors
        );
      }
      return new EatWiseError(
        data?.message || ErrorMessages[ErrorCodes.INVALID_INPUT],
        ErrorCodes.INVALID_INPUT,
        400,
        data
      );

    case 401:
      return new EatWiseError(
        data?.message || ErrorMessages[ErrorCodes.UNAUTHORIZED],
        ErrorCodes.UNAUTHORIZED,
        401,
        data
      );

    case 403:
      if (data?.code === ErrorCodes.PREMIUM_REQUIRED) {
        return new EatWiseError(
          ErrorMessages[ErrorCodes.PREMIUM_REQUIRED],
          ErrorCodes.PREMIUM_REQUIRED,
          403,
          data
        );
      }
      return new EatWiseError(
        data?.message || ErrorMessages[ErrorCodes.FORBIDDEN],
        ErrorCodes.FORBIDDEN,
        403,
        data
      );

    case 404:
      return new EatWiseError(
        data?.message || ErrorMessages[ErrorCodes.NOT_FOUND],
        ErrorCodes.NOT_FOUND,
        404,
        data
      );

    case 409:
      return new EatWiseError(
        data?.message || ErrorMessages[ErrorCodes.ALREADY_EXISTS],
        ErrorCodes.ALREADY_EXISTS,
        409,
        data
      );

    case 422:
      return new EatWiseError(
        data?.message || ErrorMessages[ErrorCodes.VALIDATION_ERROR],
        ErrorCodes.VALIDATION_ERROR,
        422,
        data.errors || data
      );

    case 429:
      return new EatWiseError(
        ErrorMessages[ErrorCodes.RATE_LIMITED],
        ErrorCodes.RATE_LIMITED,
        429,
        data
      );

    case 500:
    case 502:
    case 503:
    case 504:
      return new EatWiseError(
        ErrorMessages[ErrorCodes.SERVER_ERROR],
        ErrorCodes.SERVER_ERROR,
        status,
        data
      );

    default:
      return new EatWiseError(
        data?.message || 'An unexpected error occurred',
        'UNKNOWN_ERROR',
        status,
        data
      );
  }
}

/**
 * Enhanced error handler with user-friendly messages
 */
export function handleError(error: any, context?: string): EatWiseError {
  let appError: EatWiseError;

  if (error instanceof EatWiseError) {
    appError = error;
  } else if (error.response || error.request) {
    // Axios error
    appError = parseAPIError(error);
  } else if (error instanceof Error) {
    // Regular JavaScript error
    appError = new EatWiseError(
      error.message,
      'JAVASCRIPT_ERROR',
      undefined,
      { stack: error.stack, context }
    );
  } else {
    // Unknown error
    appError = new EatWiseError(
      'An unexpected error occurred',
      'UNKNOWN_ERROR',
      undefined,
      { originalError: error, context }
    );
  }

  // Log error for debugging (in development)
  if (process.env.NODE_ENV === 'development') {
    console.group(`🚨 EatWise Error ${context ? `(${context})` : ''}`);
    console.error('Message:', appError.message);
    console.error('Code:', appError.code);
    console.error('Status:', appError.status);
    console.error('Details:', appError.details);
    console.error('Original Error:', error);
    console.groupEnd();
  }

  return appError;
}

/**
 * Retry wrapper for API calls with exponential backoff
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Don't retry for certain error types
      const appError = handleError(error);
      const nonRetryableCodes = [
        ErrorCodes.UNAUTHORIZED,
        ErrorCodes.FORBIDDEN,
        ErrorCodes.NOT_FOUND,
        ErrorCodes.VALIDATION_ERROR,
        ErrorCodes.INVALID_INPUT,
      ];

      if (nonRetryableCodes.includes(appError.code as any)) {
        throw appError;
      }

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw handleError(lastError, `Failed after ${maxRetries + 1} attempts`);
}

/**
 * Format error for user display
 */
export function formatErrorForUser(error: EatWiseError): string {
  // Use custom message if available, otherwise use default
  if (error.code && ErrorMessages[error.code as keyof typeof ErrorMessages]) {
    return ErrorMessages[error.code as keyof typeof ErrorMessages];
  }
  
  return error.message || 'An unexpected error occurred';
}

/**
 * Check if error indicates user needs to complete profile
 */
export function isProfileIncompleteError(error: EatWiseError): boolean {
  return error.code === ErrorCodes.PROFILE_INCOMPLETE ||
         error.message?.toLowerCase().includes('complete your profile') ||
         error.status === 422 && error.details?.profile;
}

/**
 * Check if error requires premium subscription
 */
export function isPremiumRequiredError(error: EatWiseError): boolean {
  return error.code === ErrorCodes.PREMIUM_REQUIRED ||
         error.message?.toLowerCase().includes('premium') ||
         error.status === 403 && error.details?.premium;
}

/**
 * Check if error is due to network issues
 */
export function isNetworkError(error: EatWiseError): boolean {
  const networkCodes = [
    ErrorCodes.NETWORK_ERROR,
    ErrorCodes.CONNECTION_FAILED,
    ErrorCodes.TIMEOUT,
  ];
  
  return networkCodes.includes(error.code as any) || error.status === 0;
}

/**
 * Global error boundary helper
 */
export function createErrorBoundaryHandler(
  onError?: (error: EatWiseError) => void
) {
  return (error: Error, errorInfo: any) => {
    const appError = handleError(error, 'React Error Boundary');
    
    // Call custom error handler if provided
    onError?.(appError);
    
    // Log to error reporting service in production
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(appError);
    }
  };
}