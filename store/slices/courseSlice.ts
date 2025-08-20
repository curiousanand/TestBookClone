/**
 * Course Management Slice
 * 
 * Manages course state, enrollments, and progress tracking.
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';

// Types
export interface Course {
  id: string;
  title: string;
  description: string;
  slug: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  language: 'ENGLISH' | 'HINDI';
  price: number;
  originalPrice?: number;
  isFree: boolean;
  duration: number;
  thumbnail?: string;
  tags: string[];
  isPublished: boolean;
  category: {
    name: string;
    slug: string;
  };
  instructor: {
    id: string;
    fullName: string;
    avatar?: string;
  };
  enrollmentCount: number;
  lessonCount: number;
  isEnrolled?: boolean;
  createdAt: string;
}

export interface CourseFilters {
  search: string;
  category: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | '';
  language: 'ENGLISH' | 'HINDI' | '';
  isFree: boolean | null;
  sortBy: 'title' | 'price' | 'createdAt' | 'enrollmentCount';
  sortOrder: 'asc' | 'desc';
}

export interface Enrollment {
  id: string;
  courseId: string;
  userId: string;
  enrolledAt: string;
  completedAt?: string;
  progress: number; // 0-100
  lastAccessedAt: string;
  course: Course;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: number;
  order: number;
  isFree: boolean;
  videoUrl?: string;
  isCompleted?: boolean;
  completedAt?: string;
}

export interface CourseState {
  // Course catalog
  courses: Course[];
  currentCourse: Course | null;
  courseLessons: Lesson[];
  
  // Filters and pagination
  filters: CourseFilters;
  currentPage: number;
  totalPages: number;
  totalCourses: number;
  
  // Enrollments
  enrollments: Enrollment[];
  currentEnrollment: Enrollment | null;
  
  // Loading states
  isLoading: boolean;
  isLoadingCourse: boolean;
  isLoadingEnrollments: boolean;
  isEnrolling: boolean;
  
  // Error handling
  error: string | null;
  enrollmentError: string | null;
  
  // UI state
  selectedCategories: string[];
  viewMode: 'grid' | 'list';
  showFilters: boolean;
}

// Initial state
const initialState: CourseState = {
  courses: [],
  currentCourse: null,
  courseLessons: [],
  
  filters: {
    search: '',
    category: '',
    level: '',
    language: '',
    isFree: null,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
  currentPage: 1,
  totalPages: 0,
  totalCourses: 0,
  
  enrollments: [],
  currentEnrollment: null,
  
  isLoading: false,
  isLoadingCourse: false,
  isLoadingEnrollments: false,
  isEnrolling: false,
  
  error: null,
  enrollmentError: null,
  
  selectedCategories: [],
  viewMode: 'grid',
  showFilters: false,
};

// Async thunks
export const fetchCourses = createAsyncThunk(
  'courses/fetchCourses',
  async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      category?: string;
      level?: string;
      language?: string;
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

      const response = await fetch(`/api/courses?${searchParams.toString()}`);
      const data = await response.json();

      if (!data.success) {
        return rejectWithValue(data.error?.message || 'Failed to fetch courses');
      }

      return {
        courses: data.data,
        meta: data.meta,
      };
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const fetchCourse = createAsyncThunk(
  'courses/fetchCourse',
  async (courseId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/courses/${courseId}`);
      const data = await response.json();

      if (!data.success) {
        return rejectWithValue(data.error?.message || 'Course not found');
      }

      return data.data.course;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const fetchCourseLessons = createAsyncThunk(
  'courses/fetchCourseLessons',
  async (courseId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/courses/${courseId}/lessons`);
      const data = await response.json();

      if (!data.success) {
        return rejectWithValue(data.error?.message || 'Failed to fetch lessons');
      }

      return data.data.lessons;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const enrollInCourse = createAsyncThunk(
  'courses/enrollInCourse',
  async (courseId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const token = state.auth.token;

      if (!token) {
        return rejectWithValue('Authentication required');
      }

      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!data.success) {
        return rejectWithValue(data.error?.message || 'Enrollment failed');
      }

      return {
        courseId,
        enrollment: data.data.enrollment,
      };
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const fetchEnrollments = createAsyncThunk(
  'courses/fetchEnrollments',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const token = state.auth.token;

      if (!token) {
        return rejectWithValue('Authentication required');
      }

      const response = await fetch('/api/users/me/enrollments', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!data.success) {
        return rejectWithValue(data.error?.message || 'Failed to fetch enrollments');
      }

      return data.data.enrollments;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

// Course slice
const courseSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    // Filter actions
    setFilters: (state, action: PayloadAction<Partial<CourseFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.currentPage = 1; // Reset to first page when filters change
    },
    
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.currentPage = 1;
    },
    
    setSearch: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
      state.currentPage = 1;
    },
    
    setCategory: (state, action: PayloadAction<string>) => {
      state.filters.category = action.payload;
      state.currentPage = 1;
    },
    
    setPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    
    // UI actions
    setViewMode: (state, action: PayloadAction<'grid' | 'list'>) => {
      state.viewMode = action.payload;
    },
    
    toggleFilters: (state) => {
      state.showFilters = !state.showFilters;
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
    
    // Course actions
    clearCurrentCourse: (state) => {
      state.currentCourse = null;
      state.courseLessons = [];
    },
    
    markLessonComplete: (state, action: PayloadAction<{ lessonId: string; completedAt: string }>) => {
      const { lessonId, completedAt } = action.payload;
      const lesson = state.courseLessons.find(l => l.id === lessonId);
      
      if (lesson) {
        lesson.isCompleted = true;
        lesson.completedAt = completedAt;
      }
    },
    
    // Error handling
    clearError: (state) => {
      state.error = null;
      state.enrollmentError = null;
    },
    
    // Reset state
    reset: () => initialState,
  },
  
  extraReducers: (builder) => {
    // Fetch courses
    builder
      .addCase(fetchCourses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.courses = action.payload.courses;
        state.currentPage = action.payload.meta.page;
        state.totalPages = action.payload.meta.totalPages;
        state.totalCourses = action.payload.meta.total;
        state.error = null;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch course
    builder
      .addCase(fetchCourse.pending, (state) => {
        state.isLoadingCourse = true;
        state.error = null;
      })
      .addCase(fetchCourse.fulfilled, (state, action) => {
        state.isLoadingCourse = false;
        state.currentCourse = action.payload;
        state.error = null;
      })
      .addCase(fetchCourse.rejected, (state, action) => {
        state.isLoadingCourse = false;
        state.error = action.payload as string;
      });

    // Fetch course lessons
    builder
      .addCase(fetchCourseLessons.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCourseLessons.fulfilled, (state, action) => {
        state.isLoading = false;
        state.courseLessons = action.payload;
      })
      .addCase(fetchCourseLessons.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Enroll in course
    builder
      .addCase(enrollInCourse.pending, (state) => {
        state.isEnrolling = true;
        state.enrollmentError = null;
      })
      .addCase(enrollInCourse.fulfilled, (state, action) => {
        state.isEnrolling = false;
        state.enrollments.push(action.payload.enrollment);
        
        // Update current course if it's the enrolled course
        if (state.currentCourse?.id === action.payload.courseId) {
          state.currentCourse.isEnrolled = true;
        }
        
        // Update course in courses list
        const courseIndex = state.courses.findIndex(c => c.id === action.payload.courseId);
        if (courseIndex > -1) {
          state.courses[courseIndex].isEnrolled = true;
          state.courses[courseIndex].enrollmentCount += 1;
        }
      })
      .addCase(enrollInCourse.rejected, (state, action) => {
        state.isEnrolling = false;
        state.enrollmentError = action.payload as string;
      });

    // Fetch enrollments
    builder
      .addCase(fetchEnrollments.pending, (state) => {
        state.isLoadingEnrollments = true;
      })
      .addCase(fetchEnrollments.fulfilled, (state, action) => {
        state.isLoadingEnrollments = false;
        state.enrollments = action.payload;
        
        // Mark enrolled courses in the courses list
        state.courses.forEach(course => {
          course.isEnrolled = state.enrollments.some(e => e.courseId === course.id);
        });
      })
      .addCase(fetchEnrollments.rejected, (state, action) => {
        state.isLoadingEnrollments = false;
        state.error = action.payload as string;
      });
  },
});

// Actions
export const {
  setFilters,
  clearFilters,
  setSearch,
  setCategory,
  setPage,
  setViewMode,
  toggleFilters,
  toggleCategory,
  clearCurrentCourse,
  markLessonComplete,
  clearError,
  reset,
} = courseSlice.actions;

// Selectors
export const selectCourses = (state: RootState) => state.courses;
export const selectCourseList = (state: RootState) => state.courses.courses;
export const selectCurrentCourse = (state: RootState) => state.courses.currentCourse;
export const selectCourseLessons = (state: RootState) => state.courses.courseLessons;
export const selectCourseFilters = (state: RootState) => state.courses.filters;
export const selectEnrollments = (state: RootState) => state.courses.enrollments;
export const selectCourseLoading = (state: RootState) => state.courses.isLoading;
export const selectCourseError = (state: RootState) => state.courses.error;

// Complex selectors
export const selectFilteredCourses = (state: RootState) => {
  const { courses, filters, selectedCategories } = state.courses;
  
  return courses.filter(course => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        course.title.toLowerCase().includes(searchLower) ||
        course.description.toLowerCase().includes(searchLower) ||
        course.category.name.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }
    
    // Category filter
    if (selectedCategories.length > 0) {
      if (!selectedCategories.includes(course.category.slug)) return false;
    }
    
    // Level filter
    if (filters.level && course.level !== filters.level) return false;
    
    // Language filter
    if (filters.language && course.language !== filters.language) return false;
    
    // Free/paid filter
    if (filters.isFree !== null && course.isFree !== filters.isFree) return false;
    
    return true;
  });
};

export const selectEnrolledCourses = (state: RootState) => {
  return state.courses.enrollments.map(enrollment => enrollment.course);
};

export const selectCourseProgress = (courseId: string) => (state: RootState) => {
  const enrollment = state.courses.enrollments.find(e => e.courseId === courseId);
  return enrollment?.progress || 0;
};

export default courseSlice.reducer;