/**
 * Authentication Components Index
 * 
 * Central export file for all authentication-related components,
 * hooks, and utilities.
 */

// Components
export { default as SignInForm } from './SignInForm';
export { default as SignUpForm } from './SignUpForm';
export { default as PhoneOTPForm } from './PhoneOTPForm';
export { default as AuthProvider } from './AuthProvider';

// Hooks
export {
  useAuth,
  useUser,
  useIsAuthenticated,
  useHasRole,
  useHasPermission,
  useCanAccessResource,
  useAuthLoading,
} from './AuthProvider';

// Higher-Order Components
export {
  withAuth,
  withRole,
  withPermission,
} from './AuthProvider';

// Types (re-exported for convenience)
export type {
  AuthUser,
  UserRole,
  UserStatus,
  LoginCredentials,
  RegisterData,
  PhoneVerification,
} from '@/types';