/**
 * Reset Password API Route
 * 
 * Handles password reset using reset tokens.
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createApiRoute, sendSuccess, sendError } from '@/lib/api-utils';
import { verifyJWT, hashPassword, validatePasswordStrength } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Validation schema
const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Handler
const handler = createApiRoute({
  validation: {
    body: resetPasswordSchema,
  },
  rateLimit: {
    requests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
});

export const POST = handler(async (request) => {
  const { token, password } = request.body!;

  // Verify the JWT token
  const payload = verifyJWT<{
    userId: string;
    email: string;
    type: string;
  }>(token);

  if (!payload || payload.type !== 'password_reset') {
    return sendError('Invalid or expired reset token', 400);
  }

  // Validate password strength
  const passwordValidation = validatePasswordStrength(password);
  if (!passwordValidation.isValid) {
    return sendError(
      `Password validation failed: ${passwordValidation.errors.join(', ')}`,
      400
    );
  }

  // Find the user
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: {
      accounts: {
        where: { provider: 'credentials' },
      },
    },
  });

  if (!user) {
    return sendError('Invalid reset token', 400);
  }

  if (user.email !== payload.email) {
    return sendError('Invalid reset token', 400);
  }

  // Hash the new password
  const hashedPassword = await hashPassword(password);

  // Update the user's password
  if (user.accounts.length > 0) {
    await prisma.account.update({
      where: { id: user.accounts[0].id },
      data: { password: hashedPassword },
    });
  } else {
    // Create credentials account if it doesn't exist
    await prisma.account.create({
      data: {
        userId: user.id,
        type: 'credentials',
        provider: 'credentials',
        providerAccountId: user.email,
        password: hashedPassword,
      },
    });
  }

  // Invalidate existing reset tokens
  await prisma.passwordReset.deleteMany({
    where: { userId: user.id },
  });

  return sendSuccess({
    message: 'Password reset successfully',
  });
});