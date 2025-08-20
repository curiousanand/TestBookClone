/**
 * Sign In Form Component
 * 
 * Provides email/password authentication with OAuth options.
 * Includes form validation, error handling, and loading states.
 */

'use client';

import React, { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { FormField, ValidationResult } from '@/types';

// =============================================================================
// TYPES
// =============================================================================

interface SignInFormProps {
  className?: string;
  redirectTo?: string;
  showSocialLogin?: boolean;
  showRememberMe?: boolean;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface SignInFormState {
  email: FormField<string>;
  password: FormField<string>;
  rememberMe: FormField<boolean>;
  isSubmitting: boolean;
  error: string | null;
}

// =============================================================================
// VALIDATION
// =============================================================================

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

function validatePassword(password: string): ValidationResult {
  const errors: string[] = [];
  
  if (!password) {
    errors.push('Password is required');
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors.map(message => ({ field: 'password', message, code: 'VALIDATION_ERROR' })),
  };
}

// =============================================================================
// COMPONENT
// =============================================================================

export default function SignInForm({
  className = '',
  redirectTo,
  showSocialLogin = true,
  showRememberMe = true,
  onSuccess,
  onError,
}: SignInFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = redirectTo || searchParams.get('callbackUrl') || '/dashboard';

  const [formState, setFormState] = useState<SignInFormState>({
    email: { value: '', error: '', touched: false, focused: false, dirty: false, valid: false },
    password: { value: '', error: '', touched: false, focused: false, dirty: false, valid: false },
    rememberMe: { value: false, error: '', touched: false, focused: false, dirty: false, valid: true },
    isSubmitting: false,
    error: null,
  });

  // =============================================================================
  // FORM HANDLERS
  // =============================================================================

  const updateField = <K extends keyof SignInFormState>(
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

  const handleInputChange = (field: keyof SignInFormState, value: any) => {
    updateField(field, { value, dirty: true });
    
    // Clear form-level errors when user starts typing
    if (formState.error) {
      setFormState(prev => ({ ...prev, error: null }));
    }
  };

  const handleInputBlur = (field: keyof SignInFormState) => {
    updateField(field, { touched: true, focused: false });
    
    // Validate on blur
    if (field === 'email') {
      const validation = validateEmail(formState.email.value);
      updateField('email', { 
        error: validation.errors[0]?.message || '',
        valid: validation.isValid 
      });
    } else if (field === 'password') {
      const validation = validatePassword(formState.password.value);
      updateField('password', { 
        error: validation.errors[0]?.message || '',
        valid: validation.isValid 
      });
    }
  };

  const handleInputFocus = (field: keyof SignInFormState) => {
    updateField(field, { focused: true });
  };

  // =============================================================================
  // FORM SUBMISSION
  // =============================================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const emailValidation = validateEmail(formState.email.value);
    const passwordValidation = validatePassword(formState.password.value);
    
    updateField('email', {
      error: emailValidation.errors[0]?.message || '',
      valid: emailValidation.isValid,
      touched: true,
    });
    
    updateField('password', {
      error: passwordValidation.errors[0]?.message || '',
      valid: passwordValidation.isValid,
      touched: true,
    });

    if (!emailValidation.isValid || !passwordValidation.isValid) {
      return;
    }

    setFormState(prev => ({ ...prev, isSubmitting: true, error: null }));

    try {
      const result = await signIn('credentials', {
        email: formState.email.value,
        password: formState.password.value,
        redirect: false,
      });

      if (result?.error) {
        let errorMessage = 'Sign in failed';
        
        switch (result.error) {
          case 'CredentialsSignin':
            errorMessage = 'Invalid email or password';
            break;
          case 'AccessDenied':
            errorMessage = 'Access denied. Please contact support.';
            break;
          case 'Verification':
            errorMessage = 'Please verify your email before signing in';
            break;
          default:
            errorMessage = result.error;
        }
        
        setFormState(prev => ({ ...prev, error: errorMessage }));
        onError?.(errorMessage);
      } else {
        // Sign in successful
        onSuccess?.();
        
        // Refresh session and redirect
        await getSession();
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      console.error('Sign in error:', error);
      const errorMessage = 'An unexpected error occurred. Please try again.';
      setFormState(prev => ({ ...prev, error: errorMessage }));
      onError?.(errorMessage);
    } finally {
      setFormState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  // =============================================================================
  // SOCIAL LOGIN
  // =============================================================================

  const handleSocialLogin = async (provider: string) => {
    try {
      setFormState(prev => ({ ...prev, isSubmitting: true, error: null }));
      
      await signIn(provider, {
        callbackUrl,
        redirect: true,
      });
    } catch (error) {
      console.error('Social login error:', error);
      setFormState(prev => ({ 
        ...prev, 
        error: 'Social login failed. Please try again.',
        isSubmitting: false,
      }));
    }
  };

  // =============================================================================
  // RENDER
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

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
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

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password
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
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />
          {formState.password.error && formState.password.touched && (
            <p className="mt-1 text-sm text-red-600">{formState.password.error}</p>
          )}
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          {showRememberMe && (
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={formState.rememberMe.value}
                onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                disabled={formState.isSubmitting}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
          )}
          
          <Link
            href="/auth/forgot-password"
            className="text-sm text-blue-600 hover:text-blue-500 font-medium"
          >
            Forgot password?
          </Link>
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
              Signing in...
            </div>
          ) : (
            'Sign in'
          )}
        </button>

        {/* Social Login */}
        {showSocialLogin && (
          <>
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => handleSocialLogin('google')}
                disabled={formState.isSubmitting}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </div>
          </>
        )}

        {/* Sign Up Link */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link
            href="/auth/signup"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}