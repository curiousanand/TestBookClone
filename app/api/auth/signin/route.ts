/**
 * User Sign In API Route
 * 
 * Handles user authentication with email/password.
 * Returns JWT token and user information.
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createApiRoute, sendSuccess, sendError } from '@/lib/api-utils';
import { authenticateUser } from '@/lib/auth';

// Validation schema
const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
});

// Handler
const handler = createApiRoute({
  validation: {
    body: signInSchema,
  },
  rateLimit: {
    requests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
});

export const POST = handler(async (request) => {
  const { email, password, rememberMe } = request.body!;

  // Authenticate user
  const user = await authenticateUser({ email, password });

  if (!user) {
    return sendError('Invalid email or password', 401);
  }

  // Check if user account is active
  if (user.status === 'SUSPENDED') {
    return sendError('Account has been suspended', 403);
  }

  if (user.status === 'PENDING_VERIFICATION') {
    return sendError('Please verify your email address before signing in', 403);
  }

  return sendSuccess({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
    },
    rememberMe,
  });
});