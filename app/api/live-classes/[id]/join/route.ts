/**
 * Live Class Join API Route
 * 
 * Handles joining and leaving live classes.
 */

import { z } from 'zod';
import { createApiRoute, sendSuccess, sendError } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';

// Params validation schema
const joinParamsSchema = z.object({
  id: z.string().uuid('Invalid live class ID'),
});

// POST handler - Join live class
const postHandler = createApiRoute({
  requireAuth: true,
  validation: {
    params: joinParamsSchema,
  },
});

export const POST = postHandler(async (request, { params }) => {
  const { id: liveClassId } = params!;
  const user = request.user!;

  // Get the live class
  const liveClass = await prisma.liveClass.findUnique({
    where: { id: liveClassId },
    include: {
      _count: {
        select: { attendees: true },
      },
    },
  });

  if (!liveClass) {
    return sendError('Live class not found', 404);
  }

  // Check if class is available for joining
  if (!liveClass.isPublic && user.id !== liveClass.instructorId) {
    return sendError('This is a private class', 403);
  }

  if (liveClass.status === 'CANCELLED') {
    return sendError('This class has been cancelled', 400);
  }

  if (liveClass.status === 'COMPLETED') {
    return sendError('This class has already completed', 400);
  }

  // Check timing - allow joining 15 minutes before start time
  const now = new Date();
  const joinAllowedTime = new Date(liveClass.startTime.getTime() - 15 * 60 * 1000);
  
  if (now < joinAllowedTime) {
    return sendError('Class has not started yet. You can join 15 minutes before start time.', 400);
  }

  // Check if class has ended (2 hours after scheduled end time)
  const classEndTime = new Date(liveClass.endTime.getTime() + 2 * 60 * 60 * 1000);
  if (now > classEndTime) {
    return sendError('This class has ended', 400);
  }

  // Check max attendees limit
  if (liveClass.maxAttendees && liveClass._count.attendees >= liveClass.maxAttendees) {
    return sendError('Class is full', 409);
  }

  // Check if user is already in the class
  const existingAttendance = await prisma.liveClassAttendance.findUnique({
    where: {
      userId_liveClassId: {
        userId: user.id,
        liveClassId,
      },
    },
  });

  if (existingAttendance && !existingAttendance.leftAt) {
    return sendSuccess({
      message: 'Already joined the class',
      meetingUrl: liveClass.meetingUrl,
      meetingId: liveClass.meetingId,
      meetingPassword: liveClass.meetingPassword,
      joinedAt: existingAttendance.joinedAt,
    });
  }

  // Create or update attendance record
  const attendance = await prisma.liveClassAttendance.upsert({
    where: {
      userId_liveClassId: {
        userId: user.id,
        liveClassId,
      },
    },
    update: {
      joinedAt: new Date(),
      leftAt: null,
    },
    create: {
      userId: user.id,
      liveClassId,
      joinedAt: new Date(),
    },
  });

  // Update class status to LIVE if it's the first attendee and time is appropriate
  if (liveClass.status === 'SCHEDULED' && now >= liveClass.startTime) {
    await prisma.liveClass.update({
      where: { id: liveClassId },
      data: { status: 'LIVE' },
    });
  }

  return sendSuccess({
    message: 'Successfully joined the class',
    attendance: {
      id: attendance.id,
      joinedAt: attendance.joinedAt,
    },
    meetingUrl: liveClass.meetingUrl,
    meetingId: liveClass.meetingId,
    meetingPassword: liveClass.meetingPassword,
    classInfo: {
      title: liveClass.title,
      subject: liveClass.subject,
      startTime: liveClass.startTime,
      endTime: liveClass.endTime,
    },
  });
});

// DELETE handler - Leave live class
const deleteHandler = createApiRoute({
  requireAuth: true,
  validation: {
    params: joinParamsSchema,
  },
});

export const DELETE = deleteHandler(async (request, { params }) => {
  const { id: liveClassId } = params!;
  const user = request.user!;

  // Check if user is in the class
  const attendance = await prisma.liveClassAttendance.findUnique({
    where: {
      userId_liveClassId: {
        userId: user.id,
        liveClassId,
      },
    },
  });

  if (!attendance || attendance.leftAt) {
    return sendError('You are not currently in this class', 400);
  }

  // Calculate duration
  const now = new Date();
  const duration = Math.floor((now.getTime() - attendance.joinedAt.getTime()) / 1000); // in seconds

  // Update attendance record
  await prisma.liveClassAttendance.update({
    where: {
      userId_liveClassId: {
        userId: user.id,
        liveClassId,
      },
    },
    data: {
      leftAt: now,
      duration,
    },
  });

  return sendSuccess({
    message: 'Successfully left the class',
    attendance: {
      joinedAt: attendance.joinedAt,
      leftAt: now,
      duration,
    },
  });
});