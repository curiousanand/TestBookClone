/**
 * Send OTP API Route
 * 
 * Handles OTP generation and sending via SMS or email.
 * Supports phone verification and password reset flows.
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateOTP, storeOTP, sendOTP } from '@/lib/auth';
import type { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, email, type = 'phone_verification' } = body;

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

    // Generate OTP
    const otp = generateOTP(6);
    const identifier = phoneNumber || email;

    // Store OTP in database
    await storeOTP(identifier, otp, phoneNumber ? 'phone' : 'email');

    if (phoneNumber) {
      // Send OTP via SMS
      const sent = await sendOTP(phoneNumber, otp);
      
      if (!sent) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'SMS_SEND_ERROR',
            message: 'Failed to send SMS. Please try again.',
            statusCode: 500,
          },
        } satisfies ApiResponse, { status: 500 });
      }
    } else {
      // TODO: Send OTP via email
      console.log(`Email OTP for ${email}: ${otp}`);
    }

    return NextResponse.json({
      success: true,
      message: phoneNumber 
        ? 'OTP sent to your phone number' 
        : 'OTP sent to your email',
      data: {
        identifier,
        expiresIn: 600, // 10 minutes in seconds
      },
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    } satisfies ApiResponse, { status: 200 });

  } catch (error: any) {
    console.error('Send OTP error:', error);

    return NextResponse.json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to send OTP. Please try again.',
        statusCode: 500,
      },
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    } satisfies ApiResponse, { status: 500 });
  }
}