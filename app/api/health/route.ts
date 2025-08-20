/**
 * Health Check API Route
 * 
 * Provides system health status and diagnostics.
 */

import { createApiRoute, sendSuccess } from '@/lib/api-utils';
import { getSystemHealth } from '@/lib/api-utils';

// GET handler - Health check
const getHandler = createApiRoute({
  rateLimit: {
    requests: 60,
    windowMs: 60 * 1000, // 1 minute
  },
});

export const GET = getHandler(async (request) => {
  const health = await getSystemHealth();
  
  const statusCode = health.status === 'healthy' ? 200 : 503;
  
  return sendSuccess(health, undefined, statusCode);
});