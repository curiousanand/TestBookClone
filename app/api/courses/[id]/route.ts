/**
 * Individual Course API Route
 * 
 * Handles getting, updating, and deleting individual courses.
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createApiRoute, sendSuccess, sendError } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';

// Params validation schema
const courseParamsSchema = z.object({
  id: z.string().uuid('Invalid course ID'),
});

// Update course schema
const updateCourseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').optional(),
  description: z.string().min(10, 'Description must be at least 10 characters').optional(),
  slug: z.string().min(3, 'Slug must be at least 3 characters').optional(),
  categoryId: z.string().uuid('Invalid category ID').optional(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  language: z.enum(['ENGLISH', 'HINDI']).optional(),
  price: z.number().min(0, 'Price must be non-negative').optional(),
  originalPrice: z.number().min(0, 'Original price must be non-negative').optional(),
  isFree: z.boolean().optional(),
  duration: z.number().min(1, 'Duration must be at least 1 hour').optional(),
  thumbnail: z.string().url('Invalid thumbnail URL').optional(),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
});

// GET handler - Get single course
const getHandler = createApiRoute({
  validation: {
    params: courseParamsSchema,
  },
});

export const GET = getHandler(async (request, { params }) => {
  const { id } = params!;

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      category: {
        select: { name: true, slug: true },
      },
      instructor: {
        select: { id: true, fullName: true, avatar: true, bio: true },
      },
      lessons: {
        select: {
          id: true,
          title: true,
          duration: true,
          isPreview: true,
          sortOrder: true,
        },
        orderBy: { sortOrder: 'asc' },
      },
      _count: {
        select: { enrollments: true },
      },
    },
  });

  if (!course) {
    return sendError('Course not found', 404);
  }

  // Check if user can access unpublished courses
  if (!course.isPublished && (!request.user || 
      (request.user.role !== 'ADMIN' && request.user.id !== course.instructorId))) {
    return sendError('Course not found', 404);
  }

  // Check if user is enrolled (if authenticated)
  let isEnrolled = false;
  if (request.user) {
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId: request.user.id,
          courseId: course.id,
        },
      },
    });
    isEnrolled = !!enrollment;
  }

  return sendSuccess({
    course: {
      id: course.id,
      title: course.title,
      description: course.description,
      slug: course.slug,
      level: course.level,
      language: course.language,
      price: course.price,
      originalPrice: course.originalPrice,
      isFree: course.isFree,
      duration: course.duration,
      thumbnail: course.thumbnail,
      tags: course.tags,
      isPublished: course.isPublished,
      category: course.category,
      instructor: course.instructor,
      lessons: course.lessons,
      enrollmentCount: course._count.enrollments,
      isEnrolled,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    },
  });
});

// PUT handler - Update course
const putHandler = createApiRoute({
  requireAuth: true,
  validation: {
    params: courseParamsSchema,
    body: updateCourseSchema,
  },
});

export const PUT = putHandler(async (request, { params }) => {
  const { id } = params!;
  const updateData = request.body!;
  const user = request.user!;

  // Get the course to check ownership
  const course = await prisma.course.findUnique({
    where: { id },
  });

  if (!course) {
    return sendError('Course not found', 404);
  }

  // Check permissions
  if (user.role !== 'ADMIN' && user.id !== course.instructorId) {
    return sendError('You do not have permission to update this course', 403);
  }

  // Check if slug is unique (if being updated)
  if (updateData.slug && updateData.slug !== course.slug) {
    const existingCourse = await prisma.course.findUnique({
      where: { slug: updateData.slug },
    });

    if (existingCourse) {
      return sendError('Course with this slug already exists', 409);
    }
  }

  // Update course
  const updatedCourse = await prisma.course.update({
    where: { id },
    data: updateData,
    include: {
      category: {
        select: { name: true, slug: true },
      },
      instructor: {
        select: { id: true, fullName: true, avatar: true },
      },
    },
  });

  return sendSuccess({
    course: {
      id: updatedCourse.id,
      title: updatedCourse.title,
      description: updatedCourse.description,
      slug: updatedCourse.slug,
      level: updatedCourse.level,
      language: updatedCourse.language,
      price: updatedCourse.price,
      originalPrice: updatedCourse.originalPrice,
      isFree: updatedCourse.isFree,
      duration: updatedCourse.duration,
      thumbnail: updatedCourse.thumbnail,
      tags: updatedCourse.tags,
      isPublished: updatedCourse.isPublished,
      category: updatedCourse.category,
      instructor: updatedCourse.instructor,
      updatedAt: updatedCourse.updatedAt,
    },
  });
});

// DELETE handler - Delete course
const deleteHandler = createApiRoute({
  requireAuth: true,
  validation: {
    params: courseParamsSchema,
  },
});

export const DELETE = deleteHandler(async (request, { params }) => {
  const { id } = params!;
  const user = request.user!;

  // Get the course to check ownership
  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      _count: {
        select: { enrollments: true },
      },
    },
  });

  if (!course) {
    return sendError('Course not found', 404);
  }

  // Check permissions
  if (user.role !== 'ADMIN' && user.id !== course.instructorId) {
    return sendError('You do not have permission to delete this course', 403);
  }

  // Check if course has enrollments
  if (course._count.enrollments > 0) {
    return sendError('Cannot delete course with active enrollments', 409);
  }

  // Delete course
  await prisma.course.delete({
    where: { id },
  });

  return sendSuccess({
    message: 'Course deleted successfully',
  });
});