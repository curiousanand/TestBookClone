/**
 * Redux Utilities
 * 
 * Common utilities and patterns for Redux state management.
 */

import type { RootState } from './index';

// Common action types
export interface AsyncThunkMeta {
  requestId: string;
  requestStatus: 'pending' | 'fulfilled' | 'rejected';
}

// Entity adapter utilities
export interface EntityState<T> {
  ids: string[];
  entities: Record<string, T>;
}

// Pagination utilities
export interface PaginatedState {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export const createInitialPaginatedState = (): PaginatedState => ({
  currentPage: 1,
  totalPages: 0,
  totalItems: 0,
  itemsPerPage: 10,
});

// Loading state utilities
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export const createInitialLoadingState = (): LoadingState => ({
  isLoading: false,
  error: null,
});

// Filter state utilities
export interface FilterState<T = Record<string, any>> {
  filters: T;
  activeFilters: string[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export const createInitialFilterState = <T>(initialFilters: T): FilterState<T> => ({
  filters: initialFilters,
  activeFilters: [],
  sortBy: 'createdAt',
  sortOrder: 'desc',
});

// Selection state utilities
export interface SelectionState {
  selectedIds: string[];
  isAllSelected: boolean;
}

export const createInitialSelectionState = (): SelectionState => ({
  selectedIds: [],
  isAllSelected: false,
});

// Common selectors
export const createLoadingSelector = (sliceName: keyof RootState) => 
  (state: RootState) => state[sliceName]?.isLoading || false;

export const createErrorSelector = (sliceName: keyof RootState) => 
  (state: RootState) => state[sliceName]?.error || null;

// Cache utilities
export interface CacheState<T> {
  data: T | null;
  lastUpdated: number | null;
  isStale: boolean;
}

export const createInitialCacheState = <T>(): CacheState<T> => ({
  data: null,
  lastUpdated: null,
  isStale: true,
});

export const isCacheStale = <T>(
  cache: CacheState<T>, 
  maxAge: number = 5 * 60 * 1000 // 5 minutes default
): boolean => {
  if (!cache.lastUpdated) return true;
  return Date.now() - cache.lastUpdated > maxAge;
};

// Optimistic update utilities
export interface OptimisticState<T> {
  optimisticUpdates: Record<string, T>;
  pendingOperations: Set<string>;
}

export const createInitialOptimisticState = <T>(): OptimisticState<T> => ({
  optimisticUpdates: {},
  pendingOperations: new Set(),
});

// Toast/notification utilities
export const createToastId = () => 
  `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const createNotificationId = () => 
  `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Form state utilities
export interface FormFieldState {
  value: any;
  error: string | null;
  touched: boolean;
  dirty: boolean;
}

export interface FormState<T = Record<string, any>> {
  fields: Record<keyof T, FormFieldState>;
  isSubmitting: boolean;
  isValid: boolean;
  submitCount: number;
}

export const createInitialFormState = <T>(initialValues: T): FormState<T> => ({
  fields: Object.keys(initialValues).reduce((fields, key) => {
    fields[key as keyof T] = {
      value: initialValues[key as keyof T],
      error: null,
      touched: false,
      dirty: false,
    };
    return fields;
  }, {} as Record<keyof T, FormFieldState>),
  isSubmitting: false,
  isValid: true,
  submitCount: 0,
});

// Session utilities
export const createSessionId = () => 
  `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Debounced action utilities
export const createDebouncedAction = (action: any, delay: number = 300) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => action(...args), delay);
  };
};

// Storage utilities
export const storage = {
  get: (key: string, defaultValue: any = null) => {
    if (typeof window === 'undefined') return defaultValue;
    
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  
  set: (key: string, value: any) => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  },
  
  remove: (key: string) => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
    }
  },
  
  clear: () => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.clear();
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  },
};

// Retry utilities for failed API calls
export const createRetryConfig = (maxRetries: number = 3, baseDelay: number = 1000) => ({
  maxRetries,
  baseDelay,
  backoff: (attempt: number) => baseDelay * Math.pow(2, attempt),
});

// Common validation utilities
export const validators = {
  required: (value: any) => value != null && value !== '' ? null : 'This field is required',
  
  email: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? null : 'Invalid email address';
  },
  
  minLength: (min: number) => (value: string) => 
    value.length >= min ? null : `Must be at least ${min} characters`,
  
  maxLength: (max: number) => (value: string) => 
    value.length <= max ? null : `Must be no more than ${max} characters`,
  
  pattern: (regex: RegExp, message: string) => (value: string) =>
    regex.test(value) ? null : message,
  
  compose: (...validators: Array<(value: any) => string | null>) => (value: any) => {
    for (const validator of validators) {
      const error = validator(value);
      if (error) return error;
    }
    return null;
  },
};

// Error boundary for Redux components
export class ReduxErrorBoundary extends Error {
  constructor(
    public sliceName: string,
    public actionType: string,
    public originalError: Error
  ) {
    super(`Redux error in ${sliceName} slice (${actionType}): ${originalError.message}`);
    this.name = 'ReduxErrorBoundary';
  }
}