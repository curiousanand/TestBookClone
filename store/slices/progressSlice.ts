/**
 * User Progress Slice
 * 
 * Manages user learning progress across courses, exams, and activities.
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';

// Types
export interface CourseProgress {
  courseId: string;
  userId: string;
  enrollmentId: string;
  progress: number; // 0-100
  completedLessons: string[];
  totalLessons: number;
  timeSpent: number; // in minutes
  lastAccessedAt: string;
  completedAt?: string;
  certificateIssued: boolean;
  certificateUrl?: string;
  streakDays: number;
  badges: Badge[];
}

export interface LessonProgress {
  lessonId: string;
  courseId: string;
  userId: string;
  isCompleted: boolean;
  progress: number; // 0-100 for video progress
  timeSpent: number; // in seconds
  lastWatchedPosition: number; // video position in seconds
  completedAt?: string;
  notes: string;
  bookmarks: number[]; // video timestamps
}

export interface ExamProgress {
  examId: string;
  userId: string;
  bestScore: number;
  bestPercentage: number;
  totalAttempts: number;
  completedAttempts: number;
  averageScore: number;
  timeSpent: number; // in minutes
  lastAttemptAt: string;
  hasAchievedPassing: boolean;
  rank?: number;
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'COURSE_COMPLETION' | 'EXAM_SCORE' | 'STREAK' | 'MILESTONE';
  earnedAt: string;
  metadata?: Record<string, any>;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'COURSE' | 'EXAM' | 'STREAK' | 'TIME' | 'SCORE';
  criteria: Record<string, any>;
  progress: number; // 0-100
  isCompleted: boolean;
  completedAt?: string;
  reward?: {
    type: 'BADGE' | 'POINTS' | 'CERTIFICATE';
    value: string;
  };
}

export interface StudySession {
  id: string;
  userId: string;
  type: 'COURSE' | 'EXAM' | 'LIVE_CLASS';
  itemId: string;
  startTime: string;
  endTime?: string;
  duration: number; // in minutes
  activities: StudyActivity[];
  date: string;
}

export interface StudyActivity {
  type: 'VIDEO_WATCH' | 'QUIZ_ATTEMPT' | 'NOTE_TAKING' | 'DISCUSSION';
  itemId: string;
  duration: number;
  metadata?: Record<string, any>;
}

export interface LearningGoal {
  id: string;
  title: string;
  description: string;
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  target: number;
  unit: 'HOURS' | 'LESSONS' | 'COURSES' | 'EXAMS';
  progress: number;
  isCompleted: boolean;
  dueDate: string;
  createdAt: string;
}

export interface ProgressState {
  // Course progress
  courseProgress: Record<string, CourseProgress>;
  lessonProgress: Record<string, LessonProgress>;
  
  // Exam progress
  examProgress: Record<string, ExamProgress>;
  
  // Achievements and badges
  badges: Badge[];
  achievements: Achievement[];
  totalPoints: number;
  level: number;
  
  // Study sessions
  studySessions: StudySession[];
  currentSession: StudySession | null;
  
  // Learning goals
  learningGoals: LearningGoal[];
  dailyGoal: LearningGoal | null;
  
  // Analytics
  weeklyStats: {
    hoursStudied: number;
    lessonsCompleted: number;
    examsAttempted: number;
    coursesEnrolled: number;
  };
  monthlyStats: {
    hoursStudied: number;
    lessonsCompleted: number;
    examsAttempted: number;
    coursesCompleted: number;
  };
  streakDays: number;
  longestStreak: number;
  
  // Loading states
  isLoading: boolean;
  isSyncing: boolean;
  
  // Error handling
  error: string | null;
  
  // Settings
  studyReminders: boolean;
  goalNotifications: boolean;
  achievementNotifications: boolean;
}

// Initial state
const initialState: ProgressState = {
  courseProgress: {},
  lessonProgress: {},
  examProgress: {},
  
  badges: [],
  achievements: [],
  totalPoints: 0,
  level: 1,
  
  studySessions: [],
  currentSession: null,
  
  learningGoals: [],
  dailyGoal: null,
  
  weeklyStats: {
    hoursStudied: 0,
    lessonsCompleted: 0,
    examsAttempted: 0,
    coursesEnrolled: 0,
  },
  monthlyStats: {
    hoursStudied: 0,
    lessonsCompleted: 0,
    examsAttempted: 0,
    coursesCompleted: 0,
  },
  streakDays: 0,
  longestStreak: 0,
  
  isLoading: false,
  isSyncing: false,
  error: null,
  
  studyReminders: true,
  goalNotifications: true,
  achievementNotifications: true,
};

// Async thunks
export const fetchUserProgress = createAsyncThunk(
  'progress/fetchUserProgress',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const token = state.auth.token;

      if (!token) {
        return rejectWithValue('Authentication required');
      }

      const response = await fetch('/api/users/me/progress', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!data.success) {
        return rejectWithValue(data.error?.message || 'Failed to fetch progress');
      }

      return data.data;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const updateLessonProgress = createAsyncThunk(
  'progress/updateLessonProgress',
  async (
    progressData: {
      lessonId: string;
      courseId: string;
      progress: number;
      timeSpent: number;
      lastWatchedPosition: number;
      isCompleted?: boolean;
    },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as RootState;
      const token = state.auth.token;

      if (!token) {
        return rejectWithValue('Authentication required');
      }

      const response = await fetch(`/api/lessons/${progressData.lessonId}/progress`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(progressData),
      });

      const data = await response.json();

      if (!data.success) {
        return rejectWithValue(data.error?.message || 'Failed to update progress');
      }

      return {
        lessonId: progressData.lessonId,
        progress: data.data.progress,
      };
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const startStudySession = createAsyncThunk(
  'progress/startStudySession',
  async (
    sessionData: {
      type: 'COURSE' | 'EXAM' | 'LIVE_CLASS';
      itemId: string;
    },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as RootState;
      const token = state.auth.token;
      const userId = state.auth.user?.id;

      if (!token || !userId) {
        return rejectWithValue('Authentication required');
      }

      const session: StudySession = {
        id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        type: sessionData.type,
        itemId: sessionData.itemId,
        startTime: new Date().toISOString(),
        duration: 0,
        activities: [],
        date: new Date().toISOString().split('T')[0],
      };

      return session;
    } catch (error) {
      return rejectWithValue('Failed to start study session');
    }
  }
);

export const endStudySession = createAsyncThunk(
  'progress/endStudySession',
  async (
    sessionData: {
      sessionId: string;
      activities: StudyActivity[];
    },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as RootState;
      const token = state.auth.token;
      const currentSession = state.progress.currentSession;

      if (!token || !currentSession) {
        return rejectWithValue('No active session found');
      }

      const endTime = new Date().toISOString();
      const startTime = new Date(currentSession.startTime);
      const duration = Math.floor((new Date(endTime).getTime() - startTime.getTime()) / (1000 * 60));

      const response = await fetch('/api/users/me/study-sessions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...currentSession,
          endTime,
          duration,
          activities: sessionData.activities,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        return rejectWithValue(data.error?.message || 'Failed to save session');
      }

      return {
        sessionId: sessionData.sessionId,
        session: data.data.session,
      };
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

// Progress slice
const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    // Course progress actions
    updateCourseProgress: (state, action: PayloadAction<{ courseId: string; progress: Partial<CourseProgress> }>) => {
      const { courseId, progress } = action.payload;
      if (state.courseProgress[courseId]) {
        state.courseProgress[courseId] = { ...state.courseProgress[courseId], ...progress };
      }
    },
    
    // Lesson progress actions
    setLessonProgress: (state, action: PayloadAction<LessonProgress>) => {
      const progress = action.payload;
      state.lessonProgress[progress.lessonId] = progress;
    },
    
    markLessonComplete: (state, action: PayloadAction<{ lessonId: string; courseId: string }>) => {
      const { lessonId, courseId } = action.payload;
      
      // Update lesson progress
      if (state.lessonProgress[lessonId]) {
        state.lessonProgress[lessonId].isCompleted = true;
        state.lessonProgress[lessonId].progress = 100;
        state.lessonProgress[lessonId].completedAt = new Date().toISOString();
      }
      
      // Update course progress
      if (state.courseProgress[courseId]) {
        const courseProgress = state.courseProgress[courseId];
        if (!courseProgress.completedLessons.includes(lessonId)) {
          courseProgress.completedLessons.push(lessonId);
          courseProgress.progress = (courseProgress.completedLessons.length / courseProgress.totalLessons) * 100;
          courseProgress.lastAccessedAt = new Date().toISOString();
        }
      }
    },
    
    // Exam progress actions
    updateExamProgress: (state, action: PayloadAction<{ examId: string; progress: Partial<ExamProgress> }>) => {
      const { examId, progress } = action.payload;
      if (state.examProgress[examId]) {
        state.examProgress[examId] = { ...state.examProgress[examId], ...progress };
      } else {
        state.examProgress[examId] = progress as ExamProgress;
      }
    },
    
    // Badge and achievement actions
    addBadge: (state, action: PayloadAction<Badge>) => {
      const badge = action.payload;
      if (!state.badges.find(b => b.id === badge.id)) {
        state.badges.push(badge);
        state.totalPoints += 50; // Award points for badges
      }
    },
    
    updateAchievement: (state, action: PayloadAction<{ id: string; progress: number; isCompleted?: boolean }>) => {
      const { id, progress, isCompleted } = action.payload;
      const achievement = state.achievements.find(a => a.id === id);
      
      if (achievement) {
        achievement.progress = progress;
        if (isCompleted) {
          achievement.isCompleted = true;
          achievement.completedAt = new Date().toISOString();
        }
      }
    },
    
    // Study session actions
    addActivity: (state, action: PayloadAction<StudyActivity>) => {
      if (state.currentSession) {
        state.currentSession.activities.push(action.payload);
      }
    },
    
    // Learning goal actions
    setDailyGoal: (state, action: PayloadAction<LearningGoal>) => {
      state.dailyGoal = action.payload;
      
      // Add to goals list if not exists
      const existingGoal = state.learningGoals.find(g => g.id === action.payload.id);
      if (!existingGoal) {
        state.learningGoals.push(action.payload);
      }
    },
    
    updateGoalProgress: (state, action: PayloadAction<{ goalId: string; progress: number }>) => {
      const { goalId, progress } = action.payload;
      const goal = state.learningGoals.find(g => g.id === goalId);
      
      if (goal) {
        goal.progress = progress;
        goal.isCompleted = progress >= goal.target;
        
        if (state.dailyGoal && state.dailyGoal.id === goalId) {
          state.dailyGoal.progress = progress;
          state.dailyGoal.isCompleted = progress >= goal.target;
        }
      }
    },
    
    // Statistics actions
    updateWeeklyStats: (state, action: PayloadAction<Partial<typeof initialState.weeklyStats>>) => {
      state.weeklyStats = { ...state.weeklyStats, ...action.payload };
    },
    
    updateMonthlyStats: (state, action: PayloadAction<Partial<typeof initialState.monthlyStats>>) => {
      state.monthlyStats = { ...state.monthlyStats, ...action.payload };
    },
    
    incrementStreak: (state) => {
      state.streakDays += 1;
      if (state.streakDays > state.longestStreak) {
        state.longestStreak = state.streakDays;
      }
    },
    
    resetStreak: (state) => {
      state.streakDays = 0;
    },
    
    // Settings actions
    updateSettings: (state, action: PayloadAction<{ 
      studyReminders?: boolean;
      goalNotifications?: boolean;
      achievementNotifications?: boolean;
    }>) => {
      const settings = action.payload;
      if (settings.studyReminders !== undefined) {
        state.studyReminders = settings.studyReminders;
      }
      if (settings.goalNotifications !== undefined) {
        state.goalNotifications = settings.goalNotifications;
      }
      if (settings.achievementNotifications !== undefined) {
        state.achievementNotifications = settings.achievementNotifications;
      }
    },
    
    // Utility actions
    syncStart: (state) => {
      state.isSyncing = true;
    },
    
    syncComplete: (state) => {
      state.isSyncing = false;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    reset: () => initialState,
  },
  
  extraReducers: (builder) => {
    // Fetch user progress
    builder
      .addCase(fetchUserProgress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProgress.fulfilled, (state, action) => {
        state.isLoading = false;
        const data = action.payload;
        
        state.courseProgress = data.courseProgress || {};
        state.lessonProgress = data.lessonProgress || {};
        state.examProgress = data.examProgress || {};
        state.badges = data.badges || [];
        state.achievements = data.achievements || [];
        state.totalPoints = data.totalPoints || 0;
        state.level = data.level || 1;
        state.studySessions = data.studySessions || [];
        state.learningGoals = data.learningGoals || [];
        state.weeklyStats = data.weeklyStats || initialState.weeklyStats;
        state.monthlyStats = data.monthlyStats || initialState.monthlyStats;
        state.streakDays = data.streakDays || 0;
        state.longestStreak = data.longestStreak || 0;
        
        state.error = null;
      })
      .addCase(fetchUserProgress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update lesson progress
    builder
      .addCase(updateLessonProgress.pending, (state) => {
        state.isSyncing = true;
      })
      .addCase(updateLessonProgress.fulfilled, (state, action) => {
        state.isSyncing = false;
        const { lessonId, progress } = action.payload;
        
        if (state.lessonProgress[lessonId]) {
          state.lessonProgress[lessonId] = { ...state.lessonProgress[lessonId], ...progress };
        }
      })
      .addCase(updateLessonProgress.rejected, (state, action) => {
        state.isSyncing = false;
        state.error = action.payload as string;
      });

    // Start study session
    builder
      .addCase(startStudySession.fulfilled, (state, action) => {
        state.currentSession = action.payload;
      });

    // End study session
    builder
      .addCase(endStudySession.pending, (state) => {
        state.isSyncing = true;
      })
      .addCase(endStudySession.fulfilled, (state, action) => {
        state.isSyncing = false;
        state.studySessions.push(action.payload.session);
        state.currentSession = null;
        
        // Update statistics based on completed session
        const session = action.payload.session;
        state.weeklyStats.hoursStudied += session.duration / 60;
        state.monthlyStats.hoursStudied += session.duration / 60;
      })
      .addCase(endStudySession.rejected, (state, action) => {
        state.isSyncing = false;
        state.error = action.payload as string;
      });
  },
});

// Actions
export const {
  updateCourseProgress,
  setLessonProgress,
  markLessonComplete,
  updateExamProgress,
  addBadge,
  updateAchievement,
  addActivity,
  setDailyGoal,
  updateGoalProgress,
  updateWeeklyStats,
  updateMonthlyStats,
  incrementStreak,
  resetStreak,
  updateSettings,
  syncStart,
  syncComplete,
  clearError,
  reset,
} = progressSlice.actions;

// Selectors
export const selectProgress = (state: RootState) => state.progress;
export const selectCourseProgress = (courseId: string) => (state: RootState) => 
  state.progress.courseProgress[courseId];
export const selectLessonProgress = (lessonId: string) => (state: RootState) => 
  state.progress.lessonProgress[lessonId];
export const selectExamProgress = (examId: string) => (state: RootState) => 
  state.progress.examProgress[examId];
export const selectBadges = (state: RootState) => state.progress.badges;
export const selectAchievements = (state: RootState) => state.progress.achievements;
export const selectCurrentSession = (state: RootState) => state.progress.currentSession;
export const selectDailyGoal = (state: RootState) => state.progress.dailyGoal;
export const selectStreakDays = (state: RootState) => state.progress.streakDays;
export const selectWeeklyStats = (state: RootState) => state.progress.weeklyStats;
export const selectMonthlyStats = (state: RootState) => state.progress.monthlyStats;

// Complex selectors
export const selectOverallProgress = (state: RootState) => {
  const { courseProgress, examProgress } = state.progress;
  
  const courseProgressValues = Object.values(courseProgress);
  const examProgressValues = Object.values(examProgress);
  
  const totalCourseProgress = courseProgressValues.reduce((sum, cp) => sum + cp.progress, 0);
  const avgCourseProgress = courseProgressValues.length > 0 ? totalCourseProgress / courseProgressValues.length : 0;
  
  const totalExamScore = examProgressValues.reduce((sum, ep) => sum + ep.bestPercentage, 0);
  const avgExamScore = examProgressValues.length > 0 ? totalExamScore / examProgressValues.length : 0;
  
  return {
    averageCourseProgress: avgCourseProgress,
    averageExamScore: avgExamScore,
    totalCourses: courseProgressValues.length,
    completedCourses: courseProgressValues.filter(cp => cp.progress === 100).length,
    totalExams: examProgressValues.length,
    passedExams: examProgressValues.filter(ep => ep.hasAchievedPassing).length,
  };
};

export const selectRecentActivity = (state: RootState) => {
  return state.progress.studySessions
    .slice(-10)
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
};

export default progressSlice.reducer;