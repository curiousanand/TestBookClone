/**
 * Edge-Runtime Compatible Auth Configuration for Middleware
 * 
 * This configuration is designed to work in Edge Runtime environments
 * like NextJS middleware, where Prisma cannot be used.
 */

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import type { 
  NextAuthConfig, 
  User as NextAuthUser, 
  Session
} from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import type { UserRole, UserStatus } from '../types';

// =============================================================================
// EDGE-SAFE AUTH CONFIGURATION
// =============================================================================

/**
 * Auth configuration that works in Edge Runtime
 * No database operations or Prisma imports
 */
export const authConfig: NextAuthConfig = {
  // No adapter - we'll handle database operations in API routes
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/onboarding',
  },
  providers: [
    // Note: Providers are declared but actual authentication logic
    // should be handled in API routes where Prisma is available
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize() {
        // This will be handled in API routes where we can use Prisma
        // Return null here to prevent edge runtime issues
        return null;
      },
    }),

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
    async signIn() {
      // Basic validation - actual sign-in logic should be in API routes
      return true;
    },
    async jwt({ token, user }: { token: JWT; user?: NextAuthUser }) {
      // Store user info in JWT token for middleware access
      if (user) {
        token['id'] = user.id;
        // These will be set by API routes after database lookup
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      // Add user info to session from JWT token
      if (token && session.user) {
        (session.user as any).id = token['id'] as string;
        (session.user as any).role = token['role'] as UserRole;
        (session.user as any).status = token['status'] as UserStatus;
        (session.user as any).permissions = token['permissions'] as string[];
      }
      return session;
    },
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
      console.info('User signed out:', (message as any).token?.email);
    },
  },
  debug: process.env.NODE_ENV === 'development',
};

// =============================================================================
// EDGE-COMPATIBLE AUTH INSTANCE
// =============================================================================

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

// =============================================================================
// UTILITY FUNCTIONS FOR MIDDLEWARE
// =============================================================================

/**
 * Get current session in middleware (edge-safe)
 */
export async function getMiddlewareSession() {
  return await auth();
}