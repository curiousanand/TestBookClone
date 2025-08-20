/**
 * Verify OTP API Route
 * 
 * Handles OTP verification for phone/email verification
 * and password reset flows.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyOTP } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, email, otp, type = 'phone_verification' } = body;

    if (!phoneNumber && !email) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Phone number or email is required',
          statusCode: 400,
        },
      } satisfies ApiResponse, { status: 400 });
    }

    if (!otp) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'OTP is required',
          statusCode: 400,
        },
      } satisfies ApiResponse, { status: 400 });
    }

    const identifier = phoneNumber || email;

    // Verify OTP
    const isValid = await verifyOTP(identifier, otp);

    if (!isValid) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_OTP',
          message: 'Invalid or expired OTP',
          statusCode: 400,
        },
      } satisfies ApiResponse, { status: 400 });
    }

    // Update user verification status if it's a verification flow
    if (type === 'phone_verification' && phoneNumber) {
      await prisma.user.updateMany({
        where: { phone: phoneNumber },
        data: { phoneVerified: true },
      });
    } else if (type === 'email_verification' && email) {
      await prisma.user.updateMany({
        where: { email: email },
        data: { emailVerified: true },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        verified: true,
        type,
        identifier,
      },
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    } satisfies ApiResponse, { status: 200 });

  } catch (error: any) {
    console.error('Verify OTP error:', error);

    return NextResponse.json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to verify OTP. Please try again.',
        statusCode: 500,
      },
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    } satisfies ApiResponse, { status: 500 });
  }
}