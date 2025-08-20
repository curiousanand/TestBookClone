/**
 * Authentication Provider Component
 * 
 * Wraps the application with NextAuth SessionProvider and provides
 * authentication context, user state management, and session handling.
 */

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';
import type { Session } from 'next-auth';
import type { AuthUser, UserRole } from '@/types';

// =============================================================================
// TYPES
// =============================================================================

interface AuthContextValue {
  user: AuthUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasRole: (role: UserRole) => boolean;
  hasPermission: (permission: string) => boolean;
  canAccessResource: (resource: string, action: string) => boolean;
  refreshUser: () => Promise<void>;
}

interface AuthProviderProps {
  children: React.ReactNode;
  session?: Session | null;
}

interface AuthWrapperProps {
  children: React.ReactNode;
}

// =============================================================================
// CONTEXT
// =============================================================================

const AuthContext = createContext<AuthContextValue | null>(null);

// =============================================================================
// UTILITIES
// =============================================================================

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
 * Get permissions for a role (including inherited permissions)
 */
function getUserPermissions(role: UserRole): string[] {
  const rolePermissions: Record<UserRole, string[]> = {
    STUDENT: [
      'courses:view',
      'courses:enroll',
      'lessons:view',
      'tests:attempt',
      'profile:update',
      'payments:create',
      'subscriptions:manage',
    ],
    INSTRUCTOR: [
      'courses:create',
      'courses:update',
      'lessons:create',
      'lessons:update',
      'questions:create',
      'questions:update',
      'tests:create',
      'tests:update',
      'analytics:view:own',
    ],
    ADMIN: [
      'users:manage',
      'courses:manage',
      'payments:manage',
      'subscriptions:manage',
      'content:moderate',
      'analytics:view:all',
      'system:configure',
    ],
    SUPER_ADMIN: [
      'system:admin',
      'users:impersonate',
      'data:export',
      'security:manage',
    ],
  };

  const permissions = new Set<string>();
  const currentRoleLevel = getRoleLevel(role);

  // Add permissions for all roles at or below current role level
  Object.entries(rolePermissions).forEach(([roleName, perms]) => {
    const level = getRoleLevel(roleName as UserRole);
    if (level <= currentRoleLevel) {
      perms.forEach(permission => permissions.add(permission));
    }
  });

  return Array.from(permissions);
}

/**
 * Transform session user to AuthUser
 */
function transformSessionToAuthUser(session: Session | null): AuthUser | null {
  if (!session?.user) {
    return null;
  }

  const sessionUser = session.user as any;
  
  return {
    id: sessionUser.id || '',
    name: sessionUser.name || '',
    email: sessionUser.email || '',
    avatar: sessionUser.image || sessionUser.avatar,
    role: sessionUser.role || 'STUDENT',
    status: sessionUser.status || 'ACTIVE',
    emailVerified: sessionUser.emailVerified || false,
    phoneVerified: sessionUser.phoneVerified || false,
    permissions: sessionUser.permissions || getUserPermissions(sessionUser.role || 'STUDENT'),
  };
}

// =============================================================================
// AUTH WRAPPER COMPONENT
// =============================================================================

function AuthWrapper({ children }: AuthWrapperProps) {
  const { data: session, status, update } = useSession();
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  // Update auth user when session changes
  useEffect(() => {
    const user = transformSessionToAuthUser(session);
    setAuthUser(user);
  }, [session]);

  // =============================================================================
  // AUTH CONTEXT VALUE
  // =============================================================================

  const refreshUser = async () => {
    try {
      // Force session refresh
      await update();
    } catch (error) {
      console.error('Failed to refresh user session:', error);
    }
  };

  const hasRole = (role: UserRole): boolean => {
    if (!authUser) return false;
    return getRoleLevel(authUser.role) >= getRoleLevel(role);
  };

  const hasPermission = (permission: string): boolean => {
    if (!authUser) return false;
    return authUser.permissions.includes(permission);
  };

  const canAccessResource = (resource: string, action: string): boolean => {
    const permission = `${resource}:${action}`;
    return hasPermission(permission);
  };

  const contextValue: AuthContextValue = {
    user: authUser,
    session,
    isAuthenticated: !!authUser && status === 'authenticated',
    isLoading: status === 'loading',
    hasRole,
    hasPermission,
    canAccessResource,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// =============================================================================
// MAIN PROVIDER COMPONENT
// =============================================================================

export default function AuthProvider({ children, session }: AuthProviderProps) {
  return (
    <SessionProvider session={session || null} refetchInterval={5 * 60} refetchOnWindowFocus={true}>
      <AuthWrapper>{children}</AuthWrapper>
    </SessionProvider>
  );
}

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Hook to access authentication context
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Hook to get current user
 */
export function useUser(): AuthUser | null {
  const { user } = useAuth();
  return user;
}

/**
 * Hook to check authentication status
 */
export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}

/**
 * Hook to check if user has specific role
 */
export function useHasRole(role: UserRole): boolean {
  const { hasRole } = useAuth();
  return hasRole(role);
}

/**
 * Hook to check if user has specific permission
 */
export function useHasPermission(permission: string): boolean {
  const { hasPermission } = useAuth();
  return hasPermission(permission);
}

/**
 * Hook to check if user can access resource
 */
export function useCanAccessResource(resource: string, action: string): boolean {
  const { canAccessResource } = useAuth();
  return canAccessResource(resource, action);
}

/**
 * Hook for authentication loading state
 */
export function useAuthLoading(): boolean {
  const { isLoading } = useAuth();
  return isLoading;
}

// =============================================================================
// HIGHER-ORDER COMPONENTS
// =============================================================================

/**
 * HOC to require authentication
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType
) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      if (fallback) {
        const FallbackComponent = fallback;
        return <FallbackComponent />;
      }
      
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Authentication Required
            </h1>
            <p className="text-gray-600 mb-4">
              Please sign in to access this page.
            </p>
            <a 
              href="/auth/signin"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Sign In
            </a>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

/**
 * HOC to require specific role
 */
export function withRole<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole: UserRole,
  fallback?: React.ComponentType
) {
  return function RoleProtectedComponent(props: P) {
    const { hasRole, isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Authentication Required
            </h1>
            <p className="text-gray-600 mb-4">
              Please sign in to access this page.
            </p>
            <a 
              href="/auth/signin"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Sign In
            </a>
          </div>
        </div>
      );
    }

    if (!hasRole(requiredRole)) {
      if (fallback) {
        const FallbackComponent = fallback;
        return <FallbackComponent />;
      }

      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Access Denied
            </h1>
            <p className="text-gray-600 mb-4">
              You don&apos;t have permission to access this page.
            </p>
            <p className="text-sm text-gray-500">
              Required role: <span className="font-medium">{requiredRole}</span>
            </p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

/**
 * HOC to require specific permission
 */
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  requiredPermission: string,
  fallback?: React.ComponentType
) {
  return function PermissionProtectedComponent(props: P) {
    const { hasPermission, isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Authentication Required
            </h1>
            <p className="text-gray-600 mb-4">
              Please sign in to access this page.
            </p>
            <a 
              href="/auth/signin"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Sign In
            </a>
          </div>
        </div>
      );
    }

    if (!hasPermission(requiredPermission)) {
      if (fallback) {
        const FallbackComponent = fallback;
        return <FallbackComponent />;
      }

      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Access Denied
            </h1>
            <p className="text-gray-600 mb-4">
              You don&apos;t have permission to access this page.
            </p>
            <p className="text-sm text-gray-500">
              Required permission: <span className="font-medium">{requiredPermission}</span>
            </p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}