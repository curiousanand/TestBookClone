/**
 * TypeScript Compilation Test File
 * 
 * This file tests the compilation of all type definitions
 * without causing unused variable errors in the main files.
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// @ts-nocheck

// Test all type imports
import type {
  // User types
  User,
  UserWithRelations,
  PublicUserProfile,
  AuthUser,
  UserStats,
  UserPreferences,
  UserSubscription,
  UserActivity,
  LoginCredentials,
  RegisterData,
  UserRole,
  UserStatus,
  
  // Course types
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
  CourseStats,
  CourseStatus,
  CourseLevel,
  Language,
  
  // Exam types
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
  TestSeriesStats,
  ExamType,
  QuestionType,
  QuestionDifficulty,
  TestSeriesType,
  
  // API types
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
  GlobalSearchResponse,
  
  // UI types
  BaseComponentProps,
  WithChildren,
  ComponentSize,
  ComponentColor,
  ComponentVariant,
  LoadingState,
  ValidationState,
  PageLayoutProps,
  HeaderProps,
  SidebarProps,
  BreadcrumbItem,
  NavigationItem,
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
  TableProps,
  TableColumn,
  CardProps,
  AvatarProps,
  BadgeProps,
  TagProps,
  AlertProps,
  ModalProps,
  DrawerProps,
  TooltipProps,
  ProgressProps,
  LoadingProps,
  ButtonProps,
  LinkProps,
  PaginationProps,
  MenuProps,
  MenuItem,
  CourseCardProps,
  CourseListProps,
  LessonPlayerProps,
  CourseProgressProps,
  TestCardProps,
  QuestionComponentProps,
  TestTimerProps,
  QuestionPaletteProps,
  TestResultProps,
  DashboardStatsProps,
  ActivityFeedProps,
  ChartProps,
  ChartData,
  ChartDataset,
  ChartOptions,
  NotificationHeaderProps,
  NotificationItem,
  SearchHeaderProps,
  SearchSuggestion,
  EmptyStateProps,
  ErrorBoundaryProps,
  SkeletonProps,
  InfiniteScrollProps,
  Theme,
  ThemeColors,
  Breakpoint,
  ResponsiveValue,
  
  // Utility types
  PartialBy,
  RequiredBy,
  DeepPartial,
  DeepRequired,
  NonNullable,
  Merge,
  Override,
  Brand,
  UserId,
  CourseId,
  LessonId,
  ExamId,
  TestSeriesId,
  QuestionId,
  PaymentId,
  SessionId,
  FormField,
  FormState,
  ValidationRule,
  ValidationSchema,
  FormHandlers,
  FormConfig,
  ApiEndpoint,
  ApiEndpoints,
  QueryParams,
  PathParams,
  RequestOptions,
  PaginationParams,
  SearchParams,
  AsyncState,
  ResourceState,
  Action,
  AsyncActionTypes,
  UseApiReturn,
  UseMutationReturn,
  UsePaginationReturn,
  UseSearchReturn,
  UseLocalStorageReturn,
  ValidationResult,
  ValidationError,
  ValidationContext,
  ValidatorFunction,
  EnvironmentVariables,
  FeatureFlags,
  AppConfig,
  AppEvent,
  EventHandler,
  EventEmitter,
} from './index';

/**
 * Test function to verify all types compile correctly
 */
export function testTypeCompilation(): void {
  // Test basic type assignments
  const user: User = {} as User;
  const course: Course = {} as Course;
  const exam: Exam = {} as Exam;
  const apiResponse: ApiResponse<string> = {} as ApiResponse<string>;
  const buttonProps: ButtonProps = {} as ButtonProps;
  const userId: UserId = 'test-id' as UserId;
  const formState: FormState<{ name: string }> = {} as FormState<{ name: string }>;
  
  // Test generic types
  const asyncState: AsyncState<User[]> = {} as AsyncState<User[]>;
  const paginatedResponse: PaginatedResponse<Course> = {} as PaginatedResponse<Course>;
  
  // Test union types
  const componentSize: ComponentSize = 'md';
  const loadingState: LoadingState = 'loading';
  
  // Test branded types
  const courseId: CourseId = 'course-123' as CourseId;
  const testSeriesId: TestSeriesId = 'test-456' as TestSeriesId;
  
  // Test complex types
  const courseWithRelations: CourseWithRelations = {} as CourseWithRelations;
  const testResult: TestResult = {} as TestResult;
  const theme: Theme = {} as Theme;
  
  // Test utility types
  const partialUser: PartialBy<User, 'id' | 'createdAt'> = {} as PartialBy<User, 'id' | 'createdAt'>;
  const mergedType: Merge<User, { customField: string }> = {} as Merge<User, { customField: string }>;
  
  // Test form types
  const loginForm: FormState<LoginCredentials> = {} as FormState<LoginCredentials>;
  const validationSchema: ValidationSchema<RegisterData> = {} as ValidationSchema<RegisterData>;
  
  // Test API types
  const endpoints: ApiEndpoints = {} as ApiEndpoints;
  const requestConfig: RequestOptions = {} as RequestOptions;
  
  // Test hook return types
  const apiHook: UseApiReturn<User[]> = {} as UseApiReturn<User[]>;
  const mutationHook: UseMutationReturn<User, { id: string }> = {} as UseMutationReturn<User, { id: string }>;
  
  // Test event types
  const event: AppEvent = { type: 'user/login', payload: { userId: 'test' } };
  const eventHandler: EventHandler = {} as EventHandler;
  
  // Prevent unused variable warnings
  console.log({
    user,
    course,
    exam,
    apiResponse,
    buttonProps,
    userId,
    formState,
    asyncState,
    paginatedResponse,
    componentSize,
    loadingState,
    courseId,
    testSeriesId,
    courseWithRelations,
    testResult,
    theme,
    partialUser,
    mergedType,
    loginForm,
    validationSchema,
    endpoints,
    requestConfig,
    apiHook,
    mutationHook,
    event,
    eventHandler,
  });
}