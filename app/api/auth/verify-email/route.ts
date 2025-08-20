/**
 * Email Verification API Route
 * 
 * Handles email verification using verification tokens.
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createApiRoute, sendSuccess, sendError } from '@/lib/api-utils';
import { verifyJWT } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Validation schema
const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

// Handler
const handler = createApiRoute({
  validation: {
    body: verifyEmailSchema,
  },
  rateLimit: {
    requests: 10,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
});

export const POST = handler(async (request) => {
  const { token } = request.body!;

  // Verify the JWT token
  const payload = verifyJWT<{
    userId: string;
    email: string;
    type: string;
  }>(token);

  if (!payload || payload.type !== 'email_verification') {
    return sendError('Invalid or expired verification token', 400);
  }

  // Find the user
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user) {
    return sendError('User not found', 404);
  }

  if (user.email !== payload.email) {
    return sendError('Invalid verification token', 400);
  }

  if (user.emailVerified) {
    return sendError('Email is already verified', 400);
  }

  // Update user's email verification status
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      status: user.status === 'PENDING_VERIFICATION' ? 'ACTIVE' : user.status,
    },
  });

  return sendSuccess({
    message: 'Email verified successfully',
    user: {
      id: user.id,
      name: user.fullName,
      email: user.email,
      emailVerified: true,
    },
  });
});