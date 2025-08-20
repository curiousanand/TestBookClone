/**
 * Form Validation Hook
 * 
 * Custom React hook that integrates Zod schemas with React Hook Form
 * for comprehensive client-side and server-side validation.
 */

import { useForm, UseFormProps, UseFormReturn, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useCallback } from 'react';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ServerValidationResponse {
  success: boolean;
  errors?: ValidationError[];
  data?: any;
}

export interface UseFormValidationOptions<T extends FieldValues> extends Omit<UseFormProps<T>, 'resolver'> {
  schema: z.ZodType<T>;
  onSubmit?: (data: T) => Promise<void> | void;
  onError?: (errors: ValidationError[]) => void;
  validateOnServer?: boolean;
  serverValidationEndpoint?: string;
  transformData?: (data: T) => any;
  resetOnSuccess?: boolean;
}

export interface UseFormValidationReturn<T extends FieldValues> extends UseFormReturn<T> {
  isValidating: boolean;
  serverErrors: ValidationError[];
  submitWithValidation: (data: T) => Promise<void>;
  validateField: (fieldName: keyof T, value: any) => Promise<boolean>;
  clearServerErrors: () => void;
  setServerErrors: (errors: ValidationError[]) => void;
}

// =============================================================================
// MAIN HOOK
// =============================================================================

export function useFormValidation<T extends FieldValues>({
  schema,
  onSubmit,
  onError,
  validateOnServer = false,
  serverValidationEndpoint,
  transformData,
  resetOnSuccess = false,
  ...formOptions
}: UseFormValidationOptions<T>) {
  const [isValidating, setIsValidating] = useState(false);
  const [serverErrors, setServerErrors] = useState<ValidationError[]>([]);

  // Initialize React Hook Form with Zod resolver
  const form = useForm<T>({
    resolver: zodResolver(schema as any),
    mode: 'onChange',
    ...formOptions,
  });

  const { handleSubmit, setError, clearErrors, reset } = form;

  // Clear server errors
  const clearServerErrors = useCallback(() => {
    setServerErrors([]);
  }, []);

  // Set server errors and map them to form fields
  const setServerErrorsState = useCallback((errors: ValidationError[]) => {
    setServerErrors(errors);
    
    // Map server errors to form fields
    errors.forEach(error => {
      if (error.field) {
        setError(error.field as any, {
          type: 'server',
          message: error.message,
        });
      }
    });
  }, [setError]);

  // Validate individual field
  const validateField = useCallback(async (fieldName: keyof T, value: any): Promise<boolean> => {
    try {
      // Clear previous errors for this field
      clearErrors(fieldName as any);
      
      // Basic validation using the schema
      await schema.parseAsync({ [fieldName]: value });
      
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors[0]?.message || 'Invalid value';
        setError(fieldName as any, {
          type: 'validation',
          message: errorMessage,
        });
      }
      return false;
    }
  }, [schema, clearErrors, setError]);

  // Server-side validation
  const validateOnServerSide = useCallback(async (data: T): Promise<ServerValidationResponse> => {
    if (!validateOnServer || !serverValidationEndpoint) {
      return { success: true, data };
    }

    try {
      const response = await fetch(serverValidationEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transformData ? transformData(data) : data),
      });

      const result = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          errors: result.errors || [{ field: '', message: 'Server validation failed' }],
        };
      }

      return { success: true, data: result.data || data };
    } catch (error) {
      return {
        success: false,
        errors: [{ field: '', message: 'Network error during validation' }],
      };
    }
  }, [validateOnServer, serverValidationEndpoint, transformData]);

  // Submit with comprehensive validation
  const submitWithValidation = useCallback(async (data: T) => {
    setIsValidating(true);
    clearServerErrors();
    clearErrors();

    try {
      // Client-side validation (already handled by Zod resolver)
      
      // Server-side validation if enabled
      const serverValidation = await validateOnServerSide(data);
      
      if (!serverValidation.success) {
        setServerErrorsState(serverValidation.errors || []);
        if (onError) {
          onError(serverValidation.errors || []);
        }
        return;
      }

      // Execute the actual submission
      if (onSubmit) {
        await onSubmit(serverValidation.data || data);
      }

      // Reset form if requested
      if (resetOnSuccess) {
        reset();
      }

    } catch (error) {
      console.error('Form submission error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      const errors: ValidationError[] = [{ field: '', message: errorMessage }];
      
      setServerErrorsState(errors);
      if (onError) {
        onError(errors);
      }
    } finally {
      setIsValidating(false);
    }
  }, [
    validateOnServerSide,
    onSubmit,
    onError,
    resetOnSuccess,
    reset,
    clearServerErrors,
    clearErrors,
    setServerErrorsState,
  ]);

  return {
    ...form,
    isValidating,
    serverErrors,
    submitWithValidation,
    validateField,
    clearServerErrors,
    setServerErrors: setServerErrorsState,
  };
}

// =============================================================================
// SPECIALIZED HOOKS FOR DIFFERENT FORM TYPES
// =============================================================================

// Authentication form hook
export function useAuthForm<T extends FieldValues>(
  schema: z.ZodType<T>,
  options?: Omit<UseFormValidationOptions<T>, 'schema'>
) {
  return useFormValidation({
    schema,
    validateOnServer: true,
    serverValidationEndpoint: '/api/auth/validate',
    ...options,
  });
}

// Course form hook
export function useCourseForm<T extends FieldValues>(
  schema: z.ZodType<T>,
  options?: Omit<UseFormValidationOptions<T>, 'schema'>
) {
  return useFormValidation({
    schema,
    validateOnServer: true,
    serverValidationEndpoint: '/api/courses/validate',
    ...options,
  });
}

// Exam form hook
export function useExamForm<T extends FieldValues>(
  schema: z.ZodType<T>,
  options?: Omit<UseFormValidationOptions<T>, 'schema'>
) {
  return useFormValidation({
    schema,
    validateOnServer: true,
    serverValidationEndpoint: '/api/exams/validate',
    ...options,
  });
}

// Payment form hook
export function usePaymentForm<T extends FieldValues>(
  schema: z.ZodType<T>,
  options?: Omit<UseFormValidationOptions<T>, 'schema'>
) {
  return useFormValidation({
    schema,
    validateOnServer: true,
    serverValidationEndpoint: '/api/payments/validate',
    mode: 'onChange', // Real-time validation for payment forms
    ...options,
  });
}

// =============================================================================
// UTILITY HOOKS
// =============================================================================

// Multi-step form validation hook
export function useMultiStepForm<T extends FieldValues>(
  schemas: z.ZodType<any>[],
  options?: Omit<UseFormValidationOptions<T>, 'schema'>
) {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepData, setStepData] = useState<Partial<T>[]>([]);

  const currentSchema = schemas[currentStep];
  
  const form = useFormValidation({
    schema: currentSchema,
    ...options,
  });

  const nextStep = useCallback(async (data: any) => {
    // Validate current step
    try {
      await currentSchema.parseAsync(data);
      
      // Save step data
      const newStepData = [...stepData];
      newStepData[currentStep] = data;
      setStepData(newStepData);
      
      // Move to next step
      if (currentStep < schemas.length - 1) {
        setCurrentStep(currentStep + 1);
      }
      
      return true;
    } catch (error) {
      return false;
    }
  }, [currentStep, currentSchema, stepData, schemas.length]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const submitAllSteps = useCallback(async () => {
    // Combine all step data
    const allData = stepData.reduce((acc, step) => ({ ...acc, ...step }), {} as T);
    
    try {
      if (options?.onSubmit) {
        await options.onSubmit(allData);
      }
      return true;
    } catch (error) {
      return false;
    }
  }, [stepData, options]);

  return {
    ...form,
    currentStep,
    totalSteps: schemas.length,
    stepData,
    nextStep,
    prevStep,
    submitAllSteps,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === schemas.length - 1,
  };
}

// Simple validation helper
export function useSimpleValidation<T extends FieldValues>(schema: z.ZodType<T>) {
  const validateData = useCallback(async (data: T): Promise<{ success: boolean; errors: ValidationError[] }> => {
    try {
      await schema.parseAsync(data);
      return { success: true, errors: [] };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: ValidationError[] = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));
        return { success: false, errors };
      }
      return { success: false, errors: [{ field: '', message: 'Validation failed' }] };
    }
  }, [schema]);

  return { validateData };
}

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

// Format validation errors for display
export function formatValidationErrors(errors: ValidationError[]): Record<string, string> {
  return errors.reduce((acc, error) => {
    acc[error.field || 'general'] = error.message;
    return acc;
  }, {} as Record<string, string>);
}

// Check if form has specific error type
export function hasErrorType(errors: ValidationError[], type: string): boolean {
  return errors.some(error => error.code === type);
}

// Get errors for specific field
export function getFieldErrors(errors: ValidationError[], fieldName: string): ValidationError[] {
  return errors.filter(error => error.field === fieldName);
}

// Merge client and server errors
export function mergeErrors(
  clientErrors: Record<string, any>,
  serverErrors: ValidationError[]
): ValidationError[] {
  const merged: ValidationError[] = [];
  
  // Add client errors
  Object.entries(clientErrors).forEach(([field, error]) => {
    if (error?.message) {
      merged.push({
        field,
        message: error.message,
        code: error.type || 'client',
      });
    }
  });
  
  // Add server errors (avoiding duplicates)
  serverErrors.forEach(serverError => {
    const exists = merged.some(
      error => error.field === serverError.field && error.message === serverError.message
    );
    if (!exists) {
      merged.push(serverError);
    }
  });
  
  return merged;
}

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type {
  UseFormValidationOptions,
  ValidationError,
  ServerValidationResponse,
};