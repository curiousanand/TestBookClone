/**
 * Payments API Route
 * 
 * Handles payment creation, listing, and management.
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createApiRoute, sendSuccess, sendError, parsePagination, createPaginationMeta } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';

// Query validation schema
const paymentsQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED']).optional(),
  type: z.enum(['COURSE_PURCHASE', 'EXAM_PURCHASE', 'SUBSCRIPTION']).optional(),
  sortBy: z.enum(['amount', 'createdAt', 'status']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Create payment schema
const createPaymentSchema = z.object({
  type: z.enum(['COURSE_PURCHASE', 'EXAM_PURCHASE', 'SUBSCRIPTION']),
  itemId: z.string().uuid('Invalid item ID'), // Course ID, Exam ID, or Subscription Plan ID
  amount: z.number().min(0, 'Amount must be non-negative'),
  currency: z.string().length(3, 'Currency must be 3 characters').default('INR'),
  paymentMethod: z.enum(['RAZORPAY', 'STRIPE', 'PAYTM', 'UPI']).default('RAZORPAY'),
});

// GET handler - List payments for user
const getHandler = createApiRoute({
  requireAuth: true,
  validation: {
    query: paymentsQuerySchema,
  },
});

export const GET = getHandler(async (request) => {
  const query = request.query!;
  const user = request.user!;
  const { skip, take, orderBy } = parsePagination(query);

  // Build filters
  const where: any = {
    userId: user.id,
  };

  if (query.status) {
    where.status = query.status;
  }

  if (query.type) {
    where.type = query.type;
  }

  // Get payments with count
  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    }),
    prisma.payment.count({ where }),
  ]);

  return sendSuccess(
    payments.map((payment) => ({
      id: payment.id,
      type: payment.type,
      itemId: payment.itemId,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      paymentMethod: payment.paymentMethod,
      transactionId: payment.transactionId,
      gatewayPaymentId: payment.gatewayPaymentId,
      gatewayOrderId: payment.gatewayOrderId,
      metadata: payment.metadata,
      createdAt: payment.createdAt,
      completedAt: payment.completedAt,
    })),
    createPaginationMeta(
      parseInt(query.page || '1'),
      take,
      total
    )
  );
});

// POST handler - Create payment
const postHandler = createApiRoute({
  requireAuth: true,
  validation: {
    body: createPaymentSchema,
  },
});

export const POST = postHandler(async (request) => {
  const paymentData = request.body!;
  const user = request.user!;

  // Validate the item exists and get its details
  let itemName = '';
  let actualAmount = 0;

  if (paymentData.type === 'COURSE_PURCHASE') {
    const course = await prisma.course.findUnique({
      where: { id: paymentData.itemId },
    });

    if (!course) {
      return sendError('Course not found', 404);
    }

    if (course.isFree) {
      return sendError('Cannot create payment for free course', 400);
    }

    // Check if user is already enrolled
    const existingEnrollment = await prisma.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: course.id,
        },
      },
    });

    if (existingEnrollment) {
      return sendError('Already enrolled in this course', 409);
    }

    itemName = course.title;
    actualAmount = course.price;
  } else if (paymentData.type === 'EXAM_PURCHASE') {
    const exam = await prisma.exam.findUnique({
      where: { id: paymentData.itemId },
    });

    if (!exam) {
      return sendError('Exam not found', 404);
    }

    if (exam.isFree) {
      return sendError('Cannot create payment for free exam', 400);
    }

    itemName = exam.title;
    actualAmount = exam.price;
  } else if (paymentData.type === 'SUBSCRIPTION') {
    // TODO: Implement subscription plan validation
    // For now, use the provided amount
    itemName = 'Subscription Plan';
    actualAmount = paymentData.amount;
  }

  // Validate amount matches item price
  if (paymentData.amount !== actualAmount) {
    return sendError('Payment amount does not match item price', 400);
  }

  // Generate transaction ID
  const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Create payment record
  const payment = await prisma.payment.create({
    data: {
      userId: user.id,
      type: paymentData.type,
      itemId: paymentData.itemId,
      amount: paymentData.amount,
      currency: paymentData.currency,
      paymentMethod: paymentData.paymentMethod,
      transactionId,
      status: 'PENDING',
      metadata: {
        itemName,
        userEmail: user.email,
        userName: user.name,
      },
    },
  });

  // TODO: Integrate with actual payment gateway (Razorpay, Stripe, etc.)
  // For now, we'll return the payment details for frontend integration

  return sendSuccess({
    payment: {
      id: payment.id,
      transactionId: payment.transactionId,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      // Gateway-specific data would be added here
      gatewayData: {
        // This would contain actual gateway order/session data
        orderIdPlaceholder: `ORDER_${payment.id}`,
      },
    },
    // Instructions for frontend
    nextSteps: {
      redirectToGateway: true,
      gatewayUrl: `/payments/${payment.id}/gateway`,
    },
  }, undefined, 201);
});