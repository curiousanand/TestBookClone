/**
 * Utility Types for TestBook Clone Application
 * 
 * Common utility types, form schemas, API endpoints,
 * and reusable type helpers across the application.
 */

// =============================================================================
// GENERIC UTILITY TYPES
// =============================================================================

/**
 * Make specific properties optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make specific properties required
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * Deep partial type
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Deep required type
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

/**
 * Flatten object type (remove nested objects)
 */
export type Flatten<T> = {
  [K in keyof T]: T[K] extends object ? never : T[K];
};

/**
 * Extract keys of type
 */
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

/**
 * Non-nullable type
 */
export type NonNullable<T> = T extends null | undefined ? never : T;

/**
 * Optional fields type
 */
export type OptionalFields<T> = {
  [K in keyof T as undefined extends T[K] ? K : never]: T[K];
};

/**
 * Required fields type
 */
export type RequiredFields<T> = {
  [K in keyof T as undefined extends T[K] ? never : K]: T[K];
};

/**
 * Merge two types
 */
export type Merge<T, U> = Omit<T, keyof U> & U;

/**
 * Override properties in type
 */
export type Override<T, U> = Omit<T, keyof U> & U;

/**
 * Pick properties by value type
 */
export type PickByType<T, U> = Pick<T, KeysOfType<T, U>>;

/**
 * Omit properties by value type
 */
export type OmitByType<T, U> = Omit<T, KeysOfType<T, U>>;

/**
 * Brand type for nominal typing
 */
export type Brand<T, B> = T & { readonly __brand: B };

/**
 * Nominal types for IDs
 */
export type UserId = Brand<string, 'UserId'>;
export type CourseId = Brand<string, 'CourseId'>;
export type LessonId = Brand<string, 'LessonId'>;
export type ExamId = Brand<string, 'ExamId'>;
export type TestSeriesId = Brand<string, 'TestSeriesId'>;
export type QuestionId = Brand<string, 'QuestionId'>;
export type PaymentId = Brand<string, 'PaymentId'>;
export type SessionId = Brand<string, 'SessionId'>;

// =============================================================================
// FORM UTILITY TYPES
// =============================================================================

/**
 * Form field state
 */
export interface FormField<T = any> {
  value: T;
  error?: string;
  touched: boolean;
  focused: boolean;
  dirty: boolean;
  valid: boolean;
}

/**
 * Form state
 */
export interface FormState<T = Record<string, any>> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValidating: boolean;
  isValid: boolean;
  isDirty: boolean;
  submitCount: number;
}

/**
 * Form validation rules
 */
export interface ValidationRule<T = any> {
  required?: boolean | string;
  min?: number | string;
  max?: number | string;
  minLength?: number | string;
  maxLength?: number | string;
  pattern?: RegExp | string;
  email?: boolean | string;
  url?: boolean | string;
  custom?: (value: T) => string | boolean | Promise<string | boolean>;
}

/**
 * Form validation schema
 */
export type ValidationSchema<T> = {
  [K in keyof T]?: ValidationRule<T[K]>;
};

/**
 * Form handlers
 */
export interface FormHandlers<T = Record<string, any>> {
  handleChange: (field: keyof T, value: T[keyof T]) => void;
  handleBlur: (field: keyof T) => void;
  handleFocus: (field: keyof T) => void;
  handleSubmit: (event?: React.FormEvent) => void;
  handleReset: () => void;
  setFieldValue: (field: keyof T, value: T[keyof T]) => void;
  setFieldError: (field: keyof T, error: string) => void;
  setFieldTouched: (field: keyof T, touched: boolean) => void;
  validateField: (field: keyof T) => Promise<void>;
  validateForm: () => Promise<boolean>;
}

/**
 * Form configuration
 */
export interface FormConfig<T = Record<string, any>> {
  initialValues: T;
  validationSchema?: ValidationSchema<T>;
  onSubmit: (values: T) => void | Promise<void>;
  onReset?: () => void;
  enableReinitialize?: boolean;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnMount?: boolean;
}

// =============================================================================
// API UTILITY TYPES
// =============================================================================

/**
 * API endpoint configuration
 */
export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  authenticated?: boolean;
  cache?: boolean;
  timeout?: number;
  retry?: boolean;
  retryCount?: number;
  retryDelay?: number;
}

/**
 * API endpoints collection
 */
export interface ApiEndpoints {
  // Authentication
  login: ApiEndpoint;
  register: ApiEndpoint;
  logout: ApiEndpoint;
  refresh: ApiEndpoint;
  forgotPassword: ApiEndpoint;
  resetPassword: ApiEndpoint;
  
  // User management
  getUserProfile: ApiEndpoint;
  updateUserProfile: ApiEndpoint;
  getUserStats: ApiEndpoint;
  getUserActivity: ApiEndpoint;
  searchUsers: ApiEndpoint;
  
  // Course management
  getCourses: ApiEndpoint;
  getCourse: ApiEndpoint;
  createCourse: ApiEndpoint;
  updateCourse: ApiEndpoint;
  deleteCourse: ApiEndpoint;
  searchCourses: ApiEndpoint;
  enrollCourse: ApiEndpoint;
  unenrollCourse: ApiEndpoint;
  
  // Lesson management
  getLessons: ApiEndpoint;
  getLesson: ApiEndpoint;
  createLesson: ApiEndpoint;
  updateLesson: ApiEndpoint;
  deleteLesson: ApiEndpoint;
  markLessonComplete: ApiEndpoint;
  updateLessonProgress: ApiEndpoint;
  
  // Exam management
  getExams: ApiEndpoint;
  getExam: ApiEndpoint;
  createExam: ApiEndpoint;
  updateExam: ApiEndpoint;
  deleteExam: ApiEndpoint;
  
  // Test series management
  getTestSeries: ApiEndpoint;
  getTestSeriesById: ApiEndpoint;
  createTestSeries: ApiEndpoint;
  updateTestSeries: ApiEndpoint;
  deleteTestSeries: ApiEndpoint;
  startTestAttempt: ApiEndpoint;
  submitTestAttempt: ApiEndpoint;
  getTestResult: ApiEndpoint;
  getTestAnalytics: ApiEndpoint;
  
  // Question management
  getQuestions: ApiEndpoint;
  getQuestion: ApiEndpoint;
  createQuestion: ApiEndpoint;
  updateQuestion: ApiEndpoint;
  deleteQuestion: ApiEndpoint;
  searchQuestions: ApiEndpoint;
  
  // Payment management
  createPayment: ApiEndpoint;
  verifyPayment: ApiEndpoint;
  getPaymentHistory: ApiEndpoint;
  refundPayment: ApiEndpoint;
  
  // Subscription management
  getSubscriptions: ApiEndpoint;
  createSubscription: ApiEndpoint;
  updateSubscription: ApiEndpoint;
  cancelSubscription: ApiEndpoint;
  
  // Live classes
  getLiveClasses: ApiEndpoint;
  getLiveClass: ApiEndpoint;
  joinLiveClass: ApiEndpoint;
  leaveLiveClass: ApiEndpoint;
  
  // Notifications
  getNotifications: ApiEndpoint;
  markNotificationRead: ApiEndpoint;
  markAllNotificationsRead: ApiEndpoint;
  deleteNotification: ApiEndpoint;
  
  // Analytics
  getDashboardAnalytics: ApiEndpoint;
  getUserAnalytics: ApiEndpoint;
  getCourseAnalytics: ApiEndpoint;
  getTestAnalytics: ApiEndpoint;
  
  // Search
  globalSearch: ApiEndpoint;
  searchSuggestions: ApiEndpoint;
  
  // File upload
  uploadFile: ApiEndpoint;
  deleteFile: ApiEndpoint;
  
  // Admin
  getAdminStats: ApiEndpoint;
  moderateContent: ApiEndpoint;
  manageUser: ApiEndpoint;
}

/**
 * Query parameters type
 */
export type QueryParams = Record<string, string | number | boolean | undefined>;

/**
 * URL path parameters type
 */
export type PathParams = Record<string, string>;

/**
 * API request options
 */
export interface RequestOptions {
  params?: QueryParams;
  pathParams?: PathParams;
  headers?: Record<string, string>;
  timeout?: number;
  retry?: boolean;
  cache?: boolean;
  signal?: AbortSignal;
}

/**
 * Paginated request parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Search parameters
 */
export interface SearchParams extends PaginationParams {
  query?: string;
  filters?: Record<string, any>;
}

/**
 * Date range parameters
 */
export interface DateRangeParams {
  startDate?: Date | string;
  endDate?: Date | string;
}

// =============================================================================
// STATE MANAGEMENT TYPES
// =============================================================================

/**
 * Async state
 */
export interface AsyncState<T = any, E = Error> {
  data: T | null;
  loading: boolean;
  error: E | null;
  lastFetch?: Date;
}

/**
 * Resource state (CRUD operations)
 */
export interface ResourceState<T = any> {
  items: T[];
  item: T | null;
  loading: boolean;
  error: string | null;
  filters: Record<string, any>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  sort: {
    field: string;
    order: 'asc' | 'desc';
  };
}

/**
 * Action with payload
 */
export interface Action<T = any> {
  type: string;
  payload?: T;
  meta?: Record<string, any>;
  error?: boolean;
}

/**
 * Async action states
 */
export interface AsyncActionTypes {
  pending: string;
  fulfilled: string;
  rejected: string;
}

/**
 * Store slice
 */
export interface StoreSlice<T = any> {
  name: string;
  initialState: T;
  reducers: Record<string, (state: T, action: Action) => T>;
  extraReducers?: (builder: any) => void;
}

// =============================================================================
// HOOK UTILITY TYPES
// =============================================================================

/**
 * API hook return type
 */
export interface UseApiReturn<T = any, E = Error> {
  data: T | null;
  loading: boolean;
  error: E | null;
  refetch: () => Promise<void>;
  mutate: (data: T) => void;
}

/**
 * Mutation hook return type
 */
export interface UseMutationReturn<TData = any, TVariables = any, TError = Error> {
  data: TData | null;
  loading: boolean;
  error: TError | null;
  mutate: (variables: TVariables) => Promise<TData>;
  reset: () => void;
}

/**
 * Pagination hook return type
 */
export interface UsePaginationReturn {
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setPageSize: (size: number) => void;
}

/**
 * Search hook return type
 */
export interface UseSearchReturn<T = any> {
  query: string;
  results: T[];
  loading: boolean;
  error: string | null;
  setQuery: (query: string) => void;
  clearSearch: () => void;
  filters: Record<string, any>;
  setFilters: (filters: Record<string, any>) => void;
  totalResults: number;
  hasMore: boolean;
  loadMore: () => void;
}

/**
 * Local storage hook return type
 */
export interface UseLocalStorageReturn<T = any> {
  value: T;
  setValue: (value: T) => void;
  removeValue: () => void;
}

/**
 * Debounce hook return type
 */
export interface UseDebounceReturn<T = any> {
  debouncedValue: T;
  cancel: () => void;
  flush: () => void;
}

// =============================================================================
// VALIDATION UTILITY TYPES
// =============================================================================

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings?: ValidationError[];
}

/**
 * Validation error
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

/**
 * Validation context
 */
export interface ValidationContext<T = any> {
  data: T;
  field: keyof T;
  value: T[keyof T];
  allValues: T;
  touched: Partial<Record<keyof T, boolean>>;
  errors: Partial<Record<keyof T, string>>;
}

/**
 * Custom validator function
 */
export type ValidatorFunction<T = any> = (
  context: ValidationContext<T>
) => string | boolean | Promise<string | boolean>;

/**
 * Validation schema with custom validators
 */
export interface ExtendedValidationSchema<T> extends ValidationSchema<T> {
  [key: string]: ValidationRule<any> & {
    validators?: ValidatorFunction<T>[];
  };
}

// =============================================================================
// PERMISSION & AUTHORIZATION TYPES
// =============================================================================

/**
 * Permission definition
 */
export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
  conditions?: PermissionCondition[];
}

/**
 * Permission condition
 */
export interface PermissionCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'contains' | 'starts_with';
  value: any;
}

/**
 * Role definition
 */
export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  inherits?: string[]; // Other role IDs
}

/**
 * Authorization context
 */
export interface AuthContext {
  user?: {
    id: string;
    role: string;
    permissions: string[];
  };
  resource?: any;
  action?: string;
}

/**
 * Permission check function
 */
export type PermissionChecker = (
  permission: string,
  context?: AuthContext
) => boolean;

// =============================================================================
// ENVIRONMENT & CONFIGURATION TYPES
// =============================================================================

/**
 * Environment variables
 */
export interface EnvironmentVariables {
  NODE_ENV: 'development' | 'production' | 'test';
  NEXT_PUBLIC_API_URL: string;
  NEXT_PUBLIC_APP_URL: string;
  NEXT_PUBLIC_ANALYTICS_ID?: string;
  NEXT_PUBLIC_SENTRY_DSN?: string;
  DATABASE_URL: string;
  NEXTAUTH_SECRET: string;
  NEXTAUTH_URL: string;
  JWT_SECRET: string;
  // Add more as needed
}

/**
 * Feature flags
 */
export interface FeatureFlags {
  enableAnalytics: boolean;
  enableLiveClasses: boolean;
  enableMobileApp: boolean;
  enableAdvancedReports: boolean;
  enableAI: boolean;
  enableSocialLogin: boolean;
  enablePayments: boolean;
  maintenanceMode: boolean;
}

/**
 * Application configuration
 */
export interface AppConfig {
  app: {
    name: string;
    version: string;
    description: string;
    url: string;
    supportEmail: string;
  };
  api: {
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
  };
  auth: {
    sessionTimeout: number; // minutes
    tokenRefreshThreshold: number; // minutes
    enableTwoFactor: boolean;
  };
  uploads: {
    maxFileSize: number; // bytes
    allowedTypes: string[];
    cloudinaryConfig?: {
      cloudName: string;
      uploadPreset: string;
    };
  };
  payments: {
    currency: string;
    supportedMethods: string[];
    razorpay?: {
      keyId: string;
    };
    stripe?: {
      publicKey: string;
    };
  };
  features: FeatureFlags;
}

// =============================================================================
// EVENT TYPES
// =============================================================================

/**
 * Application events
 */
export type AppEvent = 
  | { type: 'user/login'; payload: { userId: string } }
  | { type: 'user/logout'; payload: { userId: string } }
  | { type: 'course/enroll'; payload: { userId: string; courseId: string } }
  | { type: 'lesson/complete'; payload: { userId: string; lessonId: string } }
  | { type: 'test/complete'; payload: { userId: string; testId: string; score: number } }
  | { type: 'payment/success'; payload: { userId: string; amount: number } }
  | { type: 'subscription/create'; payload: { userId: string; planId: string } }
  | { type: 'notification/send'; payload: { userId: string; message: string } };

/**
 * Event handler function
 */
export type EventHandler<T extends AppEvent = AppEvent> = (event: T) => void;

/**
 * Event emitter interface
 */
export interface EventEmitter {
  emit<T extends AppEvent>(event: T): void;
  on<T extends AppEvent>(eventType: T['type'], handler: EventHandler<T>): void;
  off<T extends AppEvent>(eventType: T['type'], handler: EventHandler<T>): void;
  once<T extends AppEvent>(eventType: T['type'], handler: EventHandler<T>): void;
}

// =============================================================================
// TESTING UTILITY TYPES
// =============================================================================

/**
 * Mock function type
 */
export type MockFunction<T extends (...args: any[]) => any> = jest.Mock<
  ReturnType<T>,
  Parameters<T>
>;

/**
 * Component test props
 */
export interface ComponentTestProps<T = any> {
  component: React.ComponentType<T>;
  props: T;
  mockProps?: Partial<T>;
  testId?: string;
}

/**
 * API mock response
 */
export interface MockApiResponse<T = any> {
  status: number;
  data: T;
  delay?: number;
  error?: boolean;
}

/**
 * Test utilities
 */
export interface TestUtils {
  render: (component: React.ReactElement) => any;
  fireEvent: any;
  waitFor: (callback: () => void) => Promise<void>;
  screen: any;
  userEvent: any;
}

// =============================================================================
// EXPORTS
// =============================================================================

// Re-export common types
export type { ComponentProps, HTMLAttributes } from 'react';

// Export utility type constructors
export const createBrandedType = <T, B extends string>(value: T): Brand<T, B> => 
  value as Brand<T, B>;

export const createUserId = (id: string): UserId => createBrandedType<string, 'UserId'>(id);
export const createCourseId = (id: string): CourseId => createBrandedType<string, 'CourseId'>(id);
export const createLessonId = (id: string): LessonId => createBrandedType<string, 'LessonId'>(id);
export const createExamId = (id: string): ExamId => createBrandedType<string, 'ExamId'>(id);
export const createTestSeriesId = (id: string): TestSeriesId => createBrandedType<string, 'TestSeriesId'>(id);
export const createQuestionId = (id: string): QuestionId => createBrandedType<string, 'QuestionId'>(id);
export const createPaymentId = (id: string): PaymentId => createBrandedType<string, 'PaymentId'>(id);
export const createSessionId = (id: string): SessionId => createBrandedType<string, 'SessionId'>(id);