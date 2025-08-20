/**
 * Live Classes API Route
 * 
 * Handles live class listing, creation, and management.
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createApiRoute, sendSuccess, parsePagination, createPaginationMeta } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';

// Query validation schema
const liveClassesQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  subject: z.string().optional(),
  status: z.enum(['SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED']).optional(),
  startDate: z.string().datetime('Invalid start date').optional(),
  endDate: z.string().datetime('Invalid end date').optional(),
  instructorId: z.string().uuid('Invalid instructor ID').optional(),
  sortBy: z.enum(['title', 'startTime', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Create live class schema
const createLiveClassSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  subject: z.string().min(2, 'Subject is required'),
  startTime: z.string().datetime('Invalid start time'),
  duration: z.number().min(15, 'Duration must be at least 15 minutes'),
  maxAttendees: z.number().min(1, 'Max attendees must be at least 1').optional(),
  meetingUrl: z.string().url('Invalid meeting URL').optional(),
  meetingId: z.string().optional(),
  meetingPassword: z.string().optional(),
  recordingEnabled: z.boolean().default(true),
  isPublic: z.boolean().default(true),
  tags: z.array(z.string()).default([]),
});

// GET handler - List live classes
const getHandler = createApiRoute({
  validation: {
    query: liveClassesQuerySchema,
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
      { subject: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  if (query.subject) {
    where.subject = { contains: query.subject, mode: 'insensitive' };
  }

  if (query.status) {
    where.status = query.status;
  }

  if (query.instructorId) {
    where.instructorId = query.instructorId;
  }

  // Date range filtering
  if (query.startDate || query.endDate) {
    where.startTime = {};
    if (query.startDate) {
      where.startTime.gte = new Date(query.startDate);
    }
    if (query.endDate) {
      where.startTime.lte = new Date(query.endDate);
    }
  }

  // Only show public classes or user's enrolled classes
  if (!request.user) {
    where.isPublic = true;
  }

  // Get live classes with count
  const [liveClasses, total] = await Promise.all([
    prisma.liveClass.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        instructor: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
            bio: true,
          },
        },
        _count: {
          select: {
            attendees: true,
          },
        },
      },
    }),
    prisma.liveClass.count({ where }),
  ]);

  // Check user enrollment status for each class
  const classesWithEnrollment = await Promise.all(
    liveClasses.map(async (liveClass) => {
      let isEnrolled = false;
      if (request.user) {
        const attendance = await prisma.liveClassAttendance.findUnique({
          where: {
            userId_liveClassId: {
              userId: request.user.id,
              liveClassId: liveClass.id,
            },
          },
        });
        isEnrolled = !!attendance;
      }

      return {
        id: liveClass.id,
        title: liveClass.title,
        description: liveClass.description,
        subject: liveClass.subject,
        startTime: liveClass.startTime,
        duration: liveClass.duration,
        status: liveClass.status,
        maxAttendees: liveClass.maxAttendees,
        currentAttendees: liveClass._count.attendees,
        recordingEnabled: liveClass.recordingEnabled,
        isPublic: liveClass.isPublic,
        tags: liveClass.tags,
        instructor: liveClass.instructor,
        isEnrolled,
        createdAt: liveClass.createdAt,
      };
    })
  );

  return sendSuccess(
    classesWithEnrollment,
    createPaginationMeta(
      parseInt(query.page || '1'),
      take,
      total
    )
  );
});

// POST handler - Create live class
const postHandler = createApiRoute({
  requireAuth: true,
  requiredRole: 'INSTRUCTOR',
  validation: {
    body: createLiveClassSchema,
  },
});

export const POST = postHandler(async (request) => {
  const classData = request.body!;
  const user = request.user!;

  // Validate start time is in the future
  const startTime = new Date(classData.startTime);
  const now = new Date();
  
  if (startTime <= now) {
    return sendSuccess({ error: 'Start time must be in the future' }, undefined, 400);
  }

  // Calculate end time
  const endTime = new Date(startTime.getTime() + classData.duration * 60 * 1000);

  // Check for instructor availability (no overlapping classes)
  const overlappingClass = await prisma.liveClass.findFirst({
    where: {
      instructorId: user.id,
      status: { in: ['SCHEDULED', 'LIVE'] },
      OR: [
        {
          startTime: { lte: startTime },
          endTime: { gt: startTime },
        },
        {
          startTime: { lt: endTime },
          endTime: { gte: endTime },
        },
        {
          startTime: { gte: startTime },
          endTime: { lte: endTime },
        },
      ],
    },
  });

  if (overlappingClass) {
    return sendSuccess({ error: 'You have a conflicting class scheduled at this time' }, undefined, 409);
  }

  // Generate meeting ID if not provided
  const meetingId = classData.meetingId || `LC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Create live class
  const liveClass = await prisma.liveClass.create({
    data: {
      ...classData,
      startTime: startTime,
      endTime: endTime,
      meetingId,
      instructorId: user.id,
      status: 'SCHEDULED',
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
      id: liveClass.id,
      title: liveClass.title,
      description: liveClass.description,
      subject: liveClass.subject,
      startTime: liveClass.startTime,
      endTime: liveClass.endTime,
      duration: liveClass.duration,
      status: liveClass.status,
      maxAttendees: liveClass.maxAttendees,
      meetingId: liveClass.meetingId,
      meetingUrl: liveClass.meetingUrl,
      recordingEnabled: liveClass.recordingEnabled,
      isPublic: liveClass.isPublic,
      tags: liveClass.tags,
      instructor: liveClass.instructor,
      createdAt: liveClass.createdAt,
    },
  }, undefined, 201);
});