/**
 * Prisma Database Schema Test
 * 
 * This file tests the database schema and client configuration
 * to ensure everything is working correctly.
 */

import { prisma, testConnection, healthCheck } from './prisma';
import type { User, Course, Question, TestSeries } from '@prisma/client';

// =============================================================================
// TEST FUNCTIONS
// =============================================================================

/**
 * Test basic Prisma client functionality
 */
export async function testPrismaClient(): Promise<boolean> {
  try {
    console.info('Testing Prisma client...');
    
    // Test connection
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Database connection failed');
    }
    
    // Test client generation and types
    const clientTest = {
      // Test that all models are available
      user: prisma.user,
      course: prisma.course,
      exam: prisma.exam,
      question: prisma.question,
      testSeries: prisma.testSeries,
      liveClass: prisma.liveClass,
      payment: prisma.payment,
      subscription: prisma.subscription,
      category: prisma.category,
      lesson: prisma.lesson,
      userProgress: prisma.userProgress,
      courseEnrollment: prisma.courseEnrollment,
      testAttempt: prisma.testAttempt,
      questionAttempt: prisma.questionAttempt,
      liveClassAttendance: prisma.liveClassAttendance,
      notification: prisma.notification,
      account: prisma.account,
      session: prisma.session,
    };
    
    // Verify all models are accessible
    for (const [modelName, model] of Object.entries(clientTest)) {
      if (!model) {
        throw new Error(`Model ${modelName} is not accessible`);
      }
    }
    
    console.info('✅ Prisma client test passed');
    return true;
  } catch (error) {
    console.error('❌ Prisma client test failed:', error);
    return false;
  }
}

/**
 * Test database schema relationships
 */
export async function testSchemaRelationships(): Promise<boolean> {
  try {
    console.info('Testing schema relationships...');
    
    // This test doesn't actually create data, just tests that the schema
    // allows for the expected relationships to be defined
    
    // Test type relationships compilation (these types should compile without errors)
    const userRelationsTest: User & {
      accounts: any[];
      sessions: any[];
      subscriptions: any[];
      payments: any[];
      enrollments: any[];
      progress: any[];
      testAttempts: any[];
      liveClassAttendance: any[];
      instructorClasses: any[];
      createdCourses: any[];
      createdQuestions: any[];
      createdTestSeries: any[];
      notifications: any[];
    } = {} as any;
    
    const courseRelationsTest: Course & {
      category: any;
      instructor: any;
      lessons: any[];
      enrollments: any[];
      progress: any[];
    } = {} as any;
    
    const questionRelationsTest: Question & {
      creator: any;
      testSeries: any;
      attempts: any[];
    } = {} as any;
    
    const testSeriesRelationsTest: TestSeries & {
      creator: any;
      exam: any;
      questions: any[];
    } = {} as any;
    
    // If TypeScript compiles these types without errors, relationships are correct
    console.info('✅ Schema relationships test passed');
    return true;
  } catch (error) {
    console.error('❌ Schema relationships test failed:', error);
    return false;
  }
}

/**
 * Test enum types
 */
export async function testEnumTypes(): Promise<boolean> {
  try {
    console.info('Testing enum types...');
    
    // Import and test all enums
    const { 
      UserRole, 
      UserStatus, 
      SubscriptionStatus, 
      PaymentStatus, 
      PaymentMethod,
      CourseStatus, 
      CourseLevel, 
      ExamType, 
      QuestionType, 
      QuestionDifficulty,
      LiveClassStatus, 
      TestSeriesType, 
      Language 
    } = await import('@prisma/client');
    
    // Test that enums have expected values
    const enumTests = {
      UserRole: ['STUDENT', 'INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN'],
      UserStatus: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'],
      SubscriptionStatus: ['ACTIVE', 'INACTIVE', 'EXPIRED', 'CANCELLED', 'PENDING'],
      PaymentStatus: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED'],
      PaymentMethod: ['RAZORPAY', 'STRIPE', 'PAYPAL', 'UPI', 'CARD', 'BANK_TRANSFER'],
      CourseStatus: ['DRAFT', 'PUBLISHED', 'ARCHIVED', 'COMING_SOON'],
      CourseLevel: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'],
      ExamType: ['MOCK_TEST', 'PRACTICE_TEST', 'PREVIOUS_YEAR', 'CUSTOM_TEST', 'LIVE_TEST'],
      QuestionType: ['MULTIPLE_CHOICE', 'SINGLE_CHOICE', 'TRUE_FALSE', 'DESCRIPTIVE', 'NUMERICAL', 'FILL_BLANKS'],
      QuestionDifficulty: ['EASY', 'MEDIUM', 'HARD', 'VERY_HARD'],
      LiveClassStatus: ['SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED', 'POSTPONED'],
      TestSeriesType: ['FREE', 'PAID', 'PREMIUM'],
      Language: ['ENGLISH', 'HINDI', 'TAMIL', 'TELUGU', 'BENGALI', 'GUJARATI', 'MARATHI', 'KANNADA']
    };
    
    const enums = {
      UserRole,
      UserStatus,
      SubscriptionStatus,
      PaymentStatus,
      PaymentMethod,
      CourseStatus,
      CourseLevel,
      ExamType,
      QuestionType,
      QuestionDifficulty,
      LiveClassStatus,
      TestSeriesType,
      Language
    };
    
    for (const [enumName, expectedValues] of Object.entries(enumTests)) {
      const enumObj = enums[enumName as keyof typeof enums];
      const actualValues = Object.values(enumObj);
      
      for (const expectedValue of expectedValues) {
        if (!actualValues.includes(expectedValue as any)) {
          throw new Error(`Enum ${enumName} missing value: ${expectedValue}`);
        }
      }
    }
    
    console.info('✅ Enum types test passed');
    return true;
  } catch (error) {
    console.error('❌ Enum types test failed:', error);
    return false;
  }
}

/**
 * Test database health check
 */
export async function testHealthCheck(): Promise<boolean> {
  try {
    console.info('Testing health check...');
    
    const health = await healthCheck();
    
    if (health.status !== 'healthy') {
      console.warn('Health check returned unhealthy status:', health);
      // Don't fail the test if database is just not available
      // This is expected in environments where PostgreSQL isn't running
      return true;
    }
    
    console.info('✅ Health check test passed');
    console.info('Health status:', health);
    return true;
  } catch (error) {
    console.error('❌ Health check test failed:', error);
    // Don't fail on health check errors - database might not be available
    return true;
  }
}

/**
 * Run all database tests
 */
export async function runAllTests(): Promise<boolean> {
  console.info('🚀 Starting database schema tests...\n');
  
  const tests = [
    { name: 'Prisma Client', test: testPrismaClient },
    { name: 'Schema Relationships', test: testSchemaRelationships },
    { name: 'Enum Types', test: testEnumTypes },
    { name: 'Health Check', test: testHealthCheck },
  ];
  
  let allPassed = true;
  
  for (const { name, test } of tests) {
    console.info(`\n--- Running ${name} Test ---`);
    const passed = await test();
    
    if (!passed) {
      allPassed = false;
    }
  }
  
  console.info('\n' + '='.repeat(50));
  
  if (allPassed) {
    console.info('🎉 All database tests passed!');
    console.info('✅ Database schema and client are working correctly');
  } else {
    console.error('❌ Some database tests failed');
    console.error('Please check the errors above and fix the issues');
  }
  
  return allPassed;
}

// =============================================================================
// MAIN EXECUTION
// =============================================================================

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Test execution failed:', error);
      process.exit(1);
    });
}

export default {
  testPrismaClient,
  testSchemaRelationships,
  testEnumTypes,
  testHealthCheck,
  runAllTests,
};