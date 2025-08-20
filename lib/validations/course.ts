/**
 * Course Validation Schemas
 * 
 * Zod schemas for validating course-related forms and API requests.
 * Covers course creation, updates, lessons, categories, and enrollments.
 */

import { z } from 'zod';

// =============================================================================
// COMMON VALIDATION PATTERNS
// =============================================================================

// Slug validation (URL-friendly)
const slugSchema = z
  .string()
  .min(3, 'Slug must be at least 3 characters long')
  .max(100, 'Slug must not exceed 100 characters')
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Slug can only contain lowercase letters, numbers, and hyphens'
  );

// Price validation
const priceSchema = z
  .number()
  .min(0, 'Price cannot be negative')
  .max(999999, 'Price cannot exceed ₹999,999')
  .refine(
    (price) => Number.isFinite(price),
    'Price must be a valid number'
  );

// Duration validation (in minutes)
const durationSchema = z
  .number()
  .min(1, 'Duration must be at least 1 minute')
  .max(600, 'Duration cannot exceed 10 hours')
  .int('Duration must be a whole number');

// Tags validation
const tagsSchema = z
  .array(z.string().min(1).max(30))
  .max(10, 'Cannot have more than 10 tags')
  .optional();

// =============================================================================
// COURSE SCHEMAS
// =============================================================================

// Course creation schema
export const createCourseSchema = z.object({
  title: z
    .string()
    .min(5, 'Course title must be at least 5 characters long')
    .max(200, 'Course title must not exceed 200 characters')
    .refine(
      (title) => title.trim().length > 0,
      'Course title cannot be empty or just whitespace'
    ),
  
  description: z
    .string()
    .min(20, 'Course description must be at least 20 characters long')
    .max(2000, 'Course description must not exceed 2000 characters'),
  
  shortDescription: z
    .string()
    .min(10, 'Short description must be at least 10 characters long')
    .max(200, 'Short description must not exceed 200 characters')
    .optional(),
  
  slug: slugSchema,
  
  categoryId: z
    .string()
    .uuid('Invalid category ID'),
  
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'], {
    errorMap: () => ({ message: 'Please select a valid course level' }),
  }),
  
  language: z.enum(['ENGLISH', 'HINDI'], {
    errorMap: () => ({ message: 'Please select a valid language' }),
  }),
  
  price: priceSchema,
  
  originalPrice: priceSchema.optional(),
  
  isFree: z.boolean().default(false),
  
  duration: durationSchema.optional(),
  
  thumbnail: z
    .string()
    .url('Please provide a valid thumbnail URL')
    .optional(),
  
  previewVideo: z
    .string()
    .url('Please provide a valid preview video URL')
    .optional(),
  
  tags: tagsSchema,
  
  requirements: z
    .array(
      z.string()
        .min(5, 'Requirement must be at least 5 characters')
        .max(200, 'Requirement must not exceed 200 characters')
    )
    .max(10, 'Cannot have more than 10 requirements')
    .optional(),
  
  learningOutcomes: z
    .array(
      z.string()
        .min(5, 'Learning outcome must be at least 5 characters')
        .max(200, 'Learning outcome must not exceed 200 characters')
    )
    .min(1, 'At least one learning outcome is required')
    .max(15, 'Cannot have more than 15 learning outcomes'),
  
  targetAudience: z
    .array(
      z.string()
        .min(5, 'Target audience must be at least 5 characters')
        .max(200, 'Target audience must not exceed 200 characters')
    )
    .max(10, 'Cannot have more than 10 target audience items')
    .optional(),
  
  difficulty: z
    .number()
    .min(1, 'Difficulty must be at least 1')
    .max(10, 'Difficulty cannot exceed 10')
    .int('Difficulty must be a whole number')
    .optional(),
  
  estimatedHours: z
    .number()
    .min(0.5, 'Estimated hours must be at least 0.5')
    .max(1000, 'Estimated hours cannot exceed 1000')
    .optional(),
  
  isPublished: z.boolean().default(false),
  
  publishAt: z
    .string()
    .datetime('Invalid publish date format')
    .optional(),
  
  expiresAt: z
    .string()
    .datetime('Invalid expiry date format')
    .optional(),
    
}).refine(
  (data) => {
    if (data.originalPrice && data.price > data.originalPrice) {
      return false;
    }
    return true;
  },
  {
    message: 'Price cannot be higher than original price',
    path: ['price'],
  }
).refine(
  (data) => {
    if (data.publishAt && new Date(data.publishAt) <= new Date()) {
      return false;
    }
    return true;
  },
  {
    message: 'Publish date must be in the future',
    path: ['publishAt'],
  }
).refine(
  (data) => {
    if (data.expiresAt && data.publishAt && new Date(data.expiresAt) <= new Date(data.publishAt)) {
      return false;
    }
    return true;
  },
  {
    message: 'Expiry date must be after publish date',
    path: ['expiresAt'],
  }
);

// Course update schema (all fields optional except ID)
export const updateCourseSchema = createCourseSchema.partial().extend({
  id: z.string().uuid('Invalid course ID'),
});

// =============================================================================
// LESSON SCHEMAS
// =============================================================================

// Lesson creation schema
export const createLessonSchema = z.object({
  courseId: z
    .string()
    .uuid('Invalid course ID'),
  
  title: z
    .string()
    .min(3, 'Lesson title must be at least 3 characters long')
    .max(200, 'Lesson title must not exceed 200 characters'),
  
  description: z
    .string()
    .min(10, 'Lesson description must be at least 10 characters long')
    .max(1000, 'Lesson description must not exceed 1000 characters')
    .optional(),
  
  content: z
    .string()
    .min(20, 'Lesson content must be at least 20 characters long')
    .optional(),
  
  videoUrl: z
    .string()
    .url('Please provide a valid video URL')
    .optional(),
  
  duration: durationSchema.optional(),
  
  sortOrder: z
    .number()
    .min(0, 'Sort order cannot be negative')
    .int('Sort order must be a whole number'),
  
  isPreview: z.boolean().default(false),
  
  isPublished: z.boolean().default(false),
  
  resources: z
    .array(
      z.object({
        title: z.string().min(1, 'Resource title is required'),
        url: z.string().url('Invalid resource URL'),
        type: z.enum(['pdf', 'video', 'audio', 'document', 'link'], {
          errorMap: () => ({ message: 'Invalid resource type' }),
        }),
        size: z.number().min(0).optional(),
      })
    )
    .max(20, 'Cannot have more than 20 resources per lesson')
    .optional(),
  
  quiz: z
    .object({
      questions: z
        .array(
          z.object({
            question: z.string().min(5, 'Question must be at least 5 characters'),
            options: z.array(z.string()).min(2).max(6),
            correctAnswer: z.number().min(0),
            explanation: z.string().optional(),
          })
        )
        .max(20, 'Cannot have more than 20 questions per quiz'),
      passingScore: z.number().min(0).max(100).default(70),
      timeLimit: z.number().min(30).max(3600).optional(), // in seconds
    })
    .optional(),
});

// Lesson update schema
export const updateLessonSchema = createLessonSchema.partial().extend({
  id: z.string().uuid('Invalid lesson ID'),
});

// =============================================================================
// CATEGORY SCHEMAS
// =============================================================================

// Category creation schema
export const createCategorySchema = z.object({
  name: z
    .string()
    .min(2, 'Category name must be at least 2 characters long')
    .max(100, 'Category name must not exceed 100 characters'),
  
  slug: slugSchema,
  
  description: z
    .string()
    .min(10, 'Category description must be at least 10 characters long')
    .max(500, 'Category description must not exceed 500 characters')
    .optional(),
  
  icon: z
    .string()
    .min(1, 'Category icon is required')
    .max(50, 'Icon name must not exceed 50 characters')
    .optional(),
  
  color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color format (use hex color)')
    .optional(),
  
  parentId: z
    .string()
    .uuid('Invalid parent category ID')
    .optional(),
  
  sortOrder: z
    .number()
    .min(0, 'Sort order cannot be negative')
    .int('Sort order must be a whole number')
    .default(0),
  
  isActive: z.boolean().default(true),
  
  metadata: z
    .object({
      examTypes: z.array(z.string()).optional(),
      subjects: z.array(z.string()).optional(),
      difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
    })
    .optional(),
});

// Category update schema
export const updateCategorySchema = createCategorySchema.partial().extend({
  id: z.string().uuid('Invalid category ID'),
});

// =============================================================================
// ENROLLMENT SCHEMAS
// =============================================================================

// Course enrollment schema
export const enrollCourseSchema = z.object({
  courseId: z
    .string()
    .uuid('Invalid course ID'),
  
  paymentMethod: z
    .enum(['free', 'credit_card', 'debit_card', 'upi', 'wallet', 'net_banking'], {
      errorMap: () => ({ message: 'Please select a valid payment method' }),
    })
    .optional(),
  
  couponCode: z
    .string()
    .min(3, 'Coupon code must be at least 3 characters')
    .max(20, 'Coupon code must not exceed 20 characters')
    .regex(/^[A-Z0-9-_]+$/, 'Coupon code can only contain uppercase letters, numbers, hyphens, and underscores')
    .optional(),
  
  agreeToTerms: z
    .boolean()
    .refine(val => val === true, 'You must agree to the terms and conditions'),
});

// Unenroll schema
export const unenrollCourseSchema = z.object({
  courseId: z
    .string()
    .uuid('Invalid course ID'),
  
  reason: z
    .enum([
      'not_interested',
      'too_difficult',
      'too_easy',
      'poor_quality',
      'technical_issues',
      'time_constraints',
      'found_alternative',
      'other'
    ], {
      errorMap: () => ({ message: 'Please select a reason for unenrollment' }),
    }),
  
  feedback: z
    .string()
    .max(1000, 'Feedback must not exceed 1000 characters')
    .optional(),
  
  requestRefund: z.boolean().default(false),
});

// =============================================================================
// REVIEW SCHEMAS
// =============================================================================

// Course review schema
export const createReviewSchema = z.object({
  courseId: z
    .string()
    .uuid('Invalid course ID'),
  
  rating: z
    .number()
    .min(1, 'Rating must be at least 1 star')
    .max(5, 'Rating cannot exceed 5 stars')
    .int('Rating must be a whole number'),
  
  title: z
    .string()
    .min(5, 'Review title must be at least 5 characters long')
    .max(100, 'Review title must not exceed 100 characters')
    .optional(),
  
  comment: z
    .string()
    .min(10, 'Review comment must be at least 10 characters long')
    .max(1000, 'Review comment must not exceed 1000 characters'),
  
  pros: z
    .array(z.string().min(3).max(100))
    .max(5, 'Cannot have more than 5 pros')
    .optional(),
  
  cons: z
    .array(z.string().min(3).max(100))
    .max(5, 'Cannot have more than 5 cons')
    .optional(),
  
  wouldRecommend: z.boolean().optional(),
  
  isAnonymous: z.boolean().default(false),
});

// Review update schema
export const updateReviewSchema = createReviewSchema.partial().extend({
  id: z.string().uuid('Invalid review ID'),
});

// =============================================================================
// PROGRESS TRACKING SCHEMAS
// =============================================================================

// Lesson progress schema
export const updateLessonProgressSchema = z.object({
  lessonId: z
    .string()
    .uuid('Invalid lesson ID'),
  
  progress: z
    .number()
    .min(0, 'Progress cannot be negative')
    .max(100, 'Progress cannot exceed 100%'),
  
  completed: z.boolean().default(false),
  
  timeSpent: z
    .number()
    .min(0, 'Time spent cannot be negative')
    .max(86400, 'Time spent cannot exceed 24 hours')
    .optional(), // in seconds
  
  notes: z
    .string()
    .max(2000, 'Notes must not exceed 2000 characters')
    .optional(),
  
  bookmarked: z.boolean().default(false),
});

// Quiz submission schema
export const submitQuizSchema = z.object({
  lessonId: z
    .string()
    .uuid('Invalid lesson ID'),
  
  answers: z
    .array(
      z.object({
        questionIndex: z.number().min(0),
        selectedAnswer: z.number().min(0),
        timeSpent: z.number().min(0).optional(),
      })
    )
    .min(1, 'At least one answer is required'),
  
  totalTimeSpent: z
    .number()
    .min(0, 'Total time spent cannot be negative')
    .max(86400, 'Total time spent cannot exceed 24 hours'),
});

// =============================================================================
// SEARCH AND FILTER SCHEMAS
// =============================================================================

// Course search schema
export const courseSearchSchema = z.object({
  query: z
    .string()
    .max(200, 'Search query must not exceed 200 characters')
    .optional(),
  
  category: z
    .string()
    .uuid('Invalid category ID')
    .optional(),
  
  level: z
    .enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'])
    .optional(),
  
  language: z
    .enum(['ENGLISH', 'HINDI'])
    .optional(),
  
  priceRange: z
    .object({
      min: z.number().min(0).optional(),
      max: z.number().min(0).optional(),
    })
    .optional(),
  
  duration: z
    .object({
      min: z.number().min(0).optional(),
      max: z.number().min(0).optional(),
    })
    .optional(),
  
  rating: z
    .number()
    .min(1)
    .max(5)
    .optional(),
  
  sortBy: z
    .enum(['relevance', 'price_low', 'price_high', 'rating', 'popularity', 'newest', 'title'])
    .default('relevance'),
  
  page: z
    .number()
    .min(1, 'Page number must be at least 1')
    .max(1000, 'Page number cannot exceed 1000')
    .default(1),
  
  limit: z
    .number()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .default(20),
  
  includeInactive: z.boolean().default(false),
});

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type CreateCourseFormData = z.infer<typeof createCourseSchema>;
export type UpdateCourseFormData = z.infer<typeof updateCourseSchema>;
export type CreateLessonFormData = z.infer<typeof createLessonSchema>;
export type UpdateLessonFormData = z.infer<typeof updateLessonSchema>;
export type CreateCategoryFormData = z.infer<typeof createCategorySchema>;
export type UpdateCategoryFormData = z.infer<typeof updateCategorySchema>;
export type EnrollCourseFormData = z.infer<typeof enrollCourseSchema>;
export type UnenrollCourseFormData = z.infer<typeof unenrollCourseSchema>;
export type CreateReviewFormData = z.infer<typeof createReviewSchema>;
export type UpdateReviewFormData = z.infer<typeof updateReviewSchema>;
export type UpdateLessonProgressFormData = z.infer<typeof updateLessonProgressSchema>;
export type SubmitQuizFormData = z.infer<typeof submitQuizSchema>;
export type CourseSearchFormData = z.infer<typeof courseSearchSchema>;

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

// Validate course slug uniqueness (to be used with API call)
export const validateSlugUniqueness = async (slug: string, excludeId?: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/courses/validate-slug?slug=${encodeURIComponent(slug)}${excludeId ? `&excludeId=${excludeId}` : ''}`);
    const data = await response.json();
    return data.isUnique;
  } catch {
    return false;
  }
};

// Generate slug from title
export const generateSlugFromTitle = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};

// Validate video URL format
export const validateVideoUrl = (url: string): boolean => {
  const videoUrlPatterns = [
    /^https:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/,
    /^https:\/\/youtu\.be\/[\w-]+/,
    /^https:\/\/(www\.)?vimeo\.com\/\d+/,
    /^https:\/\/.*\.mp4$/,
    /^https:\/\/.*\.webm$/,
    /^https:\/\/.*\.ogg$/,
  ];
  
  return videoUrlPatterns.some(pattern => pattern.test(url));
};

// Enhanced video URL schema
export const enhancedVideoUrlSchema = z
  .string()
  .url('Invalid video URL')
  .refine(validateVideoUrl, 'Video URL must be from YouTube, Vimeo, or a direct video file link');