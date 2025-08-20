/**
 * Exam & Assessment Types for TestBook Clone Application
 * 
 * Comprehensive type definitions for examination system including
 * exams, test series, questions, attempts, results, and analytics.
 */

import type { 
  Exam as PrismaExam,
  TestSeries as PrismaTestSeries,
  Question as PrismaQuestion,
  TestAttempt as PrismaTestAttempt,
  QuestionAttempt as PrismaQuestionAttempt,
  ExamType,
  QuestionType,
  QuestionDifficulty,
  TestSeriesType,
  Language
} from '@prisma/client';

import type { User, PublicUserProfile } from './user';

// =============================================================================
// BASE EXAM TYPES
// =============================================================================

/**
 * Core exam information from database
 */
export type Exam = PrismaExam;

/**
 * Exam with all related data
 */
export interface ExamWithRelations extends Exam {
  testSeries: TestSeries[];
  creator?: PublicUserProfile;
  stats: ExamStats;
  syllabus: ExamSyllabus[];
  cutoffs: ExamCutoff[];
}

/**
 * Public exam information
 */
export interface PublicExam {
  id: string;
  name: string;
  slug: string;
  description: string;
  type: ExamType;
  duration: number; // minutes
  totalMarks: number;
  passingMarks: number;
  language: Language;
  instructions: string;
  isActive: boolean;
  stats: ExamStats;
  syllabus: ExamSyllabus[];
  cutoffs: ExamCutoff[];
  sampleQuestions: Question[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Exam statistics
 */
export interface ExamStats {
  totalAttempts: number;
  totalUsers: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passRate: number; // percentage
  averageTime: number; // minutes
  difficultyDistribution: DifficultyStats;
  topicWiseStats: TopicStats[];
}

/**
 * Difficulty-wise statistics
 */
export interface DifficultyStats {
  easy: {
    count: number;
    averageAccuracy: number;
  };
  medium: {
    count: number;
    averageAccuracy: number;
  };
  hard: {
    count: number;
    averageAccuracy: number;
  };
  veryHard: {
    count: number;
    averageAccuracy: number;
  };
}

/**
 * Topic-wise statistics
 */
export interface TopicStats {
  topic: string;
  questionCount: number;
  averageAccuracy: number;
  totalAttempts: number;
}

/**
 * Exam syllabus section
 */
export interface ExamSyllabus {
  id: string;
  subject: string;
  topics: ExamTopic[];
  weightage: number; // percentage
  questionCount: number;
}

/**
 * Exam topic
 */
export interface ExamTopic {
  id: string;
  name: string;
  subtopics: string[];
  weightage: number; // percentage
  difficulty: QuestionDifficulty;
  questionCount: number;
}

/**
 * Exam cutoff information
 */
export interface ExamCutoff {
  id: string;
  examId: string;
  year: number;
  category: 'GENERAL' | 'OBC' | 'SC' | 'ST' | 'EWS' | 'PH';
  cutoffScore: number;
  rank?: number;
  totalSeats?: number;
}

// =============================================================================
// TEST SERIES TYPES
// =============================================================================

/**
 * Core test series information from database
 */
export type TestSeries = PrismaTestSeries;

/**
 * Test series with all related data
 */
export interface TestSeriesWithRelations extends TestSeries {
  exam: PublicExam;
  creator: PublicUserProfile;
  questions: Question[];
  attempts: TestAttempt[];
  stats: TestSeriesStats;
  tags: string[];
}

/**
 * Public test series information
 */
export interface PublicTestSeries {
  id: string;
  title: string;
  description: string;
  type: TestSeriesType;
  examId: string;
  exam: Pick<Exam, 'name' | 'type'>;
  duration: number; // minutes
  totalQuestions: number;
  totalMarks: number;
  passingMarks: number;
  language: Language;
  price: number;
  currency: string;
  isActive: boolean;
  scheduledAt?: Date;
  availableFrom: Date;
  availableUntil?: Date;
  maxAttempts: number;
  showAnswers: boolean;
  showResultsImmediately: boolean;
  negativeMarking: boolean;
  negativeMarkingRatio: number;
  instructions: string;
  tags: string[];
  stats: TestSeriesStats;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Test series statistics
 */
export interface TestSeriesStats {
  totalAttempts: number;
  uniqueUsers: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  averageTime: number; // minutes
  completionRate: number; // percentage
  difficultyRating: number; // 1-5
  toppersList: TestSeriesTopper[];
}

/**
 * Test series topper
 */
export interface TestSeriesTopper {
  userId: string;
  user: PublicUserProfile;
  score: number;
  percentage: number;
  rank: number;
  timeTaken: number; // minutes
  attemptedAt: Date;
}

// =============================================================================
// QUESTION TYPES
// =============================================================================

/**
 * Core question information from database
 */
export type Question = PrismaQuestion;

/**
 * Question with all related data
 */
export interface QuestionWithRelations extends Question {
  creator: PublicUserProfile;
  testSeries: PublicTestSeries;
  attempts: QuestionAttempt[];
  stats: QuestionStats;
  tags: QuestionTag[];
}

/**
 * Public question information
 */
export interface PublicQuestion {
  id: string;
  question: string;
  type: QuestionType;
  options: QuestionOption[];
  correctAnswer: string | string[];
  explanation?: string;
  marks: number;
  negativeMarks: number;
  difficulty: QuestionDifficulty;
  subject: string;
  topic: string;
  subtopic?: string;
  language: Language;
  image?: string;
  audio?: string;
  video?: string;
  tags: string[];
  stats: QuestionStats;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Question option for multiple choice questions
 */
export interface QuestionOption {
  id: string;
  text: string;
  image?: string;
  isCorrect: boolean;
}

/**
 * Question statistics
 */
export interface QuestionStats {
  totalAttempts: number;
  correctAttempts: number;
  accuracy: number; // percentage
  averageTime: number; // seconds
  skipRate: number; // percentage
  difficultyRating: number; // calculated based on attempts
}

/**
 * Question tag for categorization
 */
export interface QuestionTag {
  id: string;
  name: string;
  category: 'SUBJECT' | 'TOPIC' | 'CONCEPT' | 'EXAM' | 'DIFFICULTY';
  color?: string;
}

// =============================================================================
// TEST ATTEMPT TYPES
// =============================================================================

/**
 * Core test attempt information from database
 */
export type TestAttempt = PrismaTestAttempt;

/**
 * Test attempt with all related data
 */
export interface TestAttemptWithRelations extends TestAttempt {
  user: PublicUserProfile;
  testSeries: PublicTestSeries;
  questionAttempts: QuestionAttempt[];
  result: TestResult;
  analytics: TestAnalytics;
}

/**
 * Test result summary
 */
export interface TestResult {
  attemptId: string;
  userId: string;
  testSeriesId: string;
  score: number;
  maxScore: number;
  percentage: number;
  rank: number;
  totalUsers: number;
  timeTaken: number; // minutes
  questionsAttempted: number;
  correctAnswers: number;
  incorrectAnswers: number;
  skippedQuestions: number;
  accuracy: number; // percentage
  negativeMarks: number;
  isPassed: boolean;
  grade: TestGrade;
  percentile: number;
  subjectWiseResults: SubjectWiseResult[];
  topicWiseResults: TopicWiseResult[];
  completedAt: Date;
  certificate?: TestCertificate;
}

/**
 * Test grade enum
 */
export type TestGrade = 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';

/**
 * Subject-wise test result
 */
export interface SubjectWiseResult {
  subject: string;
  totalQuestions: number;
  attemptedQuestions: number;
  correctAnswers: number;
  score: number;
  maxScore: number;
  accuracy: number; // percentage
  timeTaken: number; // minutes
}

/**
 * Topic-wise test result
 */
export interface TopicWiseResult {
  topic: string;
  subject: string;
  totalQuestions: number;
  attemptedQuestions: number;
  correctAnswers: number;
  score: number;
  maxScore: number;
  accuracy: number; // percentage
}

/**
 * Test analytics for detailed insights
 */
export interface TestAnalytics {
  attemptId: string;
  timeDistribution: TimeDistribution;
  difficultyAnalysis: DifficultyAnalysis;
  comparisonWithPeers: PeerComparison;
  recommendations: AnalyticsRecommendation[];
  strengths: string[];
  weaknesses: string[];
  improvementAreas: string[];
}

/**
 * Time distribution analysis
 */
export interface TimeDistribution {
  totalTime: number; // minutes
  averageTimePerQuestion: number; // seconds
  fastestQuestion: {
    questionId: string;
    timeTaken: number; // seconds
  };
  slowestQuestion: {
    questionId: string;
    timeTaken: number; // seconds
  };
  subjectWiseTime: {
    subject: string;
    timeTaken: number; // minutes
    averageTimePerQuestion: number; // seconds
  }[];
}

/**
 * Difficulty analysis
 */
export interface DifficultyAnalysis {
  easy: {
    total: number;
    attempted: number;
    correct: number;
    accuracy: number;
  };
  medium: {
    total: number;
    attempted: number;
    correct: number;
    accuracy: number;
  };
  hard: {
    total: number;
    attempted: number;
    correct: number;
    accuracy: number;
  };
  veryHard: {
    total: number;
    attempted: number;
    correct: number;
    accuracy: number;
  };
}

/**
 * Peer comparison data
 */
export interface PeerComparison {
  yourScore: number;
  averageScore: number;
  topScore: number;
  yourPercentile: number;
  betterThanPercent: number;
  subjectComparison: {
    subject: string;
    yourScore: number;
    averageScore: number;
    percentile: number;
  }[];
}

/**
 * Analytics recommendation
 */
export interface AnalyticsRecommendation {
  type: 'STUDY_MORE' | 'PRACTICE_MORE' | 'TIME_MANAGEMENT' | 'CONCEPT_CLARITY';
  subject?: string;
  topic?: string;
  description: string;
  action: string;
  resources: RecommendedResource[];
}

/**
 * Recommended resource
 */
export interface RecommendedResource {
  type: 'COURSE' | 'VIDEO' | 'PRACTICE_SET' | 'BOOK' | 'ARTICLE';
  title: string;
  url: string;
  description?: string;
}

/**
 * Test certificate
 */
export interface TestCertificate {
  id: string;
  attemptId: string;
  certificateNumber: string;
  issuedAt: Date;
  validUntil?: Date;
  certificateUrl: string;
  verificationUrl: string;
  score: number;
  percentage: number;
  rank: number;
}

// =============================================================================
// QUESTION ATTEMPT TYPES
// =============================================================================

/**
 * Core question attempt information from database
 */
export type QuestionAttempt = PrismaQuestionAttempt;

/**
 * Question attempt with question details
 */
export interface QuestionAttemptWithDetails extends QuestionAttempt {
  question: PublicQuestion;
  timeTaken: number; // seconds
  isCorrect: boolean;
  marksAwarded: number;
  review: QuestionReview;
}

/**
 * Question review/feedback
 */
export interface QuestionReview {
  difficulty: 'TOO_EASY' | 'EASY' | 'MODERATE' | 'HARD' | 'TOO_HARD';
  clarity: 'VERY_CLEAR' | 'CLEAR' | 'MODERATE' | 'UNCLEAR' | 'VERY_UNCLEAR';
  feedback?: string;
  reportIssue?: QuestionIssueReport;
}

/**
 * Question issue report
 */
export interface QuestionIssueReport {
  type: 'WRONG_ANSWER' | 'TYPO' | 'UNCLEAR_QUESTION' | 'TECHNICAL_ISSUE' | 'OTHER';
  description: string;
  reportedAt: Date;
  status: 'PENDING' | 'RESOLVED' | 'REJECTED';
}

// =============================================================================
// LIVE TEST TYPES
// =============================================================================

/**
 * Live test session
 */
export interface LiveTest {
  id: string;
  testSeriesId: string;
  testSeries: PublicTestSeries;
  scheduledAt: Date;
  startTime: Date;
  endTime: Date;
  duration: number; // minutes
  participants: LiveTestParticipant[];
  leaderboard: LiveTestLeaderboard[];
  status: 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'CANCELLED';
  proctoring: ProctoringSettings;
  chat: LiveTestChat[];
}

/**
 * Live test participant
 */
export interface LiveTestParticipant {
  userId: string;
  user: PublicUserProfile;
  joinedAt: Date;
  currentQuestion: number;
  score: number;
  rank: number;
  isActive: boolean;
  violations: ProctoringViolation[];
}

/**
 * Live test leaderboard entry
 */
export interface LiveTestLeaderboard {
  rank: number;
  userId: string;
  user: PublicUserProfile;
  score: number;
  questionsAnswered: number;
  accuracy: number;
  timeTaken: number; // minutes
}

/**
 * Proctoring settings and data
 */
export interface ProctoringSettings {
  enabled: boolean;
  webcamRequired: boolean;
  screenShareRequired: boolean;
  micRequired: boolean;
  tabSwitchingAllowed: boolean;
  copyPasteAllowed: boolean;
  calculatorAllowed: boolean;
  warningThreshold: number;
  autoSubmitOnViolation: boolean;
}

/**
 * Proctoring violation
 */
export interface ProctoringViolation {
  type: 'TAB_SWITCH' | 'FULLSCREEN_EXIT' | 'COPY_PASTE' | 'WEBCAM_OFF' | 'SUSPICIOUS_ACTIVITY';
  timestamp: Date;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
  evidence?: string; // screenshot or other evidence
}

/**
 * Live test chat message
 */
export interface LiveTestChat {
  id: string;
  userId: string;
  user: PublicUserProfile;
  message: string;
  timestamp: Date;
  type: 'USER' | 'SYSTEM' | 'MODERATOR';
}

// =============================================================================
// FORM TYPES
// =============================================================================

/**
 * Test series creation form
 */
export interface TestSeriesCreateForm {
  title: string;
  description: string;
  type: TestSeriesType;
  examId: string;
  duration: number; // minutes
  totalQuestions: number;
  totalMarks: number;
  passingMarks: number;
  language: Language;
  price: number;
  currency: string;
  maxAttempts: number;
  showAnswers: boolean;
  showResultsImmediately: boolean;
  negativeMarking: boolean;
  negativeMarkingRatio: number;
  instructions: string;
  tags: string[];
  questions: string[]; // question IDs
  scheduledAt?: Date;
  availableFrom: Date;
  availableUntil?: Date;
}

/**
 * Question creation form
 */
export interface QuestionCreateForm {
  question: string;
  type: QuestionType;
  options: Omit<QuestionOption, 'id'>[];
  correctAnswer: string | string[];
  explanation?: string;
  marks: number;
  negativeMarks: number;
  difficulty: QuestionDifficulty;
  subject: string;
  topic: string;
  subtopic?: string;
  language: Language;
  image?: File;
  audio?: File;
  video?: File;
  tags: string[];
}

/**
 * Test attempt submission form
 */
export interface TestSubmissionForm {
  testSeriesId: string;
  answers: {
    questionId: string;
    answer: string | string[];
    timeTaken: number; // seconds
    marked: boolean;
    skipped: boolean;
  }[];
  totalTimeTaken: number; // minutes
  review?: {
    difficulty: number;
    feedback?: string;
    reportedIssues: QuestionIssueReport[];
  };
}

// =============================================================================
// SEARCH & FILTERING TYPES
// =============================================================================

/**
 * Test series search filters
 */
export interface TestSeriesSearchFilters {
  query?: string;
  examId?: string;
  type?: TestSeriesType;
  difficulty?: QuestionDifficulty;
  language?: Language;
  priceRange?: {
    min: number;
    max: number;
  };
  duration?: {
    min: number; // minutes
    max: number; // minutes
  };
  free?: boolean;
  tags?: string[];
  createdBy?: string;
}

/**
 * Question search filters
 */
export interface QuestionSearchFilters {
  query?: string;
  type?: QuestionType;
  difficulty?: QuestionDifficulty;
  subject?: string;
  topic?: string;
  language?: Language;
  tags?: string[];
  createdBy?: string;
  examId?: string;
}

/**
 * Question bank filters
 */
export interface QuestionBankFilters extends QuestionSearchFilters {
  onlyMyQuestions?: boolean;
  onlyPublished?: boolean;
  lastUsed?: {
    from: Date;
    to: Date;
  };
  accuracy?: {
    min: number; // percentage
    max: number; // percentage
  };
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Test attempt creation data
 */
export type TestAttemptCreate = Omit<TestAttempt, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Question creation data
 */
export type QuestionCreate = Omit<Question, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Test series list item
 */
export type TestSeriesListItem = Pick<TestSeries, 
  | 'id' 
  | 'title' 
  | 'type' 
  | 'duration' 
  | 'totalQuestions' 
  | 'price' 
  | 'isActive'
  | 'createdAt'
> & {
  exam: Pick<Exam, 'name' | 'type'>;
  attemptCount: number;
  averageScore: number;
};

/**
 * Question list item
 */
export type QuestionListItem = Pick<Question, 
  | 'id' 
  | 'question' 
  | 'type' 
  | 'difficulty' 
  | 'subject' 
  | 'topic' 
  | 'marks'
  | 'createdAt'
> & {
  stats: Pick<QuestionStats, 'totalAttempts' | 'accuracy'>;
  tags: string[];
};

/**
 * User test history item
 */
export interface UserTestHistoryItem {
  attemptId: string;
  testSeriesId: string;
  testTitle: string;
  examName: string;
  score: number;
  maxScore: number;
  percentage: number;
  rank: number;
  totalUsers: number;
  timeTaken: number; // minutes
  attemptedAt: Date;
  isPassed: boolean;
  grade: TestGrade;
}

// =============================================================================
// EXPORTS
// =============================================================================

export type {
  ExamType,
  QuestionType,
  QuestionDifficulty,
  TestSeriesType,
  Language
} from '@prisma/client';