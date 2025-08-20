/**
 * Forgot Password API Route
 * 
 * Handles password reset requests by sending reset tokens.
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createApiRoute, sendSuccess } from '@/lib/api-utils';
import { generatePasswordResetToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// Handler
const handler = createApiRoute({
  validation: {
    body: forgotPasswordSchema,
  },
  rateLimit: {
    requests: 3,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
});

export const POST = handler(async (request) => {
  const { email } = request.body!;

  // Find the user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  // Always return success to prevent email enumeration
  if (!user) {
    return sendSuccess({
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  }

  // Generate password reset token
  const resetToken = generatePasswordResetToken(user.id, user.email);

  // TODO: Send password reset email
  // await sendPasswordResetEmail(user.email, resetToken);

  // Store reset token in database for tracking (optional)
  await prisma.passwordReset.create({
    data: {
      userId: user.id,
      email: user.email,
      token: resetToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    },
  });

  return sendSuccess({
    message: 'If an account with that email exists, a password reset link has been sent.',
  });
});