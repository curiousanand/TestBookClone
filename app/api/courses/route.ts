/**
 * Courses API Route
 * 
 * Handles course listing, creation, and search functionality.
 */

import { z } from 'zod';
import { createApiRoute, sendSuccess, parsePagination, createPaginationMeta } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';

// Query validation schema
const coursesQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  category: z.string().optional(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  language: z.enum(['ENGLISH', 'HINDI']).optional(),
  isFree: z.string().transform((val) => val === 'true').optional(),
  sortBy: z.enum(['title', 'price', 'createdAt', 'enrollmentCount']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Course creation schema
const createCourseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters'),
  categoryId: z.string().uuid('Invalid category ID'),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  language: z.enum(['ENGLISH', 'HINDI']),
  price: z.number().min(0, 'Price must be non-negative'),
  originalPrice: z.number().min(0, 'Original price must be non-negative').optional(),
  isFree: z.boolean().default(false),
  estimatedHours: z.number().min(1, 'Estimated hours must be at least 1 hour'),
  thumbnail: z.string().url('Invalid thumbnail URL').optional(),
  tags: z.array(z.string()).default([]),
  isPublished: z.boolean().default(false),
});

// GET handler - List courses
const getHandler = createApiRoute({
  validation: {
    query: coursesQuerySchema,
  },
});

export const GET = getHandler(async (request) => {
  const query = request.query!;
  const { skip, take, orderBy } = parsePagination(query);

  // Build filters
  const where: any = {};

  if (query['search']) {
    where.OR = [
      { title: { contains: query['search'], mode: 'insensitive' } },
      { description: { contains: query['search'], mode: 'insensitive' } },
    ];
  }

  if (query['category']) {
    where.category = { slug: query['category'] };
  }

  if (query['level']) {
    where.level = query['level'];
  }

  if (query['language']) {
    where.language = query['language'];
  }

  if (query['isFree'] !== undefined) {
    where.isFree = query['isFree'];
  }

  // Only show published courses for non-authenticated users
  if (!request.user) {
    where.isPublished = true;
  }

  // Get courses with count
  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where,
      skip,
      take,
      ...(orderBy && { orderBy }),
      include: {
        category: {
          select: { name: true, slug: true },
        },
        instructor: {
          select: { id: true, fullName: true, avatar: true },
        },
        _count: {
          select: { enrollments: true, lessons: true },
        },
      },
    }),
    prisma.course.count({ where }),
  ]);

  return sendSuccess(
    courses.map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      slug: course.slug,
      level: course.level,
      language: course.language,
      price: course.price,
      originalPrice: course.originalPrice,
      isFree: course.isFree,
      estimatedHours: course.estimatedHours,
      thumbnail: course.thumbnail,
      tags: course.tags,
      isPublished: course.isPublished,
      category: course.category,
      instructor: course.instructor,
      enrollmentCount: course._count.enrollments,
      lessonCount: course._count.lessons,
      createdAt: course.createdAt,
    })),
    createPaginationMeta(
      parseInt(query['page'] || '1'),
      take,
      total
    )
  );
});

// POST handler - Create course
const postHandler = createApiRoute({
  requireAuth: true,
  requiredRole: 'INSTRUCTOR',
  validation: {
    body: createCourseSchema,
  },
});

export const POST = postHandler(async (request) => {
  const courseData = request.body!;
  const user = request.user!;

  // Check if slug is unique
  const existingCourse = await prisma.course.findUnique({
    where: { slug: courseData.slug },
  });

  if (existingCourse) {
    return sendSuccess({ error: 'Course with this slug already exists' }, undefined, 409);
  }

  // Create course
  const course = await prisma.course.create({
    data: {
      ...courseData,
      instructorId: user.id,
    },
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
      id: course.id,
      title: course.title,
      description: course.description,
      slug: course.slug,
      level: course.level,
      language: course.language,
      price: course.price,
      originalPrice: course.originalPrice,
      isFree: course.isFree,
      estimatedHours: course.estimatedHours,
      thumbnail: course.thumbnail,
      tags: course.tags,
      isPublished: course.isPublished,
      category: course.category,
      instructor: course.instructor,
      createdAt: course.createdAt,
    },
  }, undefined, 201);
});