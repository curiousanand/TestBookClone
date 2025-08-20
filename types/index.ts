/**
 * Type Definitions Index for TestBook Clone Application
 * 
 * Central export file for all TypeScript type definitions.
 * Provides convenient access to all types across the application.
 */

// =============================================================================
// CORE DOMAIN TYPES
// =============================================================================

// User types
export type * from './user';
export type {
  User,
  UserWithRelations,
  PublicUserProfile,
  AuthUser,
  UserStats,
  UserPreferences,
  UserSubscription,
  UserActivity,
  LoginCredentials,
  RegisterData
} from './user';

// Course types
export type * from './course';
export type {
  Course,
  CourseWithRelations,
  PublicCourse,
  Lesson,
  LessonWithProgress,
  Category,
  CourseEnrollment,
  UserProgress,
  CourseProgressSummary,
  LearningPath,
  CourseStats
} from './course';

// Exam types
export type * from './exam';
export type {
  Exam,
  ExamWithRelations,
  TestSeries,
  PublicTestSeries,
  Question,
  PublicQuestion,
  TestAttempt,
  TestAttemptWithRelations,
  TestResult,
  QuestionAttempt,
  LiveTest,
  TestSeriesStats
} from './exam';

// =============================================================================
// API TYPES
// =============================================================================

// API response and request types
export type * from './api';
export type {
  ApiResponse,
  PaginatedResponse,
  ApiError,
  ApiErrorType,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  AuthTokens,
  PaymentResponse,
  SubscriptionResponse,
  NotificationResponse,
  GlobalSearchResponse
} from './api';

// =============================================================================
// UI COMPONENT TYPES
// =============================================================================

// UI component props and design system types
export type * from './ui';
export type {
  BaseComponentProps,
  WithChildren,
  ComponentSize,
  ComponentColor,
  ComponentVariant,
  LoadingState,
  ValidationState,
  
  // Layout components
  PageLayoutProps,
  HeaderProps,
  SidebarProps,
  BreadcrumbItem,
  NavigationItem,
  
  // Form components
  FormFieldProps,
  InputProps,
  SelectProps,
  SelectOption,
  TextareaProps,
  CheckboxProps,
  RadioProps,
  SwitchProps,
  FileUploadProps,
  UploadedFile,
  
  // Data display components
  TableProps,
  TableColumn,
  CardProps,
  AvatarProps,
  BadgeProps,
  TagProps,
  
  // Feedback components
  AlertProps,
  ModalProps,
  DrawerProps,
  TooltipProps,
  ProgressProps,
  LoadingProps,
  
  // Navigation components
  ButtonProps,
  LinkProps,
  PaginationProps,
  MenuProps,
  MenuItem,
  
  // Course-specific components
  CourseCardProps,
  CourseListProps,
  LessonPlayerProps,
  CourseProgressProps,
  
  // Exam-specific components
  TestCardProps,
  QuestionComponentProps,
  TestTimerProps,
  QuestionPaletteProps,
  TestResultProps,
  
  // Theme types
  Theme,
  ThemeColors,
  Breakpoint,
  ResponsiveValue
} from './ui';

// =============================================================================
// UTILITY TYPES
// =============================================================================

// Utility and helper types
export type * from './utils';
export type {
  // Generic utilities
  PartialBy,
  RequiredBy,
  DeepPartial,
  DeepRequired,
  NonNullable,
  Merge,
  Override,
  Brand,
  
  // Branded ID types
  UserId,
  CourseId,
  LessonId,
  ExamId,
  TestSeriesId,
  QuestionId,
  PaymentId,
  SessionId,
  
  // Form utilities
  FormField,
  FormState,
  ValidationRule,
  ValidationSchema,
  FormHandlers,
  FormConfig,
  
  // API utilities
  ApiEndpoint,
  ApiEndpoints,
  QueryParams,
  PathParams,
  RequestOptions,
  PaginationParams,
  SearchParams,
  
  // State management
  AsyncState,
  ResourceState,
  Action,
  AsyncActionTypes,
  
  // Hook utilities
  UseApiReturn,
  UseMutationReturn,
  UsePaginationReturn,
  UseSearchReturn,
  UseLocalStorageReturn,
  
  // Validation utilities
  ValidationResult,
  ValidationError,
  ValidationContext,
  ValidatorFunction,
  
  // Configuration types
  EnvironmentVariables,
  FeatureFlags,
  AppConfig,
  
  // Event types
  AppEvent,
  EventHandler,
  EventEmitter
} from './utils';

// =============================================================================
// RE-EXPORT PRISMA TYPES
// =============================================================================

// Re-export important Prisma enums and base types for convenience
export type {
  UserRole,
  UserStatus,
  CourseStatus,
  CourseLevel,
  ExamType,
  QuestionType,
  QuestionDifficulty,
  TestSeriesType,
  Language,
  SubscriptionStatus,
  PaymentStatus,
  PaymentMethod,
  LiveClassStatus
} from '@prisma/client';

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Type guard to check if a value is defined (not null or undefined)
 */
export const isDefined = <T>(value: T | null | undefined): value is T => {
  return value !== null && value !== undefined;
};

/**
 * Type guard to check if a string is not empty
 */
export const isNonEmptyString = (value: string | null | undefined): value is string => {
  return typeof value === 'string' && value.length > 0;
};

/**
 * Type guard to check if an array is not empty
 */
export const isNonEmptyArray = <T>(value: T[] | null | undefined): value is T[] => {
  return Array.isArray(value) && value.length > 0;
};

/**
 * Type guard to check if a value is an API error response
 */
export const isApiError = (value: any): value is ApiError => {
  return value && typeof value.code === 'string' && typeof value.message === 'string';
};

/**
 * Type guard to check if an API response is successful
 */
export const isApiSuccess = <T>(response: ApiResponse<T>): response is ApiResponse<T> & { success: true; data: T } => {
  return response.success === true && response.data !== undefined;
};

/**
 * Type guard to check if a user has a specific role
 */
export const hasRole = (user: { role: UserRole } | null | undefined, role: UserRole): boolean => {
  return user?.role === role;
};

/**
 * Type guard to check if a user is authenticated
 */
export const isAuthenticated = (user: any): user is AuthUser => {
  return user && typeof user.id === 'string' && typeof user.email === 'string';
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Create branded ID from string
 */
export const createBrandedId = <B extends string>(type: B) => 
  (id: string): Brand<string, B> => id as Brand<string, B>;

// ID creators
export const createUserId = createBrandedId('UserId');
export const createCourseId = createBrandedId('CourseId');
export const createLessonId = createBrandedId('LessonId');
export const createExamId = createBrandedId('ExamId');
export const createTestSeriesId = createBrandedId('TestSeriesId');
export const createQuestionId = createBrandedId('QuestionId');
export const createPaymentId = createBrandedId('PaymentId');
export const createSessionId = createBrandedId('SessionId');

/**
 * Type-safe object keys
 */
export const typedKeys = <T extends Record<string, any>>(obj: T): (keyof T)[] => {
  return Object.keys(obj) as (keyof T)[];
};

/**
 * Type-safe object entries
 */
export const typedEntries = <T extends Record<string, any>>(obj: T): [keyof T, T[keyof T]][] => {
  return Object.entries(obj) as [keyof T, T[keyof T]][];
};

/**
 * Pick properties from object with type safety
 */
export const pick = <T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
};

/**
 * Omit properties from object with type safety
 */
export const omit = <T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach(key => {
    delete result[key];
  });
  return result;
};

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Common validation messages
 */
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  EMAIL: 'Please enter a valid email address',
  PASSWORD_MIN_LENGTH: 'Password must be at least 8 characters long',
  PASSWORD_COMPLEXITY: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  PHONE_NUMBER: 'Please enter a valid phone number',
  URL: 'Please enter a valid URL',
  POSITIVE_NUMBER: 'Please enter a positive number',
  INTEGER: 'Please enter a whole number',
  MIN_VALUE: (min: number) => `Value must be at least ${min}`,
  MAX_VALUE: (max: number) => `Value must be at most ${max}`,
  MIN_LENGTH: (min: number) => `Must be at least ${min} characters long`,
  MAX_LENGTH: (max: number) => `Must be at most ${max} characters long`,
  MATCH: (field: string) => `Must match ${field}`,
  UNIQUE: 'This value is already taken',
  FILE_SIZE: (max: string) => `File size must be less than ${max}`,
  FILE_TYPE: (types: string) => `File type must be ${types}`,
} as const;

/**
 * HTTP status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * Component sizes
 */
export const COMPONENT_SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

/**
 * Component colors
 */
export const COMPONENT_COLORS = [
  'primary',
  'secondary', 
  'success',
  'warning',
  'error',
  'info',
  'gray',
  'neutral'
] as const;

/**
 * Responsive breakpoints
 */
export const BREAKPOINTS = {
  xs: '0px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// =============================================================================
// VERSION INFO
// =============================================================================

/**
 * Type definitions version and metadata
 */
export const TYPE_DEFINITIONS_META = {
  version: '1.0.0',
  lastUpdated: '2024-12-20',
  description: 'Comprehensive TypeScript type definitions for TestBook Clone Application',
  coverage: {
    domains: ['user', 'course', 'exam', 'payment', 'subscription', 'live-class'],
    components: ['forms', 'tables', 'cards', 'modals', 'charts', 'navigation'],
    api: ['rest', 'websocket', 'webhooks', 'auth', 'file-upload'],
    utilities: ['validation', 'state-management', 'hooks', 'permissions', 'events'],
  },
} as const;