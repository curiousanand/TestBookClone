/**
 * NextAuth.js API Route Handler
 * 
 * This file handles all authentication requests including:
 * - Sign in/out
 * - Session management
 * - OAuth callbacks
 * - Password reset
 * - Email verification
 */

import { handlers } from '@/lib/auth';

export const { GET, POST } = handlers;