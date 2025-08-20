/**
 * NextAuth.js Middleware for Route Protection
 * 
 * Handles authentication and authorization for protected routes.
 * Implements role-based access control and route-specific permissions.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import type { UserRole } from '@/types';

// =============================================================================
// ROUTE CONFIGURATION
// =============================================================================

/**
 * Routes that require authentication
 */
const PROTECTED_ROUTES = [
  '/dashboard',
  '/courses/enrolled',
  '/profile',
  '/settings',
  '/tests/attempt',
  '/live-classes',
  '/payments',
  '/subscriptions',
];

/**
 * Routes that require specific roles
 */
const ROLE_PROTECTED_ROUTES: Record<string, UserRole> = {
  '/admin': 'ADMIN',
  '/instructor': 'INSTRUCTOR',
  '/super-admin': 'SUPER_ADMIN',
};

/**
 * API routes that require authentication
 */
const PROTECTED_API_ROUTES = [
  '/api/users',
  '/api/courses/enroll',
  '/api/tests/attempt',
  '/api/payments',
  '/api/subscriptions',
];

/**
 * API routes that require specific roles
 */
const ROLE_PROTECTED_API_ROUTES: Record<string, UserRole> = {
  '/api/admin': 'ADMIN',
  '/api/instructor': 'INSTRUCTOR',
  '/api/super-admin': 'SUPER_ADMIN',
};

/**
 * Routes that should redirect to dashboard if already authenticated
 */
const AUTH_ROUTES = [
  '/auth/signin',
  '/auth/signup',
  '/auth/forgot-password',
  '/auth/reset-password',
];

/**
 * Public routes that don't require authentication
 */
const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/courses',
  '/exams',
  '/pricing',
  '/contact',
  '/terms',
  '/privacy',
  '/help',
];

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Check if route is protected
 */
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Check if API route is protected
 */
function isProtectedAPIRoute(pathname: string): boolean {
  return PROTECTED_API_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Get required role for route
 */
function getRequiredRole(pathname: string): UserRole | null {
  // Check exact matches first
  if (ROLE_PROTECTED_ROUTES[pathname]) {
    return ROLE_PROTECTED_ROUTES[pathname];
  }

  // Check API routes
  if (ROLE_PROTECTED_API_ROUTES[pathname]) {
    return ROLE_PROTECTED_API_ROUTES[pathname];
  }

  // Check prefix matches
  for (const [routePrefix, role] of Object.entries(ROLE_PROTECTED_ROUTES)) {
    if (pathname.startsWith(routePrefix)) {
      return role;
    }
  }

  for (const [routePrefix, role] of Object.entries(ROLE_PROTECTED_API_ROUTES)) {
    if (pathname.startsWith(routePrefix)) {
      return role;
    }
  }

  return null;
}

/**
 * Check if route is public
 */
function isPublicRoute(pathname: string): boolean {
  // Exact matches
  if (PUBLIC_ROUTES.includes(pathname)) {
    return true;
  }

  // Allow Next.js static files
  if (pathname.startsWith('/_next/') || 
      pathname.startsWith('/favicon') ||
      pathname.includes('.')) {
    return true;
  }

  // Allow public course/exam viewing
  if (pathname.match(/^\/courses\/[^/]+$/) || 
      pathname.match(/^\/exams\/[^/]+$/)) {
    return true;
  }

  return false;
}

/**
 * Check if route is auth-related
 */
function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some(route => pathname.startsWith(route)) ||
         pathname.startsWith('/auth/');
}

/**
 * Get user role hierarchy level
 */
function getRoleLevel(role: UserRole): number {
  const hierarchy: Record<UserRole, number> = {
    STUDENT: 1,
    INSTRUCTOR: 2,
    ADMIN: 3,
    SUPER_ADMIN: 4,
  };
  return hierarchy[role] || 0;
}

/**
 * Check if user has minimum required role
 */
function hasMinimumRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return getRoleLevel(userRole) >= getRoleLevel(requiredRole);
}

// =============================================================================
// MIDDLEWARE FUNCTION
// =============================================================================

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const url = new URL(request.url);

  try {
    // Get session
    const session = await auth();
    const user = session?.user;
    const isAuthenticated = !!user;

    // Handle NextAuth.js routes - always allow
    if (pathname.startsWith('/api/auth')) {
      return NextResponse.next();
    }

    // Handle public routes - always allow
    if (isPublicRoute(pathname)) {
      return NextResponse.next();
    }

    // Handle auth routes when already authenticated
    if (isAuthRoute(pathname) && isAuthenticated) {
      // Redirect to dashboard if already logged in
      const redirectUrl = new URL('/dashboard', request.url);
      return NextResponse.redirect(redirectUrl);
    }

    // Handle auth routes when not authenticated - allow access
    if (isAuthRoute(pathname) && !isAuthenticated) {
      return NextResponse.next();
    }

    // Check if route requires authentication
    const requiresAuth = isProtectedRoute(pathname) || isProtectedAPIRoute(pathname);

    if (requiresAuth && !isAuthenticated) {
      // Redirect to sign in
      const signInUrl = new URL('/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', pathname + search);
      
      if (pathname.startsWith('/api/')) {
        // Return 401 for API routes
        return new NextResponse(
          JSON.stringify({ 
            success: false, 
            error: { 
              code: 'AUTHENTICATION_REQUIRED',
              message: 'Authentication required',
              statusCode: 401
            }
          }),
          { 
            status: 401, 
            headers: { 'content-type': 'application/json' } 
          }
        );
      }

      return NextResponse.redirect(signInUrl);
    }

    // Check role-based access control
    const requiredRole = getRequiredRole(pathname);
    
    if (requiredRole && isAuthenticated) {
      const userRole = (user as any)?.role as UserRole;
      
      if (!userRole || !hasMinimumRole(userRole, requiredRole)) {
        if (pathname.startsWith('/api/')) {
          // Return 403 for API routes
          return new NextResponse(
            JSON.stringify({ 
              success: false, 
              error: { 
                code: 'INSUFFICIENT_PERMISSIONS',
                message: `Required role: ${requiredRole}`,
                statusCode: 403
              }
            }),
            { 
              status: 403, 
              headers: { 'content-type': 'application/json' } 
            }
          );
        }

        // Redirect to unauthorized page
        const unauthorizedUrl = new URL('/unauthorized', request.url);
        unauthorizedUrl.searchParams.set('required', requiredRole);
        return NextResponse.redirect(unauthorizedUrl);
      }
    }

    // Check user status
    if (isAuthenticated) {
      const userStatus = (user as any)?.status;
      
      // Block suspended users
      if (userStatus === 'SUSPENDED') {
        if (pathname.startsWith('/api/')) {
          return new NextResponse(
            JSON.stringify({ 
              success: false, 
              error: { 
                code: 'ACCOUNT_SUSPENDED',
                message: 'Account has been suspended',
                statusCode: 403
              }
            }),
            { 
              status: 403, 
              headers: { 'content-type': 'application/json' } 
            }
          );
        }

        const suspendedUrl = new URL('/auth/suspended', request.url);
        return NextResponse.redirect(suspendedUrl);
      }

      // Redirect pending verification users to verification page
      if (userStatus === 'PENDING_VERIFICATION' && !pathname.startsWith('/auth/verify')) {
        const verifyUrl = new URL('/auth/verify-email', request.url);
        return NextResponse.redirect(verifyUrl);
      }
    }

    // Add security headers
    const response = NextResponse.next();
    
    // Add user info to headers for server components
    if (isAuthenticated && user) {
      response.headers.set('X-User-ID', (user as any).id || '');
      response.headers.set('X-User-Role', (user as any).role || '');
      response.headers.set('X-User-Status', (user as any).status || '');
    }

    // Add security headers
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    if (pathname.startsWith('/api/')) {
      response.headers.set('X-Robots-Tag', 'noindex');
    }

    return response;

  } catch (error) {
    console.error('Middleware error:', error);
    
    // In case of error, allow the request to continue
    // but add error header for debugging
    const response = NextResponse.next();
    response.headers.set('X-Middleware-Error', 'true');
    
    return response;
  }
}

// =============================================================================
// MIDDLEWARE CONFIGURATION
// =============================================================================

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
};

// =============================================================================
// UTILITY EXPORTS FOR COMPONENTS
// =============================================================================

/**
 * Check if current route requires authentication (for client-side)
 */
export function requiresAuthentication(pathname: string): boolean {
  return isProtectedRoute(pathname) || isProtectedAPIRoute(pathname);
}

/**
 * Check if current route requires specific role (for client-side)
 */
export function requiresRole(pathname: string): UserRole | null {
  return getRequiredRole(pathname);
}

/**
 * Get appropriate redirect URL for unauthenticated users
 */
export function getAuthRedirectUrl(pathname: string, search: string = ''): string {
  const signInUrl = new URL('/auth/signin', process.env.NEXTAUTH_URL);
  signInUrl.searchParams.set('callbackUrl', pathname + search);
  return signInUrl.toString();
}