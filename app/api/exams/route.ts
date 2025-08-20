/**
 * Exams API Route
 * 
 * Handles exam listing, creation, and search functionality.
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createApiRoute, sendSuccess, parsePagination, createPaginationMeta } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';

// Query validation schema
const examsQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  category: z.string().optional(),
  type: z.enum(['MOCK_TEST', 'PRACTICE_TEST', 'PREVIOUS_YEAR', 'SECTIONAL_TEST']).optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
  isFree: z.string().transform((val) => val === 'true').optional(),
  sortBy: z.enum(['title', 'createdAt', 'startDate', 'totalQuestions']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Create exam schema
const createExamSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters'),
  type: z.enum(['MOCK_TEST', 'PRACTICE_TEST', 'PREVIOUS_YEAR', 'SECTIONAL_TEST']),
  categoryId: z.string().uuid('Invalid category ID'),
  duration: z.number().min(1, 'Duration must be at least 1 minute'),
  totalQuestions: z.number().min(1, 'Must have at least 1 question'),
  totalMarks: z.number().min(1, 'Total marks must be at least 1'),
  passingMarks: z.number().min(0, 'Passing marks must be non-negative'),
  price: z.number().min(0, 'Price must be non-negative'),
  originalPrice: z.number().min(0, 'Original price must be non-negative').optional(),
  isFree: z.boolean().default(false),
  startDate: z.string().datetime('Invalid start date').optional(),
  endDate: z.string().datetime('Invalid end date').optional(),
  instructions: z.string().optional(),
  isPublished: z.boolean().default(false),
  showResultsImmediately: z.boolean().default(true),
  allowReview: z.boolean().default(true),
  tags: z.array(z.string()).default([]),
});

// GET handler - List exams
const getHandler = createApiRoute({
  validation: {
    query: examsQuerySchema,
  },
});

export const GET = getHandler(async (request) => {
  const query = request.query!;
  const { skip, take, orderBy } = parsePagination(query);

  // Build filters
  const where: any = {};

  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: 'insensitive' } },
      { description: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  if (query.category) {
    where.category = { slug: query.category };
  }

  if (query.type) {
    where.type = query.type;
  }

  if (query.isFree !== undefined) {
    where.isFree = query.isFree;
  }

  // Only show published exams for non-authenticated users
  if (!request.user) {
    where.isPublished = true;
  }

  // Filter by date availability
  const now = new Date();
  if (!request.user || request.user.role === 'STUDENT') {
    where.OR = [
      { startDate: null, endDate: null },
      { startDate: { lte: now }, endDate: null },
      { startDate: null, endDate: { gte: now } },
      { startDate: { lte: now }, endDate: { gte: now } },
    ];
  }

  // Get exams with count
  const [exams, total] = await Promise.all([
    prisma.exam.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        category: {
          select: { name: true, slug: true },
        },
        _count: {
          select: { attempts: true, questions: true },
        },
      },
    }),
    prisma.exam.count({ where }),
  ]);

  return sendSuccess(
    exams.map((exam) => ({
      id: exam.id,
      title: exam.title,
      description: exam.description,
      slug: exam.slug,
      type: exam.type,
      duration: exam.duration,
      totalQuestions: exam.totalQuestions,
      totalMarks: exam.totalMarks,
      passingMarks: exam.passingMarks,
      price: exam.price,
      originalPrice: exam.originalPrice,
      isFree: exam.isFree,
      startDate: exam.startDate,
      endDate: exam.endDate,
      isPublished: exam.isPublished,
      category: exam.category,
      attemptCount: exam._count.attempts,
      questionCount: exam._count.questions,
      createdAt: exam.createdAt,
    })),
    createPaginationMeta(
      parseInt(query.page || '1'),
      take,
      total
    )
  );
});

// POST handler - Create exam
const postHandler = createApiRoute({
  requireAuth: true,
  requiredRole: 'INSTRUCTOR',
  validation: {
    body: createExamSchema,
  },
});

export const POST = postHandler(async (request) => {
  const examData = request.body!;
  const user = request.user!;

  // Check if slug is unique
  const existingExam = await prisma.exam.findUnique({
    where: { slug: examData.slug },
  });

  if (existingExam) {
    return sendSuccess({ error: 'Exam with this slug already exists' }, undefined, 409);
  }

  // Validate date range
  if (examData.startDate && examData.endDate) {
    const startDate = new Date(examData.startDate);
    const endDate = new Date(examData.endDate);
    
    if (startDate >= endDate) {
      return sendSuccess({ error: 'End date must be after start date' }, undefined, 400);
    }
  }

  // Create exam
  const exam = await prisma.exam.create({
    data: {
      ...examData,
      startDate: examData.startDate ? new Date(examData.startDate) : null,
      endDate: examData.endDate ? new Date(examData.endDate) : null,
      createdBy: user.id,
    },
    include: {
      category: {
        select: { name: true, slug: true },
      },
    },
  });

  return sendSuccess({
    exam: {
      id: exam.id,
      title: exam.title,
      description: exam.description,
      slug: exam.slug,
      type: exam.type,
      duration: exam.duration,
      totalQuestions: exam.totalQuestions,
      totalMarks: exam.totalMarks,
      passingMarks: exam.passingMarks,
      price: exam.price,
      originalPrice: exam.originalPrice,
      isFree: exam.isFree,
      startDate: exam.startDate,
      endDate: exam.endDate,
      instructions: exam.instructions,
      isPublished: exam.isPublished,
      showResultsImmediately: exam.showResultsImmediately,
      allowReview: exam.allowReview,
      tags: exam.tags,
      category: exam.category,
      createdAt: exam.createdAt,
    },
  }, undefined, 201);
});