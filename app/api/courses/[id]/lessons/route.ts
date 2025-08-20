/**
 * Course Lessons API Route
 * 
 * Handles listing and creating lessons for a course.
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createApiRoute, sendSuccess, sendError } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';

// Params validation schema
const lessonParamsSchema = z.object({
  id: z.string().uuid('Invalid course ID'),
});

// Create lesson schema
const createLessonSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  content: z.string().optional(),
  videoUrl: z.string().url('Invalid video URL').optional(),
  videoDuration: z.number().min(0, 'Video duration must be non-negative').optional(),
  isPreview: z.boolean().default(false),
  isFree: z.boolean().default(false),
  sortOrder: z.number().min(0, 'Sort order must be non-negative'),
});

// GET handler - List lessons
const getHandler = createApiRoute({
  validation: {
    params: lessonParamsSchema,
  },
});

export const GET = getHandler(async (request, { params }) => {
  const { id: courseId } = params!;

  // Get the course
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    return sendError('Course not found', 404);
  }

  // Check if user is enrolled or has access
  let hasAccess = course.isPublished;
  
  if (request.user) {
    // Check if user is the instructor or admin
    if (request.user.role === 'ADMIN' || request.user.id === course.instructorId) {
      hasAccess = true;
    } else {
      // Check if user is enrolled
      const enrollment = await prisma.courseEnrollment.findUnique({
        where: {
          userId_courseId: {
            userId: request.user.id,
            courseId,
          },
        },
      });
      hasAccess = !!enrollment;
    }
  }

  if (!hasAccess) {
    return sendError('Access denied', 403);
  }

  // Get lessons
  const lessons = await prisma.lesson.findMany({
    where: { courseId },
    orderBy: { sortOrder: 'asc' },
    select: {
      id: true,
      title: true,
      description: true,
      videoDuration: true,
      isPreview: true,
      isFree: true,
      sortOrder: true,
      isPublished: true,
      // Include content only if user has access
      ...(hasAccess && {
        content: true,
        videoUrl: true,
      }),
    },
  });

  // Filter lessons based on access level
  const filteredLessons = lessons.filter((lesson) => {
    // Show all lessons to instructor/admin
    if (request.user && (request.user.role === 'ADMIN' || request.user.id === course.instructorId)) {
      return true;
    }
    
    // Show published lessons and previews to others
    return lesson.isPublished || lesson.isPreview;
  });

  return sendSuccess({
    lessons: filteredLessons,
  });
});

// POST handler - Create lesson
const postHandler = createApiRoute({
  requireAuth: true,
  validation: {
    params: lessonParamsSchema,
    body: createLessonSchema,
  },
});

export const POST = postHandler(async (request, { params }) => {
  const { id: courseId } = params!;
  const lessonData = request.body!;
  const user = request.user!;

  // Get the course to check ownership
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    return sendError('Course not found', 404);
  }

  // Check permissions
  if (user.role !== 'ADMIN' && user.id !== course.instructorId) {
    return sendError('You do not have permission to create lessons for this course', 403);
  }

  // Create lesson
  const lesson = await prisma.lesson.create({
    data: {
      ...lessonData,
      courseId,
      slug: lessonData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    },
  });

  return sendSuccess({
    lesson: {
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      slug: lesson.slug,
      content: lesson.content,
      videoUrl: lesson.videoUrl,
      videoDuration: lesson.videoDuration,
      isPreview: lesson.isPreview,
      isFree: lesson.isFree,
      isPublished: lesson.isPublished,
      sortOrder: lesson.sortOrder,
      createdAt: lesson.createdAt,
    },
  }, undefined, 201);
});