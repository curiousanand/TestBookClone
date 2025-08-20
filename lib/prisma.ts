/**
 * Prisma Client Configuration for TestBook Clone
 * 
 * This module provides a singleton Prisma client instance with proper
 * configuration for development and production environments.
 */

import { PrismaClient } from '@prisma/client';

// =============================================================================
// PRISMA CLIENT CONFIGURATION
// =============================================================================

/**
 * Prisma client options based on environment
 */
const createPrismaClientOptions = () => {
  // Use DATABASE_URL directly for Prisma testing to avoid config validation
  const databaseUrl = process.env.DATABASE_URL;
  
  return {
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'info', 'warn', 'error'] as const
      : ['warn', 'error'] as const,
    
    errorFormat: process.env.NODE_ENV === 'development' ? 'pretty' : 'minimal',
    
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  } as const;
};

/**
 * Global variable to store Prisma client instance
 * This prevents multiple instances in development due to hot reloading
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Create Prisma client with configuration
 */
const createPrismaClient = () => {
  const options = createPrismaClientOptions();
  
  const prisma = new PrismaClient({
    log: options.log,
    errorFormat: options.errorFormat,
    datasources: options.datasources,
  });

  // Enable query logging in development
  if (process.env.NODE_ENV === 'development') {
    prisma.$on('query', (e) => {
      console.log('Query: ' + e.query);
      console.log('Params: ' + e.params);
      console.log('Duration: ' + e.duration + 'ms');
    });
  }

  return prisma;
};

/**
 * Singleton Prisma client instance
 */
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Prevent multiple instances in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// =============================================================================
// CONNECTION MANAGEMENT
// =============================================================================

/**
 * Test database connection
 */
export const testConnection = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.info('Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
};

/**
 * Gracefully disconnect from database
 */
export const disconnect = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    console.info('Database disconnected successfully');
  } catch (error) {
    console.error('Error during database disconnection:', error);
  }
};

/**
 * Execute a transaction with retry logic
 */
export const executeTransaction = async <T>(
  operation: (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'>) => Promise<T>,
  maxRetries = 3
): Promise<T> => {
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await prisma.$transaction(operation, {
        timeout: 30000, // 30 seconds timeout
        maxWait: 5000,  // 5 seconds max wait
        isolationLevel: 'ReadCommitted',
      });
    } catch (error) {
      lastError = error;
      console.warn(`Transaction attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};

// =============================================================================
// DATABASE UTILITIES
// =============================================================================

/**
 * Reset database (WARNING: Deletes all data)
 * Only available in development environment
 */
export const resetDatabase = async (): Promise<void> => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Database reset is not allowed in production');
  }
  
  console.warn('Resetting database - all data will be lost!');
  
  try {
    // Delete all data in reverse dependency order
    await prisma.notification.deleteMany();
    await prisma.liveClassAttendance.deleteMany();
    await prisma.liveClass.deleteMany();
    await prisma.questionAttempt.deleteMany();
    await prisma.testAttempt.deleteMany();
    await prisma.question.deleteMany();
    await prisma.testSeries.deleteMany();
    await prisma.exam.deleteMany();
    await prisma.userProgress.deleteMany();
    await prisma.courseEnrollment.deleteMany();
    await prisma.lesson.deleteMany();
    await prisma.course.deleteMany();
    await prisma.category.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.subscription.deleteMany();
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();
    
    console.info('Database reset completed successfully');
  } catch (error) {
    console.error('Database reset failed:', error);
    throw error;
  }
};

/**
 * Database health check
 */
export const healthCheck = async () => {
  try {
    const startTime = Date.now();
    
    // Test basic connection
    await prisma.$queryRaw`SELECT 1 as test`;
    
    const responseTime = Date.now() - startTime;
    
    // Get database info
    const dbInfo = await prisma.$queryRaw`
      SELECT 
        current_database() as database_name,
        current_user as user_name,
        version() as version
    ` as Array<{
      database_name: string;
      user_name: string;
      version: string;
    }>;
    
    // Get table counts for basic stats
    const userCount = await prisma.user.count();
    const courseCount = await prisma.course.count();
    const questionCount = await prisma.question.count();
    
    return {
      status: 'healthy',
      responseTime: `${responseTime}ms`,
      database: dbInfo[0]?.database_name,
      user: dbInfo[0]?.user_name,
      version: dbInfo[0]?.version?.split(' ')[0], // Just PostgreSQL version
      statistics: {
        users: userCount,
        courses: courseCount,
        questions: questionCount,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
};

// =============================================================================
// SEEDING UTILITIES
// =============================================================================

/**
 * Check if database is seeded with basic data
 */
export const isDatabaseSeeded = async (): Promise<boolean> => {
  try {
    const categoryCount = await prisma.category.count();
    const userCount = await prisma.user.count();
    
    // Consider database seeded if we have at least one category and one user
    return categoryCount > 0 && userCount > 0;
  } catch (error) {
    console.error('Error checking database seed status:', error);
    return false;
  }
};

/**
 * Create basic seed data (categories, admin user, etc.)
 */
export const seedBasicData = async (): Promise<void> => {
  try {
    console.info('Starting database seeding...');
    
    // Create basic categories
    const categories = await prisma.category.createMany({
      data: [
        {
          name: 'Engineering',
          slug: 'engineering',
          description: 'Engineering competitive exams',
          icon: '🔧',
          color: '#3B82F6',
          sortOrder: 1,
        },
        {
          name: 'Medical',
          slug: 'medical', 
          description: 'Medical entrance exams',
          icon: '🩺',
          color: '#EF4444',
          sortOrder: 2,
        },
        {
          name: 'Government Jobs',
          slug: 'government-jobs',
          description: 'Government job competitive exams',
          icon: '🏛️',
          color: '#10B981',
          sortOrder: 3,
        },
        {
          name: 'Banking',
          slug: 'banking',
          description: 'Banking sector exams',
          icon: '🏦',
          color: '#F59E0B',
          sortOrder: 4,
        },
      ],
      skipDuplicates: true,
    });
    
    console.info(`Created ${categories.count} categories`);
    console.info('Database seeding completed successfully');
  } catch (error) {
    console.error('Database seeding failed:', error);
    throw error;
  }
};

// =============================================================================
// EXPORTS
// =============================================================================

export default prisma;

// Export common Prisma types for convenience
export type {
  User,
  Course,
  Exam,
  Question,
  TestSeries,
  LiveClass,
  Payment,
  Subscription,
  UserRole,
  UserStatus,
  CourseStatus,
  ExamType,
  QuestionType,
  QuestionDifficulty,
  PaymentStatus,
  SubscriptionStatus,
  LiveClassStatus,
} from '@prisma/client';

// Export useful Prisma utilities
export { Prisma } from '@prisma/client';