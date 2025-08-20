/**
 * Error Handling Utilities
 * 
 * Provides comprehensive error handling, classification, and user-friendly error messages
 * for the TestBook Clone application.
 */

import { ZodError } from 'zod';
import { logger } from './logger';

// =============================================================================
// ERROR TYPES AND INTERFACES
// =============================================================================

export interface AppError {
  code: string;
  message: string;
  userMessage: string;
  statusCode: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'validation' | 'authentication' | 'authorization' | 'network' | 'server' | 'client' | 'business';
  details?: any;
  stack?: string;
  timestamp: string;
  context?: Record<string, any>;
}

export interface ErrorDisplayOptions {
  showDetails?: boolean;
  showRetry?: boolean;
  showContact?: boolean;
  customActions?: Array<{
    label: string;
    action: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
  }>;
}

// =============================================================================
// ERROR CLASSIFICATION
// =============================================================================

export const ERROR_CODES = {
  // Validation Errors (400)
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  
  // Authentication Errors (401)
  AUTHENTICATION_REQUIRED: 'AUTHENTICATION_REQUIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  
  // Authorization Errors (403)
  ACCESS_DENIED: 'ACCESS_DENIED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  ACCOUNT_SUSPENDED: 'ACCOUNT_SUSPENDED',
  
  // Not Found Errors (404)
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  PAGE_NOT_FOUND: 'PAGE_NOT_FOUND',
  COURSE_NOT_FOUND: 'COURSE_NOT_FOUND',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  
  // Conflict Errors (409)
  RESOURCE_EXISTS: 'RESOURCE_EXISTS',
  EMAIL_EXISTS: 'EMAIL_EXISTS',
  SLUG_EXISTS: 'SLUG_EXISTS',
  
  // Rate Limiting (429)
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // Server Errors (500)
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  
  // Network Errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  CONNECTION_ERROR: 'CONNECTION_ERROR',
  
  // Business Logic Errors
  ENROLLMENT_LIMIT_REACHED: 'ENROLLMENT_LIMIT_REACHED',
  COURSE_NOT_AVAILABLE: 'COURSE_NOT_AVAILABLE',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  SUBSCRIPTION_EXPIRED: 'SUBSCRIPTION_EXPIRED',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

// =============================================================================
// ERROR MESSAGES
// =============================================================================

const ERROR_MESSAGES: Record<ErrorCode, { message: string; userMessage: string; severity: AppError['severity']; category: AppError['category'] }> = {
  // Validation Errors
  [ERROR_CODES.VALIDATION_FAILED]: {
    message: 'Validation failed',
    userMessage: 'Please check your input and try again.',
    severity: 'low',
    category: 'validation',
  },
  [ERROR_CODES.INVALID_INPUT]: {
    message: 'Invalid input provided',
    userMessage: 'The information you entered is not valid. Please check and try again.',
    severity: 'low',
    category: 'validation',
  },
  [ERROR_CODES.MISSING_REQUIRED_FIELD]: {
    message: 'Required field is missing',
    userMessage: 'Please fill in all required fields.',
    severity: 'low',
    category: 'validation',
  },
  [ERROR_CODES.INVALID_FORMAT]: {
    message: 'Invalid format',
    userMessage: 'Please check the format of your input.',
    severity: 'low',
    category: 'validation',
  },
  
  // Authentication Errors
  [ERROR_CODES.AUTHENTICATION_REQUIRED]: {
    message: 'Authentication required',
    userMessage: 'Please sign in to continue.',
    severity: 'medium',
    category: 'authentication',
  },
  [ERROR_CODES.INVALID_CREDENTIALS]: {
    message: 'Invalid credentials',
    userMessage: 'Invalid email or password. Please try again.',
    severity: 'medium',
    category: 'authentication',
  },
  [ERROR_CODES.TOKEN_EXPIRED]: {
    message: 'Token expired',
    userMessage: 'Your session has expired. Please sign in again.',
    severity: 'medium',
    category: 'authentication',
  },
  [ERROR_CODES.TOKEN_INVALID]: {
    message: 'Invalid token',
    userMessage: 'Invalid session. Please sign in again.',
    severity: 'medium',
    category: 'authentication',
  },
  
  // Authorization Errors
  [ERROR_CODES.ACCESS_DENIED]: {
    message: 'Access denied',
    userMessage: 'You do not have permission to access this resource.',
    severity: 'medium',
    category: 'authorization',
  },
  [ERROR_CODES.INSUFFICIENT_PERMISSIONS]: {
    message: 'Insufficient permissions',
    userMessage: 'You do not have sufficient permissions to perform this action.',
    severity: 'medium',
    category: 'authorization',
  },
  [ERROR_CODES.ACCOUNT_SUSPENDED]: {
    message: 'Account suspended',
    userMessage: 'Your account has been suspended. Please contact support.',
    severity: 'high',
    category: 'authorization',
  },
  
  // Not Found Errors
  [ERROR_CODES.RESOURCE_NOT_FOUND]: {
    message: 'Resource not found',
    userMessage: 'The requested resource could not be found.',
    severity: 'low',
    category: 'client',
  },
  [ERROR_CODES.PAGE_NOT_FOUND]: {
    message: 'Page not found',
    userMessage: 'The page you are looking for does not exist.',
    severity: 'low',
    category: 'client',
  },
  [ERROR_CODES.COURSE_NOT_FOUND]: {
    message: 'Course not found',
    userMessage: 'The course you are looking for does not exist.',
    severity: 'low',
    category: 'client',
  },
  [ERROR_CODES.USER_NOT_FOUND]: {
    message: 'User not found',
    userMessage: 'User not found.',
    severity: 'low',
    category: 'client',
  },
  
  // Conflict Errors
  [ERROR_CODES.RESOURCE_EXISTS]: {
    message: 'Resource already exists',
    userMessage: 'This resource already exists.',
    severity: 'low',
    category: 'validation',
  },
  [ERROR_CODES.EMAIL_EXISTS]: {
    message: 'Email already exists',
    userMessage: 'An account with this email already exists.',
    severity: 'low',
    category: 'validation',
  },
  [ERROR_CODES.SLUG_EXISTS]: {
    message: 'Slug already exists',
    userMessage: 'This URL slug is already taken.',
    severity: 'low',
    category: 'validation',
  },
  
  // Rate Limiting
  [ERROR_CODES.RATE_LIMIT_EXCEEDED]: {
    message: 'Rate limit exceeded',
    userMessage: 'Too many requests. Please wait a moment and try again.',
    severity: 'medium',
    category: 'client',
  },
  
  // Server Errors
  [ERROR_CODES.INTERNAL_SERVER_ERROR]: {
    message: 'Internal server error',
    userMessage: 'Something went wrong on our end. Please try again later.',
    severity: 'critical',
    category: 'server',
  },
  [ERROR_CODES.DATABASE_ERROR]: {
    message: 'Database error',
    userMessage: 'We are experiencing technical difficulties. Please try again later.',
    severity: 'critical',
    category: 'server',
  },
  [ERROR_CODES.EXTERNAL_SERVICE_ERROR]: {
    message: 'External service error',
    userMessage: 'A third-party service is currently unavailable. Please try again later.',
    severity: 'high',
    category: 'server',
  },
  
  // Network Errors
  [ERROR_CODES.NETWORK_ERROR]: {
    message: 'Network error',
    userMessage: 'Please check your internet connection and try again.',
    severity: 'medium',
    category: 'network',
  },
  [ERROR_CODES.TIMEOUT_ERROR]: {
    message: 'Request timeout',
    userMessage: 'The request took too long. Please try again.',
    severity: 'medium',
    category: 'network',
  },
  [ERROR_CODES.CONNECTION_ERROR]: {
    message: 'Connection error',
    userMessage: 'Unable to connect to our servers. Please try again later.',
    severity: 'medium',
    category: 'network',
  },
  
  // Business Logic Errors
  [ERROR_CODES.ENROLLMENT_LIMIT_REACHED]: {
    message: 'Enrollment limit reached',
    userMessage: 'This course has reached its enrollment limit.',
    severity: 'medium',
    category: 'business',
  },
  [ERROR_CODES.COURSE_NOT_AVAILABLE]: {
    message: 'Course not available',
    userMessage: 'This course is not currently available for enrollment.',
    severity: 'medium',
    category: 'business',
  },
  [ERROR_CODES.PAYMENT_FAILED]: {
    message: 'Payment failed',
    userMessage: 'Payment could not be processed. Please try again or use a different payment method.',
    severity: 'medium',
    category: 'business',
  },
  [ERROR_CODES.SUBSCRIPTION_EXPIRED]: {
    message: 'Subscription expired',
    userMessage: 'Your subscription has expired. Please renew to continue accessing this content.',
    severity: 'medium',
    category: 'business',
  },
};

// =============================================================================
// ERROR CREATION AND CLASSIFICATION
// =============================================================================

export class AppErrorClass extends Error implements AppError {
  code: string;
  message: string;
  userMessage: string;
  statusCode: number;
  severity: AppError['severity'];
  category: AppError['category'];
  details?: any;
  timestamp: string;
  context?: Record<string, any>;

  constructor(
    code: ErrorCode,
    customMessage?: string,
    customUserMessage?: string,
    statusCode?: number,
    details?: any,
    context?: Record<string, any>
  ) {
    const errorConfig = ERROR_MESSAGES[code];
    const message = customMessage || errorConfig.message;
    
    super(message);
    
    this.name = 'AppError';
    this.code = code;
    this.message = message;
    this.userMessage = customUserMessage || errorConfig.userMessage;
    this.statusCode = statusCode || this.getStatusCodeFromCode(code);
    this.severity = errorConfig.severity;
    this.category = errorConfig.category;
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.context = context;
  }

  private getStatusCodeFromCode(code: ErrorCode): number {
    if (code.includes('VALIDATION') || code.includes('INVALID') || code.includes('MISSING')) return 400;
    if (code.includes('AUTHENTICATION') || code.includes('TOKEN')) return 401;
    if (code.includes('ACCESS') || code.includes('PERMISSION') || code.includes('SUSPENDED')) return 403;
    if (code.includes('NOT_FOUND')) return 404;
    if (code.includes('EXISTS') || code.includes('CONFLICT')) return 409;
    if (code.includes('RATE_LIMIT')) return 429;
    return 500;
  }

  toJSON(): AppError {
    return {
      code: this.code,
      message: this.message,
      userMessage: this.userMessage,
      statusCode: this.statusCode,
      severity: this.severity,
      category: this.category,
      details: this.details,
      stack: this.stack,
      timestamp: this.timestamp,
      context: this.context,
    };
  }
}

// =============================================================================
// ERROR FACTORY FUNCTIONS
// =============================================================================

export function createError(
  code: ErrorCode,
  customMessage?: string,
  customUserMessage?: string,
  statusCode?: number,
  details?: any,
  context?: Record<string, any>
): AppErrorClass {
  return new AppErrorClass(code, customMessage, customUserMessage, statusCode, details, context);
}

export function createValidationError(message: string, details?: any): AppErrorClass {
  return createError(ERROR_CODES.VALIDATION_FAILED, message, undefined, 400, details);
}

export function createAuthenticationError(message?: string): AppErrorClass {
  return createError(ERROR_CODES.AUTHENTICATION_REQUIRED, message);
}

export function createAuthorizationError(message?: string): AppErrorClass {
  return createError(ERROR_CODES.ACCESS_DENIED, message);
}

export function createNotFoundError(resource?: string): AppErrorClass {
  const message = resource ? `${resource} not found` : undefined;
  const userMessage = resource ? `The ${resource.toLowerCase()} you are looking for does not exist.` : undefined;
  return createError(ERROR_CODES.RESOURCE_NOT_FOUND, message, userMessage, 404);
}

export function createConflictError(resource?: string): AppErrorClass {
  const message = resource ? `${resource} already exists` : undefined;
  const userMessage = resource ? `This ${resource.toLowerCase()} already exists.` : undefined;
  return createError(ERROR_CODES.RESOURCE_EXISTS, message, userMessage, 409);
}

export function createInternalError(message?: string, details?: any): AppErrorClass {
  return createError(ERROR_CODES.INTERNAL_SERVER_ERROR, message, undefined, 500, details);
}

// =============================================================================
// ERROR PARSING AND CONVERSION
// =============================================================================

export function parseError(error: unknown, context?: Record<string, any>): AppError {
  // If it's already an AppError, return it
  if (error instanceof AppErrorClass) {
    return error.toJSON();
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return createValidationError('Validation failed', {
      zodErrors: error.errors,
      formattedErrors: error.format(),
    }).toJSON();
  }

  // Handle standard errors
  if (error instanceof Error) {
    // Check if it's a network error
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return createError(ERROR_CODES.NETWORK_ERROR, error.message, undefined, undefined, undefined, context).toJSON();
    }

    // Check if it's a timeout error
    if (error.message.includes('timeout')) {
      return createError(ERROR_CODES.TIMEOUT_ERROR, error.message, undefined, undefined, undefined, context).toJSON();
    }

    // Default to internal server error
    return createInternalError(error.message, { stack: error.stack }).toJSON();
  }

  // Handle string errors
  if (typeof error === 'string') {
    return createInternalError(error).toJSON();
  }

  // Handle unknown errors
  return createInternalError('An unknown error occurred', { originalError: error }).toJSON();
}

// =============================================================================
// ERROR HANDLING UTILITIES
// =============================================================================

export function handleApiError(error: unknown, context?: Record<string, any>): AppError {
  const appError = parseError(error, context);

  // Log the error
  logger.error('API Error occurred', {
    error: appError,
    context,
  });

  return appError;
}

export function handleClientError(error: unknown, context?: Record<string, any>): AppError {
  const appError = parseError(error, context);

  // Log the error (less verbose for client errors)
  logger.warn('Client Error occurred', {
    code: appError.code,
    message: appError.message,
    severity: appError.severity,
    context,
  });

  return appError;
}

// =============================================================================
// FORM VALIDATION ERROR UTILITIES
// =============================================================================

export interface FieldError {
  field: string;
  message: string;
  code?: string;
}

export function extractFieldErrors(error: AppError): FieldError[] {
  if (error.details?.zodErrors) {
    return error.details.zodErrors.map((err: any) => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
    }));
  }

  return [];
}

export function formatFieldErrors(fieldErrors: FieldError[]): Record<string, string> {
  return fieldErrors.reduce((acc, error) => {
    acc[error.field] = error.message;
    return acc;
  }, {} as Record<string, string>);
}

// =============================================================================
// ERROR RETRY UTILITIES
// =============================================================================

export interface RetryOptions {
  maxRetries: number;
  delay: number;
  backoff?: 'linear' | 'exponential';
  retryCondition?: (error: AppError) => boolean;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  const { maxRetries, delay, backoff = 'exponential', retryCondition } = options;
  
  let lastError: AppError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = parseError(error);
      
      // Don't retry if we've reached max retries
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Don't retry if condition is not met
      if (retryCondition && !retryCondition(lastError)) {
        throw lastError;
      }
      
      // Don't retry client errors (4xx) except for 429 (rate limit)
      if (lastError.statusCode >= 400 && lastError.statusCode < 500 && lastError.statusCode !== 429) {
        throw lastError;
      }
      
      // Calculate delay
      let waitTime = delay;
      if (backoff === 'exponential') {
        waitTime = delay * Math.pow(2, attempt);
      } else if (backoff === 'linear') {
        waitTime = delay * (attempt + 1);
      }
      
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError!;
}

// =============================================================================
// ERROR CONTEXT UTILITIES
// =============================================================================

export function createErrorContext(request?: any): Record<string, any> {
  const context: Record<string, any> = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  };

  if (typeof window !== 'undefined') {
    context.client = {
      url: window.location.href,
      userAgent: window.navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    };
  }

  if (request) {
    context.request = {
      method: request.method,
      url: request.url,
      headers: Object.fromEntries(request.headers?.entries?.() || []),
    };
  }

  return context;
}