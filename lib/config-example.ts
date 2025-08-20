/**
 * Configuration Usage Examples
 * 
 * This file demonstrates how to use the configuration system
 * in your application components and API routes.
 */

import { getConfig } from './config';
import type { AppConfig } from '@/types/config';

// =============================================================================
// BASIC USAGE EXAMPLE
// =============================================================================

export function useAppConfig(): AppConfig {
  // Get configuration with validation
  return getConfig({ 
    validate: true, 
    strict: process.env.NODE_ENV === 'production' 
  });
}

// =============================================================================
// SPECIFIC CONFIGURATION EXAMPLES
// =============================================================================

export function getDatabaseConfig() {
  const config = getConfig();
  return {
    url: config.database.url,
    poolSize: config.database.poolSize,
    logging: config.database.logging,
  };
}

export function getAuthConfig() {
  const config = getConfig();
  return {
    jwtSecret: config.auth.jwtSecret,
    sessionTimeout: config.auth.sessionTimeout,
    cookieSecure: config.auth.cookieSecure,
  };
}

export function getFeatureFlags() {
  const config = getConfig();
  return config.features;
}

export function getPaymentConfig() {
  const config = getConfig();
  return {
    razorpay: config.payment.razorpay,
    stripe: config.payment.stripe,
  };
}

// =============================================================================
// CONDITIONAL FEATURE USAGE
// =============================================================================

export function isFeatureEnabled(feature: keyof AppConfig['features']): boolean {
  const config = getConfig();
  return config.features[feature];
}

export function isProduction(): boolean {
  const config = getConfig();
  return config.env === 'production';
}

export function isDevelopment(): boolean {
  const config = getConfig();
  return config.env === 'development';
}

export function isDebugMode(): boolean {
  const config = getConfig();
  return config.debug;
}

// =============================================================================
// EMAIL SERVICE SELECTION
// =============================================================================

export function getEmailService() {
  const config = getConfig();
  
  // Prefer SendGrid if configured, fallback to SMTP
  if (config.email.sendgrid.apiKey) {
    return {
      type: 'sendgrid' as const,
      config: config.email.sendgrid,
    };
  }
  
  if (config.email.smtp.user) {
    return {
      type: 'smtp' as const,
      config: config.email.smtp,
    };
  }
  
  throw new Error('No email service configured');
}

// =============================================================================
// STORAGE SERVICE SELECTION
// =============================================================================

export function getStorageConfig() {
  const config = getConfig();
  
  if (!config.s3.accessKeyId || !config.s3.bucket) {
    throw new Error('AWS S3 configuration is required');
  }
  
  return config.s3;
}

// =============================================================================
// API CONFIGURATION
// =============================================================================

export function getAPILimits() {
  const config = getConfig();
  return {
    rateLimit: config.rateLimit,
    performance: config.performance,
  };
}

// =============================================================================
// EXAMPLE USAGE IN API ROUTES
// =============================================================================

export function createAPIResponse(data: unknown, message = 'Success') {
  const config = getConfig();
  
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
    version: config.appVersion,
    ...(config.debug && { debug: true }),
  };
}

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

export function validateRequiredServices(): { isValid: boolean; missing: string[] } {
  const config = getConfig({ validate: false });
  const missing: string[] = [];
  
  // Check database connection
  if (!config.database.url) {
    missing.push('DATABASE_URL');
  }
  
  // Check authentication
  if (!config.auth.jwtSecret || !config.auth.nextAuthSecret) {
    missing.push('Authentication secrets');
  }
  
  // Check required services based on feature flags
  if (config.features.paymentIntegration) {
    if (!config.payment.razorpay.keyId && !config.payment.stripe.secretKey) {
      missing.push('Payment gateway configuration');
    }
  }
  
  if (config.features.aiDoubtResolution) {
    if (!config.openai.apiKey) {
      missing.push('OpenAI API key');
    }
  }
  
  if (config.features.liveClasses) {
    if (!config.liveStreaming.agora.appId) {
      missing.push('Agora configuration for live classes');
    }
  }
  
  return {
    isValid: missing.length === 0,
    missing,
  };
}

export default {
  useAppConfig,
  getDatabaseConfig,
  getAuthConfig,
  getFeatureFlags,
  getPaymentConfig,
  isFeatureEnabled,
  isProduction,
  isDevelopment,
  isDebugMode,
  getEmailService,
  getStorageConfig,
  getAPILimits,
  createAPIResponse,
  validateRequiredServices,
};