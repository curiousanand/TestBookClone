/**
 * Exam Slice
 * 
 * Manages exam state, test attempts, and results.
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';

// Types
export interface Question {
  id: string;
  questionText: string;
  type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'ESSAY';
  options: QuestionOption[];
  correctAnswers: string[];
  explanation?: string;
  marks: number;
  negativeMarks: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  tags: string[];
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  slug: string;
  type: 'MOCK_TEST' | 'PRACTICE_TEST' | 'PREVIOUS_YEAR' | 'SECTIONAL_TEST';
  duration: number;
  totalQuestions: number;
  totalMarks: number;
  passingMarks: number;
  price: number;
  originalPrice?: number;
  isFree: boolean;
  startDate?: string;
  endDate?: string;
  instructions?: string;
  isPublished: boolean;
  showResultsImmediately: boolean;
  allowReview: boolean;
  tags: string[];
  category: {
    name: string;
    slug: string;
  };
  attemptCount: number;
  questionCount: number;
  createdAt: string;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  userId: string;
  startedAt: string;
  submittedAt?: string;
  completedAt?: string;
  duration: number; // in minutes
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'COMPLETED' | 'ABANDONED';
  score: number;
  percentage: number;
  correctAnswers: number;
  wrongAnswers: number;
  skippedAnswers: number;
  totalMarks: number;
  obtainedMarks: number;
  rank?: number;
  isPassed: boolean;
  answers: ExamAnswer[];
  exam: Exam;
}

export interface ExamAnswer {
  questionId: string;
  selectedOptions: string[];
  timeTaken: number; // in seconds
  isCorrect: boolean;
  marksObtained: number;
  marksDeducted: number;
}

export interface ExamFilters {
  search: string;
  category: string;
  type: 'MOCK_TEST' | 'PRACTICE_TEST' | 'PREVIOUS_YEAR' | 'SECTIONAL_TEST' | '';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | '';
  isFree: boolean | null;
  sortBy: 'title' | 'createdAt' | 'startDate' | 'totalQuestions';
  sortOrder: 'asc' | 'desc';
}

export interface CurrentExamSession {
  examId: string;
  attemptId: string;
  questions: Question[];
  currentQuestionIndex: number;
  answers: Record<string, string[]>;
  timeRemaining: number; // in seconds
  startTime: number;
  isSubmitting: boolean;
  isPaused: boolean;
  flaggedQuestions: Set<string>;
  visitedQuestions: Set<string>;
}

export interface ExamState {
  // Exam catalog
  exams: Exam[];
  currentExam: Exam | null;
  
  // Filters and pagination
  filters: ExamFilters;
  currentPage: number;
  totalPages: number;
  totalExams: number;
  
  // Exam session
  currentSession: CurrentExamSession | null;
  
  // Attempts and results
  attempts: ExamAttempt[];
  currentAttempt: ExamAttempt | null;
  
  // Loading states
  isLoading: boolean;
  isLoadingExam: boolean;
  isLoadingAttempts: boolean;
  isStartingAttempt: boolean;
  isSubmittingExam: boolean;
  
  // Error handling
  error: string | null;
  sessionError: string | null;
  
  // UI state
  showInstructions: boolean;
  showReview: boolean;
  selectedCategories: string[];
  viewMode: 'grid' | 'list';
}

// Initial state
const initialState: ExamState = {
  exams: [],
  currentExam: null,
  
  filters: {
    search: '',
    category: '',
    type: '',
    difficulty: '',
    isFree: null,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
  currentPage: 1,
  totalPages: 0,
  totalExams: 0,
  
  currentSession: null,
  
  attempts: [],
  currentAttempt: null,
  
  isLoading: false,
  isLoadingExam: false,
  isLoadingAttempts: false,
  isStartingAttempt: false,
  isSubmittingExam: false,
  
  error: null,
  sessionError: null,
  
  showInstructions: true,
  showReview: false,
  selectedCategories: [],
  viewMode: 'grid',
};

// Async thunks
export const fetchExams = createAsyncThunk(
  'exams/fetchExams',
  async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      category?: string;
      type?: string;
      isFree?: boolean;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
    { rejectWithValue }
  ) => {
    try {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });

      const response = await fetch(`/api/exams?${searchParams.toString()}`);
      const data = await response.json();

      if (!data.success) {
        return rejectWithValue(data.error?.message || 'Failed to fetch exams');
      }

      return {
        exams: data.data,
        meta: data.meta,
      };
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const fetchExam = createAsyncThunk(
  'exams/fetchExam',
  async (examId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/exams/${examId}`);
      const data = await response.json();

      if (!data.success) {
        return rejectWithValue(data.error?.message || 'Exam not found');
      }

      return data.data.exam;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const startExamAttempt = createAsyncThunk(
  'exams/startExamAttempt',
  async (examId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const token = state.auth.token;

      if (!token) {
        return rejectWithValue('Authentication required');
      }

      const response = await fetch(`/api/exams/${examId}/attempt`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!data.success) {
        return rejectWithValue(data.error?.message || 'Failed to start exam');
      }

      return {
        attemptId: data.data.attemptId,
        questions: data.data.questions,
        exam: data.data.exam,
        duration: data.data.duration,
      };
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const submitExam = createAsyncThunk(
  'exams/submitExam',
  async (
    { attemptId, answers }: { attemptId: string; answers: Record<string, string[]> },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as RootState;
      const token = state.auth.token;

      if (!token) {
        return rejectWithValue('Authentication required');
      }

      const response = await fetch(`/api/exam-attempts/${attemptId}/submit`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers }),
      });

      const data = await response.json();

      if (!data.success) {
        return rejectWithValue(data.error?.message || 'Failed to submit exam');
      }

      return data.data.result;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const fetchAttempts = createAsyncThunk(
  'exams/fetchAttempts',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const token = state.auth.token;

      if (!token) {
        return rejectWithValue('Authentication required');
      }

      const response = await fetch('/api/users/me/exam-attempts', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!data.success) {
        return rejectWithValue(data.error?.message || 'Failed to fetch attempts');
      }

      return data.data.attempts;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

// Exam slice
const examSlice = createSlice({
  name: 'exams',
  initialState,
  reducers: {
    // Filter actions
    setFilters: (state, action: PayloadAction<Partial<ExamFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.currentPage = 1;
    },
    
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.currentPage = 1;
    },
    
    setSearch: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
      state.currentPage = 1;
    },
    
    setPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    
    // UI actions
    setViewMode: (state, action: PayloadAction<'grid' | 'list'>) => {
      state.viewMode = action.payload;
    },
    
    toggleCategory: (state, action: PayloadAction<string>) => {
      const category = action.payload;
      const index = state.selectedCategories.indexOf(category);
      
      if (index > -1) {
        state.selectedCategories.splice(index, 1);
      } else {
        state.selectedCategories.push(category);
      }
    },
    
    setShowInstructions: (state, action: PayloadAction<boolean>) => {
      state.showInstructions = action.payload;
    },
    
    setShowReview: (state, action: PayloadAction<boolean>) => {
      state.showReview = action.payload;
    },
    
    // Session actions
    setCurrentQuestion: (state, action: PayloadAction<number>) => {
      if (state.currentSession) {
        state.currentSession.currentQuestionIndex = action.payload;
        
        // Mark question as visited
        const currentQuestion = state.currentSession.questions[action.payload];
        if (currentQuestion) {
          state.currentSession.visitedQuestions.add(currentQuestion.id);
        }
      }
    },
    
    answerQuestion: (state, action: PayloadAction<{ questionId: string; selectedOptions: string[] }>) => {
      if (state.currentSession) {
        const { questionId, selectedOptions } = action.payload;
        state.currentSession.answers[questionId] = selectedOptions;
      }
    },
    
    flagQuestion: (state, action: PayloadAction<string>) => {
      if (state.currentSession) {
        const questionId = action.payload;
        if (state.currentSession.flaggedQuestions.has(questionId)) {
          state.currentSession.flaggedQuestions.delete(questionId);
        } else {
          state.currentSession.flaggedQuestions.add(questionId);
        }
      }
    },
    
    updateTimeRemaining: (state, action: PayloadAction<number>) => {
      if (state.currentSession) {
        state.currentSession.timeRemaining = action.payload;
      }
    },
    
    pauseSession: (state) => {
      if (state.currentSession) {
        state.currentSession.isPaused = true;
      }
    },
    
    resumeSession: (state) => {
      if (state.currentSession) {
        state.currentSession.isPaused = false;
      }
    },
    
    clearSession: (state) => {
      state.currentSession = null;
      state.sessionError = null;
    },
    
    // Error handling
    clearError: (state) => {
      state.error = null;
      state.sessionError = null;
    },
    
    // Reset state
    reset: () => initialState,
  },
  
  extraReducers: (builder) => {
    // Fetch exams
    builder
      .addCase(fetchExams.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchExams.fulfilled, (state, action) => {
        state.isLoading = false;
        state.exams = action.payload.exams;
        state.currentPage = action.payload.meta.page;
        state.totalPages = action.payload.meta.totalPages;
        state.totalExams = action.payload.meta.total;
        state.error = null;
      })
      .addCase(fetchExams.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch exam
    builder
      .addCase(fetchExam.pending, (state) => {
        state.isLoadingExam = true;
        state.error = null;
      })
      .addCase(fetchExam.fulfilled, (state, action) => {
        state.isLoadingExam = false;
        state.currentExam = action.payload;
        state.error = null;
      })
      .addCase(fetchExam.rejected, (state, action) => {
        state.isLoadingExam = false;
        state.error = action.payload as string;
      });

    // Start exam attempt
    builder
      .addCase(startExamAttempt.pending, (state) => {
        state.isStartingAttempt = true;
        state.sessionError = null;
      })
      .addCase(startExamAttempt.fulfilled, (state, action) => {
        state.isStartingAttempt = false;
        const { attemptId, questions, exam, duration } = action.payload;
        
        state.currentSession = {
          examId: exam.id,
          attemptId,
          questions,
          currentQuestionIndex: 0,
          answers: {},
          timeRemaining: duration * 60, // Convert minutes to seconds
          startTime: Date.now(),
          isSubmitting: false,
          isPaused: false,
          flaggedQuestions: new Set(),
          visitedQuestions: new Set(),
        };
        
        state.currentExam = exam;
        state.sessionError = null;
      })
      .addCase(startExamAttempt.rejected, (state, action) => {
        state.isStartingAttempt = false;
        state.sessionError = action.payload as string;
      });

    // Submit exam
    builder
      .addCase(submitExam.pending, (state) => {
        state.isSubmittingExam = true;
        if (state.currentSession) {
          state.currentSession.isSubmitting = true;
        }
      })
      .addCase(submitExam.fulfilled, (state, action) => {
        state.isSubmittingExam = false;
        state.currentAttempt = action.payload;
        state.currentSession = null; // Clear session after successful submission
        state.sessionError = null;
      })
      .addCase(submitExam.rejected, (state, action) => {
        state.isSubmittingExam = false;
        if (state.currentSession) {
          state.currentSession.isSubmitting = false;
        }
        state.sessionError = action.payload as string;
      });

    // Fetch attempts
    builder
      .addCase(fetchAttempts.pending, (state) => {
        state.isLoadingAttempts = true;
      })
      .addCase(fetchAttempts.fulfilled, (state, action) => {
        state.isLoadingAttempts = false;
        state.attempts = action.payload;
      })
      .addCase(fetchAttempts.rejected, (state, action) => {
        state.isLoadingAttempts = false;
        state.error = action.payload as string;
      });
  },
});

// Actions
export const {
  setFilters,
  clearFilters,
  setSearch,
  setPage,
  setViewMode,
  toggleCategory,
  setShowInstructions,
  setShowReview,
  setCurrentQuestion,
  answerQuestion,
  flagQuestion,
  updateTimeRemaining,
  pauseSession,
  resumeSession,
  clearSession,
  clearError,
  reset,
} = examSlice.actions;

// Selectors
export const selectExams = (state: RootState) => state.exams;
export const selectExamList = (state: RootState) => state.exams.exams;
export const selectCurrentExam = (state: RootState) => state.exams.currentExam;
export const selectCurrentSession = (state: RootState) => state.exams.currentSession;
export const selectExamFilters = (state: RootState) => state.exams.filters;
export const selectAttempts = (state: RootState) => state.exams.attempts;
export const selectCurrentAttempt = (state: RootState) => state.exams.currentAttempt;
export const selectExamLoading = (state: RootState) => state.exams.isLoading;
export const selectExamError = (state: RootState) => state.exams.error;

// Complex selectors
export const selectCurrentQuestion = (state: RootState) => {
  const session = state.exams.currentSession;
  if (!session) return null;
  
  return session.questions[session.currentQuestionIndex] || null;
};

export const selectQuestionProgress = (state: RootState) => {
  const session = state.exams.currentSession;
  if (!session) return { answered: 0, total: 0, flagged: 0 };
  
  const answeredCount = Object.keys(session.answers).length;
  const totalCount = session.questions.length;
  const flaggedCount = session.flaggedQuestions.size;
  
  return {
    answered: answeredCount,
    total: totalCount,
    flagged: flaggedCount,
    percentage: totalCount > 0 ? (answeredCount / totalCount) * 100 : 0,
  };
};

export const selectTimeFormatted = (state: RootState) => {
  const session = state.exams.currentSession;
  if (!session) return '00:00:00';
  
  const timeRemaining = session.timeRemaining;
  const hours = Math.floor(timeRemaining / 3600);
  const minutes = Math.floor((timeRemaining % 3600) / 60);
  const seconds = timeRemaining % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const selectExamsByCategory = (state: RootState) => {
  return state.exams.exams.reduce((acc, exam) => {
    const category = exam.category.name;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(exam);
    return acc;
  }, {} as Record<string, Exam[]>);
};

export default examSlice.reducer;