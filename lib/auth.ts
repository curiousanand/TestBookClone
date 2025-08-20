/**
 * Authentication Utilities for TestBook Clone
 * 
 * Centralized authentication logic including NextAuth configuration,
 * JWT token handling, password hashing, OTP generation, and role-based access control.
 */

import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
// Twilio import moved to dynamic import to avoid edge runtime issues
import { prisma } from './prisma';
import { getConfig } from './config';
import type { 
  NextAuthConfig, 
  User as NextAuthUser, 
  Session,
  Account
} from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import type { 
  User, 
  UserRole, 
  UserStatus,
  AuthUser,
  LoginCredentials,
  RegisterData
} from '../types';

// =============================================================================
// CONFIGURATION
// =============================================================================

const config = getConfig({ validate: false });

// Twilio client will be initialized dynamically when needed

// =============================================================================
// PASSWORD UTILITIES
// =============================================================================

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Generate secure random password
 */
export function generateRandomPassword(length: number = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
  score: number;
} {
  const errors: string[] = [];
  let score = 0;

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else {
    score += 1;
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else {
    score += 1;
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else {
    score += 1;
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  } else {
    score += 1;
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  } else {
    score += 1;
  }

  if (password.length >= 12) {
    score += 1;
  }

  return {
    isValid: errors.length === 0,
    errors,
    score: Math.min(score, 5),
  };
}

// =============================================================================
// JWT UTILITIES
// =============================================================================

/**
 * Generate JWT token
 */
export function generateJWT(payload: Record<string, any>, expiresIn: string = '7d'): string {
  return jwt.sign(payload, config.auth.jwtSecret, { 
    expiresIn,
    issuer: config.appName,
    audience: config.appUrl 
  });
}

/**
 * Verify JWT token
 */
export function verifyJWT<T = any>(token: string): T | null {
  try {
    return jwt.verify(token, config.auth.jwtSecret, {
      issuer: config.appName,
      audience: config.appUrl
    }) as T;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

/**
 * Generate password reset token
 */
export function generatePasswordResetToken(userId: string, email: string): string {
  return generateJWT(
    { userId, email, type: 'password_reset' },
    '1h'
  );
}

/**
 * Generate email verification token
 */
export function generateEmailVerificationToken(userId: string, email: string): string {
  return generateJWT(
    { userId, email, type: 'email_verification' },
    '24h'
  );
}

// =============================================================================
// OTP UTILITIES
// =============================================================================

/**
 * Generate numeric OTP
 */
export function generateOTP(length: number = 6): string {
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
}

/**
 * Send OTP via SMS
 */
export async function sendOTP(phoneNumber: string, otp: string): Promise<boolean> {
  try {
    if (!process.env['TWILIO_PHONE_NUMBER']) {
      throw new Error('Twilio phone number not configured');
    }

    // Dynamic import to avoid Edge Runtime issues
    const { Twilio } = await import('twilio');
    const twilioClient = new Twilio(
      process.env['TWILIO_ACCOUNT_SID'],
      process.env['TWILIO_AUTH_TOKEN']
    );

    const message = await twilioClient.messages.create({
      body: `Your TestBook verification code is: ${otp}. This code expires in 10 minutes.`,
      from: process.env['TWILIO_PHONE_NUMBER'],
      to: phoneNumber,
    });

    console.info('OTP sent successfully:', message.sid);
    return true;
  } catch (error) {
    console.error('Failed to send OTP:', error);
    return false;
  }
}

/**
 * Store OTP in database with expiry
 */
export async function storeOTP(
  identifier: string, 
  otp: string, 
  type: 'phone' | 'email' = 'phone'
): Promise<void> {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await prisma.otp.upsert({
    where: { identifier },
    update: {
      otp: await hashPassword(otp),
      expiresAt,
      attempts: 0,
      verified: false,
    },
    create: {
      identifier,
      otp: await hashPassword(otp),
      type,
      expiresAt,
      attempts: 0,
      verified: false,
    },
  });
}

/**
 * Verify OTP
 */
export async function verifyOTP(identifier: string, otp: string): Promise<boolean> {
  try {
    const otpRecord = await prisma.otp.findUnique({
      where: { identifier },
    });

    if (!otpRecord) {
      return false;
    }

    // Check if OTP has expired
    if (otpRecord.expiresAt < new Date()) {
      await prisma.otp.delete({ where: { identifier } });
      return false;
    }

    // Check if already verified
    if (otpRecord.verified) {
      return false;
    }

    // Check attempts limit
    if (otpRecord.attempts >= 3) {
      await prisma.otp.delete({ where: { identifier } });
      return false;
    }

    // Verify OTP
    const isValid = await verifyPassword(otp, otpRecord.otp);

    if (isValid) {
      // Mark as verified and clean up
      await prisma.otp.update({
        where: { identifier },
        data: { verified: true },
      });
      
      // Clean up after successful verification
      setTimeout(async () => {
        await prisma.otp.delete({ where: { identifier } }).catch(() => {});
      }, 5000);

      return true;
    } else {
      // Increment attempt count
      await prisma.otp.update({
        where: { identifier },
        data: { attempts: otpRecord.attempts + 1 },
      });
      return false;
    }
  } catch (error) {
    console.error('OTP verification failed:', error);
    return false;
  }
}

// =============================================================================
// USER UTILITIES
// =============================================================================

/**
 * Create new user with hashed password
 */
export async function createUser(userData: RegisterData): Promise<User> {
  // Validate password
  const passwordValidation = validatePasswordStrength(userData.password);
  if (!passwordValidation.isValid) {
    throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
  }

  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: userData.email },
        ...(userData.phone ? [{ phone: userData.phone }] : []),
      ],
    },
  });

  if (existingUser) {
    throw new Error('User already exists with this email or phone number');
  }

  // Hash password
  const hashedPassword = await hashPassword(userData.password);

  // Create user
  const user = await prisma.user.create({
    data: {
      firstName: userData.name.split(' ')[0] || userData.name,
      lastName: userData.name.split(' ').slice(1).join(' ') || '',
      fullName: userData.name,
      email: userData.email,
      phone: userData.phone || null,
      role: 'STUDENT',
      status: 'PENDING_VERIFICATION',
      emailVerified: false,
      phoneVerified: false,
      accounts: {
        create: {
          type: 'credentials',
          provider: 'credentials',
          providerAccountId: userData.email,
          password: hashedPassword,
        },
      },
    },
  });

  return user;
}

/**
 * Find user by email or phone
 */
export async function findUser(identifier: string): Promise<User | null> {
  return await prisma.user.findFirst({
    where: {
      OR: [
        { email: identifier },
        { phone: identifier },
        { username: identifier },
      ],
    },
  });
}

/**
 * Authenticate user with credentials
 */
export async function authenticateUser(
  credentials: LoginCredentials
): Promise<AuthUser | null> {
  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: credentials.email },
      include: {
        accounts: {
          where: { provider: 'credentials' },
        },
      },
    });

    if (!user || !user.accounts[0]) {
      return null;
    }

    // Verify password
    const isValid = await verifyPassword(credentials.password, user.accounts[0].password || '');
    if (!isValid) {
      return null;
    }

    // Update last active
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() },
    });

    // Return auth user
    return {
      id: user.id,
      name: user.fullName,
      email: user.email,
      avatar: user.avatar || null,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      permissions: await getUserPermissions(user.role),
    };
  } catch (error) {
    console.error('Authentication failed:', error);
    return null;
  }
}

// =============================================================================
// ROLE-BASED ACCESS CONTROL
// =============================================================================

/**
 * Role hierarchy (higher roles include permissions of lower roles)
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  STUDENT: 1,
  INSTRUCTOR: 2,
  ADMIN: 3,
  SUPER_ADMIN: 4,
};

/**
 * Permission definitions by role
 */
const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
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

/**
 * Get permissions for a role (including inherited permissions)
 */
export function getUserPermissions(role: UserRole): string[] {
  const permissions = new Set<string>();
  const currentRoleLevel = ROLE_HIERARCHY[role];

  // Add permissions for all roles at or below current role level
  Object.entries(ROLE_HIERARCHY).forEach(([roleName, level]) => {
    if (level <= currentRoleLevel) {
      ROLE_PERMISSIONS[roleName as UserRole].forEach(permission => {
        permissions.add(permission);
      });
    }
  });

  return Array.from(permissions);
}

/**
 * Check if user has specific permission
 */
export function hasPermission(userRole: UserRole, permission: string): boolean {
  const permissions = getUserPermissions(userRole);
  return permissions.includes(permission);
}

/**
 * Check if user can access resource
 */
export function canAccessResource(
  userRole: UserRole, 
  resource: string, 
  action: string
): boolean {
  const permission = `${resource}:${action}`;
  return hasPermission(userRole, permission);
}

/**
 * Get user role hierarchy level
 */
export function getRoleLevel(role: UserRole): number {
  return ROLE_HIERARCHY[role] || 0;
}

/**
 * Check if user role is higher than or equal to required role
 */
export function hasMinimumRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return getRoleLevel(userRole) >= getRoleLevel(requiredRole);
}

// =============================================================================
// SESSION UTILITIES
// =============================================================================

/**
 * Transform database user to NextAuth user
 */
export function transformUser(user: User): NextAuthUser {
  return {
    id: user.id,
    name: user.fullName,
    email: user.email,
    image: user.avatar,
  };
}

/**
 * Custom session callback
 */
export async function sessionCallback({ session, token }: { session: Session; token: JWT }) {
  if (token && session.user) {
    (session.user as any).id = token['id'] as string;
    (session.user as any).role = token['role'] as UserRole;
    (session.user as any).status = token['status'] as UserStatus;
    (session.user as any).permissions = token['permissions'] as string[];
  }
  return session;
}

/**
 * Custom JWT callback
 */
export async function jwtCallback({ token, user, account }: { token: JWT; user?: NextAuthUser; account?: Account | null }) {
  if (user && account) {
    // First time login - fetch full user data
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (dbUser) {
      token.id = dbUser.id;
      token.role = dbUser.role;
      token.status = dbUser.status;
      token.permissions = getUserPermissions(dbUser.role);
    }
  }
  return token;
}

// =============================================================================
// NEXTAUTH CONFIGURATION
// =============================================================================

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/onboarding',
  },
  providers: [
    // Email/Password Provider
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await authenticateUser({
          email: credentials.email as string,
          password: credentials.password as string,
        });

        if (user) {
          return transformUser(user as any);
        }

        return null;
      },
    }),

    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env['GOOGLE_CLIENT_ID']!,
      clientSecret: process.env['GOOGLE_CLIENT_SECRET']!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Allow OAuth sign-ins
      if (account?.provider === 'google') {
        try {
          // Check if user exists
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });

          if (!existingUser) {
            // Create new user from OAuth profile
            const newUser = await prisma.user.create({
              data: {
                email: user.email!,
                firstName: (profile as any)?.given_name || user.name?.split(' ')[0] || '',
                lastName: (profile as any)?.family_name || user.name?.split(' ').slice(1).join(' ') || '',
                fullName: user.name || '',
                avatar: user.image,
                role: 'STUDENT',
                status: 'ACTIVE',
                emailVerified: true,
                phoneVerified: false,
              },
            });
            user.id = newUser.id;
          } else {
            user.id = existingUser.id;
            
            // Update last active
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { lastActiveAt: new Date() },
            });
          }

          return true;
        } catch (error) {
          console.error('OAuth sign-in error:', error);
          return false;
        }
      }

      return true;
    },
    jwt: jwtCallback,
    session: sessionCallback,
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  events: {
    async signIn(message) {
      console.info('User signed in:', message.user.email);
    },
    async signOut(message) {
      console.info('User signed out:', message.token?.email);
    },
    async createUser(message) {
      console.info('New user created:', message.user.email);
    },
  },
  debug: process.env.NODE_ENV === 'development',
};

// =============================================================================
// AUTH INSTANCE
// =============================================================================

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

// =============================================================================
// UTILITY FUNCTIONS FOR COMPONENTS
// =============================================================================

/**
 * Get current session server-side
 */
export async function getCurrentSession() {
  return await auth();
}

/**
 * Get current user server-side
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await getCurrentSession();
  
  if (!session?.user?.id) {
    return null;
  }

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
    permissions: getUserPermissions(user.role),
  };
}

/**
 * Check if current user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getCurrentSession();
  return !!session?.user;
}

/**
 * Require authentication (throws if not authenticated)
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}

/**
 * Require specific role (throws if insufficient permissions)
 */
export async function requireRole(requiredRole: UserRole): Promise<AuthUser> {
  const user = await requireAuth();
  if (!hasMinimumRole(user.role, requiredRole)) {
    throw new Error(`Insufficient permissions. Required: ${requiredRole}`);
  }
  return user;
}

/**
 * Require specific permission (throws if not authorized)
 */
export async function requirePermission(permission: string): Promise<AuthUser> {
  const user = await requireAuth();
  if (!hasPermission(user.role, permission)) {
    throw new Error(`Missing required permission: ${permission}`);
  }
  return user;
}