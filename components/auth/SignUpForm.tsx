/**
 * Sign Up Form Component
 * 
 * Provides user registration with email/password and phone verification.
 * Includes comprehensive form validation and terms acceptance.
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { FormField, ValidationResult } from '@/types';

// =============================================================================
// TYPES
// =============================================================================

interface SignUpFormProps {
  className?: string;
  redirectTo?: string;
  showSocialSignup?: boolean;
  onSuccess?: (user: any) => void;
  onError?: (error: string) => void;
}

interface SignUpFormState {
  name: FormField<string>;
  email: FormField<string>;
  phone: FormField<string>;
  password: FormField<string>;
  confirmPassword: FormField<string>;
  termsAccepted: FormField<boolean>;
  marketingConsent: FormField<boolean>;
  isSubmitting: boolean;
  error: string | null;
  step: 'form' | 'verification';
}

// =============================================================================
// VALIDATION
// =============================================================================

function validateName(name: string): ValidationResult {
  const errors: string[] = [];
  
  if (!name.trim()) {
    errors.push('Full name is required');
  } else if (name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  } else if (name.trim().length > 50) {
    errors.push('Name must be less than 50 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors.map(message => ({ field: 'name', message, code: 'VALIDATION_ERROR' })),
  };
}

function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];
  
  if (!email) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Please enter a valid email address');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors.map(message => ({ field: 'email', message, code: 'VALIDATION_ERROR' })),
  };
}

function validatePhone(phone: string): ValidationResult {
  const errors: string[] = [];
  
  if (phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(phone)) {
    errors.push('Please enter a valid phone number');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors.map(message => ({ field: 'phone', message, code: 'VALIDATION_ERROR' })),
  };
}

function validatePassword(password: string): ValidationResult {
  const errors: string[] = [];
  
  if (!password) {
    errors.push('Password is required');
  } else {
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain a lowercase letter');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain an uppercase letter');
    }
    if (!/\d/.test(password)) {
      errors.push('Password must contain a number');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain a special character');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors.map(message => ({ field: 'password', message, code: 'VALIDATION_ERROR' })),
  };
}

function validateConfirmPassword(password: string, confirmPassword: string): ValidationResult {
  const errors: string[] = [];
  
  if (!confirmPassword) {
    errors.push('Please confirm your password');
  } else if (password !== confirmPassword) {
    errors.push('Passwords do not match');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors.map(message => ({ field: 'confirmPassword', message, code: 'VALIDATION_ERROR' })),
  };
}

// =============================================================================
// COMPONENT
// =============================================================================

export default function SignUpForm({
  className = '',
  redirectTo = '/dashboard',
  onSuccess,
  onError,
}: SignUpFormProps) {
  const router = useRouter();

  const [formState, setFormState] = useState<SignUpFormState>({
    name: { value: '', error: '', touched: false, focused: false, dirty: false, valid: false },
    email: { value: '', error: '', touched: false, focused: false, dirty: false, valid: false },
    phone: { value: '', error: '', touched: false, focused: false, dirty: false, valid: true },
    password: { value: '', error: '', touched: false, focused: false, dirty: false, valid: false },
    confirmPassword: { value: '', error: '', touched: false, focused: false, dirty: false, valid: false },
    termsAccepted: { value: false, error: '', touched: false, focused: false, dirty: false, valid: false },
    marketingConsent: { value: false, error: '', touched: false, focused: false, dirty: false, valid: true },
    isSubmitting: false,
    error: null,
    step: 'form',
  });

  // =============================================================================
  // FORM HANDLERS
  // =============================================================================

  const updateField = <K extends keyof SignUpFormState>(
    field: K,
    updates: Partial<FormField<any>>
  ) => {
    setFormState(prev => {
      const currentField = prev[field] || {};
      return {
        ...prev,
        [field]: { ...currentField, ...updates },
      };
    });
  };

  const handleInputChange = (field: keyof SignUpFormState, value: any) => {
    updateField(field, { value, dirty: true });
    
    // Clear form-level errors when user starts typing
    if (formState.error) {
      setFormState(prev => ({ ...prev, error: null }));
    }
  };

  const handleInputBlur = (field: keyof SignUpFormState) => {
    updateField(field, { touched: true, focused: false });
    
    // Validate on blur
    let validation: ValidationResult;
    
    switch (field) {
      case 'name':
        validation = validateName(formState.name.value);
        updateField('name', { 
          error: validation.errors[0]?.message || '',
          valid: validation.isValid 
        });
        break;
      case 'email':
        validation = validateEmail(formState.email.value);
        updateField('email', { 
          error: validation.errors[0]?.message || '',
          valid: validation.isValid 
        });
        break;
      case 'phone':
        validation = validatePhone(formState.phone.value);
        updateField('phone', { 
          error: validation.errors[0]?.message || '',
          valid: validation.isValid 
        });
        break;
      case 'password':
        validation = validatePassword(formState.password.value);
        updateField('password', { 
          error: validation.errors[0]?.message || '',
          valid: validation.isValid 
        });
        // Also revalidate confirm password
        if (formState.confirmPassword.value) {
          const confirmValidation = validateConfirmPassword(
            formState.password.value, 
            formState.confirmPassword.value
          );
          updateField('confirmPassword', { 
            error: confirmValidation.errors[0]?.message || '',
            valid: confirmValidation.isValid 
          });
        }
        break;
      case 'confirmPassword':
        validation = validateConfirmPassword(formState.password.value, formState.confirmPassword.value);
        updateField('confirmPassword', { 
          error: validation.errors[0]?.message || '',
          valid: validation.isValid 
        });
        break;
    }
  };

  const handleInputFocus = (field: keyof SignUpFormState) => {
    updateField(field, { focused: true });
  };

  // =============================================================================
  // FORM SUBMISSION
  // =============================================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const nameValidation = validateName(formState.name.value);
    const emailValidation = validateEmail(formState.email.value);
    const phoneValidation = validatePhone(formState.phone.value);
    const passwordValidation = validatePassword(formState.password.value);
    const confirmPasswordValidation = validateConfirmPassword(
      formState.password.value, 
      formState.confirmPassword.value
    );
    
    // Update field errors
    updateField('name', {
      error: nameValidation.errors[0]?.message || '',
      valid: nameValidation.isValid,
      touched: true,
    });
    
    updateField('email', {
      error: emailValidation.errors[0]?.message || '',
      valid: emailValidation.isValid,
      touched: true,
    });
    
    updateField('phone', {
      error: phoneValidation.errors[0]?.message || '',
      valid: phoneValidation.isValid,
      touched: true,
    });
    
    updateField('password', {
      error: passwordValidation.errors[0]?.message || '',
      valid: passwordValidation.isValid,
      touched: true,
    });
    
    updateField('confirmPassword', {
      error: confirmPasswordValidation.errors[0]?.message || '',
      valid: confirmPasswordValidation.isValid,
      touched: true,
    });

    // Check terms acceptance
    if (!formState.termsAccepted.value) {
      updateField('termsAccepted', {
        error: 'You must accept the Terms of Service',
        valid: false,
        touched: true,
      });
    } else {
      updateField('termsAccepted', {
        error: '',
        valid: true,
      });
    }

    const isFormValid = nameValidation.isValid && 
                       emailValidation.isValid && 
                       phoneValidation.isValid &&
                       passwordValidation.isValid && 
                       confirmPasswordValidation.isValid &&
                       formState.termsAccepted.value;

    if (!isFormValid) {
      return;
    }

    setFormState(prev => ({ ...prev, isSubmitting: true, error: null }));

    try {
      const registerData: any = {
        name: formState.name.value.trim(),
        email: formState.email.value.trim().toLowerCase(),
        password: formState.password.value,
        confirmPassword: formState.confirmPassword.value,
        termsAccepted: formState.termsAccepted.value,
        marketingConsent: formState.marketingConsent.value,
      };
      
      // Only add phone if it has a value
      if (formState.phone.value.trim()) {
        registerData.phone = formState.phone.value.trim();
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Registration failed');
      }

      // Registration successful
      onSuccess?.(result.data);
      
      // Show verification step or redirect
      if (result.data?.requiresEmailVerification) {
        setFormState(prev => ({ ...prev, step: 'verification' }));
      } else {
        router.push(redirectTo);
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error.message || 'Registration failed. Please try again.';
      setFormState(prev => ({ ...prev, error: errorMessage }));
      onError?.(errorMessage);
    } finally {
      setFormState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  // =============================================================================
  // VERIFICATION STEP
  // =============================================================================

  if (formState.step === 'verification') {
    return (
      <div className={`w-full max-w-md mx-auto text-center ${className}`}>
        <div className="p-6 bg-green-50 rounded-lg border border-green-200">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Account Created Successfully!
          </h3>
          <p className="text-gray-600 mb-4">
            We&apos;ve sent a verification email to <strong>{formState.email.value}</strong>. 
            Please check your inbox and click the verification link to complete your registration.
          </p>
          <div className="space-y-3">
            <Link
              href="/auth/signin"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Go to Sign In
            </Link>
            <p className="text-sm text-gray-500">
              Didn&apos;t receive the email?{' '}
              <button 
                type="button"
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Resend verification email
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =============================================================================
  // RENDER FORM
  // =============================================================================

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Form Error */}
        {formState.error && (
          <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {formState.error}
          </div>
        )}

        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            id="name"
            type="text"
            value={formState.name.value}
            onChange={(e) => handleInputChange('name', e.target.value)}
            onBlur={() => handleInputBlur('name')}
            onFocus={() => handleInputFocus('name')}
            disabled={formState.isSubmitting}
            className={`
              w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
              placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 
              focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed
              ${formState.name.error && formState.name.touched ? 'border-red-500' : ''}
            `}
            placeholder="Enter your full name"
            autoComplete="name"
            required
          />
          {formState.name.error && formState.name.touched && (
            <p className="mt-1 text-sm text-red-600">{formState.name.error}</p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            id="email"
            type="email"
            value={formState.email.value}
            onChange={(e) => handleInputChange('email', e.target.value)}
            onBlur={() => handleInputBlur('email')}
            onFocus={() => handleInputFocus('email')}
            disabled={formState.isSubmitting}
            className={`
              w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
              placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 
              focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed
              ${formState.email.error && formState.email.touched ? 'border-red-500' : ''}
            `}
            placeholder="Enter your email"
            autoComplete="email"
            required
          />
          {formState.email.error && formState.email.touched && (
            <p className="mt-1 text-sm text-red-600">{formState.email.error}</p>
          )}
        </div>

        {/* Phone Field */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number (Optional)
          </label>
          <input
            id="phone"
            type="tel"
            value={formState.phone.value}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            onBlur={() => handleInputBlur('phone')}
            onFocus={() => handleInputFocus('phone')}
            disabled={formState.isSubmitting}
            className={`
              w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
              placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 
              focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed
              ${formState.phone.error && formState.phone.touched ? 'border-red-500' : ''}
            `}
            placeholder="+1 (555) 123-4567"
            autoComplete="tel"
          />
          {formState.phone.error && formState.phone.touched && (
            <p className="mt-1 text-sm text-red-600">{formState.phone.error}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password *
          </label>
          <input
            id="password"
            type="password"
            value={formState.password.value}
            onChange={(e) => handleInputChange('password', e.target.value)}
            onBlur={() => handleInputBlur('password')}
            onFocus={() => handleInputFocus('password')}
            disabled={formState.isSubmitting}
            className={`
              w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
              placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 
              focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed
              ${formState.password.error && formState.password.touched ? 'border-red-500' : ''}
            `}
            placeholder="Create a strong password"
            autoComplete="new-password"
            required
          />
          {formState.password.error && formState.password.touched && (
            <p className="mt-1 text-sm text-red-600">{formState.password.error}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Password must contain uppercase, lowercase, number, and special character
          </p>
        </div>

        {/* Confirm Password Field */}
        <div>
          <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password *
          </label>
          <input
            id="confirm-password"
            type="password"
            value={formState.confirmPassword.value}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            onBlur={() => handleInputBlur('confirmPassword')}
            onFocus={() => handleInputFocus('confirmPassword')}
            disabled={formState.isSubmitting}
            className={`
              w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
              placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 
              focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed
              ${formState.confirmPassword.error && formState.confirmPassword.touched ? 'border-red-500' : ''}
            `}
            placeholder="Confirm your password"
            autoComplete="new-password"
            required
          />
          {formState.confirmPassword.error && formState.confirmPassword.touched && (
            <p className="mt-1 text-sm text-red-600">{formState.confirmPassword.error}</p>
          )}
        </div>

        {/* Terms & Marketing Consent */}
        <div className="space-y-3">
          <div className="flex items-start">
            <input
              id="terms"
              type="checkbox"
              checked={formState.termsAccepted.value}
              onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
              disabled={formState.isSubmitting}
              className="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              required
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
              I agree to the{' '}
              <Link href="/terms" className="text-blue-600 hover:text-blue-500 font-medium">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-blue-600 hover:text-blue-500 font-medium">
                Privacy Policy
              </Link>{' '}
              *
            </label>
          </div>
          {formState.termsAccepted.error && formState.termsAccepted.touched && (
            <p className="text-sm text-red-600">{formState.termsAccepted.error}</p>
          )}

          <div className="flex items-start">
            <input
              id="marketing"
              type="checkbox"
              checked={formState.marketingConsent.value}
              onChange={(e) => handleInputChange('marketingConsent', e.target.checked)}
              disabled={formState.isSubmitting}
              className="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="marketing" className="ml-2 block text-sm text-gray-700">
              I&apos;d like to receive updates about courses and special offers
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={formState.isSubmitting}
          className={`
            w-full flex justify-center py-2 px-4 border border-transparent rounded-md 
            shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 
            focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 
            disabled:cursor-not-allowed transition-colors
            ${formState.isSubmitting 
              ? 'bg-gray-400' 
              : 'bg-blue-600 hover:bg-blue-700'
            }
          `}
        >
          {formState.isSubmitting ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Creating account...
            </div>
          ) : (
            'Create Account'
          )}
        </button>

        {/* Sign In Link */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            href="/auth/signin"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}