/**
 * Exam Attempt API Route
 * 
 * Handles starting, submitting, and managing exam attempts.
 */

import { z } from 'zod';
import { createApiRoute, sendSuccess, sendError } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';

// Params validation schema
const attemptParamsSchema = z.object({
  id: z.string().uuid('Invalid exam ID'),
});

// Submit attempt schema
const submitAttemptSchema = z.object({
  answers: z.array(z.object({
    questionId: z.string().uuid('Invalid question ID'),
    userAnswer: z.any(), // Can be string, array, or object depending on question type
    timeTaken: z.number().min(0, 'Time taken must be non-negative'),
    isMarked: z.boolean().default(false),
  })),
});

// POST handler - Start exam attempt
const postHandler = createApiRoute({
  requireAuth: true,
  validation: {
    params: attemptParamsSchema,
  },
});

export const POST = postHandler(async (request, context) => {
  const { id: examId } = context?.params || {};
  
  if (!examId) {
    return sendError('Exam ID is required', 400);
  }
  const user = request.user!;

  // Get the exam with its test series
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      testSeries: {
        include: {
          questions: {
            select: {
              id: true,
              title: true,
              questionText: true,
              type: true,
              options: true,
              marks: true,
              negativeMarks: true,
              difficulty: true,
            },
          },
        },
      },
    },
  });

  if (!exam) {
    return sendError('Exam not found', 404);
  }

  if (!exam.isPublished) {
    return sendError('Exam is not available', 400);
  }

  // Get the first available test series for this exam
  const testSeries = exam.testSeries?.[0];
  if (!testSeries) {
    return sendError('No test series available for this exam', 400);
  }

  // Check date availability
  const now = new Date();
  
  if (exam.startDate && exam.startDate > now) {
    return sendError('Exam has not started yet', 400);
  }
  
  if (exam.endDate && exam.endDate < now) {
    return sendError('Exam has ended', 400);
  }

  // Check if user already has an active attempt
  const activeAttempt = await prisma.testAttempt.findFirst({
    where: {
      userId: user.id,
      testSeriesId: testSeries.id,
      completedAt: null,
    },
  });

  if (activeAttempt) {
    // Return existing active attempt
    return sendSuccess({
      attempt: {
        id: activeAttempt.id,
        testSeriesId: activeAttempt.testSeriesId,
        startedAt: activeAttempt.startedAt,
        endTime: new Date(activeAttempt.startedAt.getTime() + testSeries.duration * 60 * 1000),
        questions: testSeries.questions,
      },
    });
  }

  // For paid exams, check if user has access
  if (!exam.isFree) {
    // TODO: Implement payment/subscription validation
    // For now, we'll allow access for testing
  }

  // Create new attempt
  const attempt = await prisma.testAttempt.create({
    data: {
      userId: user.id,
      testSeriesId: testSeries.id,
      startedAt: new Date(),
    },
  });

  return sendSuccess({
    attempt: {
      id: attempt.id,
      testSeriesId: attempt.testSeriesId,
      startedAt: attempt.startedAt,
      endTime: new Date(attempt.startedAt.getTime() + testSeries.duration * 60 * 1000),
      questions: testSeries.questions,
    },
  }, undefined, 201);
});

// PUT handler - Submit exam attempt
const putHandler = createApiRoute({
  requireAuth: true,
  validation: {
    params: attemptParamsSchema,
    body: submitAttemptSchema,
  },
});

export const PUT = putHandler(async (request, context) => {
  const { id: examId } = context?.params || {};
  
  if (!examId) {
    return sendError('Exam ID is required', 400);
  }
  const { answers } = request.body!;
  const user = request.user!;

  // First get the exam to find its test series
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      testSeries: {
        include: {
          questions: true,
        },
      },
    },
  });

  if (!exam || !exam.testSeries?.[0]) {
    return sendError('Exam or test series not found', 404);
  }

  const testSeries = exam.testSeries[0];

  // Get the active attempt
  const attempt = await prisma.testAttempt.findFirst({
    where: {
      userId: user.id,
      testSeriesId: testSeries.id,
      completedAt: null,
    },
  });

  if (!attempt) {
    return sendError('No active attempt found', 404);
  }

  // Check if exam time has expired
  const endTime = new Date(attempt.startedAt.getTime() + testSeries.duration * 60 * 1000);
  const now = new Date();
  
  if (now > endTime) {
    return sendError('Exam time has expired', 400);
  }

  // Calculate score
  let totalScore = 0;
  let correctAnswers = 0;
  let incorrectAnswers = 0;
  let skippedAnswers = 0;

  const questionAnswers = [];

  for (const answer of answers) {
    const question = testSeries.questions.find(q => q.id === answer.questionId);
    
    if (!question) {
      continue;
    }

    let isCorrect = false;
    let isSkipped = false;
    let score = 0;

    // Check if answer is provided
    if (!answer.userAnswer || 
        (Array.isArray(answer.userAnswer) && answer.userAnswer.length === 0) ||
        answer.userAnswer === '') {
      isSkipped = true;
      skippedAnswers++;
    } else {
      // Compare with correct answer based on question type
      if (question.type === 'MULTIPLE_CHOICE' || question.type === 'SINGLE_CHOICE') {
        isCorrect = answer.userAnswer === question.correctAnswer;
      } else if (question.type === 'TRUE_FALSE') {
        isCorrect = answer.userAnswer === question.correctAnswer;
      } else if (question.type === 'NUMERICAL') {
        const userAnswerStr = String(answer.userAnswer);
        const correctAnswerStr = String(question.correctAnswer);
        isCorrect = parseFloat(userAnswerStr) === parseFloat(correctAnswerStr);
      }

      if (isCorrect) {
        score = Number(question.marks);
        correctAnswers++;
      } else {
        score = -Number(question.negativeMarks);
        incorrectAnswers++;
      }
    }

    totalScore += score;

    // Store question attempt
    questionAnswers.push({
      questionId: question.id,
      userAnswer: answer.userAnswer,
      isCorrect,
      isSkipped,
      isMarked: answer.isMarked,
      timeTaken: answer.timeTaken,
      marksAwarded: score,
    });
  }

  const percentage = (totalScore / testSeries.totalMarks) * 100;
  const isPassed = totalScore >= testSeries.passingMarks;

  // Update attempt with results
  const completedAttempt = await prisma.testAttempt.update({
    where: { id: attempt.id },
    data: {
      completedAt: new Date(),
      score: totalScore,
      percentage,
      isPassed,
      correctAnswers,
      incorrectAnswers,
      skippedQuestions: skippedAnswers,
    },
  });

  // Create question attempts
  await prisma.questionAttempt.createMany({
    data: questionAnswers.map(qa => ({
      testAttemptId: attempt.id,
      ...qa,
    })),
  });

  return sendSuccess({
    result: {
      attemptId: completedAttempt.id,
      score: totalScore,
      totalMarks: testSeries.totalMarks,
      percentage,
      isPassed,
      correctAnswers,
      incorrectAnswers,
      skippedAnswers,
      timeTaken: Math.floor((now.getTime() - attempt.startedAt.getTime()) / 1000),
      completedAt: completedAttempt.completedAt,
    },
  });
});