/**
 * User Sign Out API Route
 * 
 * Handles user sign out and session cleanup.
 */

import { createApiRoute, sendSuccess } from '@/lib/api-utils';
import { signOut } from '@/lib/auth';

// Handler
const handler = createApiRoute({
  requireAuth: true,
});

export const POST = handler(async () => {
  // Sign out user
  await signOut();

  return sendSuccess({
    message: 'Successfully signed out',
  });
});