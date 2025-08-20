/**
 * UI Component Types for TestBook Clone Application
 * 
 * Comprehensive type definitions for React component props,
 * UI states, form components, and design system elements.
 */

import { ReactNode, ComponentProps, CSSProperties } from 'react';
import type {
  PublicUserProfile,
  UserStats
} from './user';
import type {
  PublicCourse,
  Lesson,
  CourseProgressSummary
} from './course';
import type {
  PublicTestSeries,
  Question,
  TestResult
} from './exam';

// =============================================================================
// BASE UI TYPES
// =============================================================================

/**
 * Common component props
 */
export interface BaseComponentProps {
  className?: string;
  style?: CSSProperties;
  id?: string;
  'data-testid'?: string;
}

/**
 * Component with children
 */
export interface WithChildren {
  children?: ReactNode;
}

/**
 * Component size variants
 */
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Component color variants
 */
export type ComponentColor = 
  | 'primary' 
  | 'secondary' 
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'info' 
  | 'gray'
  | 'neutral';

/**
 * Component variant types
 */
export type ComponentVariant = 
  | 'solid' 
  | 'outline' 
  | 'ghost' 
  | 'link' 
  | 'subtle';

/**
 * Loading states
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Form validation state
 */
export type ValidationState = 'valid' | 'invalid' | 'pending';

// =============================================================================
// LAYOUT COMPONENT TYPES
// =============================================================================

/**
 * Page layout props
 */
export interface PageLayoutProps extends BaseComponentProps, WithChildren {
  title?: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  sidebar?: ReactNode;
  footer?: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  centered?: boolean;
  loading?: boolean;
}

/**
 * Breadcrumb item
 */
export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
  icon?: ReactNode;
}

/**
 * Header props
 */
export interface HeaderProps extends BaseComponentProps {
  user?: PublicUserProfile;
  notifications?: NotificationHeaderProps;
  search?: SearchHeaderProps;
  navigation?: NavigationItem[];
  onUserMenuClick?: () => void;
  onNotificationsClick?: () => void;
  onSearchSubmit?: (query: string) => void;
}

/**
 * Navigation item
 */
export interface NavigationItem {
  label: string;
  href: string;
  icon?: ReactNode;
  active?: boolean;
  badge?: string | number;
  children?: NavigationItem[];
}

/**
 * Sidebar props
 */
export interface SidebarProps extends BaseComponentProps {
  items: SidebarItem[];
  collapsed?: boolean;
  onToggle?: () => void;
  footer?: ReactNode;
}

/**
 * Sidebar item
 */
export interface SidebarItem {
  id: string;
  label: string;
  icon?: ReactNode;
  href?: string;
  onClick?: () => void;
  active?: boolean;
  badge?: string | number;
  children?: SidebarItem[];
  disabled?: boolean;
}

// =============================================================================
// FORM COMPONENT TYPES
// =============================================================================

/**
 * Form field base props
 */
export interface FormFieldProps extends BaseComponentProps {
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
}

/**
 * Input component props
 */
export interface InputProps extends FormFieldProps, 
  Omit<ComponentProps<'input'>, 'size'> {
  size?: ComponentSize;
  variant?: 'default' | 'filled' | 'underlined';
  fullWidth?: boolean;
  readonly?: boolean;
  helperText?: string;
  success?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  leftAddon?: ReactNode;
  rightAddon?: ReactNode;
  showCount?: boolean;
  wrapperClassName?: string;
}

/**
 * Textarea component props
 */
export interface TextareaProps extends FormFieldProps,
  ComponentProps<'textarea'> {
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';
  autoResize?: boolean;
  minRows?: number;
  maxRows?: number;
}

/**
 * Select component props
 */
export interface SelectProps extends FormFieldProps {
  options: SelectOption[];
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  loading?: boolean;
  size?: ComponentSize;
  placeholder?: string;
}

/**
 * Select option
 */
export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  disabled?: boolean;
  group?: string;
}

/**
 * Checkbox component props
 */
export interface CheckboxProps extends BaseComponentProps,
  Omit<ComponentProps<'input'>, 'type' | 'size'> {
  label?: ReactNode;
  description?: string;
  error?: string;
  indeterminate?: boolean;
  size?: ComponentSize;
  color?: ComponentColor;
}

/**
 * Radio component props
 */
export interface RadioProps extends BaseComponentProps,
  Omit<ComponentProps<'input'>, 'type' | 'size'> {
  label?: ReactNode;
  description?: string;
  size?: ComponentSize;
  color?: ComponentColor;
}

/**
 * Switch component props
 */
export interface SwitchProps extends BaseComponentProps,
  Omit<ComponentProps<'input'>, 'type' | 'size'> {
  label?: ReactNode;
  description?: string;
  size?: ComponentSize;
  color?: ComponentColor;
}

/**
 * File upload component props
 */
export interface FileUploadProps extends FormFieldProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // bytes
  maxFiles?: number;
  onUpload?: (files: File[]) => Promise<void>;
  onRemove?: (file: File) => void;
  preview?: boolean;
  dragDrop?: boolean;
  value?: UploadedFile[];
}

/**
 * Uploaded file
 */
export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  thumbnailUrl?: string;
  uploadedAt: Date;
  status: 'uploading' | 'uploaded' | 'error';
  progress?: number;
  error?: string;
}

// =============================================================================
// DATA DISPLAY COMPONENT TYPES
// =============================================================================

/**
 * Table component props
 */
export interface TableProps<T = any> extends BaseComponentProps {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  pagination?: TablePaginationProps;
  sorting?: TableSortingProps;
  filtering?: TableFilteringProps;
  selection?: TableSelectionProps<T>;
  actions?: TableAction<T>[];
  emptyState?: ReactNode;
  error?: string;
  onRowClick?: (row: T) => void;
}

/**
 * Table column definition
 */
export interface TableColumn<T = any> {
  key: keyof T | string;
  title: string;
  dataIndex?: keyof T;
  render?: (value: any, row: T, index: number) => ReactNode;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  filterable?: boolean;
  searchable?: boolean;
  fixed?: 'left' | 'right';
  ellipsis?: boolean;
}

/**
 * Table pagination props
 */
export interface TablePaginationProps {
  current: number;
  pageSize: number;
  total: number;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: (total: number, range: [number, number]) => ReactNode;
  onChange: (page: number, pageSize: number) => void;
}

/**
 * Table sorting props
 */
export interface TableSortingProps {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
}

/**
 * Table filtering props
 */
export interface TableFilteringProps {
  filters: Record<string, any>;
  onChange: (filters: Record<string, any>) => void;
}

/**
 * Table selection props
 */
export interface TableSelectionProps<T = any> {
  selectedRows: T[];
  onChange: (selectedRows: T[]) => void;
  getRowKey: (row: T) => string;
  type?: 'checkbox' | 'radio';
}

/**
 * Table action
 */
export interface TableAction<T = any> {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick: (row: T) => void;
  disabled?: (row: T) => boolean;
  visible?: (row: T) => boolean;
  confirm?: {
    title: string;
    description: string;
  };
}

/**
 * Card component props
 */
export interface CardProps extends BaseComponentProps, WithChildren {
  variant?: 'default' | 'outlined' | 'elevated' | 'filled';
  size?: ComponentSize;
  hoverable?: boolean;
  clickable?: boolean;
  shadow?: boolean;
  onClick?: () => void;
}

/**
 * Card sub-component props
 */
export interface CardHeaderProps extends BaseComponentProps, WithChildren {}
export interface CardBodyProps extends BaseComponentProps, WithChildren {}
export interface CardFooterProps extends BaseComponentProps, WithChildren {}

/**
 * Avatar component props
 */
export interface AvatarProps extends BaseComponentProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: ComponentSize;
  shape?: 'circle' | 'square';
  showBorder?: boolean;
  status?: 'online' | 'offline' | 'away' | 'busy';
  fallbackSrc?: string;
  onClick?: () => void;
}

/**
 * Avatar group component props
 */
export interface AvatarGroupProps extends BaseComponentProps, WithChildren {
  max?: number;
  size?: ComponentSize;
  spacing?: 'tight' | 'normal' | 'loose';
}

/**
 * Badge component props
 */
export interface BadgeProps extends BaseComponentProps, WithChildren {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'outline' | 'outline-primary' | 'outline-success' | 'outline-warning' | 'outline-danger';
  size?: ComponentSize;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  withDot?: boolean;
  removable?: boolean;
  onRemove?: () => void;
}

/**
 * Tag component props
 */
export interface TagProps extends BaseComponentProps, WithChildren {
  color?: ComponentColor | string;
  size?: ComponentSize;
  variant?: ComponentVariant;
  closable?: boolean;
  onClose?: () => void;
  icon?: ReactNode;
}

// =============================================================================
// FEEDBACK COMPONENT TYPES
// =============================================================================

/**
 * Alert component props
 */
export interface AlertProps extends BaseComponentProps, WithChildren {
  variant?: 'info' | 'success' | 'warning' | 'danger';
  size?: ComponentSize;
  dismissible?: boolean;
  icon?: boolean | ReactNode;
  title?: ReactNode;
  onDismiss?: () => void;
}

/**
 * Modal component props
 */
export interface ModalProps extends BaseComponentProps, WithChildren {
  open?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
  centered?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  preventScroll?: boolean;
  overlayClassName?: string;
  onClose?: () => void;
  onOpen?: () => void;
  onOverlayClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

/**
 * Modal sub-component props
 */
export interface ModalHeaderProps extends BaseComponentProps, WithChildren {
  showCloseButton?: boolean;
  onClose?: () => void;
}
export interface ModalBodyProps extends BaseComponentProps, WithChildren {}
export interface ModalFooterProps extends BaseComponentProps, WithChildren {}

/**
 * Dropdown component props
 */
export interface DropdownProps extends BaseComponentProps, WithChildren {
  trigger: ReactNode;
  placement?: 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end' | 'right' | 'right-start' | 'right-end';
  offset?: number;
  closeOnClick?: boolean;
  disabled?: boolean;
  triggerClassName?: string;
  onOpen?: () => void;
  onClose?: () => void;
}

/**
 * Dropdown sub-component props
 */
export interface DropdownItemProps extends BaseComponentProps, WithChildren {
  disabled?: boolean;
  danger?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onClose?: () => void;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export interface DropdownDividerProps extends BaseComponentProps {}

/**
 * Drawer component props
 */
export interface DrawerProps extends BaseComponentProps, WithChildren {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  placement?: 'left' | 'right' | 'top' | 'bottom';
  width?: number | string;
  height?: number | string;
  closable?: boolean;
  maskClosable?: boolean;
  destroyOnClose?: boolean;
}

/**
 * Tooltip component props
 */
export interface TooltipProps extends BaseComponentProps, WithChildren {
  title: ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click' | 'focus';
  visible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  arrow?: boolean;
  delay?: number;
}

/**
 * Progress component props
 */
export interface ProgressProps extends BaseComponentProps {
  value: number;
  max?: number;
  showPercent?: boolean;
  status?: 'normal' | 'success' | 'error' | 'active';
  strokeColor?: string | string[];
  trailColor?: string;
  strokeWidth?: number;
  size?: ComponentSize;
  type?: 'line' | 'circle' | 'dashboard';
}

/**
 * Loading component props
 */
export interface LoadingProps extends BaseComponentProps {
  size?: ComponentSize;
  variant?: 'spinner' | 'dots' | 'bars' | 'pulse' | 'ring';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'white';
  overlay?: boolean;
  fullScreen?: boolean;
  text?: string;
}

// =============================================================================
// NAVIGATION COMPONENT TYPES
// =============================================================================

/**
 * Button component props
 */
export interface ButtonProps extends BaseComponentProps,
  Omit<ComponentProps<'button'>, 'type'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning' | 'link';
  size?: ComponentSize;
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  type?: 'button' | 'submit' | 'reset';
}

/**
 * Link component props
 */
export interface LinkProps extends BaseComponentProps,
  ComponentProps<'a'> {
  underline?: 'always' | 'hover' | 'none';
  color?: ComponentColor;
  disabled?: boolean;
  icon?: ReactNode;
}

/**
 * Pagination component props
 */
export interface PaginationProps extends BaseComponentProps {
  current: number;
  total: number;
  pageSize: number;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showLessItems?: boolean;
  simple?: boolean;
  size?: ComponentSize;
  onChange: (page: number, pageSize: number) => void;
}

/**
 * Breadcrumb component props
 */
export interface BreadcrumbProps extends BaseComponentProps {
  items: BreadcrumbItem[];
  separator?: ReactNode;
  maxItems?: number;
}

/**
 * Menu component props
 */
export interface MenuProps extends BaseComponentProps {
  items: MenuItem[];
  selectedKeys?: string[];
  openKeys?: string[];
  mode?: 'horizontal' | 'vertical' | 'inline';
  theme?: 'light' | 'dark';
  collapsed?: boolean;
  onSelect?: (key: string) => void;
  onOpenChange?: (openKeys: string[]) => void;
}

/**
 * Menu item
 */
export interface MenuItem {
  key: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  danger?: boolean;
  children?: MenuItem[];
  type?: 'item' | 'submenu' | 'group' | 'divider';
}

// =============================================================================
// COURSE-SPECIFIC COMPONENT TYPES
// =============================================================================

/**
 * Course card props
 */
export interface CourseCardProps extends BaseComponentProps {
  course: PublicCourse;
  enrolled?: boolean;
  progress?: number;
  onEnroll?: (courseId: string) => void;
  onView?: (courseId: string) => void;
  layout?: 'grid' | 'list';
  showProgress?: boolean;
  showInstructor?: boolean;
  showStats?: boolean;
}

/**
 * Course list props
 */
export interface CourseListProps extends BaseComponentProps {
  courses: PublicCourse[];
  loading?: boolean;
  pagination?: PaginationProps;
  filters?: CourseFilters;
  onFilterChange?: (filters: CourseFilters) => void;
  onCourseClick?: (course: PublicCourse) => void;
  layout?: 'grid' | 'list';
  emptyState?: ReactNode;
}

/**
 * Course filters
 */
export interface CourseFilters {
  search?: string;
  category?: string[];
  level?: string[];
  language?: string[];
  price?: 'free' | 'paid' | 'all';
  rating?: number;
  duration?: {
    min?: number;
    max?: number;
  };
}

/**
 * Lesson player props
 */
export interface LessonPlayerProps extends BaseComponentProps {
  lesson: Lesson;
  autoplay?: boolean;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  controls?: LessonPlayerControls;
}

/**
 * Lesson player controls
 */
export interface LessonPlayerControls {
  playPause?: boolean;
  progress?: boolean;
  volume?: boolean;
  speed?: boolean;
  fullscreen?: boolean;
  notes?: boolean;
  transcript?: boolean;
  quality?: boolean;
}

/**
 * Course progress props
 */
export interface CourseProgressProps extends BaseComponentProps {
  progress: CourseProgressSummary;
  detailed?: boolean;
  showCertificate?: boolean;
  showTimeRemaining?: boolean;
  showStreak?: boolean;
}

// =============================================================================
// EXAM-SPECIFIC COMPONENT TYPES
// =============================================================================

/**
 * Test card props
 */
export interface TestCardProps extends BaseComponentProps {
  testSeries: PublicTestSeries;
  attempted?: boolean;
  bestScore?: number;
  lastAttemptAt?: Date;
  onStart?: (testSeriesId: string) => void;
  onViewResult?: (testSeriesId: string) => void;
  layout?: 'grid' | 'list';
  showStats?: boolean;
}

/**
 * Question component props
 */
export interface QuestionComponentProps extends BaseComponentProps {
  question: Question;
  selectedAnswer?: string | string[];
  onAnswerChange?: (answer: string | string[]) => void;
  showExplanation?: boolean;
  showResult?: boolean;
  marked?: boolean;
  onMarkQuestion?: () => void;
  readonly?: boolean;
  questionNumber?: number;
  totalQuestions?: number;
}

/**
 * Test timer props
 */
export interface TestTimerProps extends BaseComponentProps {
  duration: number; // seconds
  onTimeUp?: () => void;
  onTimeWarning?: (remainingSeconds: number) => void;
  warningThreshold?: number; // seconds
  paused?: boolean;
  format?: 'mm:ss' | 'hh:mm:ss';
  showWarning?: boolean;
}

/**
 * Question palette props
 */
export interface QuestionPaletteProps extends BaseComponentProps {
  questions: QuestionPaletteItem[];
  currentQuestion: number;
  onQuestionClick: (questionNumber: number) => void;
  onSubmit?: () => void;
  submitDisabled?: boolean;
}

/**
 * Question palette item
 */
export interface QuestionPaletteItem {
  number: number;
  status: 'not_visited' | 'not_answered' | 'answered' | 'marked' | 'answered_marked';
  subject?: string;
}

/**
 * Test result props
 */
export interface TestResultProps extends BaseComponentProps {
  result: TestResult;
  showAnalytics?: boolean;
  showComparison?: boolean;
  showRecommendations?: boolean;
  onViewSolutions?: () => void;
  onRetake?: () => void;
}

// =============================================================================
// DASHBOARD COMPONENT TYPES
// =============================================================================

/**
 * Dashboard stats props
 */
export interface DashboardStatsProps extends BaseComponentProps {
  stats: UserStats;
  loading?: boolean;
  period?: 'week' | 'month' | 'year';
  onPeriodChange?: (period: string) => void;
}

/**
 * Activity feed props
 */
export interface ActivityFeedProps extends BaseComponentProps {
  activities: UserActivity[];
  loading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  emptyState?: ReactNode;
}

/**
 * User activity
 */
export interface UserActivity {
  id: string;
  type: 'course_enrolled' | 'lesson_completed' | 'test_attempted' | 'certificate_earned';
  title: string;
  description: string;
  timestamp: Date;
  icon?: ReactNode;
  url?: string;
  metadata?: Record<string, any>;
}

/**
 * Chart component props
 */
export interface ChartProps extends BaseComponentProps {
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
  data: ChartData;
  options?: ChartOptions;
  loading?: boolean;
  error?: string;
  height?: number;
  responsive?: boolean;
}

/**
 * Chart data
 */
export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

/**
 * Chart dataset
 */
export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
}

/**
 * Chart options
 */
export interface ChartOptions {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  plugins?: {
    legend?: {
      display?: boolean;
      position?: 'top' | 'bottom' | 'left' | 'right';
    };
    title?: {
      display?: boolean;
      text?: string;
    };
  };
  scales?: {
    x?: ChartScale;
    y?: ChartScale;
  };
}

/**
 * Chart scale
 */
export interface ChartScale {
  display?: boolean;
  title?: {
    display?: boolean;
    text?: string;
  };
  min?: number;
  max?: number;
}

// =============================================================================
// NOTIFICATION COMPONENT TYPES
// =============================================================================

/**
 * Notification header props
 */
export interface NotificationHeaderProps extends BaseComponentProps {
  count: number;
  notifications: NotificationItem[];
  onMarkAllRead?: () => void;
  onViewAll?: () => void;
  loading?: boolean;
}

/**
 * Notification item
 */
export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: Date;
  actionUrl?: string;
  actionText?: string;
  icon?: ReactNode;
}

/**
 * Search header props
 */
export interface SearchHeaderProps extends BaseComponentProps {
  placeholder?: string;
  suggestions?: SearchSuggestion[];
  onSearch?: (query: string) => void;
  onSuggestionClick?: (suggestion: SearchSuggestion) => void;
  loading?: boolean;
  showRecent?: boolean;
  recentSearches?: string[];
}

/**
 * Search suggestion
 */
export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'course' | 'test' | 'instructor' | 'topic';
  icon?: ReactNode;
  url?: string;
}

// =============================================================================
// UTILITY COMPONENT TYPES
// =============================================================================

/**
 * Empty state props
 */
export interface EmptyStateProps extends BaseComponentProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  image?: string;
  action?: ReactNode;
  size?: ComponentSize;
}

/**
 * Error boundary props
 */
export interface ErrorBoundaryProps extends WithChildren {
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

/**
 * Skeleton props
 */
export interface SkeletonProps extends BaseComponentProps {
  loading: boolean;
  children: ReactNode;
  rows?: number;
  title?: boolean;
  avatar?: boolean;
  paragraph?: boolean;
  active?: boolean;
}

/**
 * Infinite scroll props
 */
export interface InfiniteScrollProps extends BaseComponentProps, WithChildren {
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  threshold?: number;
  loader?: ReactNode;
  endMessage?: ReactNode;
}

// =============================================================================
// EVENT HANDLER TYPES
// =============================================================================

/**
 * Common event handlers
 */
export interface EventHandlers {
  onClick?: () => void;
  onDoubleClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onKeyDown?: (event: KeyboardEvent) => void;
  onKeyUp?: (event: KeyboardEvent) => void;
}

/**
 * Form event handlers
 */
export interface FormEventHandlers<T = any> {
  onSubmit?: (data: T) => void;
  onChange?: (field: keyof T, value: any) => void;
  onReset?: () => void;
  onValidationChange?: (errors: Record<keyof T, string>) => void;
}

// =============================================================================
// RESPONSIVE DESIGN TYPES
// =============================================================================

/**
 * Responsive breakpoints
 */
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/**
 * Responsive value
 */
export type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>;

/**
 * Media query hook return type
 */
export interface MediaQueryResult {
  matches: boolean;
  query: string;
}

// =============================================================================
// THEME TYPES
// =============================================================================

/**
 * Theme configuration
 */
export interface Theme {
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  borderRadius: ThemeBorderRadius;
  shadows: ThemeShadows;
  zIndex: ThemeZIndex;
  breakpoints: ThemeBreakpoints;
}

/**
 * Theme colors
 */
export interface ThemeColors {
  primary: ColorPalette;
  secondary: ColorPalette;
  success: ColorPalette;
  warning: ColorPalette;
  error: ColorPalette;
  info: ColorPalette;
  gray: ColorPalette;
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
  };
  border: {
    primary: string;
    secondary: string;
    focus: string;
  };
}

/**
 * Color palette
 */
export interface ColorPalette {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

/**
 * Theme typography
 */
export interface ThemeTypography {
  fontFamily: {
    sans: string[];
    serif: string[];
    mono: string[];
  };
  fontSize: Record<string, [string, { lineHeight: string; letterSpacing?: string }]>;
  fontWeight: Record<string, string>;
}

/**
 * Theme spacing
 */
export type ThemeSpacing = Record<string, string>;

/**
 * Theme border radius
 */
export type ThemeBorderRadius = Record<string, string>;

/**
 * Theme shadows
 */
export type ThemeShadows = Record<string, string>;

/**
 * Theme z-index values
 */
export type ThemeZIndex = Record<string, number>;

/**
 * Theme breakpoints
 */
export type ThemeBreakpoints = Record<Breakpoint, string>;

// =============================================================================
// EXPORTS
// =============================================================================

// Re-export specific types to avoid conflicts
// Individual component types are exported above