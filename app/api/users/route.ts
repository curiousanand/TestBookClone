/**
 * Users API Route
 * 
 * Handles user listing and management functionality for admin users.
 */

import { z } from 'zod';
import { createApiRoute, sendSuccess, parsePagination, createPaginationMeta } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';

// Query validation schema
const usersQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  role: z.enum(['STUDENT', 'INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION']).optional(),
  emailVerified: z.string().transform((val) => val === 'true').optional(),
  phoneVerified: z.string().transform((val) => val === 'true').optional(),
  sortBy: z.enum(['fullName', 'email', 'createdAt', 'lastActiveAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// GET handler - List users (Admin only)
const getHandler = createApiRoute({
  requireAuth: true,
  requiredRole: 'ADMIN',
  validation: {
    query: usersQuerySchema,
  },
});

export const GET = getHandler(async (request) => {
  const query = request.query!;
  const { skip, take, orderBy } = parsePagination(query);

  // Build filters
  const where: any = {};

  if (query.search) {
    where.OR = [
      { fullName: { contains: query.search, mode: 'insensitive' } },
      { email: { contains: query.search, mode: 'insensitive' } },
      { firstName: { contains: query.search, mode: 'insensitive' } },
      { lastName: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  if (query.role) {
    where.role = query.role;
  }

  if (query.status) {
    where.status = query.status;
  }

  if (query.emailVerified !== undefined) {
    where.emailVerified = query.emailVerified;
  }

  if (query.phoneVerified !== undefined) {
    where.phoneVerified = query.phoneVerified;
  }

  // Get users with count
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take,
      orderBy,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        fullName: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        status: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
        lastActiveAt: true,
        _count: {
          select: {
            courseEnrollments: true,
            testAttempts: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return sendSuccess(
    users.map((user) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      enrollmentCount: user._count.courseEnrollments,
      testAttemptCount: user._count.testAttempts,
      createdAt: user.createdAt,
      lastActiveAt: user.lastActiveAt,
    })),
    createPaginationMeta(
      parseInt(query.page || '1'),
      take,
      total
    )
  );
});