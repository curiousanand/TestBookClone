/**
 * User Registration API Route
 * 
 * Handles user registration with email/password.
 * Includes validation, user creation, and email verification.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/lib/auth';
import type { RegisterData, ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { name, email, password, confirmPassword, termsAccepted } = body as RegisterData;
    
    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing required fields',
          statusCode: 400,
          type: 'VALIDATION_ERROR',
        },
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      } satisfies ApiResponse, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Passwords do not match',
          statusCode: 400,
          type: 'VALIDATION_ERROR',
        },
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      } satisfies ApiResponse, { status: 400 });
    }

    if (!termsAccepted) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'You must accept the Terms of Service',
          statusCode: 400,
          type: 'VALIDATION_ERROR',
        },
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      } satisfies ApiResponse, { status: 400 });
    }

    // Create user
    const user = await createUser(body);

    // TODO: Generate email verification token and send verification email
    // const verificationToken = generateEmailVerificationToken(user.id, user.email);
    // await sendVerificationEmail(user.email, verificationToken);

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.fullName,
        email: user.email,
        requiresEmailVerification: true,
      },
      message: 'User registered successfully',
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    } satisfies ApiResponse, { status: 201 });

  } catch (error: any) {
    console.error('Registration error:', error);

    // Handle specific error types
    if (error.message.includes('already exists')) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'CONFLICT_ERROR',
          message: 'A user with this email already exists',
          statusCode: 409,
          type: 'CONFLICT_ERROR',
        },
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      } satisfies ApiResponse, { status: 409 });
    }

    if (error.message.includes('Password validation failed')) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
          statusCode: 400,
          type: 'VALIDATION_ERROR',
        },
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      } satisfies ApiResponse, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error',
        statusCode: 500,
        type: 'SERVER_ERROR',
      },
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    } satisfies ApiResponse, { status: 500 });
  }
}