/**
 * Phone OTP Verification Form Component
 * 
 * Handles phone number verification with OTP via SMS.
 * Includes OTP input, resend functionality, and countdown timer.
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { PhoneVerification, FormField } from '@/types';

// =============================================================================
// TYPES
// =============================================================================

interface PhoneOTPFormProps {
  className?: string;
  phoneNumber?: string;
  onSuccess?: (phoneNumber: string) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
  autoSubmit?: boolean;
  otpLength?: number;
}

interface OTPFormState {
  phoneNumber: FormField<string>;
  otp: FormField<string>;
  isSubmitting: boolean;
  isSendingOTP: boolean;
  error: string | null;
  success: string | null;
  otpSent: boolean;
  resendCountdown: number;
  canResend: boolean;
}

// =============================================================================
// VALIDATION
// =============================================================================

function validatePhoneNumber(phone: string): { isValid: boolean; error?: string } {
  if (!phone.trim()) {
    return { isValid: false, error: 'Phone number is required' };
  }

  // Basic international phone number validation
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  if (!phoneRegex.test(phone)) {
    return { isValid: false, error: 'Please enter a valid phone number' };
  }

  return { isValid: true };
}

function validateOTP(otp: string, expectedLength: number = 6): { isValid: boolean; error?: string } {
  if (!otp) {
    return { isValid: false, error: 'OTP is required' };
  }

  if (otp.length !== expectedLength) {
    return { isValid: false, error: `OTP must be ${expectedLength} digits` };
  }

  if (!/^\d+$/.test(otp)) {
    return { isValid: false, error: 'OTP must contain only numbers' };
  }

  return { isValid: true };
}

// =============================================================================
// COMPONENT
// =============================================================================

export default function PhoneOTPForm({
  className = '',
  phoneNumber: initialPhoneNumber = '',
  onSuccess,
  onError,
  onCancel,
  autoSubmit = true,
  otpLength = 6,
}: PhoneOTPFormProps) {
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const resendTimerRef = useRef<NodeJS.Timeout>();

  const [formState, setFormState] = useState<OTPFormState>({
    phoneNumber: { 
      value: initialPhoneNumber, 
      error: '', 
      touched: false, 
      focused: false, 
      dirty: false, 
      valid: !!initialPhoneNumber 
    },
    otp: { 
      value: '', 
      error: '', 
      touched: false, 
      focused: false, 
      dirty: false, 
      valid: false 
    },
    isSubmitting: false,
    isSendingOTP: false,
    error: null,
    success: null,
    otpSent: !!initialPhoneNumber,
    resendCountdown: 0,
    canResend: !initialPhoneNumber,
  });

  // =============================================================================
  // EFFECTS
  // =============================================================================

  // Initialize OTP input refs
  useEffect(() => {
    otpInputRefs.current = Array(otpLength).fill(null);
  }, [otpLength]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (resendTimerRef.current) {
        clearInterval(resendTimerRef.current);
      }
    };
  }, []);

  // Start resend countdown
  const startResendCountdown = (seconds: number = 30) => {
    setFormState(prev => ({ ...prev, resendCountdown: seconds, canResend: false }));
    
    resendTimerRef.current = setInterval(() => {
      setFormState(prev => {
        const newCountdown = prev.resendCountdown - 1;
        if (newCountdown <= 0) {
          clearInterval(resendTimerRef.current);
          return { ...prev, resendCountdown: 0, canResend: true };
        }
        return { ...prev, resendCountdown: newCountdown };
      });
    }, 1000);
  };

  // =============================================================================
  // FORM HANDLERS
  // =============================================================================

  const handlePhoneNumberChange = (value: string) => {
    setFormState(prev => ({
      ...prev,
      phoneNumber: { ...prev.phoneNumber, value, dirty: true },
      error: null,
    }));
  };

  const handlePhoneNumberBlur = () => {
    const validation = validatePhoneNumber(formState.phoneNumber.value);
    setFormState(prev => ({
      ...prev,
      phoneNumber: {
        ...prev.phoneNumber,
        touched: true,
        focused: false,
        error: validation.error || '',
        valid: validation.isValid,
      },
    }));
  };

  // =============================================================================
  // OTP INPUT HANDLERS
  // =============================================================================

  const handleOTPChange = (index: number, value: string) => {
    // Only allow single digit
    if (value.length > 1) {
      value = value.slice(-1);
    }

    // Only allow numbers
    if (value && !/^\d$/.test(value)) {
      return;
    }

    // Update OTP value
    const newOTP = formState.otp.value.split('');
    newOTP[index] = value;
    
    // Fill empty slots
    while (newOTP.length < otpLength) {
      newOTP.push('');
    }

    const otpValue = newOTP.join('');
    
    setFormState(prev => ({
      ...prev,
      otp: {
        ...prev.otp,
        value: otpValue,
        dirty: true,
        valid: otpValue.length === otpLength,
      },
      error: null,
    }));

    // Auto-focus next input
    if (value && index < otpLength - 1) {
      const nextInput = otpInputRefs.current[index + 1];
      if (nextInput) {
        nextInput.focus();
      }
    }

    // Auto-submit if complete and enabled
    if (autoSubmit && otpValue.length === otpLength) {
      handleVerifyOTP(otpValue);
    }
  };

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !formState.otp.value[index] && index > 0) {
      // Focus previous input on backspace if current is empty
      const prevInput = otpInputRefs.current[index - 1];
      if (prevInput) {
        prevInput.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      const prevInput = otpInputRefs.current[index - 1];
      if (prevInput) {
        prevInput.focus();
      }
    } else if (e.key === 'ArrowRight' && index < otpLength - 1) {
      const nextInput = otpInputRefs.current[index + 1];
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleOTPPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '');
    
    if (paste.length >= otpLength) {
      const otpValue = paste.slice(0, otpLength);
      setFormState(prev => ({
        ...prev,
        otp: {
          ...prev.otp,
          value: otpValue,
          dirty: true,
          valid: true,
        },
      }));

      // Focus last input
      const lastInput = otpInputRefs.current[otpLength - 1];
      if (lastInput) {
        lastInput.focus();
      }

      // Auto-submit if enabled
      if (autoSubmit) {
        handleVerifyOTP(otpValue);
      }
    }
  };

  // =============================================================================
  // API CALLS
  // =============================================================================

  const handleSendOTP = async () => {
    const phoneValidation = validatePhoneNumber(formState.phoneNumber.value);
    if (!phoneValidation.isValid) {
      setFormState(prev => ({
        ...prev,
        phoneNumber: {
          ...prev.phoneNumber,
          error: phoneValidation.error || '',
          valid: false,
          touched: true,
        },
      }));
      return;
    }

    setFormState(prev => ({ ...prev, isSendingOTP: true, error: null, success: null }));

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: formState.phoneNumber.value,
          type: 'phone_verification',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to send OTP');
      }

      setFormState(prev => ({
        ...prev,
        otpSent: true,
        success: 'OTP sent successfully! Please check your messages.',
        otp: { ...prev.otp, value: '' }, // Reset OTP
      }));

      startResendCountdown(60);

      // Focus first OTP input
      setTimeout(() => {
        const firstInput = otpInputRefs.current[0];
        if (firstInput) {
          firstInput.focus();
        }
      }, 100);

    } catch (error: any) {
      console.error('Send OTP error:', error);
      const errorMessage = error.message || 'Failed to send OTP. Please try again.';
      setFormState(prev => ({ ...prev, error: errorMessage }));
      onError?.(errorMessage);
    } finally {
      setFormState(prev => ({ ...prev, isSendingOTP: false }));
    }
  };

  const handleVerifyOTP = async (otpValue?: string) => {
    const otp = otpValue || formState.otp.value;
    const otpValidation = validateOTP(otp, otpLength);
    
    if (!otpValidation.isValid) {
      setFormState(prev => ({
        ...prev,
        otp: {
          ...prev.otp,
          error: otpValidation.error || '',
          valid: false,
          touched: true,
        },
      }));
      return;
    }

    setFormState(prev => ({ ...prev, isSubmitting: true, error: null }));

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: formState.phoneNumber.value,
          otp: otp,
          type: 'phone_verification',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Invalid OTP');
      }

      // Verification successful
      setFormState(prev => ({ 
        ...prev, 
        success: 'Phone number verified successfully!',
        error: null,
      }));
      
      onSuccess?.(formState.phoneNumber.value);

    } catch (error: any) {
      console.error('Verify OTP error:', error);
      const errorMessage = error.message || 'Invalid OTP. Please try again.';
      setFormState(prev => ({ 
        ...prev, 
        error: errorMessage,
        otp: { ...prev.otp, error: errorMessage, valid: false },
      }));
      onError?.(errorMessage);
    } finally {
      setFormState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Verify Phone Number</h2>
          <p className="mt-2 text-gray-600">
            {formState.otpSent 
              ? `Enter the verification code sent to ${formState.phoneNumber.value}`
              : 'Enter your phone number to receive a verification code'
            }
          </p>
        </div>

        {/* Success Message */}
        {formState.success && (
          <div className="p-4 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
            {formState.success}
          </div>
        )}

        {/* Error Message */}
        {formState.error && (
          <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {formState.error}
          </div>
        )}

        {/* Phone Number Input */}
        {!formState.otpSent && (
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="flex gap-3">
              <input
                id="phone"
                type="tel"
                value={formState.phoneNumber.value}
                onChange={(e) => handlePhoneNumberChange(e.target.value)}
                onBlur={handlePhoneNumberBlur}
                disabled={formState.isSendingOTP}
                className={`
                  flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 
                  focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed
                  ${formState.phoneNumber.error && formState.phoneNumber.touched ? 'border-red-500' : ''}
                `}
                placeholder="+1 (555) 123-4567"
                autoComplete="tel"
              />
              <button
                type="button"
                onClick={handleSendOTP}
                disabled={formState.isSendingOTP || !formState.phoneNumber.valid}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {formState.isSendingOTP ? 'Sending...' : 'Send OTP'}
              </button>
            </div>
            {formState.phoneNumber.error && formState.phoneNumber.touched && (
              <p className="mt-1 text-sm text-red-600">{formState.phoneNumber.error}</p>
            )}
          </div>
        )}

        {/* OTP Input */}
        {formState.otpSent && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verification Code
            </label>
            <div className="flex gap-2 justify-center">
              {Array.from({ length: otpLength }, (_, index) => (
                <input
                  key={index}
                  ref={(el) => (otpInputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={formState.otp.value[index] || ''}
                  onChange={(e) => handleOTPChange(index, e.target.value)}
                  onKeyDown={(e) => handleOTPKeyDown(index, e)}
                  onPaste={index === 0 ? handleOTPPaste : undefined}
                  disabled={formState.isSubmitting}
                  className={`
                    w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-md 
                    shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 
                    focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed
                    ${formState.otp.error && formState.otp.touched ? 'border-red-500' : ''}
                  `}
                />
              ))}
            </div>
            
            {formState.otp.error && formState.otp.touched && (
              <p className="mt-2 text-sm text-red-600 text-center">{formState.otp.error}</p>
            )}

            {/* Resend OTP */}
            <div className="mt-4 text-center">
              {formState.canResend ? (
                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={formState.isSendingOTP}
                  className="text-sm text-blue-600 hover:text-blue-500 font-medium disabled:opacity-50"
                >
                  {formState.isSendingOTP ? 'Sending...' : 'Resend verification code'}
                </button>
              ) : (
                <p className="text-sm text-gray-500">
                  Resend code in {formState.resendCountdown} seconds
                </p>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={formState.isSubmitting || formState.isSendingOTP}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
          )}
          
          {formState.otpSent && !autoSubmit && (
            <button
              type="button"
              onClick={() => handleVerifyOTP()}
              disabled={formState.isSubmitting || !formState.otp.valid}
              className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {formState.isSubmitting ? 'Verifying...' : 'Verify Code'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}