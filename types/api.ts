/**
 * API Types for TestBook Clone Application
 * 
 * Comprehensive type definitions for API responses, requests,
 * endpoints, error handling, and data transfer objects.
 */

import type { 
  User, 
  UserWithRelations,
  PublicUserProfile,
  UserStats,
  UserActivity 
} from './user';

import type { 
  Course,
  PublicCourse,
  CourseWithRelations,
  Lesson,
  Category,
  CourseEnrollment,
  UserProgress,
  CourseSearchResult 
} from './course';

import type { 
  Exam,
  TestSeries,
  PublicTestSeries,
  Question,
  TestAttempt,
  TestResult,
  QuestionAttempt,
  LiveTest 
} from './exam';

// =============================================================================
// GENERIC API TYPES
// =============================================================================

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  timestamp: string;
  requestId: string;
}

/**
 * API error structure
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  field?: string;
  statusCode: number;
  type: ApiErrorType;
}

/**
 * API error types
 */
export type ApiErrorType = 
  | 'VALIDATION_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'NOT_FOUND_ERROR'
  | 'CONFLICT_ERROR'
  | 'RATE_LIMIT_ERROR'
  | 'SERVER_ERROR'
  | 'NETWORK_ERROR'
  | 'TIMEOUT_ERROR'
  | 'MAINTENANCE_ERROR';

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
  error?: ApiError;
  message?: string;
  timestamp: string;
  requestId: string;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * API request metadata
 */
export interface ApiRequestMeta {
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  requestId: string;
}

/**
 * File upload response
 */
export interface FileUploadResponse {
  success: boolean;
  data: {
    id: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    thumbnailUrl?: string;
    uploadedAt: string;
  };
  error?: ApiError;
}

// =============================================================================
// AUTHENTICATION API TYPES
// =============================================================================

/**
 * Login request
 */
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
  deviceInfo?: DeviceInfo;
}

/**
 * Login response
 */
export interface LoginResponse {
  user: PublicUserProfile;
  tokens: AuthTokens;
  session: SessionInfo;
  permissions: string[];
  requiresTwoFactor?: boolean;
}

/**
 * Registration request
 */
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  referralCode?: string;
  marketingConsent?: boolean;
  termsAccepted: boolean;
  deviceInfo?: DeviceInfo;
}

/**
 * Registration response
 */
export interface RegisterResponse {
  user: PublicUserProfile;
  tokens: AuthTokens;
  session: SessionInfo;
  requiresEmailVerification: boolean;
  requiresPhoneVerification: boolean;
}

/**
 * Authentication tokens
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number; // seconds
  scope: string[];
}

/**
 * Session information
 */
export interface SessionInfo {
  id: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
  lastActiveAt: string;
  deviceInfo?: DeviceInfo;
}

/**
 * Device information
 */
export interface DeviceInfo {
  type: 'desktop' | 'mobile' | 'tablet';
  os: string;
  browser: string;
  version: string;
  fingerprint?: string;
}

/**
 * Password reset request
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * Password reset response
 */
export interface PasswordResetResponse {
  message: string;
  resetTokenSent: boolean;
  expiresIn: number; // minutes
}

/**
 * Two-factor authentication setup
 */
export interface TwoFactorSetupResponse {
  qrCode: string;
  secret: string;
  backupCodes: string[];
}

/**
 * Two-factor authentication verification
 */
export interface TwoFactorVerifyRequest {
  code: string;
  backupCode?: string;
}

// =============================================================================
// USER API TYPES
// =============================================================================

/**
 * User profile response
 */
export type UserProfileResponse = ApiResponse<UserWithRelations>;

/**
 * User list response
 */
export type UserListResponse = PaginatedResponse<PublicUserProfile>;

/**
 * User stats response
 */
export type UserStatsResponse = ApiResponse<UserStats>;

/**
 * User activity response
 */
export type UserActivityResponse = PaginatedResponse<UserActivity>;

/**
 * User update request
 */
export interface UserUpdateRequest {
  name?: string;
  bio?: string;
  avatar?: string;
  location?: string;
  website?: string;
  social?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    youtube?: string;
  };
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    language?: string;
    timezone?: string;
    notifications?: Record<string, boolean>;
  };
}

/**
 * User search request
 */
export interface UserSearchRequest {
  query?: string;
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// =============================================================================
// COURSE API TYPES
// =============================================================================

/**
 * Course response
 */
export type CourseResponse = ApiResponse<CourseWithRelations>;

/**
 * Course list response
 */
export type CourseListResponse = PaginatedResponse<PublicCourse>;

/**
 * Course search response
 */
export type CourseSearchResponse = ApiResponse<CourseSearchResult>;

/**
 * Course creation request
 */
export interface CourseCreateRequest {
  title: string;
  description: string;
  shortDescription?: string;
  categoryId: string;
  level: string;
  language: string;
  price: number;
  currency: string;
  thumbnail?: string;
  previewVideo?: string;
  tags: string[];
  requirements: string[];
  learningOutcomes: string[];
  targetAudience: string[];
  isDraft?: boolean;
}

/**
 * Course enrollment request
 */
export interface CourseEnrollmentRequest {
  courseId: string;
  paymentMethod?: 'free' | 'paid' | 'subscription';
  couponCode?: string;
}

/**
 * Course enrollment response
 */
export interface CourseEnrollmentResponse {
  enrollment: CourseEnrollment;
  paymentRequired: boolean;
  paymentUrl?: string;
  nextSteps: string[];
}

/**
 * Course progress request
 */
export interface CourseProgressRequest {
  courseId: string;
  lessonId: string;
  progress: number; // 0-100
  timeSpent: number; // minutes
  completed: boolean;
}

/**
 * Course progress response
 */
export type CourseProgressResponse = ApiResponse<UserProgress>;

/**
 * Lesson completion request
 */
export interface LessonCompletionRequest {
  lessonId: string;
  timeSpent: number; // minutes
  notes?: string;
  rating?: number; // 1-5
}

// =============================================================================
// EXAM API TYPES
// =============================================================================

/**
 * Exam response
 */
export type ExamResponse = ApiResponse<Exam>;

/**
 * Exam list response
 */
export type ExamListResponse = PaginatedResponse<Exam>;

/**
 * Test series response
 */
export type TestSeriesResponse = ApiResponse<PublicTestSeries>;

/**
 * Test series list response
 */
export type TestSeriesListResponse = PaginatedResponse<PublicTestSeries>;

/**
 * Question response
 */
export type QuestionResponse = ApiResponse<Question>;

/**
 * Question list response
 */
export type QuestionListResponse = PaginatedResponse<Question>;

/**
 * Test attempt start request
 */
export interface TestAttemptStartRequest {
  testSeriesId: string;
  resume?: boolean; // resume previous attempt
}

/**
 * Test attempt start response
 */
export interface TestAttemptStartResponse {
  attemptId: string;
  questions: Question[];
  duration: number; // minutes
  instructions: string;
  startTime: string;
  endTime: string;
  rules: TestRules;
}

/**
 * Test rules
 */
export interface TestRules {
  canGoBack: boolean;
  showTimer: boolean;
  showQuestionPalette: boolean;
  allowBookmark: boolean;
  autoSubmit: boolean;
  warningBeforeSubmit: boolean;
  negativeMarking: boolean;
  negativeMarkingRatio: number;
}

/**
 * Test answer submission request
 */
export interface TestAnswerSubmissionRequest {
  attemptId: string;
  questionId: string;
  answer: string | string[];
  marked?: boolean;
  timeTaken: number; // seconds
}

/**
 * Test submission request
 */
export interface TestSubmissionRequest {
  attemptId: string;
  answers: {
    questionId: string;
    answer: string | string[];
    timeTaken: number; // seconds
    marked: boolean;
  }[];
  totalTimeTaken: number; // minutes
}

/**
 * Test result response
 */
export type TestResultResponse = ApiResponse<TestResult>;

/**
 * Test analytics response
 */
export interface TestAnalyticsResponse {
  overall: TestAnalytics;
  comparison: PeerComparison;
  recommendations: Recommendation[];
}

/**
 * Test analytics
 */
export interface TestAnalytics {
  scoreDistribution: ScoreDistribution;
  timeAnalysis: TimeAnalysis;
  subjectAnalysis: SubjectAnalysis[];
  difficultyAnalysis: DifficultyAnalysis;
}

/**
 * Score distribution
 */
export interface ScoreDistribution {
  ranges: {
    range: string;
    count: number;
    percentage: number;
  }[];
  average: number;
  median: number;
  standardDeviation: number;
}

/**
 * Time analysis
 */
export interface TimeAnalysis {
  totalTime: number;
  averageTimePerQuestion: number;
  timeEfficiency: number; // percentage
  rushingIndicator: number; // percentage
}

/**
 * Subject analysis
 */
export interface SubjectAnalysis {
  subject: string;
  totalQuestions: number;
  attempted: number;
  correct: number;
  accuracy: number;
  timeSpent: number;
  averageScore: number;
  percentile: number;
}

/**
 * Difficulty analysis
 */
export interface DifficultyAnalysis {
  easy: DifficultyStats;
  medium: DifficultyStats;
  hard: DifficultyStats;
  veryHard: DifficultyStats;
}

/**
 * Difficulty statistics
 */
export interface DifficultyStats {
  total: number;
  attempted: number;
  correct: number;
  accuracy: number;
  expectedAccuracy: number;
  performance: 'above_average' | 'average' | 'below_average';
}

/**
 * Peer comparison
 */
export interface PeerComparison {
  yourRank: number;
  totalParticipants: number;
  percentile: number;
  betterThan: number; // percentage
  scoreComparison: {
    your: number;
    average: number;
    top10: number;
    top1: number;
  };
}

/**
 * Recommendation
 */
export interface Recommendation {
  type: 'improve' | 'maintain' | 'focus';
  area: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  resources: RecommendationResource[];
}

/**
 * Recommendation resource
 */
export interface RecommendationResource {
  type: 'course' | 'practice' | 'reading';
  title: string;
  description: string;
  url: string;
  free: boolean;
}

// =============================================================================
// LIVE CLASS API TYPES
// =============================================================================

/**
 * Live class response
 */
export interface LiveClassResponse {
  id: string;
  title: string;
  description: string;
  instructor: PublicUserProfile;
  scheduledAt: string;
  duration: number; // minutes
  maxParticipants: number;
  currentParticipants: number;
  price: number;
  currency: string;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  meetingUrl?: string;
  recordingUrl?: string;
  materials: ClassMaterial[];
  tags: string[];
}

/**
 * Class material
 */
export interface ClassMaterial {
  id: string;
  type: 'pdf' | 'video' | 'document' | 'link';
  title: string;
  description?: string;
  url: string;
  downloadable: boolean;
  size?: number; // bytes
}

/**
 * Live class join response
 */
export interface LiveClassJoinResponse {
  meetingUrl: string;
  accessToken: string;
  participantId: string;
  rules: ClassRules;
}

/**
 * Class rules
 */
export interface ClassRules {
  canUnmute: boolean;
  canShareScreen: boolean;
  canChat: boolean;
  canRaiseHand: boolean;
  recordingEnabled: boolean;
}

// =============================================================================
// PAYMENT API TYPES
// =============================================================================

/**
 * Payment creation request
 */
export interface PaymentCreateRequest {
  amount: number;
  currency: string;
  paymentMethod: 'card' | 'upi' | 'wallet' | 'bank_transfer';
  description: string;
  itemType: 'course' | 'test_series' | 'subscription' | 'live_class';
  itemId: string;
  couponCode?: string;
  returnUrl?: string;
  cancelUrl?: string;
}

/**
 * Payment response
 */
export interface PaymentResponse {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  paymentUrl?: string;
  paymentMethod: string;
  transactionId?: string;
  createdAt: string;
  completedAt?: string;
  failureReason?: string;
}

/**
 * Payment verification request
 */
export interface PaymentVerifyRequest {
  paymentId: string;
  transactionId: string;
  signature?: string;
}

/**
 * Subscription creation request
 */
export interface SubscriptionCreateRequest {
  planId: string;
  paymentMethod: 'card' | 'upi' | 'wallet' | 'bank_transfer';
  couponCode?: string;
  billingCycle: 'monthly' | 'quarterly' | 'yearly';
}

/**
 * Subscription response
 */
export interface SubscriptionResponse {
  id: string;
  planId: string;
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  nextBillingDate: string;
  amount: number;
  currency: string;
  features: SubscriptionFeature[];
  usage: SubscriptionUsage;
}

/**
 * Subscription feature
 */
export interface SubscriptionFeature {
  name: string;
  description: string;
  limit?: number;
  unlimited: boolean;
}

/**
 * Subscription usage
 */
export interface SubscriptionUsage {
  coursesUsed: number;
  coursesLimit: number;
  testsUsed: number;
  testsLimit: number;
  storageUsed: number; // MB
  storageLimit: number; // MB
  resetDate: string;
}

// =============================================================================
// ANALYTICS API TYPES
// =============================================================================

/**
 * Dashboard analytics response
 */
export interface DashboardAnalyticsResponse {
  overview: DashboardOverview;
  charts: DashboardChart[];
  recentActivity: RecentActivity[];
  alerts: DashboardAlert[];
}

/**
 * Dashboard overview
 */
export interface DashboardOverview {
  totalUsers: number;
  activeUsers: number;
  totalCourses: number;
  totalTests: number;
  totalRevenue: number;
  growthMetrics: GrowthMetrics;
}

/**
 * Growth metrics
 */
export interface GrowthMetrics {
  userGrowth: number; // percentage
  courseGrowth: number; // percentage
  revenueGrowth: number; // percentage
  period: 'week' | 'month' | 'quarter' | 'year';
}

/**
 * Dashboard chart
 */
export interface DashboardChart {
  type: 'line' | 'bar' | 'pie' | 'area';
  title: string;
  description?: string;
  data: ChartDataPoint[];
  labels: string[];
  colors?: string[];
}

/**
 * Chart data point
 */
export interface ChartDataPoint {
  label: string;
  value: number;
  timestamp?: string;
  metadata?: Record<string, any>;
}

/**
 * Recent activity
 */
export interface RecentActivity {
  id: string;
  type: 'user_registration' | 'course_enrollment' | 'test_completion' | 'payment' | 'support_ticket';
  title: string;
  description: string;
  timestamp: string;
  userId?: string;
  metadata?: Record<string, any>;
}

/**
 * Dashboard alert
 */
export interface DashboardAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  actionUrl?: string;
  actionText?: string;
  dismissed: boolean;
}

// =============================================================================
// NOTIFICATION API TYPES
// =============================================================================

/**
 * Notification response
 */
export interface NotificationResponse {
  id: string;
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  readAt?: string;
  actionUrl?: string;
  actionText?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  expiresAt?: string;
}

/**
 * Notification list response
 */
export type NotificationListResponse = PaginatedResponse<NotificationResponse>;

/**
 * Notification preferences request
 */
export interface NotificationPreferencesRequest {
  email: Record<string, boolean>;
  push: Record<string, boolean>;
  sms: Record<string, boolean>;
}

/**
 * Push notification subscription request
 */
export interface PushSubscriptionRequest {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  deviceType: 'desktop' | 'mobile' | 'tablet';
}

// =============================================================================
// SEARCH API TYPES
// =============================================================================

/**
 * Global search request
 */
export interface GlobalSearchRequest {
  query: string;
  filters?: {
    type?: ('courses' | 'tests' | 'questions' | 'instructors')[];
    category?: string[];
    level?: string[];
    language?: string[];
    free?: boolean;
  };
  page?: number;
  limit?: number;
}

/**
 * Global search response
 */
export interface GlobalSearchResponse {
  query: string;
  totalResults: number;
  categories: SearchCategory[];
  suggestions: string[];
  filters: SearchFilters;
}

/**
 * Search category
 */
export interface SearchCategory {
  type: 'courses' | 'tests' | 'questions' | 'instructors';
  count: number;
  results: any[];
}

/**
 * Search filters
 */
export interface SearchFilters {
  categories: FilterOption[];
  levels: FilterOption[];
  languages: FilterOption[];
  instructors: FilterOption[];
}

/**
 * Filter option
 */
export interface FilterOption {
  value: string;
  label: string;
  count: number;
}

// =============================================================================
// ADMIN API TYPES
// =============================================================================

/**
 * Admin stats response
 */
export interface AdminStatsResponse {
  users: {
    total: number;
    active: number;
    new: number;
    growth: number;
  };
  courses: {
    total: number;
    published: number;
    draft: number;
    growth: number;
  };
  tests: {
    total: number;
    attempts: number;
    growth: number;
  };
  revenue: {
    total: number;
    monthly: number;
    growth: number;
  };
  system: {
    uptime: number;
    performance: number;
    errors: number;
  };
}

/**
 * Content moderation request
 */
export interface ContentModerationRequest {
  contentId: string;
  contentType: 'course' | 'question' | 'comment' | 'review';
  action: 'approve' | 'reject' | 'flag';
  reason?: string;
  notes?: string;
}

/**
 * User action request (admin)
 */
export interface UserActionRequest {
  userId: string;
  action: 'suspend' | 'activate' | 'ban' | 'warn' | 'reset_password';
  reason: string;
  duration?: number; // days, for temporary actions
  notifyUser?: boolean;
}

// =============================================================================
// WEBHOOK API TYPES
// =============================================================================

/**
 * Webhook event
 */
export interface WebhookEvent {
  id: string;
  type: WebhookEventType;
  data: Record<string, any>;
  timestamp: string;
  version: string;
}

/**
 * Webhook event types
 */
export type WebhookEventType = 
  | 'user.created'
  | 'user.updated'
  | 'course.enrolled'
  | 'course.completed'
  | 'test.completed'
  | 'payment.completed'
  | 'subscription.created'
  | 'subscription.cancelled';

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * API endpoint paths
 */
export interface ApiEndpoints {
  auth: {
    login: '/api/auth/login';
    register: '/api/auth/register';
    logout: '/api/auth/logout';
    refresh: '/api/auth/refresh';
    forgot: '/api/auth/forgot-password';
    reset: '/api/auth/reset-password';
  };
  users: {
    profile: '/api/users/profile';
    update: '/api/users/profile';
    stats: '/api/users/stats';
    activity: '/api/users/activity';
  };
  courses: {
    list: '/api/courses';
    search: '/api/courses/search';
    details: '/api/courses/:id';
    enroll: '/api/courses/:id/enroll';
    progress: '/api/courses/:id/progress';
  };
  tests: {
    list: '/api/tests';
    start: '/api/tests/:id/start';
    submit: '/api/tests/:id/submit';
    result: '/api/tests/attempts/:id/result';
  };
  payments: {
    create: '/api/payments/create';
    verify: '/api/payments/verify';
    history: '/api/payments/history';
  };
}

/**
 * HTTP method types
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Request configuration
 */
export interface RequestConfig {
  method: HttpMethod;
  url: string;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  timeout?: number;
  retry?: boolean;
  cache?: boolean;
}

/**
 * API client configuration
 */
export interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  authHeader: string;
  apiVersion: string;
}

// =============================================================================
// EXPORTS
// =============================================================================

export type * from './user';
export type * from './course';
export type * from './exam';