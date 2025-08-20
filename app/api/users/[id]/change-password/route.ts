/**
 * Change Password API Route
 * 
 * Handles password changes for authenticated users.
 */

import { z } from 'zod';
import { createApiRoute, sendSuccess, sendError } from '@/lib/api-utils';
import { verifyPassword, hashPassword, validatePasswordStrength } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Params validation schema
const userParamsSchema = z.object({
  id: z.string().uuid('Invalid user ID'),
});

// Change password schema
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'New passwords do not match',
  path: ['confirmPassword'],
});

// PUT handler - Change password
const putHandler = createApiRoute({
  requireAuth: true,
  validation: {
    params: userParamsSchema,
    body: changePasswordSchema,
  },
});

export const PUT = putHandler(async (request, { params }) => {
  const { id } = params!;
  const { currentPassword, newPassword } = request.body!;
  const currentUser = request.user!;

  // Check permissions - users can only change their own password
  if (currentUser.id !== id) {
    return sendError('You can only change your own password', 403);
  }

  // Get the user with their credentials account
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      accounts: {
        where: { provider: 'credentials' },
      },
    },
  });

  if (!user) {
    return sendError('User not found', 404);
  }

  if (user.accounts.length === 0) {
    return sendError('No password set for this account', 400);
  }

  // Verify current password
  const isCurrentPasswordValid = await verifyPassword(
    currentPassword,
    user.accounts[0].password || ''
  );

  if (!isCurrentPasswordValid) {
    return sendError('Current password is incorrect', 400);
  }

  // Validate new password strength
  const passwordValidation = validatePasswordStrength(newPassword);
  if (!passwordValidation.isValid) {
    return sendError(
      `Password validation failed: ${passwordValidation.errors.join(', ')}`,
      400
    );
  }

  // Check if new password is different from current
  const isSamePassword = await verifyPassword(newPassword, user.accounts[0].password || '');
  if (isSamePassword) {
    return sendError('New password must be different from current password', 400);
  }

  // Hash new password
  const hashedNewPassword = await hashPassword(newPassword);

  // Update password
  await prisma.account.update({
    where: { id: user.accounts[0].id },
    data: { password: hashedNewPassword },
  });

  return sendSuccess({
    message: 'Password changed successfully',
  });
});