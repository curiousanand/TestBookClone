/**
 * Course Enrollment API Route
 * 
 * Handles course enrollment and unenrollment.
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createApiRoute, sendSuccess, sendError } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';

// Params validation schema
const enrollParamsSchema = z.object({
  id: z.string().uuid('Invalid course ID'),
});

// POST handler - Enroll in course
const postHandler = createApiRoute({
  requireAuth: true,
  validation: {
    params: enrollParamsSchema,
  },
});

export const POST = postHandler(async (request, context) => {
  const { id: courseId } = context?.params || {};
  
  if (!courseId) {
    return sendError('Course ID is required', 400);
  }
  
  const user = request.user!;

  // Get the course
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    return sendError('Course not found', 404);
  }

  if (!course.isPublished) {
    return sendError('Course is not available for enrollment', 400);
  }

  // Check if already enrolled
  const existingEnrollment = await prisma.courseEnrollment.findUnique({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId,
      },
    },
  });

  if (existingEnrollment) {
    return sendError('Already enrolled in this course', 409);
  }

  // For paid courses, check if user has active subscription or has purchased
  if (!course.isFree) {
    // TODO: Implement payment validation
    // For now, we'll allow enrollment for testing
  }

  // Create enrollment
  const enrollment = await prisma.courseEnrollment.create({
    data: {
      userId: user.id,
      courseId,
      enrolledAt: new Date(),
    },
  });

  return sendSuccess({
    enrollment: {
      id: enrollment.id,
      courseId: enrollment.courseId,
      enrolledAt: enrollment.enrolledAt,
      progressPercent: enrollment.progressPercent,
    },
    message: 'Successfully enrolled in course',
  }, undefined, 201);
});

// DELETE handler - Unenroll from course
const deleteHandler = createApiRoute({
  requireAuth: true,
  validation: {
    params: enrollParamsSchema,
  },
});

export const DELETE = deleteHandler(async (request, context) => {
  const { id: courseId } = context?.params || {};
  
  if (!courseId) {
    return sendError('Course ID is required', 400);
  }
  
  const user = request.user!;

  // Check if enrolled
  const enrollment = await prisma.courseEnrollment.findUnique({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId,
      },
    },
  });

  if (!enrollment) {
    return sendError('Not enrolled in this course', 404);
  }

  // Delete enrollment
  await prisma.courseEnrollment.delete({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId,
      },
    },
  });

  return sendSuccess({
    message: 'Successfully unenrolled from course',
  });
});