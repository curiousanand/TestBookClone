/**
 * RTK Query API Configuration
 * 
 * Centralized API configuration using RTK Query for efficient data fetching.
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from './index';

// Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

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
  createdAt: string;
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
  isPublished: boolean;
  category: {
    name: string;
    slug: string;
  };
  attemptCount: number;
  questionCount: number;
  createdAt: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN' | 'SUPER_ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
}

export interface LiveClass {
  id: string;
  title: string;
  description: string;
  subject: string;
  startTime: string;
  duration: number;
  status: 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'CANCELLED';
  maxAttendees?: number;
  currentAttendees: number;
  recordingEnabled: boolean;
  isPublic: boolean;
  tags: string[];
  instructor: {
    id: string;
    fullName: string;
    avatar?: string;
    bio?: string;
  };
  isEnrolled: boolean;
  createdAt: string;
}

// Base query with authentication
const baseQuery = fetchBaseQuery({
  baseUrl: '/api',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    
    headers.set('content-type', 'application/json');
    return headers;
  },
});

// Base query with error handling
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  const result = await baseQuery(args, api, extraOptions);
  
  if (result.error && result.error.status === 401) {
    // Handle unauthorized - logout user
    api.dispatch({ type: 'auth/logout' });
  }
  
  return result;
};

// Main API slice
export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Course', 'Exam', 'User', 'LiveClass', 'Progress', 'Payment'],
  endpoints: (builder) => ({
    // Auth endpoints
    signIn: builder.mutation<ApiResponse<{ user: User; token: string }>, { email: string; password: string; rememberMe?: boolean }>({
      query: (credentials) => ({
        url: '/auth/signin',
        method: 'POST',
        body: credentials,
      }),
    }),
    
    signUp: builder.mutation<ApiResponse<{ user: User; token: string }>, { 
      firstName: string; 
      lastName: string; 
      email: string; 
      password: string; 
      phone?: string; 
    }>({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),
    
    getCurrentUser: builder.query<ApiResponse<User>, void>({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
    
    // Course endpoints
    getCourses: builder.query<ApiResponse<Course[]>, {
      page?: number;
      limit?: number;
      search?: string;
      category?: string;
      level?: string;
      language?: string;
      isFree?: boolean;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }>({
      query: (params) => ({
        url: '/courses',
        params,
      }),
      providesTags: ['Course'],
    }),
    
    getCourse: builder.query<ApiResponse<Course>, string>({
      query: (id) => `/courses/${id}`,
      providesTags: (result, error, id) => [{ type: 'Course', id }],
    }),
    
    enrollInCourse: builder.mutation<ApiResponse, string>({
      query: (courseId) => ({
        url: `/courses/${courseId}/enroll`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, courseId) => [
        { type: 'Course', id: courseId },
        'Progress',
      ],
    }),
    
    // Exam endpoints
    getExams: builder.query<ApiResponse<Exam[]>, {
      page?: number;
      limit?: number;
      search?: string;
      category?: string;
      type?: string;
      isFree?: boolean;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }>({
      query: (params) => ({
        url: '/exams',
        params,
      }),
      providesTags: ['Exam'],
    }),
    
    getExam: builder.query<ApiResponse<Exam>, string>({
      query: (id) => `/exams/${id}`,
      providesTags: (result, error, id) => [{ type: 'Exam', id }],
    }),
    
    startExamAttempt: builder.mutation<ApiResponse<{ attemptId: string }>, string>({
      query: (examId) => ({
        url: `/exams/${examId}/attempt`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, examId) => [
        { type: 'Exam', id: examId },
        'Progress',
      ],
    }),
    
    // Live class endpoints
    getLiveClasses: builder.query<ApiResponse<LiveClass[]>, {
      page?: number;
      limit?: number;
      search?: string;
      subject?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }>({
      query: (params) => ({
        url: '/live-classes',
        params,
      }),
      providesTags: ['LiveClass'],
    }),
    
    getLiveClass: builder.query<ApiResponse<LiveClass>, string>({
      query: (id) => `/live-classes/${id}`,
      providesTags: (result, error, id) => [{ type: 'LiveClass', id }],
    }),
    
    joinLiveClass: builder.mutation<ApiResponse<{ joinUrl: string }>, string>({
      query: (classId) => ({
        url: `/live-classes/${classId}/join`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, classId) => [
        { type: 'LiveClass', id: classId },
      ],
    }),
  }),
});

// Export hooks
export const {
  // Auth
  useSignInMutation,
  useSignUpMutation,
  useGetCurrentUserQuery,
  
  // Courses
  useGetCoursesQuery,
  useGetCourseQuery,
  useEnrollInCourseMutation,
  
  // Exams
  useGetExamsQuery,
  useGetExamQuery,
  useStartExamAttemptMutation,
  
  // Live Classes
  useGetLiveClassesQuery,
  useGetLiveClassQuery,
  useJoinLiveClassMutation,
} = api;