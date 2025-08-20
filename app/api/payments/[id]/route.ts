/**
 * Individual Payment API Route
 * 
 * Handles getting and updating individual payments.
 */

import { z } from 'zod';
import { createApiRoute, sendSuccess, sendError } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';

// Params validation schema
const paymentParamsSchema = z.object({
  id: z.string().uuid('Invalid payment ID'),
});

// Update payment schema (for webhook/admin updates)
const updatePaymentSchema = z.object({
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED']),
  gatewayPaymentId: z.string().optional(),
  gatewayOrderId: z.string().optional(),
  gatewaySignature: z.string().optional(),
  failureReason: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

// GET handler - Get single payment
const getHandler = createApiRoute({
  requireAuth: true,
  validation: {
    params: paymentParamsSchema,
  },
});

export const GET = getHandler(async (request, { params }) => {
  const { id } = params!;
  const user = request.user!;

  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  });

  if (!payment) {
    return sendError('Payment not found', 404);
  }

  // Check permissions - users can only view their own payments, admins can view all
  if (payment.userId !== user.id && user.role !== 'ADMIN') {
    return sendError('You do not have permission to view this payment', 403);
  }

  return sendSuccess({
    payment: {
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
      gatewaySignature: payment.gatewaySignature,
      failureReason: payment.failureReason,
      metadata: payment.metadata,
      user: payment.user,
      createdAt: payment.createdAt,
      completedAt: payment.completedAt,
    },
  });
});

// PUT handler - Update payment (for webhooks and admin)
const putHandler = createApiRoute({
  validation: {
    params: paymentParamsSchema,
    body: updatePaymentSchema,
  },
});

export const PUT = putHandler(async (request, { params }) => {
  const { id } = params!;
  const updateData = request.body!;

  // For webhook calls, we don't require authentication
  // For admin calls, we require authentication and admin role
  if (request.user && request.user.role !== 'ADMIN') {
    return sendError('You do not have permission to update payments', 403);
  }

  const payment = await prisma.payment.findUnique({
    where: { id },
  });

  if (!payment) {
    return sendError('Payment not found', 404);
  }

  // Prepare update data
  const updateDataWithCompletion = {
    ...updateData,
    ...(updateData.status === 'COMPLETED' && !payment.completedAt && {
      completedAt: new Date(),
    }),
  };

  // Update payment
  const updatedPayment = await prisma.payment.update({
    where: { id },
    data: updateDataWithCompletion,
  });

  // Handle post-payment actions for completed payments
  if (updateData.status === 'COMPLETED' && payment.status !== 'COMPLETED') {
    await handlePaymentCompletion(updatedPayment);
  }

  return sendSuccess({
    payment: {
      id: updatedPayment.id,
      type: updatedPayment.type,
      itemId: updatedPayment.itemId,
      amount: updatedPayment.amount,
      currency: updatedPayment.currency,
      status: updatedPayment.status,
      paymentMethod: updatedPayment.paymentMethod,
      transactionId: updatedPayment.transactionId,
      gatewayPaymentId: updatedPayment.gatewayPaymentId,
      gatewayOrderId: updatedPayment.gatewayOrderId,
      gatewaySignature: updatedPayment.gatewaySignature,
      failureReason: updatedPayment.failureReason,
      metadata: updatedPayment.metadata,
      completedAt: updatedPayment.completedAt,
      updatedAt: updatedPayment.updatedAt,
    },
  });
});

// Handle actions after successful payment
async function handlePaymentCompletion(payment: any) {
  try {
    if (payment.type === 'COURSE_PURCHASE') {
      // Enroll user in course
      await prisma.courseEnrollment.create({
        data: {
          userId: payment.userId,
          courseId: payment.itemId,
          enrolledAt: new Date(),
        },
      });
    } else if (payment.type === 'EXAM_PURCHASE') {
      // Grant access to exam (this might be handled differently in your system)
      // For now, we'll just log it
      console.log(`User ${payment.userId} purchased exam ${payment.itemId}`);
    } else if (payment.type === 'SUBSCRIPTION') {
      // Create or update subscription
      await prisma.subscription.upsert({
        where: { userId: payment.userId },
        update: {
          status: 'ACTIVE',
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
        create: {
          userId: payment.userId,
          planName: 'Premium Plan',
          planType: 'MONTHLY',
          status: 'ACTIVE',
          amount: payment.amount,
          currency: payment.currency,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          features: [],
          limits: {},
        },
      });
    }

    // TODO: Send confirmation email
    // TODO: Send push notification
    // TODO: Update analytics
  } catch (error) {
    console.error('Error handling payment completion:', error);
    // Don't throw error as payment is already completed
  }
}