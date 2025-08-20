/**
 * Individual Live Class API Route
 * 
 * Handles getting, updating, and managing individual live classes.
 */

import { z } from 'zod';
import { createApiRoute, sendSuccess, sendError } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';

// Params validation schema
const liveClassParamsSchema = z.object({
  id: z.string().uuid('Invalid live class ID'),
});

// Update live class schema
const updateLiveClassSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').optional(),
  description: z.string().min(10, 'Description must be at least 10 characters').optional(),
  subject: z.string().min(2, 'Subject is required').optional(),
  startTime: z.string().datetime('Invalid start time').optional(),
  duration: z.number().min(15, 'Duration must be at least 15 minutes').optional(),
  maxAttendees: z.number().min(1, 'Max attendees must be at least 1').optional(),
  meetingUrl: z.string().url('Invalid meeting URL').optional(),
  meetingPassword: z.string().optional(),
  recordingEnabled: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  status: z.enum(['SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED']).optional(),
  tags: z.array(z.string()).optional(),
});

// GET handler - Get single live class
const getHandler = createApiRoute({
  validation: {
    params: liveClassParamsSchema,
  },
});

export const GET = getHandler(async (request, { params }) => {
  const { id } = params!;

  const liveClass = await prisma.liveClass.findUnique({
    where: { id },
    include: {
      instructor: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
          bio: true,
        },
      },
      attendees: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              avatar: true,
            },
          },
        },
        orderBy: { joinedAt: 'asc' },
      },
      _count: {
        select: {
          attendees: true,
        },
      },
    },
  });

  if (!liveClass) {
    return sendError('Live class not found', 404);
  }

  // Check if user can access this class
  if (!liveClass.isPublic && (!request.user || 
      (request.user.role !== 'ADMIN' && request.user.id !== liveClass.instructorId))) {
    return sendError('You do not have permission to view this class', 403);
  }

  // Check if user is enrolled
  let userAttendance = null;
  if (request.user) {
    userAttendance = await prisma.liveClassAttendance.findUnique({
      where: {
        userId_liveClassId: {
          userId: request.user.id,
          liveClassId: liveClass.id,
        },
      },
    });
  }

  return sendSuccess({
    liveClass: {
      id: liveClass.id,
      title: liveClass.title,
      description: liveClass.description,
      subject: liveClass.subject,
      startTime: liveClass.startTime,
      endTime: liveClass.endTime,
      duration: liveClass.duration,
      status: liveClass.status,
      maxAttendees: liveClass.maxAttendees,
      currentAttendees: liveClass._count.attendees,
      meetingId: liveClass.meetingId,
      // Only show meeting URL/password to enrolled users or instructor
      ...(userAttendance || (request.user && request.user.id === liveClass.instructorId) ? {
        meetingUrl: liveClass.meetingUrl,
        meetingPassword: liveClass.meetingPassword,
      } : {}),
      recordingUrl: liveClass.recordingUrl,
      recordingEnabled: liveClass.recordingEnabled,
      isPublic: liveClass.isPublic,
      tags: liveClass.tags,
      instructor: liveClass.instructor,
      attendees: liveClass.attendees.map(attendance => ({
        user: attendance.user,
        joinedAt: attendance.joinedAt,
        leftAt: attendance.leftAt,
        duration: attendance.duration,
      })),
      userAttendance: userAttendance ? {
        joinedAt: userAttendance.joinedAt,
        leftAt: userAttendance.leftAt,
        duration: userAttendance.duration,
      } : null,
      createdAt: liveClass.createdAt,
      updatedAt: liveClass.updatedAt,
    },
  });
});

// PUT handler - Update live class
const putHandler = createApiRoute({
  requireAuth: true,
  validation: {
    params: liveClassParamsSchema,
    body: updateLiveClassSchema,
  },
});

export const PUT = putHandler(async (request, { params }) => {
  const { id } = params!;
  const updateData = request.body!;
  const user = request.user!;

  // Get the live class to check ownership
  const liveClass = await prisma.liveClass.findUnique({
    where: { id },
  });

  if (!liveClass) {
    return sendError('Live class not found', 404);
  }

  // Check permissions
  if (user.role !== 'ADMIN' && user.id !== liveClass.instructorId) {
    return sendError('You do not have permission to update this class', 403);
  }

  // Validate timing changes
  if (updateData.startTime || updateData.duration) {
    const newStartTime = updateData.startTime ? new Date(updateData.startTime) : liveClass.startTime;
    const newDuration = updateData.duration ?? liveClass.duration;
    const newEndTime = new Date(newStartTime.getTime() + newDuration * 60 * 1000);
    const now = new Date();

    // Can't change timing if class is live or completed
    if (liveClass.status === 'LIVE' || liveClass.status === 'COMPLETED') {
      return sendError('Cannot modify timing of live or completed classes', 400);
    }

    // Start time must be in the future
    if (newStartTime <= now) {
      return sendError('Start time must be in the future', 400);
    }

    // Check for conflicts with other classes
    const overlappingClass = await prisma.liveClass.findFirst({
      where: {
        id: { not: id },
        instructorId: user.id,
        status: { in: ['SCHEDULED', 'LIVE'] },
        OR: [
          {
            startTime: { lte: newStartTime },
            endTime: { gt: newStartTime },
          },
          {
            startTime: { lt: newEndTime },
            endTime: { gte: newEndTime },
          },
          {
            startTime: { gte: newStartTime },
            endTime: { lte: newEndTime },
          },
        ],
      },
    });

    if (overlappingClass) {
      return sendError('You have a conflicting class scheduled at this time', 409);
    }

    // Add calculated endTime to update data
    updateData.endTime = newEndTime;
  }

  // Update live class
  const updatedClass = await prisma.liveClass.update({
    where: { id },
    data: {
      ...updateData,
      ...(updateData.startTime && { startTime: new Date(updateData.startTime) }),
    },
    include: {
      instructor: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
          bio: true,
        },
      },
    },
  });

  return sendSuccess({
    liveClass: {
      id: updatedClass.id,
      title: updatedClass.title,
      description: updatedClass.description,
      subject: updatedClass.subject,
      startTime: updatedClass.startTime,
      endTime: updatedClass.endTime,
      duration: updatedClass.duration,
      status: updatedClass.status,
      maxAttendees: updatedClass.maxAttendees,
      meetingId: updatedClass.meetingId,
      meetingUrl: updatedClass.meetingUrl,
      meetingPassword: updatedClass.meetingPassword,
      recordingUrl: updatedClass.recordingUrl,
      recordingEnabled: updatedClass.recordingEnabled,
      isPublic: updatedClass.isPublic,
      tags: updatedClass.tags,
      instructor: updatedClass.instructor,
      updatedAt: updatedClass.updatedAt,
    },
  });
});

// DELETE handler - Delete live class
const deleteHandler = createApiRoute({
  requireAuth: true,
  validation: {
    params: liveClassParamsSchema,
  },
});

export const DELETE = deleteHandler(async (request, { params }) => {
  const { id } = params!;
  const user = request.user!;

  // Get the live class to check ownership
  const liveClass = await prisma.liveClass.findUnique({
    where: { id },
    include: {
      _count: {
        select: { attendees: true },
      },
    },
  });

  if (!liveClass) {
    return sendError('Live class not found', 404);
  }

  // Check permissions
  if (user.role !== 'ADMIN' && user.id !== liveClass.instructorId) {
    return sendError('You do not have permission to delete this class', 403);
  }

  // Can't delete live or completed classes with attendees
  if ((liveClass.status === 'LIVE' || liveClass.status === 'COMPLETED') && 
      liveClass._count.attendees > 0) {
    return sendError('Cannot delete live or completed classes with attendees', 409);
  }

  // Delete live class
  await prisma.liveClass.delete({
    where: { id },
  });

  return sendSuccess({
    message: 'Live class deleted successfully',
  });
});