/**
 * Exam Validation Schemas
 * 
 * Zod schemas for validating exam-related forms and API requests.
 * Covers exam creation, questions, submissions, and results.
 */

import { z } from 'zod';

// =============================================================================
// COMMON VALIDATION PATTERNS
// =============================================================================

// Time validation (in minutes)
const timeSchema = z
  .number()
  .min(1, 'Time must be at least 1 minute')
  .max(480, 'Time cannot exceed 8 hours (480 minutes)')
  .int('Time must be a whole number');

// Score validation
const scoreSchema = z
  .number()
  .min(0, 'Score cannot be negative')
  .max(100, 'Score cannot exceed 100%');

// Question ID validation
const questionIdSchema = z
  .string()
  .uuid('Invalid question ID');

// =============================================================================
// EXAM SCHEMAS
// =============================================================================

// Exam creation schema
export const createExamSchema = z.object({
  title: z
    .string()
    .min(5, 'Exam title must be at least 5 characters long')
    .max(200, 'Exam title must not exceed 200 characters'),
  
  description: z
    .string()
    .min(20, 'Exam description must be at least 20 characters long')
    .max(2000, 'Exam description must not exceed 2000 characters'),
  
  instructions: z
    .string()
    .min(50, 'Exam instructions must be at least 50 characters long')
    .max(5000, 'Exam instructions must not exceed 5000 characters'),
  
  type: z.enum(['PRACTICE', 'MOCK', 'ACTUAL', 'QUIZ', 'ASSESSMENT'], {
    errorMap: () => ({ message: 'Please select a valid exam type' }),
  }),
  
  category: z.enum([
    'SSC',
    'BANKING',
    'RAILWAY',
    'UPSC',
    'STATE_PSC',
    'TEACHING',
    'ENGINEERING',
    'MEDICAL',
    'LAW',
    'MANAGEMENT',
    'DEFENCE',
    'POLICE',
    'OTHERS'
  ], {
    errorMap: () => ({ message: 'Please select a valid exam category' }),
  }),
  
  subject: z
    .string()
    .min(2, 'Subject must be at least 2 characters long')
    .max(100, 'Subject must not exceed 100 characters'),
  
  duration: timeSchema,
  
  totalQuestions: z
    .number()
    .min(1, 'Exam must have at least 1 question')
    .max(500, 'Exam cannot have more than 500 questions')
    .int('Total questions must be a whole number'),
  
  totalMarks: z
    .number()
    .min(1, 'Total marks must be at least 1')
    .max(10000, 'Total marks cannot exceed 10,000'),
  
  passingMarks: z
    .number()
    .min(0, 'Passing marks cannot be negative'),
  
  negativeMarking: z.object({
    enabled: z.boolean(),
    deduction: z
      .number()
      .min(0, 'Negative marking deduction cannot be negative')
      .max(5, 'Negative marking deduction cannot exceed 5 marks')
      .optional(),
  }),
  
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD'], {
    errorMap: () => ({ message: 'Please select a valid difficulty level' }),
  }),
  
  language: z.enum(['ENGLISH', 'HINDI', 'BILINGUAL'], {
    errorMap: () => ({ message: 'Please select a valid language' }),
  }),
  
  tags: z
    .array(z.string().min(1).max(30))
    .max(10, 'Cannot have more than 10 tags')
    .optional(),
  
  isPublished: z.boolean().default(false),
  
  publishAt: z
    .string()
    .datetime('Invalid publish date format')
    .optional(),
  
  startTime: z
    .string()
    .datetime('Invalid start time format')
    .optional(),
  
  endTime: z
    .string()
    .datetime('Invalid end time format')
    .optional(),
  
  maxAttempts: z
    .number()
    .min(1, 'Maximum attempts must be at least 1')
    .max(10, 'Maximum attempts cannot exceed 10')
    .int('Maximum attempts must be a whole number')
    .default(1),
  
  shuffleQuestions: z.boolean().default(false),
  
  shuffleOptions: z.boolean().default(false),
  
  showResults: z.enum(['IMMEDIATE', 'AFTER_SUBMISSION', 'AFTER_END_TIME', 'NEVER'], {
    errorMap: () => ({ message: 'Please select when to show results' }),
  }).default('AFTER_SUBMISSION'),
  
  allowReview: z.boolean().default(true),
  
  allowBookmark: z.boolean().default(true),
  
  proctoring: z.object({
    enabled: z.boolean().default(false),
    webcam: z.boolean().default(false),
    screen: z.boolean().default(false),
    audio: z.boolean().default(false),
    tabSwitching: z.boolean().default(false),
  }).optional(),
  
  accessibility: z.object({
    extraTime: z
      .number()
      .min(0, 'Extra time cannot be negative')
      .max(240, 'Extra time cannot exceed 4 hours')
      .optional(),
    fontSize: z.enum(['NORMAL', 'LARGE', 'EXTRA_LARGE']).optional(),
    highContrast: z.boolean().optional(),
    screenReader: z.boolean().optional(),
  }).optional(),
  
}).refine(
  (data) => {
    if (data.passingMarks > data.totalMarks) {
      return false;
    }
    return true;
  },
  {
    message: 'Passing marks cannot exceed total marks',
    path: ['passingMarks'],
  }
).refine(
  (data) => {
    if (data.startTime && data.endTime && new Date(data.startTime) >= new Date(data.endTime)) {
      return false;
    }
    return true;
  },
  {
    message: 'End time must be after start time',
    path: ['endTime'],
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
);

// Exam update schema
export const updateExamSchema = createExamSchema.partial().extend({
  id: z.string().uuid('Invalid exam ID'),
});

// =============================================================================
// QUESTION SCHEMAS
// =============================================================================

// Multiple choice question schema
export const multipleChoiceQuestionSchema = z.object({
  type: z.literal('MULTIPLE_CHOICE'),
  question: z
    .string()
    .min(10, 'Question must be at least 10 characters long')
    .max(2000, 'Question must not exceed 2000 characters'),
  
  options: z
    .array(
      z.object({
        text: z
          .string()
          .min(1, 'Option text cannot be empty')
          .max(500, 'Option text must not exceed 500 characters'),
        isCorrect: z.boolean(),
        explanation: z
          .string()
          .max(1000, 'Explanation must not exceed 1000 characters')
          .optional(),
      })
    )
    .min(2, 'Question must have at least 2 options')
    .max(6, 'Question cannot have more than 6 options')
    .refine(
      (options) => options.filter(opt => opt.isCorrect).length === 1,
      'Exactly one option must be marked as correct'
    ),
  
  marks: z
    .number()
    .min(0.25, 'Marks must be at least 0.25')
    .max(10, 'Marks cannot exceed 10'),
  
  negativeMarks: z
    .number()
    .min(0, 'Negative marks cannot be negative')
    .max(5, 'Negative marks cannot exceed 5')
    .optional(),
  
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD'], {
    errorMap: () => ({ message: 'Please select a valid difficulty level' }),
  }),
  
  subject: z
    .string()
    .min(2, 'Subject must be at least 2 characters long')
    .max(100, 'Subject must not exceed 100 characters'),
  
  topic: z
    .string()
    .min(2, 'Topic must be at least 2 characters long')
    .max(100, 'Topic must not exceed 100 characters')
    .optional(),
  
  explanation: z
    .string()
    .max(2000, 'Explanation must not exceed 2000 characters')
    .optional(),
  
  image: z
    .string()
    .url('Invalid image URL')
    .optional(),
  
  language: z.enum(['ENGLISH', 'HINDI'], {
    errorMap: () => ({ message: 'Please select a valid language' }),
  }),
  
  tags: z
    .array(z.string().min(1).max(30))
    .max(5, 'Cannot have more than 5 tags per question')
    .optional(),
  
  reference: z
    .string()
    .max(500, 'Reference must not exceed 500 characters')
    .optional(),
  
  estimatedTime: z
    .number()
    .min(10, 'Estimated time must be at least 10 seconds')
    .max(600, 'Estimated time cannot exceed 10 minutes')
    .optional(), // in seconds
});

// Multiple select question schema
export const multipleSelectQuestionSchema = z.object({
  type: z.literal('MULTIPLE_SELECT'),
  question: z
    .string()
    .min(10, 'Question must be at least 10 characters long')
    .max(2000, 'Question must not exceed 2000 characters'),
  
  options: z
    .array(
      z.object({
        text: z
          .string()
          .min(1, 'Option text cannot be empty')
          .max(500, 'Option text must not exceed 500 characters'),
        isCorrect: z.boolean(),
        explanation: z
          .string()
          .max(1000, 'Explanation must not exceed 1000 characters')
          .optional(),
      })
    )
    .min(3, 'Multiple select question must have at least 3 options')
    .max(8, 'Multiple select question cannot have more than 8 options')
    .refine(
      (options) => {
        const correctCount = options.filter(opt => opt.isCorrect).length;
        return correctCount >= 2 && correctCount < options.length;
      },
      'At least 2 but not all options must be marked as correct'
    ),
  
  marks: z
    .number()
    .min(0.5, 'Marks must be at least 0.5')
    .max(15, 'Marks cannot exceed 15'),
  
  partialMarking: z.boolean().default(true),
  
  negativeMarks: z
    .number()
    .min(0, 'Negative marks cannot be negative')
    .max(10, 'Negative marks cannot exceed 10')
    .optional(),
  
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  subject: z.string().min(2).max(100),
  topic: z.string().min(2).max(100).optional(),
  explanation: z.string().max(2000).optional(),
  image: z.string().url().optional(),
  language: z.enum(['ENGLISH', 'HINDI']),
  tags: z.array(z.string().min(1).max(30)).max(5).optional(),
  reference: z.string().max(500).optional(),
  estimatedTime: z.number().min(15).max(900).optional(),
});

// True/False question schema
export const trueFalseQuestionSchema = z.object({
  type: z.literal('TRUE_FALSE'),
  question: z
    .string()
    .min(10, 'Question must be at least 10 characters long')
    .max(1000, 'Question must not exceed 1000 characters'),
  
  correctAnswer: z.boolean(),
  
  explanation: z
    .string()
    .min(10, 'Explanation is required for True/False questions')
    .max(2000, 'Explanation must not exceed 2000 characters'),
  
  marks: z
    .number()
    .min(0.25, 'Marks must be at least 0.25')
    .max(5, 'Marks cannot exceed 5'),
  
  negativeMarks: z
    .number()
    .min(0, 'Negative marks cannot be negative')
    .max(3, 'Negative marks cannot exceed 3')
    .optional(),
  
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  subject: z.string().min(2).max(100),
  topic: z.string().min(2).max(100).optional(),
  image: z.string().url().optional(),
  language: z.enum(['ENGLISH', 'HINDI']),
  tags: z.array(z.string().min(1).max(30)).max(5).optional(),
  reference: z.string().max(500).optional(),
  estimatedTime: z.number().min(5).max(300).optional(),
});

// Numerical answer question schema
export const numericalQuestionSchema = z.object({
  type: z.literal('NUMERICAL'),
  question: z
    .string()
    .min(10, 'Question must be at least 10 characters long')
    .max(2000, 'Question must not exceed 2000 characters'),
  
  correctAnswer: z
    .number()
    .refine(val => Number.isFinite(val), 'Answer must be a valid number'),
  
  tolerance: z
    .number()
    .min(0, 'Tolerance cannot be negative')
    .max(1000, 'Tolerance is too large')
    .optional(),
  
  unit: z
    .string()
    .max(20, 'Unit must not exceed 20 characters')
    .optional(),
  
  explanation: z
    .string()
    .max(2000, 'Explanation must not exceed 2000 characters')
    .optional(),
  
  marks: z
    .number()
    .min(0.25, 'Marks must be at least 0.25')
    .max(15, 'Marks cannot exceed 15'),
  
  negativeMarks: z
    .number()
    .min(0, 'Negative marks cannot be negative')
    .max(10, 'Negative marks cannot exceed 10')
    .optional(),
  
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  subject: z.string().min(2).max(100),
  topic: z.string().min(2).max(100).optional(),
  image: z.string().url().optional(),
  language: z.enum(['ENGLISH', 'HINDI']),
  tags: z.array(z.string().min(1).max(30)).max(5).optional(),
  reference: z.string().max(500).optional(),
  estimatedTime: z.number().min(10).max(600).optional(),
});

// Union of all question types
export const questionSchema = z.discriminatedUnion('type', [
  multipleChoiceQuestionSchema,
  multipleSelectQuestionSchema,
  trueFalseQuestionSchema,
  numericalQuestionSchema,
]);

// Question creation schema
export const createQuestionSchema = questionSchema.extend({
  examId: z.string().uuid('Invalid exam ID').optional(),
  order: z
    .number()
    .min(1, 'Question order must be at least 1')
    .int('Question order must be a whole number')
    .optional(),
});

// Question update schema
export const updateQuestionSchema = questionSchema.partial().extend({
  id: questionIdSchema,
});

// =============================================================================
// EXAM SUBMISSION SCHEMAS
// =============================================================================

// Answer schema for different question types
const answerSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('MULTIPLE_CHOICE'),
    questionId: questionIdSchema,
    selectedOption: z.number().min(0),
    timeSpent: z.number().min(0).optional(),
    bookmarked: z.boolean().default(false),
  }),
  z.object({
    type: z.literal('MULTIPLE_SELECT'),
    questionId: questionIdSchema,
    selectedOptions: z.array(z.number().min(0)).min(1),
    timeSpent: z.number().min(0).optional(),
    bookmarked: z.boolean().default(false),
  }),
  z.object({
    type: z.literal('TRUE_FALSE'),
    questionId: questionIdSchema,
    answer: z.boolean(),
    timeSpent: z.number().min(0).optional(),
    bookmarked: z.boolean().default(false),
  }),
  z.object({
    type: z.literal('NUMERICAL'),
    questionId: questionIdSchema,
    answer: z.number(),
    timeSpent: z.number().min(0).optional(),
    bookmarked: z.boolean().default(false),
  }),
]);

// Exam submission schema
export const submitExamSchema = z.object({
  examId: z.string().uuid('Invalid exam ID'),
  
  answers: z
    .array(answerSchema)
    .min(1, 'At least one answer is required'),
  
  totalTimeSpent: z
    .number()
    .min(0, 'Total time spent cannot be negative')
    .max(28800, 'Total time spent cannot exceed 8 hours'), // in seconds
  
  submissionType: z.enum(['AUTO', 'MANUAL'], {
    errorMap: () => ({ message: 'Invalid submission type' }),
  }).default('MANUAL'),
  
  metadata: z.object({
    browserInfo: z.string().optional(),
    screenResolution: z.string().optional(),
    tabSwitches: z.number().min(0).optional(),
    violations: z.array(z.string()).optional(),
  }).optional(),
});

// Save progress schema (for auto-save functionality)
export const saveProgressSchema = z.object({
  examId: z.string().uuid('Invalid exam ID'),
  
  currentQuestion: z
    .number()
    .min(0, 'Current question index cannot be negative')
    .int('Current question index must be a whole number'),
  
  answers: z.array(answerSchema),
  
  timeSpent: z
    .number()
    .min(0, 'Time spent cannot be negative'),
  
  bookmarkedQuestions: z
    .array(questionIdSchema)
    .optional(),
});

// =============================================================================
// EXAM ATTEMPT SCHEMAS
// =============================================================================

// Start exam attempt schema
export const startExamSchema = z.object({
  examId: z.string().uuid('Invalid exam ID'),
  
  agreeToTerms: z
    .boolean()
    .refine(val => val === true, 'You must agree to the exam terms and conditions'),
  
  accessibility: z.object({
    fontSize: z.enum(['NORMAL', 'LARGE', 'EXTRA_LARGE']).optional(),
    highContrast: z.boolean().optional(),
    screenReader: z.boolean().optional(),
  }).optional(),
  
  proctoring: z.object({
    webcamPermission: z.boolean().optional(),
    microphonePermission: z.boolean().optional(),
    screenSharePermission: z.boolean().optional(),
  }).optional(),
});

// =============================================================================
// ANALYTICS AND REPORTING SCHEMAS
// =============================================================================

// Exam analytics filter schema
export const examAnalyticsSchema = z.object({
  examId: z.string().uuid('Invalid exam ID').optional(),
  
  dateRange: z.object({
    from: z.string().datetime(),
    to: z.string().datetime(),
  }).optional(),
  
  category: z.string().optional(),
  
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
  
  status: z.enum(['COMPLETED', 'IN_PROGRESS', 'NOT_STARTED']).optional(),
  
  metrics: z
    .array(z.enum([
      'ATTEMPT_COUNT',
      'COMPLETION_RATE',
      'AVERAGE_SCORE',
      'TIME_ANALYSIS',
      'QUESTION_DIFFICULTY',
      'SUBJECT_PERFORMANCE'
    ]))
    .optional(),
});

// Performance report schema
export const performanceReportSchema = z.object({
  userId: z.string().uuid('Invalid user ID').optional(),
  
  examIds: z
    .array(z.string().uuid())
    .max(50, 'Cannot generate report for more than 50 exams')
    .optional(),
  
  reportType: z.enum([
    'INDIVIDUAL',
    'COMPARATIVE',
    'SUBJECT_WISE',
    'TIME_BASED',
    'DIFFICULTY_BASED'
  ]),
  
  format: z.enum(['PDF', 'EXCEL', 'JSON'], {
    errorMap: () => ({ message: 'Please select a valid report format' }),
  }).default('PDF'),
  
  includeGraphs: z.boolean().default(true),
  
  includeRecommendations: z.boolean().default(true),
});

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type CreateExamFormData = z.infer<typeof createExamSchema>;
export type UpdateExamFormData = z.infer<typeof updateExamSchema>;
export type QuestionFormData = z.infer<typeof questionSchema>;
export type CreateQuestionFormData = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionFormData = z.infer<typeof updateQuestionSchema>;
export type SubmitExamFormData = z.infer<typeof submitExamSchema>;
export type SaveProgressFormData = z.infer<typeof saveProgressSchema>;
export type StartExamFormData = z.infer<typeof startExamSchema>;
export type ExamAnalyticsFormData = z.infer<typeof examAnalyticsSchema>;
export type PerformanceReportFormData = z.infer<typeof performanceReportSchema>;

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

// Validate exam timing
export const validateExamTiming = (duration: number, questions: number): {
  isValid: boolean;
  recommendedTime: number;
  warning?: string;
} => {
  const minTimePerQuestion = 30; // seconds
  const maxTimePerQuestion = 300; // seconds
  
  const totalTimeInSeconds = duration * 60;
  const timePerQuestion = totalTimeInSeconds / questions;
  
  const recommendedTime = Math.ceil((questions * 90) / 60); // 90 seconds per question in minutes
  
  if (timePerQuestion < minTimePerQuestion) {
    return {
      isValid: false,
      recommendedTime,
      warning: 'Insufficient time allocated per question'
    };
  }
  
  if (timePerQuestion > maxTimePerQuestion) {
    return {
      isValid: true,
      recommendedTime,
      warning: 'Excessive time allocated per question'
    };
  }
  
  return { isValid: true, recommendedTime };
};

// Calculate exam difficulty score
export const calculateExamDifficulty = (questions: QuestionFormData[]): {
  overallDifficulty: 'EASY' | 'MEDIUM' | 'HARD';
  distribution: Record<string, number>;
} => {
  const distribution = { EASY: 0, MEDIUM: 0, HARD: 0 };
  
  questions.forEach(q => {
    distribution[q.difficulty]++;
  });
  
  const total = questions.length;
  const easyPercentage = (distribution.EASY / total) * 100;
  const hardPercentage = (distribution.HARD / total) * 100;
  
  let overallDifficulty: 'EASY' | 'MEDIUM' | 'HARD';
  
  if (easyPercentage > 70) {
    overallDifficulty = 'EASY';
  } else if (hardPercentage > 50) {
    overallDifficulty = 'HARD';
  } else {
    overallDifficulty = 'MEDIUM';
  }
  
  return { overallDifficulty, distribution };
};

// Validate question distribution
export const validateQuestionDistribution = (questions: QuestionFormData[]): {
  isBalanced: boolean;
  suggestions: string[];
} => {
  const subjects: Record<string, number> = {};
  const difficulties: Record<string, number> = {};
  
  questions.forEach(q => {
    subjects[q.subject] = (subjects[q.subject] || 0) + 1;
    difficulties[q.difficulty] = (difficulties[q.difficulty] || 0) + 1;
  });
  
  const suggestions: string[] = [];
  const total = questions.length;
  
  // Check subject distribution
  const subjectCount = Object.keys(subjects).length;
  if (subjectCount === 1 && total > 50) {
    suggestions.push('Consider adding questions from multiple subjects for comprehensive assessment');
  }
  
  // Check difficulty distribution
  const easyPercent = (difficulties.EASY || 0) / total * 100;
  const hardPercent = (difficulties.HARD || 0) / total * 100;
  
  if (easyPercent > 80) {
    suggestions.push('Consider adding more challenging questions');
  }
  
  if (hardPercent > 60) {
    suggestions.push('Consider adding easier questions for better balance');
  }
  
  const isBalanced = suggestions.length === 0;
  
  return { isBalanced, suggestions };
};