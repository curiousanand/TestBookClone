/**
 * User Types for TestBook Clone Application
 * 
 * Comprehensive type definitions for user-related data structures,
 * including authentication, profiles, subscriptions, and progress tracking.
 */

import type { 
  User as PrismaUser,
  UserRole,
  UserStatus,
  Subscription,
  SubscriptionStatus,
  Account,
  Session,
  Payment,
  UserProgress,
  CourseEnrollment,
  TestAttempt,
  LiveClassAttendance,
  Notification
} from '@prisma/client';

// =============================================================================
// BASE USER TYPES
// =============================================================================

/**
 * Core user information from database
 */
export type User = PrismaUser;

/**
 * User with all related data (full profile)
 */
export interface UserWithRelations extends User {
  accounts: Account[];
  sessions: Session[];
  subscriptions: Subscription[];
  payments: Payment[];
  enrollments: CourseEnrollment[];
  progress: UserProgress[];
  testAttempts: TestAttempt[];
  liveClassAttendance: LiveClassAttendance[];
  notifications: Notification[];
  createdCourses?: any[]; // Only for instructors
  createdQuestions?: any[]; // Only for instructors
  createdTestSeries?: any[]; // Only for instructors
  instructorClasses?: any[]; // Only for instructors
}

/**
 * Public user profile (safe for client-side)
 */
export interface PublicUserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  bio?: string;
  location?: string;
  website?: string;
  social?: UserSocialLinks;
  joinedAt: Date;
  lastActiveAt?: Date;
  stats: UserStats;
}

/**
 * User statistics and metrics
 */
export interface UserStats {
  totalCourses: number;
  completedCourses: number;
  totalTests: number;
  averageScore: number;
  studyHours: number;
  streak: number;
  achievements: Achievement[];
  rank?: number;
  points: number;
}

/**
 * User social media links
 */
export interface UserSocialLinks {
  linkedin?: string;
  twitter?: string;
  github?: string;
  website?: string;
  youtube?: string;
}

/**
 * User achievement/badge
 */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earnedAt: Date;
  category: AchievementCategory;
}

export type AchievementCategory = 
  | 'STUDY_STREAK'
  | 'TEST_PERFORMANCE' 
  | 'COURSE_COMPLETION'
  | 'PARTICIPATION'
  | 'MILESTONE'
  | 'SPECIAL';

// =============================================================================
// AUTHENTICATION TYPES
// =============================================================================

/**
 * User authentication data
 */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  permissions: string[];
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Registration data
 */
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  referralCode?: string;
  marketingConsent?: boolean;
  termsAccepted: boolean;
}

/**
 * Password reset request
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * Password reset confirmation
 */
export interface PasswordReset {
  token: string;
  password: string;
  confirmPassword: string;
}

/**
 * Email verification
 */
export interface EmailVerification {
  token: string;
  email: string;
}

/**
 * Phone verification
 */
export interface PhoneVerification {
  phone: string;
  otp: string;
}

/**
 * OAuth provider data
 */
export interface OAuthProvider {
  provider: 'google' | 'facebook' | 'apple' | 'linkedin';
  providerId: string;
  email: string;
  name: string;
  avatar?: string;
}

// =============================================================================
// USER PREFERENCES & SETTINGS
// =============================================================================

/**
 * User preferences and settings
 */
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: NotificationPreferences;
  privacy: PrivacySettings;
  study: StudyPreferences;
  accessibility: AccessibilitySettings;
}

/**
 * Notification preferences
 */
export interface NotificationPreferences {
  email: {
    courseUpdates: boolean;
    testReminders: boolean;
    liveClasses: boolean;
    achievements: boolean;
    marketing: boolean;
    systemUpdates: boolean;
  };
  push: {
    courseUpdates: boolean;
    testReminders: boolean;
    liveClasses: boolean;
    achievements: boolean;
    dailyReminder: boolean;
  };
  sms: {
    testReminders: boolean;
    liveClasses: boolean;
    emergencyAlerts: boolean;
  };
}

/**
 * Privacy settings
 */
export interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  showOnlineStatus: boolean;
  showStudyProgress: boolean;
  showTestScores: boolean;
  allowDirectMessages: boolean;
  showInLeaderboards: boolean;
}

/**
 * Study preferences
 */
export interface StudyPreferences {
  dailyGoal: number; // minutes
  preferredStudyTime: 'morning' | 'afternoon' | 'evening' | 'night';
  breakReminders: boolean;
  focusMode: boolean;
  studyMusic: boolean;
  autoplay: boolean;
  playbackSpeed: number;
  captionsEnabled: boolean;
  preferredLanguage: string;
}

/**
 * Accessibility settings
 */
export interface AccessibilitySettings {
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  contrast: 'normal' | 'high';
  reducedMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  colorBlindSupport: boolean;
}

// =============================================================================
// SUBSCRIPTION TYPES
// =============================================================================

/**
 * User subscription with plan details
 */
export interface UserSubscription {
  // Base subscription data
  id: string;
  status: SubscriptionStatus;
  userId: string;
  planName: string;
  planType: string;
  amount: number;
  currency: string;
  billingCycle: string;
  startDate: Date;
  endDate: Date;
  trialEndDate?: Date;
  autoRenew: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Extended data
  plan: SubscriptionPlan;
  features: SubscriptionFeature[];
  usage: SubscriptionUsage;
}

/**
 * Subscription plan details
 */
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration: number; // days
  features: string[];
  limits: SubscriptionLimits;
  popular?: boolean;
  discount?: SubscriptionDiscount;
}

/**
 * Subscription feature
 */
export interface SubscriptionFeature {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  limit?: number;
}

/**
 * Subscription usage tracking
 */
export interface SubscriptionUsage {
  testsAttempted: number;
  testsLimit: number;
  coursesEnrolled: number;
  coursesLimit: number;
  liveClassesAttended: number;
  liveClassesLimit: number;
  downloadedContent: number;
  downloadLimit: number;
  resetDate: Date;
}

/**
 * Subscription limits
 */
export interface SubscriptionLimits {
  maxCourses: number;
  maxTests: number;
  maxLiveClasses: number;
  maxDownloads: number;
  maxStorage: number; // MB
  hasAnalytics: boolean;
  hasPrioritySupport: boolean;
  hasOfflineAccess: boolean;
}

/**
 * Subscription discount
 */
export interface SubscriptionDiscount {
  type: 'percentage' | 'fixed';
  value: number;
  code?: string;
  validUntil?: Date;
}

// =============================================================================
// USER FORM TYPES
// =============================================================================

/**
 * User profile edit form
 */
export interface UserProfileForm {
  name: string;
  bio?: string;
  avatar?: File;
  location?: string;
  website?: string;
  social?: UserSocialLinks;
  phone?: string;
}

/**
 * User settings form
 */
export interface UserSettingsForm {
  preferences: UserPreferences;
  password?: {
    current: string;
    new: string;
    confirm: string;
  };
}

/**
 * Account deletion form
 */
export interface AccountDeletionForm {
  password: string;
  reason: string;
  feedback?: string;
  confirmDeletion: boolean;
}

// =============================================================================
// USER ACTIVITY TYPES
// =============================================================================

/**
 * User activity log entry
 */
export interface UserActivity {
  id: string;
  userId: string;
  type: UserActivityType;
  action: string;
  resource?: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

export type UserActivityType =
  | 'AUTH'          // Login, logout, register
  | 'COURSE'        // Course enrollment, progress
  | 'TEST'          // Test attempts, submissions
  | 'PAYMENT'       // Payments, subscriptions
  | 'PROFILE'       // Profile updates
  | 'SETTINGS'      // Settings changes
  | 'CONTENT'       // Content interactions
  | 'SOCIAL'        // Comments, likes, shares
  | 'SYSTEM';       // System events

/**
 * User session data
 */
export interface UserSession {
  id: string;
  userId: string;
  token: string;
  refreshToken?: string;
  expiresAt: Date;
  createdAt: Date;
  lastActiveAt: Date;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: DeviceInfo;
  isActive: boolean;
}

/**
 * Device information
 */
export interface DeviceInfo {
  type: 'desktop' | 'mobile' | 'tablet';
  os: string;
  browser: string;
  version: string;
  screen?: {
    width: number;
    height: number;
    density: number;
  };
}

// =============================================================================
// USER VALIDATION TYPES
// =============================================================================

/**
 * User validation errors
 */
export interface UserValidationError {
  field: keyof User | string;
  message: string;
  code: string;
}

/**
 * User form validation result
 */
export interface UserFormValidation {
  isValid: boolean;
  errors: UserValidationError[];
  warnings?: UserValidationError[];
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Partial user for updates
 */
export type UserUpdate = Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>;

/**
 * User creation data
 */
export type UserCreate = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * User list item (for user lists/tables)
 */
export type UserListItem = Pick<User, 
  | 'id' 
  | 'fullName' 
  | 'email' 
  | 'avatar' 
  | 'role' 
  | 'status' 
  | 'createdAt' 
  | 'lastActiveAt'
> & {
  name: string; // Alias for fullName for backward compatibility
};

/**
 * User search filters
 */
export interface UserSearchFilters {
  query?: string;
  role?: UserRole;
  status?: UserStatus;
  dateRange?: {
    from: Date;
    to: Date;
  };
  subscriptionStatus?: SubscriptionStatus;
}

/**
 * User sort options
 */
export interface UserSortOptions {
  field: keyof User | 'lastActiveAt';
  direction: 'asc' | 'desc';
}

// =============================================================================
// EXPORTS
// =============================================================================

export type {
  UserRole,
  UserStatus,
  SubscriptionStatus
} from '@prisma/client';