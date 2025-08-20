/**
 * Current User API Route
 * 
 * Returns information about the currently authenticated user.
 */

import { createApiRoute, sendSuccess } from '@/lib/api-utils';

// Handler
const handler = createApiRoute({
  requireAuth: true,
});

export const GET = handler(async (request) => {
  const user = request.user!;

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
      permissions: user.permissions,
    },
  });
});