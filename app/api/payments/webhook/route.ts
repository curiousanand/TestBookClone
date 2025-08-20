/**
 * Payment Webhook API Route
 * 
 * Handles webhook notifications from payment gateways.
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createApiRoute, sendSuccess, sendError } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// Razorpay webhook schema
const razorpayWebhookSchema = z.object({
  event: z.string(),
  payload: z.object({
    payment: z.object({
      entity: z.object({
        id: z.string(),
        order_id: z.string(),
        status: z.string(),
        amount: z.number(),
        currency: z.string(),
        description: z.string().optional(),
        notes: z.record(z.string()).optional(),
      }),
    }),
  }),
});

// POST handler - Handle webhook
const postHandler = createApiRoute({
  rateLimit: {
    requests: 100,
    windowMs: 60 * 1000, // 1 minute
  },
});

export const POST = postHandler(async (request) => {
  const body = await request.text();
  const signature = request.headers.get('x-razorpay-signature');
  
  // Verify webhook signature (for Razorpay)
  if (!verifyRazorpaySignature(body, signature)) {
    return sendError('Invalid webhook signature', 401);
  }

  try {
    const webhookData = JSON.parse(body);
    const validatedData = razorpayWebhookSchema.parse(webhookData);

    const { event, payload } = validatedData;
    const paymentData = payload.payment.entity;

    // Find payment by gateway order ID
    const payment = await prisma.payment.findFirst({
      where: {
        gatewayOrderId: paymentData.order_id,
      },
    });

    if (!payment) {
      console.warn(`Payment not found for order ID: ${paymentData.order_id}`);
      return sendSuccess({ message: 'Payment not found, but webhook acknowledged' });
    }

    // Handle different event types
    let newStatus: string;
    let failureReason: string | undefined;

    switch (event) {
      case 'payment.captured':
        newStatus = 'COMPLETED';
        break;
      case 'payment.failed':
        newStatus = 'FAILED';
        failureReason = `Payment failed: ${paymentData.status}`;
        break;
      case 'payment.authorized':
        // For auto-capture, this might be treated as pending
        newStatus = 'PENDING';
        break;
      default:
        console.warn(`Unhandled webhook event: ${event}`);
        return sendSuccess({ message: 'Event acknowledged but not processed' });
    }

    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: newStatus,
        gatewayPaymentId: paymentData.id,
        gatewayOrderId: paymentData.order_id,
        failureReason,
        completedAt: newStatus === 'COMPLETED' ? new Date() : undefined,
        metadata: {
          ...payment.metadata,
          webhookEvent: event,
          gatewayResponse: paymentData,
        },
      },
    });

    // Handle post-payment actions for completed payments
    if (newStatus === 'COMPLETED' && payment.status !== 'COMPLETED') {
      await handlePaymentCompletion(updatedPayment);
    }

    return sendSuccess({
      message: 'Webhook processed successfully',
      paymentId: payment.id,
      newStatus,
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return sendError('Webhook processing failed', 500);
  }
});

// Verify Razorpay webhook signature
function verifyRazorpaySignature(body: string, signature: string | null): boolean {
  if (!signature) {
    return false;
  }

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('RAZORPAY_WEBHOOK_SECRET not configured');
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(body)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// Handle actions after successful payment
async function handlePaymentCompletion(payment: any) {
  try {
    if (payment.type === 'COURSE_PURCHASE') {
      // Enroll user in course
      await prisma.courseEnrollment.upsert({
        where: {
          userId_courseId: {
            userId: payment.userId,
            courseId: payment.itemId,
          },
        },
        update: {},
        create: {
          userId: payment.userId,
          courseId: payment.itemId,
          enrolledAt: new Date(),
        },
      });
    } else if (payment.type === 'EXAM_PURCHASE') {
      // Grant access to exam
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
    
    console.log(`Payment ${payment.id} completed successfully via webhook`);
  } catch (error) {
    console.error('Error handling payment completion in webhook:', error);
    // Don't throw error as payment webhook should still be acknowledged
  }
}