/**
 * User Registration API Route
 * 
 * Handles user registration with email/password.
 * Includes validation, user creation, and email verification.
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createApiRoute, sendSuccess, sendError } from '@/lib/api-utils';
import { createUser, generateEmailVerificationToken } from '@/lib/auth';

// Validation schema
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  phone: z.string().optional(),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept the Terms of Service',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Handler
const handler = createApiRoute({
  validation: {
    body: registerSchema,
  },
  rateLimit: {
    requests: 3,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
});

export const POST = handler(async (request) => {
  const userData = request.body!;

  try {
    // Create user
    const user = await createUser(userData);

    // Generate email verification token
    const verificationToken = generateEmailVerificationToken(user.id, user.email);
    
    // TODO: Send verification email
    // await sendVerificationEmail(user.email, verificationToken);

    return sendSuccess({
      user: {
        id: user.id,
        name: user.fullName,
        email: user.email,
        requiresEmailVerification: true,
      },
      message: 'User registered successfully. Please check your email for verification.',
    }, undefined, 201);
  } catch (error: any) {
    if (error.message.includes('already exists')) {
      return sendError('A user with this email already exists', 409);
    }
    
    if (error.message.includes('Password validation failed')) {
      return sendError(error.message, 400);
    }
    
    throw error; // Let the API utils handle other errors
  }
});