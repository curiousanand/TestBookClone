/**
 * Individual Exam API Route
 * 
 * Handles getting, updating, and deleting individual exams.
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createApiRoute, sendSuccess, sendError } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';

// Params validation schema
const examParamsSchema = z.object({
  id: z.string().uuid('Invalid exam ID'),
});

// Update exam schema
const updateExamSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').optional(),
  description: z.string().min(10, 'Description must be at least 10 characters').optional(),
  slug: z.string().min(3, 'Slug must be at least 3 characters').optional(),
  type: z.enum(['MOCK_TEST', 'PRACTICE_TEST', 'PREVIOUS_YEAR', 'SECTIONAL_TEST']).optional(),
  categoryId: z.string().uuid('Invalid category ID').optional(),
  duration: z.number().min(1, 'Duration must be at least 1 minute').optional(),
  totalQuestions: z.number().min(1, 'Must have at least 1 question').optional(),
  totalMarks: z.number().min(1, 'Total marks must be at least 1').optional(),
  passingMarks: z.number().min(0, 'Passing marks must be non-negative').optional(),
  price: z.number().min(0, 'Price must be non-negative').optional(),
  originalPrice: z.number().min(0, 'Original price must be non-negative').optional(),
  isFree: z.boolean().optional(),
  startDate: z.string().datetime('Invalid start date').optional(),
  endDate: z.string().datetime('Invalid end date').optional(),
  instructions: z.string().optional(),
  isPublished: z.boolean().optional(),
  showResultsImmediately: z.boolean().optional(),
  allowReview: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

// GET handler - Get single exam
const getHandler = createApiRoute({
  validation: {
    params: examParamsSchema,
  },
});

export const GET = getHandler(async (request, { params }) => {
  const { id } = params!;

  const exam = await prisma.exam.findUnique({
    where: { id },
    include: {
      category: {
        select: { name: true, slug: true },
      },
      questions: {
        select: {
          id: true,
          title: true,
          type: true,
          difficulty: true,
          marks: true,
          negativeMarks: true,
        },
        orderBy: { createdAt: 'asc' },
      },
      _count: {
        select: { attempts: true },
      },
    },
  });

  if (!exam) {
    return sendError('Exam not found', 404);
  }

  // Check if user can access unpublished exams
  if (!exam.isPublished && (!request.user || 
      (request.user.role !== 'ADMIN' && request.user.id !== exam.createdBy))) {
    return sendError('Exam not found', 404);
  }

  // Check date availability
  const now = new Date();
  let isAvailable = true;
  
  if (exam.startDate && exam.startDate > now) {
    isAvailable = false;
  }
  
  if (exam.endDate && exam.endDate < now) {
    isAvailable = false;
  }

  // Check if user has attempted this exam
  let userAttempt = null;
  if (request.user) {
    userAttempt = await prisma.testAttempt.findFirst({
      where: {
        userId: request.user.id,
        examId: exam.id,
      },
      orderBy: { startedAt: 'desc' },
    });
  }

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
      questions: exam.questions,
      attemptCount: exam._count.attempts,
      isAvailable,
      userAttempt: userAttempt ? {
        id: userAttempt.id,
        score: userAttempt.score,
        percentage: userAttempt.percentage,
        completedAt: userAttempt.completedAt,
      } : null,
      createdAt: exam.createdAt,
      updatedAt: exam.updatedAt,
    },
  });
});

// PUT handler - Update exam
const putHandler = createApiRoute({
  requireAuth: true,
  validation: {
    params: examParamsSchema,
    body: updateExamSchema,
  },
});

export const PUT = putHandler(async (request, { params }) => {
  const { id } = params!;
  const updateData = request.body!;
  const user = request.user!;

  // Get the exam to check ownership
  const exam = await prisma.exam.findUnique({
    where: { id },
  });

  if (!exam) {
    return sendError('Exam not found', 404);
  }

  // Check permissions
  if (user.role !== 'ADMIN' && user.id !== exam.createdBy) {
    return sendError('You do not have permission to update this exam', 403);
  }

  // Check if slug is unique (if being updated)
  if (updateData.slug && updateData.slug !== exam.slug) {
    const existingExam = await prisma.exam.findUnique({
      where: { slug: updateData.slug },
    });

    if (existingExam) {
      return sendError('Exam with this slug already exists', 409);
    }
  }

  // Validate date range
  if (updateData.startDate && updateData.endDate) {
    const startDate = new Date(updateData.startDate);
    const endDate = new Date(updateData.endDate);
    
    if (startDate >= endDate) {
      return sendError('End date must be after start date', 400);
    }
  }

  // Prepare update data
  const updateDataWithDates = {
    ...updateData,
    ...(updateData.startDate && { startDate: new Date(updateData.startDate) }),
    ...(updateData.endDate && { endDate: new Date(updateData.endDate) }),
  };

  // Update exam
  const updatedExam = await prisma.exam.update({
    where: { id },
    data: updateDataWithDates,
    include: {
      category: {
        select: { name: true, slug: true },
      },
    },
  });

  return sendSuccess({
    exam: {
      id: updatedExam.id,
      title: updatedExam.title,
      description: updatedExam.description,
      slug: updatedExam.slug,
      type: updatedExam.type,
      duration: updatedExam.duration,
      totalQuestions: updatedExam.totalQuestions,
      totalMarks: updatedExam.totalMarks,
      passingMarks: updatedExam.passingMarks,
      price: updatedExam.price,
      originalPrice: updatedExam.originalPrice,
      isFree: updatedExam.isFree,
      startDate: updatedExam.startDate,
      endDate: updatedExam.endDate,
      instructions: updatedExam.instructions,
      isPublished: updatedExam.isPublished,
      showResultsImmediately: updatedExam.showResultsImmediately,
      allowReview: updatedExam.allowReview,
      tags: updatedExam.tags,
      category: updatedExam.category,
      updatedAt: updatedExam.updatedAt,
    },
  });
});

// DELETE handler - Delete exam
const deleteHandler = createApiRoute({
  requireAuth: true,
  validation: {
    params: examParamsSchema,
  },
});

export const DELETE = deleteHandler(async (request, { params }) => {
  const { id } = params!;
  const user = request.user!;

  // Get the exam to check ownership
  const exam = await prisma.exam.findUnique({
    where: { id },
    include: {
      _count: {
        select: { attempts: true },
      },
    },
  });

  if (!exam) {
    return sendError('Exam not found', 404);
  }

  // Check permissions
  if (user.role !== 'ADMIN' && user.id !== exam.createdBy) {
    return sendError('You do not have permission to delete this exam', 403);
  }

  // Check if exam has attempts
  if (exam._count.attempts > 0) {
    return sendError('Cannot delete exam with existing attempts', 409);
  }

  // Delete exam
  await prisma.exam.delete({
    where: { id },
  });

  return sendSuccess({
    message: 'Exam deleted successfully',
  });
});