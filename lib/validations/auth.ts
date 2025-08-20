/**
 * Authentication Validation Schemas
 * 
 * Zod schemas for validating authentication-related forms and API requests.
 * Used for both client-side and server-side validation.
 */

import { z } from 'zod';

// =============================================================================
// COMMON VALIDATION PATTERNS
// =============================================================================

// Password validation with detailed requirements
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password must not exceed 128 characters')
  .refine(
    (password) => /[a-z]/.test(password),
    'Password must contain at least one lowercase letter'
  )
  .refine(
    (password) => /[A-Z]/.test(password),
    'Password must contain at least one uppercase letter'
  )
  .refine(
    (password) => /\d/.test(password),
    'Password must contain at least one number'
  )
  .refine(
    (password) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    'Password must contain at least one special character'
  );

// Email validation with common patterns
const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .toLowerCase()
  .refine(
    (email) => email.length <= 254,
    'Email address is too long'
  )
  .refine(
    (email) => !email.includes('..'),
    'Email address cannot contain consecutive dots'
  );

// Phone number validation (international format)
const phoneSchema = z
  .string()
  .regex(
    /^(\+\d{1,3}[- ]?)?\d{10}$/,
    'Please enter a valid phone number (10 digits, with optional country code)'
  )
  .optional();

// Name validation
const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters long')
  .max(50, 'Name must not exceed 50 characters')
  .regex(
    /^[a-zA-Z\s'-]+$/,
    'Name can only contain letters, spaces, hyphens, and apostrophes'
  );

// =============================================================================
// AUTHENTICATION SCHEMAS
// =============================================================================

// User registration schema
export const registerSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  phone: phoneSchema,
  agreeToTerms: z
    .boolean()
    .refine(val => val === true, 'You must agree to the terms and conditions'),
  agreeToPrivacy: z
    .boolean()
    .refine(val => val === true, 'You must agree to the privacy policy'),
  marketingEmails: z.boolean().optional().default(false),
}).refine(
  data => data.password === data.confirmPassword,
  {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }
);

// User sign-in schema
export const signInSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
});

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

// Reset password schema
export const resetPasswordSchema = z.object({
  token: z
    .string()
    .min(1, 'Reset token is required'),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine(
  data => data.password === data.confirmPassword,
  {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }
);

// Change password schema (for authenticated users)
export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmNewPassword: z.string(),
}).refine(
  data => data.newPassword === data.confirmNewPassword,
  {
    message: 'New passwords do not match',
    path: ['confirmNewPassword'],
  }
).refine(
  data => data.currentPassword !== data.newPassword,
  {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  }
);

// Email verification schema
export const verifyEmailSchema = z.object({
  token: z
    .string()
    .min(1, 'Verification token is required'),
  email: emailSchema.optional(),
});

// Phone verification schema
export const verifyPhoneSchema = z.object({
  phone: phoneSchema.refine(
    val => val !== undefined && val.length > 0,
    'Phone number is required'
  ),
  code: z
    .string()
    .length(6, 'Verification code must be 6 digits')
    .regex(/^\d{6}$/, 'Verification code must contain only numbers'),
});

// Send OTP schema
export const sendOTPSchema = z.object({
  phone: phoneSchema.refine(
    val => val !== undefined && val.length > 0,
    'Phone number is required'
  ),
  type: z.enum(['registration', 'login', 'password_reset']),
});

// Social auth schema
export const socialAuthSchema = z.object({
  provider: z.enum(['google', 'facebook', 'apple']),
  token: z
    .string()
    .min(1, 'Authentication token is required'),
  email: emailSchema.optional(),
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  avatar: z
    .string()
    .url('Invalid avatar URL')
    .optional(),
});

// =============================================================================
// PROFILE UPDATE SCHEMAS
// =============================================================================

// Update profile schema
export const updateProfileSchema = z.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  phone: phoneSchema,
  bio: z
    .string()
    .max(500, 'Bio must not exceed 500 characters')
    .optional(),
  avatar: z
    .string()
    .url('Invalid avatar URL')
    .optional(),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine(
      (date) => {
        const birthDate = new Date(date);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        return age >= 13 && age <= 120;
      },
      'You must be between 13 and 120 years old'
    )
    .optional(),
  gender: z
    .enum(['male', 'female', 'other', 'prefer_not_to_say'])
    .optional(),
  location: z.object({
    country: z
      .string()
      .min(2, 'Country name must be at least 2 characters')
      .max(100, 'Country name must not exceed 100 characters')
      .optional(),
    state: z
      .string()
      .min(2, 'State name must be at least 2 characters')
      .max(100, 'State name must not exceed 100 characters')
      .optional(),
    city: z
      .string()
      .min(2, 'City name must be at least 2 characters')
      .max(100, 'City name must not exceed 100 characters')
      .optional(),
    zipCode: z
      .string()
      .regex(/^\d{5,10}$/, 'ZIP code must be 5-10 digits')
      .optional(),
  }).optional(),
  preferences: z.object({
    language: z
      .enum(['english', 'hindi'], {
        errorMap: () => ({ message: 'Please select a valid language' }),
      })
      .optional(),
    notifications: z.object({
      email: z.boolean().optional(),
      sms: z.boolean().optional(),
      push: z.boolean().optional(),
      marketing: z.boolean().optional(),
    }).optional(),
    theme: z
      .enum(['light', 'dark', 'system'], {
        errorMap: () => ({ message: 'Please select a valid theme' }),
      })
      .optional(),
  }).optional(),
});

// =============================================================================
// ACCOUNT MANAGEMENT SCHEMAS
// =============================================================================

// Delete account schema
export const deleteAccountSchema = z.object({
  password: z
    .string()
    .min(1, 'Password is required to delete account'),
  reason: z
    .enum([
      'not_using',
      'too_expensive',
      'poor_quality',
      'technical_issues',
      'privacy_concerns',
      'found_alternative',
      'other'
    ], {
      errorMap: () => ({ message: 'Please select a reason for deletion' }),
    }),
  feedback: z
    .string()
    .max(1000, 'Feedback must not exceed 1000 characters')
    .optional(),
  confirmDeletion: z
    .boolean()
    .refine(val => val === true, 'You must confirm account deletion'),
});

// Two-factor authentication setup schema
export const twoFactorSetupSchema = z.object({
  method: z.enum(['sms', 'email', 'authenticator'], {
    errorMap: () => ({ message: 'Please select a valid 2FA method' }),
  }),
  phone: z
    .string()
    .optional()
    .refine(
      (phone, ctx) => {
        if (ctx.parent.method === 'sms' && (!phone || phone.length === 0)) {
          return false;
        }
        return true;
      },
      'Phone number is required for SMS 2FA'
    ),
  code: z
    .string()
    .length(6, 'Verification code must be 6 digits')
    .regex(/^\d{6}$/, 'Verification code must contain only numbers'),
});

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type RegisterFormData = z.infer<typeof registerSchema>;
export type SignInFormData = z.infer<typeof signInSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>;
export type VerifyPhoneFormData = z.infer<typeof verifyPhoneSchema>;
export type SendOTPFormData = z.infer<typeof sendOTPSchema>;
export type SocialAuthFormData = z.infer<typeof socialAuthSchema>;
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
export type DeleteAccountFormData = z.infer<typeof deleteAccountSchema>;
export type TwoFactorSetupFormData = z.infer<typeof twoFactorSetupSchema>;

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

// Check if email is from a disposable email provider
export const isDisposableEmail = (email: string): boolean => {
  const disposableDomains = [
    '10minutemail.com',
    'tempmail.org',
    'guerrillamail.com',
    'mailinator.com',
    'throwaway.email',
    'temp-mail.org',
  ];
  
  const domain = email.split('@')[1]?.toLowerCase();
  return disposableDomains.includes(domain);
};

// Enhanced email schema that blocks disposable emails
export const enhancedEmailSchema = emailSchema.refine(
  (email) => !isDisposableEmail(email),
  'Disposable email addresses are not allowed'
);

// Password strength checker
export const getPasswordStrength = (password: string): {
  score: number;
  feedback: string[];
} => {
  let score = 0;
  const feedback: string[] = [];

  if (password.length >= 8) score += 1;
  else feedback.push('Use at least 8 characters');

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Include lowercase letters');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Include uppercase letters');

  if (/\d/.test(password)) score += 1;
  else feedback.push('Include numbers');

  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;
  else feedback.push('Include special characters');

  if (password.length >= 12) score += 1;
  if (!/(.)\1{2,}/.test(password)) score += 1; // No repeated characters

  return { score, feedback };
};

// Common password validation with strength checking
export const strongPasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .refine(
    (password) => {
      const { score } = getPasswordStrength(password);
      return score >= 4;
    },
    'Password is not strong enough. Please follow the requirements.'
  );