/**
 * Course Types for TestBook Clone Application
 * 
 * Comprehensive type definitions for course-related data structures,
 * including courses, lessons, categories, enrollments, and progress tracking.
 */

import type { 
  Course as PrismaCourse,
  Lesson as PrismaLesson,
  Category as PrismaCategory,
  CourseEnrollment as PrismaCourseEnrollment,
  UserProgress as PrismaUserProgress,
  CourseStatus,
  CourseLevel,
  Language
} from '@prisma/client';

import type { User, PublicUserProfile } from './user';

// =============================================================================
// BASE COURSE TYPES
// =============================================================================

/**
 * Core course information from database
 */
export type Course = PrismaCourse;

/**
 * Course with all related data
 */
export interface CourseWithRelations extends Course {
  category: Category;
  instructor: PublicUserProfile;
  lessons: Lesson[];
  enrollments: CourseEnrollment[];
  progress: UserProgress[];
  tags: CourseTag[];
  reviews: CourseReview[];
  stats: CourseStats;
}

/**
 * Public course information (for course listings)
 */
export interface PublicCourse {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  thumbnail: string;
  price: number;
  discountedPrice?: number;
  currency: string;
  duration: number; // minutes
  level: CourseLevel;
  language: Language;
  status: CourseStatus;
  categoryId: string;
  category: PublicCategory;
  instructor: PublicUserProfile;
  stats: CourseStats;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Course statistics
 */
export interface CourseStats {
  enrollmentCount: number;
  completionCount: number;
  averageRating: number;
  totalRatings: number;
  totalDuration: number; // minutes
  lessonCount: number;
  completionRate: number; // percentage
  averageProgress: number; // percentage
}

/**
 * Course preview information
 */
export interface CoursePreview {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  previewVideo?: string;
  instructor: {
    name: string;
    avatar?: string;
    bio?: string;
  };
  stats: Pick<CourseStats, 'enrollmentCount' | 'averageRating' | 'totalRatings'>;
  syllabus: CourseSyllabus[];
  requirements: string[];
  learningOutcomes: string[];
  targetAudience: string[];
  faq: CourseFAQ[];
}

// =============================================================================
// LESSON TYPES
// =============================================================================

/**
 * Core lesson information from database
 */
export type Lesson = PrismaLesson;

/**
 * Lesson with progress information
 */
export interface LessonWithProgress extends Lesson {
  progress?: UserProgress;
  isCompleted: boolean;
  isAccessible: boolean;
}

/**
 * Lesson content types
 */
export type LessonType = 
  | 'VIDEO'
  | 'TEXT'
  | 'QUIZ'
  | 'ASSIGNMENT'
  | 'DOCUMENT'
  | 'INTERACTIVE'
  | 'LIVE_CLASS';

/**
 * Video lesson content
 */
export interface VideoLessonContent {
  type: 'VIDEO';
  videoUrl: string;
  duration: number; // seconds
  subtitles?: LessonSubtitle[];
  chapters?: VideoChapter[];
  quality: VideoQuality[];
  downloadable: boolean;
}

/**
 * Text lesson content
 */
export interface TextLessonContent {
  type: 'TEXT';
  content: string; // HTML or Markdown
  readingTime: number; // minutes
  downloadable: boolean;
}

/**
 * Quiz lesson content
 */
export interface QuizLessonContent {
  type: 'QUIZ';
  questions: QuizQuestion[];
  timeLimit?: number; // minutes
  passingScore: number; // percentage
  allowRetakes: boolean;
  maxAttempts?: number;
}

/**
 * Assignment lesson content
 */
export interface AssignmentLessonContent {
  type: 'ASSIGNMENT';
  instructions: string;
  submissionType: 'FILE' | 'TEXT' | 'URL';
  maxFileSize?: number; // MB
  allowedFileTypes?: string[];
  dueDate?: Date;
  graded: boolean;
}

/**
 * Document lesson content
 */
export interface DocumentLessonContent {
  type: 'DOCUMENT';
  documentUrl: string;
  documentType: 'PDF' | 'DOC' | 'PPT' | 'XLS';
  downloadable: boolean;
  pages?: number;
}

/**
 * Interactive lesson content
 */
export interface InteractiveLessonContent {
  type: 'INTERACTIVE';
  interactiveUrl: string;
  embedCode?: string;
  fullscreen: boolean;
  duration?: number; // minutes
}

/**
 * Live class lesson content
 */
export interface LiveClassLessonContent {
  type: 'LIVE_CLASS';
  liveClassId: string;
  scheduledAt: Date;
  duration: number; // minutes
  meetingUrl?: string;
  recordingUrl?: string;
  attendance: boolean;
}

/**
 * Union type for all lesson content types
 */
export type LessonContent = 
  | VideoLessonContent
  | TextLessonContent
  | QuizLessonContent
  | AssignmentLessonContent
  | DocumentLessonContent
  | InteractiveLessonContent
  | LiveClassLessonContent;

/**
 * Video quality options
 */
export interface VideoQuality {
  quality: '240p' | '360p' | '480p' | '720p' | '1080p';
  url: string;
  fileSize: number; // MB
}

/**
 * Video chapter/section
 */
export interface VideoChapter {
  id: string;
  title: string;
  startTime: number; // seconds
  endTime: number; // seconds
}

/**
 * Lesson subtitles
 */
export interface LessonSubtitle {
  language: Language;
  url: string;
  label: string;
}

/**
 * Quiz question for lessons
 */
export interface QuizQuestion {
  id: string;
  question: string;
  type: 'MULTIPLE_CHOICE' | 'SINGLE_CHOICE' | 'TRUE_FALSE';
  options: QuizOption[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
}

/**
 * Quiz option
 */
export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

// =============================================================================
// CATEGORY TYPES
// =============================================================================

/**
 * Core category information from database
 */
export type Category = PrismaCategory;

/**
 * Public category information
 */
export interface PublicCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  parentId?: string;
  sortOrder: number;
  courseCount: number;
}

/**
 * Category with subcategories
 */
export interface CategoryWithSubcategories extends Category {
  subcategories: Category[];
  courseCount: number;
  parent?: Category;
}

// =============================================================================
// ENROLLMENT TYPES
// =============================================================================

/**
 * Core enrollment information from database
 */
export type CourseEnrollment = PrismaCourseEnrollment;

/**
 * Enrollment with course and progress information
 */
export interface EnrollmentWithDetails extends CourseEnrollment {
  course: PublicCourse;
  progress: UserProgress[];
  currentLesson?: Lesson;
  overallProgress: number; // percentage
  estimatedTimeRemaining: number; // minutes
}

/**
 * Enrollment statistics
 */
export interface EnrollmentStats {
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  averageCompletionTime: number; // days
  enrollmentsByMonth: MonthlyEnrollment[];
}

/**
 * Monthly enrollment data
 */
export interface MonthlyEnrollment {
  month: string;
  year: number;
  enrollments: number;
  completions: number;
}

// =============================================================================
// PROGRESS TYPES
// =============================================================================

/**
 * Core progress information from database
 */
export type UserProgress = PrismaUserProgress;

/**
 * Detailed progress information
 */
export interface DetailedProgress extends UserProgress {
  lesson: Lesson;
  course: PublicCourse;
  nextLesson?: Lesson;
  timeSpent: number; // minutes
  lastAccessed: Date;
}

/**
 * Course progress summary
 */
export interface CourseProgressSummary {
  courseId: string;
  userId: string;
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
  timeSpent: number; // minutes
  estimatedTimeRemaining: number; // minutes
  currentStreak: number; // days
  lastActivity: Date;
  certificates: CourseCertificate[];
}

/**
 * Learning path progress
 */
export interface LearningPathProgress {
  pathId: string;
  courses: CourseProgressSummary[];
  overallProgress: number; // percentage
  completedCourses: number;
  totalCourses: number;
  estimatedCompletionDate?: Date;
}

// =============================================================================
// COURSE CONTENT TYPES
// =============================================================================

/**
 * Course syllabus/curriculum
 */
export interface CourseSyllabus {
  id: string;
  title: string;
  description?: string;
  lessons: CourseSyllabusLesson[];
  duration: number; // minutes
  order: number;
  isPreview: boolean;
}

/**
 * Syllabus lesson item
 */
export interface CourseSyllabusLesson {
  id: string;
  title: string;
  type: LessonType;
  duration: number; // minutes
  isPreview: boolean;
  isMandatory: boolean;
}

/**
 * Course FAQ
 */
export interface CourseFAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
}

/**
 * Course review
 */
export interface CourseReview {
  id: string;
  userId: string;
  courseId: string;
  user: PublicUserProfile;
  rating: number; // 1-5
  title?: string;
  content?: string;
  helpful: number; // count of helpful votes
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Course tag
 */
export interface CourseTag {
  id: string;
  name: string;
  slug: string;
  color?: string;
  count: number;
}

/**
 * Course certificate
 */
export interface CourseCertificate {
  id: string;
  userId: string;
  courseId: string;
  certificateNumber: string;
  issuedAt: Date;
  validUntil?: Date;
  certificateUrl: string;
  verificationUrl: string;
  grade?: number;
  skills: string[];
}

// =============================================================================
// COURSE FORM TYPES
// =============================================================================

/**
 * Course creation form
 */
export interface CourseCreateForm {
  title: string;
  description: string;
  shortDescription?: string;
  categoryId: string;
  level: CourseLevel;
  language: Language;
  price: number;
  currency: string;
  thumbnail?: File;
  previewVideo?: File;
  tags: string[];
  requirements: string[];
  learningOutcomes: string[];
  targetAudience: string[];
  isDraft: boolean;
}

/**
 * Course update form
 */
export interface CourseUpdateForm extends Partial<CourseCreateForm> {
  id: string;
}

/**
 * Lesson creation form
 */
export interface LessonCreateForm {
  courseId: string;
  title: string;
  description?: string;
  type: LessonType;
  content: LessonContent;
  duration: number; // minutes
  order: number;
  isPreview: boolean;
  isMandatory: boolean;
}

/**
 * Lesson update form
 */
export interface LessonUpdateForm extends Partial<LessonCreateForm> {
  id: string;
}

// =============================================================================
// SEARCH & FILTERING TYPES
// =============================================================================

/**
 * Course search filters
 */
export interface CourseSearchFilters {
  query?: string;
  categoryId?: string;
  level?: CourseLevel;
  language?: Language;
  priceRange?: {
    min: number;
    max: number;
  };
  duration?: {
    min: number; // minutes
    max: number; // minutes
  };
  rating?: number; // minimum rating
  tags?: string[];
  instructor?: string;
  status?: CourseStatus;
  free?: boolean;
}

/**
 * Course sort options
 */
export interface CourseSortOptions {
  field: 'title' | 'price' | 'rating' | 'enrollments' | 'createdAt' | 'updatedAt';
  direction: 'asc' | 'desc';
}

/**
 * Course search result
 */
export interface CourseSearchResult {
  courses: PublicCourse[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  filters: CourseSearchFilters;
  facets: SearchFacets;
}

/**
 * Search facets for filtering
 */
export interface SearchFacets {
  categories: FacetItem[];
  levels: FacetItem[];
  languages: FacetItem[];
  priceRanges: PriceRangeFacet[];
  ratings: FacetItem[];
  instructors: FacetItem[];
}

/**
 * Generic facet item
 */
export interface FacetItem {
  value: string;
  label: string;
  count: number;
}

/**
 * Price range facet
 */
export interface PriceRangeFacet {
  min: number;
  max: number;
  label: string;
  count: number;
}

// =============================================================================
// LEARNING PATH TYPES
// =============================================================================

/**
 * Learning path/track
 */
export interface LearningPath {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  courses: LearningPathCourse[];
  totalDuration: number; // minutes
  level: CourseLevel;
  estimatedWeeks: number;
  skills: string[];
  certificates: boolean;
  price: number;
  currency: string;
  enrollmentCount: number;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Course within a learning path
 */
export interface LearningPathCourse {
  courseId: string;
  course: PublicCourse;
  order: number;
  isRequired: boolean;
  prerequisites: string[]; // course IDs
  estimatedWeeks: number;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Course creation data
 */
export type CourseCreate = Omit<Course, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Course update data
 */
export type CourseUpdate = Partial<Omit<Course, 'id' | 'createdAt' | 'updatedAt'>>;

/**
 * Course list item (for admin panels)
 */
export type CourseListItem = Pick<Course, 
  | 'id' 
  | 'title' 
  | 'thumbnail' 
  | 'price' 
  | 'status' 
  | 'createdAt'
> & {
  category: Pick<Category, 'name'>;
  instructor: Pick<User, 'name'>;
  enrollmentCount: number;
  rating: number;
};

/**
 * Lesson list item
 */
export type LessonListItem = Pick<Lesson, 
  | 'id' 
  | 'title' 
  | 'duration' 
  | 'order' 
  | 'isPreview'
> & {
  progress?: number; // percentage
  isCompleted: boolean;
  isAccessible: boolean;
};

// =============================================================================
// EXPORTS
// =============================================================================

export type {
  CourseStatus,
  CourseLevel,
  Language
} from '@prisma/client';