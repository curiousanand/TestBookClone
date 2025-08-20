/**
 * Individual User API Route
 * 
 * Handles getting, updating, and managing individual users.
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createApiRoute, sendSuccess, sendError } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';

// Params validation schema
const userParamsSchema = z.object({
  id: z.string().uuid('Invalid user ID'),
});

// Update user schema
const updateUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  phone: z.string().optional(),
  avatar: z.string().url('Invalid avatar URL').optional(),
  bio: z.string().optional(),
  dateOfBirth: z.string().datetime('Invalid date of birth').optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  role: z.enum(['STUDENT', 'INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION']).optional(),
});

// GET handler - Get single user
const getHandler = createApiRoute({
  requireAuth: true,
  validation: {
    params: userParamsSchema,
  },
});

export const GET = getHandler(async (request, { params }) => {
  const { id } = params!;
  const currentUser = request.user!;

  // Check permissions - users can view their own profile, admins can view all
  if (currentUser.id !== id && currentUser.role !== 'ADMIN') {
    return sendError('You do not have permission to view this profile', 403);
  }

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          courseEnrollments: true,
          testAttempts: true,
          coursesCreated: true,
          examsCreated: true,
        },
      },
      courseEnrollments: {
        include: {
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
              thumbnail: true,
              level: true,
            },
          },
        },
        orderBy: { enrolledAt: 'desc' },
        take: 5, // Recent enrollments
      },
      testAttempts: {
        include: {
          exam: {
            select: {
              id: true,
              title: true,
              slug: true,
              type: true,
            },
          },
        },
        orderBy: { startedAt: 'desc' },
        take: 5, // Recent attempts
      },
    },
  });

  if (!user) {
    return sendError('User not found', 404);
  }

  return sendSuccess({
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      bio: user.bio,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      stats: {
        enrollmentCount: user._count.courseEnrollments,
        testAttemptCount: user._count.testAttempts,
        coursesCreatedCount: user._count.coursesCreated,
        examsCreatedCount: user._count.examsCreated,
      },
      recentEnrollments: user.courseEnrollments.map(enrollment => ({
        id: enrollment.id,
        enrolledAt: enrollment.enrolledAt,
        course: enrollment.course,
      })),
      recentTestAttempts: user.testAttempts.map(attempt => ({
        id: attempt.id,
        score: attempt.score,
        percentage: attempt.percentage,
        startedAt: attempt.startedAt,
        completedAt: attempt.completedAt,
        exam: attempt.exam,
      })),
      createdAt: user.createdAt,
      lastActiveAt: user.lastActiveAt,
    },
  });
});

// PUT handler - Update user
const putHandler = createApiRoute({
  requireAuth: true,
  validation: {
    params: userParamsSchema,
    body: updateUserSchema,
  },
});

export const PUT = putHandler(async (request, { params }) => {
  const { id } = params!;
  const updateData = request.body!;
  const currentUser = request.user!;

  // Check permissions
  const canUpdate = currentUser.id === id || currentUser.role === 'ADMIN';
  if (!canUpdate) {
    return sendError('You do not have permission to update this profile', 403);
  }

  // Only admins can update role and status
  if ((updateData.role || updateData.status) && currentUser.role !== 'ADMIN') {
    return sendError('You do not have permission to update role or status', 403);
  }

  // Get the user to check if it exists
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    return sendError('User not found', 404);
  }

  // Prepare update data
  const updateDataWithFullName = {
    ...updateData,
    ...(updateData.dateOfBirth && { dateOfBirth: new Date(updateData.dateOfBirth) }),
  };

  // Update fullName if firstName or lastName is being updated
  if (updateData.firstName || updateData.lastName) {
    const firstName = updateData.firstName || user.firstName;
    const lastName = updateData.lastName || user.lastName;
    updateDataWithFullName.fullName = `${firstName} ${lastName}`.trim();
  }

  // Update user
  const updatedUser = await prisma.user.update({
    where: { id },
    data: updateDataWithFullName,
  });

  return sendSuccess({
    user: {
      id: updatedUser.id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      phone: updatedUser.phone,
      avatar: updatedUser.avatar,
      bio: updatedUser.bio,
      dateOfBirth: updatedUser.dateOfBirth,
      gender: updatedUser.gender,
      role: updatedUser.role,
      status: updatedUser.status,
      emailVerified: updatedUser.emailVerified,
      phoneVerified: updatedUser.phoneVerified,
      updatedAt: updatedUser.updatedAt,
    },
  });
});

// DELETE handler - Delete user (Admin only)
const deleteHandler = createApiRoute({
  requireAuth: true,
  requiredRole: 'ADMIN',
  validation: {
    params: userParamsSchema,
  },
});

export const DELETE = deleteHandler(async (request, { params }) => {
  const { id } = params!;
  const currentUser = request.user!;

  // Prevent self-deletion
  if (currentUser.id === id) {
    return sendError('You cannot delete your own account', 400);
  }

  // Get the user to check if it exists
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          courseEnrollments: true,
          testAttempts: true,
          coursesCreated: true,
          examsCreated: true,
        },
      },
    },
  });

  if (!user) {
    return sendError('User not found', 404);
  }

  // Check if user has created content
  if (user._count.coursesCreated > 0 || user._count.examsCreated > 0) {
    return sendError('Cannot delete user who has created courses or exams', 409);
  }

  // Soft delete by suspending the account instead of hard delete
  await prisma.user.update({
    where: { id },
    data: {
      status: 'SUSPENDED',
      email: `deleted_${Date.now()}_${user.email}`,
      fullName: 'Deleted User',
    },
  });

  return sendSuccess({
    message: 'User account has been suspended',
  });
});