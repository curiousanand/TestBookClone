/**
 * API Utilities and Middleware for TestBook Clone
 * 
 * Provides standardized error handling, response formatting, validation middleware,
 * authentication helpers, and rate limiting for all API routes.
 */

import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema, ZodError } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { UserRole, AuthUser } from '@/types';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
    statusCode: number;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  details?: any;
}

export interface ValidatedRequest<T = any> extends NextRequest {
  user?: AuthUser;
  body?: T;
  query?: Record<string, string>;
  params?: Record<string, string>;
}

export interface ApiHandler<T = any> {
  (request: ValidatedRequest<T>): Promise<NextResponse>;
}

export interface RouteConfig {
  requireAuth?: boolean;
  requiredRole?: UserRole;
  requiredPermissions?: string[];
  rateLimit?: {
    requests: number;
    windowMs: number;
  };
  validation?: {
    body?: ZodSchema;
    query?: ZodSchema;
    params?: ZodSchema;
  };
}

// =============================================================================
// ERROR CLASSES
// =============================================================================

export class ApiValidationError extends Error {
  statusCode = 400;
  code = 'VALIDATION_ERROR';
  details: any;

  constructor(message: string, details?: any) {
    super(message);
    this.name = 'ApiValidationError';
    this.details = details;
  }
}

export class ApiAuthenticationError extends Error {
  statusCode = 401;
  code = 'AUTHENTICATION_ERROR';

  constructor(message = 'Authentication required') {
    super(message);
    this.name = 'ApiAuthenticationError';
  }
}

export class ApiAuthorizationError extends Error {
  statusCode = 403;
  code = 'AUTHORIZATION_ERROR';

  constructor(message = 'Insufficient permissions') {
    super(message);
    this.name = 'ApiAuthorizationError';
  }
}

export class ApiNotFoundError extends Error {
  statusCode = 404;
  code = 'NOT_FOUND';

  constructor(message = 'Resource not found') {
    super(message);
    this.name = 'ApiNotFoundError';
  }
}

export class ApiConflictError extends Error {
  statusCode = 409;
  code = 'CONFLICT';

  constructor(message = 'Resource conflict') {
    super(message);
    this.name = 'ApiConflictError';
  }
}

export class ApiRateLimitError extends Error {
  statusCode = 429;
  code = 'RATE_LIMIT_EXCEEDED';

  constructor(message = 'Rate limit exceeded') {
    super(message);
    this.name = 'ApiRateLimitError';
  }
}

export class ApiInternalError extends Error {
  statusCode = 500;
  code = 'INTERNAL_ERROR';

  constructor(message = 'Internal server error') {
    super(message);
    this.name = 'ApiInternalError';
  }
}

// =============================================================================
// RESPONSE UTILITIES
// =============================================================================

/**
 * Create standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  meta?: ApiResponse<T>['meta']
): ApiResponse<T> {
  return {
    success: true,
    data,
    ...(meta && { meta }),
  };
}

/**
 * Create standardized error response
 */
export function createErrorResponse(
  error: string | ApiError,
  statusCode: number = 500,
  details?: any
): ApiResponse {
  if (typeof error === 'string') {
    return {
      success: false,
      error: {
        code: 'GENERIC_ERROR',
        message: error,
        statusCode,
        ...(details && { details }),
      },
    };
  }

  return {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      ...(error.details && { details: error.details }),
    },
  };
}

/**
 * Send JSON response with proper headers
 */
export function sendResponse<T>(
  response: ApiResponse<T>,
  status: number = 200
): NextResponse {
  return NextResponse.json(response, {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}

/**
 * Send success response
 */
export function sendSuccess<T>(
  data: T,
  meta?: ApiResponse<T>['meta'],
  status: number = 200
): NextResponse {
  return sendResponse(createSuccessResponse(data, meta), status);
}

/**
 * Send error response
 */
export function sendError(
  error: string | ApiError | Error,
  status?: number,
  details?: any
): NextResponse {
  // Handle different error types
  if (error instanceof ApiValidationError ||
      error instanceof ApiAuthenticationError ||
      error instanceof ApiAuthorizationError ||
      error instanceof ApiNotFoundError ||
      error instanceof ApiConflictError ||
      error instanceof ApiRateLimitError ||
      error instanceof ApiInternalError) {
    return sendResponse(
      createErrorResponse(
        {
          code: error.code,
          message: error.message,
          statusCode: error.statusCode,
          details: error.details,
        },
        error.statusCode
      ),
      error.statusCode
    );
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return sendResponse(
      createErrorResponse(
        {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          statusCode: 400,
          details: error.errors,
        },
        400
      ),
      400
    );
  }

  // Handle generic errors
  const statusCode = status || 500;
  const message = error instanceof Error ? error.message : String(error);
  
  return sendResponse(
    createErrorResponse(message, statusCode, details),
    statusCode
  );
}

// =============================================================================
// VALIDATION UTILITIES
// =============================================================================

/**
 * Parse and validate request body
 */
export async function parseBody<T>(
  request: NextRequest,
  schema?: ZodSchema<T>
): Promise<T> {
  try {
    const body = await request.json();
    
    if (schema) {
      return schema.parse(body);
    }
    
    return body;
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ApiValidationError('Request body validation failed', error.errors);
    }
    throw new ApiValidationError('Invalid JSON in request body');
  }
}

/**
 * Parse and validate query parameters
 */
export function parseQuery<T>(
  request: NextRequest,
  schema?: ZodSchema<T>
): T {
  try {
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());
    
    if (schema) {
      return schema.parse(query);
    }
    
    return query as T;
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ApiValidationError('Query parameters validation failed', error.errors);
    }
    throw new ApiValidationError('Invalid query parameters');
  }
}

/**
 * Parse and validate URL parameters
 */
export function parseParams<T>(
  params: any,
  schema?: ZodSchema<T>
): T {
  try {
    if (schema) {
      return schema.parse(params);
    }
    
    return params as T;
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ApiValidationError('URL parameters validation failed', error.errors);
    }
    throw new ApiValidationError('Invalid URL parameters');
  }
}

// =============================================================================
// AUTHENTICATION UTILITIES
// =============================================================================

/**
 * Get authenticated user from request
 */
export async function getAuthenticatedUser(
  request: NextRequest
): Promise<AuthUser | null> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return null;
    }

    // Get full user data from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.fullName,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      permissions: [], // This should be populated based on role
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

/**
 * Require authentication middleware
 */
export async function requireAuth(request: NextRequest): Promise<AuthUser> {
  const user = await getAuthenticatedUser(request);
  
  if (!user) {
    throw new ApiAuthenticationError('Authentication required');
  }
  
  return user;
}

/**
 * Require specific role middleware
 */
export async function requireRole(
  request: NextRequest,
  requiredRole: UserRole
): Promise<AuthUser> {
  const user = await requireAuth(request);
  
  // Define role hierarchy
  const roleHierarchy: Record<UserRole, number> = {
    STUDENT: 1,
    INSTRUCTOR: 2,
    ADMIN: 3,
    SUPER_ADMIN: 4,
  };
  
  const userLevel = roleHierarchy[user.role] || 0;
  const requiredLevel = roleHierarchy[requiredRole] || 0;
  
  if (userLevel < requiredLevel) {
    throw new ApiAuthorizationError(`Required role: ${requiredRole}`);
  }
  
  return user;
}

/**
 * Check if user has permission
 */
export function hasPermission(user: AuthUser, permission: string): boolean {
  return user.permissions.includes(permission);
}

/**
 * Require specific permission middleware
 */
export async function requirePermission(
  request: NextRequest,
  permission: string
): Promise<AuthUser> {
  const user = await requireAuth(request);
  
  if (!hasPermission(user, permission)) {
    throw new ApiAuthorizationError(`Missing required permission: ${permission}`);
  }
  
  return user;
}

// =============================================================================
// RATE LIMITING
// =============================================================================

// In-memory rate limit store (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Apply rate limiting
 */
export function applyRateLimit(
  request: NextRequest,
  config: { requests: number; windowMs: number }
): void {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const key = `${ip}:${request.nextUrl.pathname}`;
  const now = Date.now();
  
  const entry = rateLimitStore.get(key);
  
  if (!entry || now > entry.resetTime) {
    // Reset or create new entry
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return;
  }
  
  if (entry.count >= config.requests) {
    throw new ApiRateLimitError(
      `Rate limit exceeded. Try again in ${Math.ceil((entry.resetTime - now) / 1000)} seconds.`
    );
  }
  
  entry.count++;
}

// =============================================================================
// PAGINATION UTILITIES
// =============================================================================

export interface PaginationParams {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationResult {
  skip: number;
  take: number;
  orderBy?: Record<string, 'asc' | 'desc'>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Parse pagination parameters
 */
export function parsePagination(
  query: PaginationParams,
  defaultLimit: number = 20,
  maxLimit: number = 100
): PaginationResult {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit || String(defaultLimit), 10)));
  const skip = (page - 1) * limit;
  
  const result: PaginationResult = {
    skip,
    take: limit,
  };
  
  if (query.sortBy) {
    result.orderBy = {
      [query.sortBy]: query.sortOrder || 'asc',
    };
  }
  
  return result;
}

/**
 * Create pagination metadata
 */
export function createPaginationMeta(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

// =============================================================================
// ROUTE WRAPPER
// =============================================================================

/**
 * Create API route handler with middleware
 */
export function createApiRoute(config: RouteConfig = {}) {
  return function routeHandler(handler: ApiHandler) {
    return async function wrappedHandler(
      request: NextRequest,
      context?: { params?: Record<string, string> }
    ): Promise<NextResponse> {
      try {
        // Apply rate limiting
        if (config.rateLimit) {
          applyRateLimit(request, config.rateLimit);
        }

        // Create validated request object
        const validatedRequest = request as ValidatedRequest;

        // Parse and validate parameters
        if (context?.params && config.validation?.params) {
          validatedRequest.params = parseParams(context.params, config.validation.params);
        } else {
          validatedRequest.params = context?.params;
        }

        // Parse and validate query parameters
        if (config.validation?.query) {
          validatedRequest.query = parseQuery(request, config.validation.query);
        }

        // Parse and validate request body for non-GET requests
        if (request.method !== 'GET' && config.validation?.body) {
          validatedRequest.body = await parseBody(request, config.validation.body);
        }

        // Handle authentication
        if (config.requireAuth) {
          validatedRequest.user = await requireAuth(request);
        }

        // Handle role-based authorization
        if (config.requiredRole) {
          validatedRequest.user = await requireRole(request, config.requiredRole);
        }

        // Handle permission-based authorization
        if (config.requiredPermissions && validatedRequest.user) {
          for (const permission of config.requiredPermissions) {
            if (!hasPermission(validatedRequest.user, permission)) {
              throw new ApiAuthorizationError(`Missing required permission: ${permission}`);
            }
          }
        }

        // Call the actual handler
        return await handler(validatedRequest);

      } catch (error) {
        console.error('API Error:', error);
        return sendError(error);
      }
    };
  };
}

// =============================================================================
// HEALTH CHECK UTILITIES
// =============================================================================

/**
 * Check database health
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

/**
 * Get system health status
 */
export async function getSystemHealth() {
  const dbHealth = await checkDatabaseHealth();
  
  return {
    status: dbHealth ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    services: {
      database: dbHealth ? 'up' : 'down',
      api: 'up',
    },
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  };
}

// =============================================================================
// EXPORT COMMONLY USED PATTERNS
// =============================================================================

export const withAuth = (handler: ApiHandler) => createApiRoute({ requireAuth: true })(handler);
export const withRole = (role: UserRole) => (handler: ApiHandler) => 
  createApiRoute({ requireAuth: true, requiredRole: role })(handler);
export const withValidation = <T>(bodySchema: ZodSchema<T>) => (handler: ApiHandler<T>) => 
  createApiRoute({ validation: { body: bodySchema } })(handler);
export const withRateLimit = (requests: number, windowMs: number) => (handler: ApiHandler) => 
  createApiRoute({ rateLimit: { requests, windowMs } })(handler);