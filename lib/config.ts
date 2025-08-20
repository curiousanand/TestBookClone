/**
 * Configuration Management for TestBook Clone
 * 
 * This module handles loading, validation, and management of all
 * environment variables and application configuration.
 */

import type {
  AppConfig,
  NodeEnvironment,
  LogLevel,
  SupportedLanguage,
  SupportedCurrency,
  CookieSameSite,
  OpenAIModel,
  ValidationResult,
  ConfigOptions,
  EnvVarMetadata,
} from '@/types/config';

// =============================================================================
// ENVIRONMENT VARIABLE DEFINITIONS
// =============================================================================

/**
 * Required environment variables with metadata
 */
const REQUIRED_ENV_VARS: EnvVarMetadata[] = [
  // Application
  { name: 'NODE_ENV', required: true, defaultValue: 'development' },
  { name: 'APP_URL', required: true, defaultValue: 'http://localhost:3000' },
  { name: 'APP_NAME', required: true, defaultValue: 'TestBook Clone' },
  
  // Authentication
  { name: 'NEXTAUTH_SECRET', required: true },
  { name: 'NEXTAUTH_URL', required: true },
  { name: 'JWT_SECRET', required: true },
  
  // Database
  { name: 'DATABASE_URL', required: true },
  { name: 'MONGODB_URL', required: true },
  { name: 'REDIS_URL', required: true },
];

/**
 * Optional environment variables with defaults
 */
const OPTIONAL_ENV_VARS: EnvVarMetadata[] = [
  // Application settings
  { name: 'APP_VERSION', required: false, defaultValue: '1.0.0' },
  { name: 'DEBUG', required: false, defaultValue: 'false' },
  { name: 'LOG_LEVEL', required: false, defaultValue: 'info' },
  
  // Database settings
  { name: 'DATABASE_POOL_SIZE', required: false, defaultValue: '10' },
  { name: 'DATABASE_LOGGING', required: false, defaultValue: 'false' },
  { name: 'DATABASE_SLOW_QUERY_THRESHOLD', required: false, defaultValue: '1000' },
  { name: 'MONGODB_DB_NAME', required: false, defaultValue: 'testbook_clone' },
  { name: 'REDIS_PASSWORD', required: false },
  { name: 'REDIS_DB', required: false, defaultValue: '0' },
  
  // Feature flags
  { name: 'FEATURE_AI_DOUBT_RESOLUTION', required: false, defaultValue: 'true' },
  { name: 'FEATURE_LIVE_CLASSES', required: false, defaultValue: 'true' },
  { name: 'FEATURE_SOCIAL_LOGIN', required: false, defaultValue: 'true' },
  { name: 'FEATURE_PAYMENT_INTEGRATION', required: false, defaultValue: 'true' },
  { name: 'FEATURE_MOBILE_APP', required: false, defaultValue: 'false' },
  { name: 'FEATURE_BETA_FEATURES', required: false, defaultValue: 'false' },
  
  // Performance settings
  { name: 'CACHE_TTL', required: false, defaultValue: '3600' },
  { name: 'CDN_CACHE_TTL', required: false, defaultValue: '86400' },
  { name: 'API_RATE_LIMIT', required: false, defaultValue: '1000' },
  { name: 'MAX_FILE_UPLOAD_SIZE', required: false, defaultValue: '50MB' },
  { name: 'MAX_VIDEO_UPLOAD_SIZE', required: false, defaultValue: '1GB' },
];

// =============================================================================
// VALIDATION FUNCTIONS
// =============================================================================

/**
 * Validate URL format
 */
const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate email format
 */
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate boolean string
 */
const validateBoolean = (value: string): boolean => {
  return ['true', 'false'].includes(value.toLowerCase());
};

/**
 * Validate number string
 */
const validateNumber = (value: string): boolean => {
  return !isNaN(Number(value)) && isFinite(Number(value));
};

/**
 * Validate positive integer
 */
const validatePositiveInteger = (value: string): boolean => {
  const num = parseInt(value, 10);
  return !isNaN(num) && num > 0;
};

/**
 * Validation rules for specific environment variables
 */
const VALIDATION_RULES: Record<string, (value: string) => boolean> = {
  'APP_URL': validateUrl,
  'NEXTAUTH_URL': validateUrl,
  'DATABASE_URL': (value: string) => value.startsWith('postgresql://'),
  'MONGODB_URL': (value: string) => value.startsWith('mongodb://') || value.startsWith('mongodb+srv://'),
  'REDIS_URL': (value: string) => value.startsWith('redis://') || value.startsWith('rediss://'),
  'DATABASE_POOL_SIZE': validatePositiveInteger,
  'DATABASE_SLOW_QUERY_THRESHOLD': validateNumber,
  'REDIS_DB': validateNumber,
  'DEBUG': validateBoolean,
  'DATABASE_LOGGING': validateBoolean,
  'SENDGRID_FROM_EMAIL': validateEmail,
  'SMTP_USER': validateEmail,
  'SMTP_PORT': validatePositiveInteger,
  'CACHE_TTL': validatePositiveInteger,
  'CDN_CACHE_TTL': validatePositiveInteger,
  'API_RATE_LIMIT': validatePositiveInteger,
  'RATE_LIMIT_WINDOW_MS': validatePositiveInteger,
  'RATE_LIMIT_MAX_REQUESTS': validatePositiveInteger,
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get environment variable with optional default value
 */
const getEnvVar = (name: string, defaultValue?: string): string => {
  const value = process.env[name];
  if (value === undefined || value === '') {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Environment variable ${name} is required but not provided`);
  }
  return value;
};

/**
 * Get environment variable as boolean
 */
const getEnvBool = (name: string, defaultValue = false): boolean => {
  const value = process.env[name];
  if (value === undefined || value === '') {
    return defaultValue;
  }
  return value.toLowerCase() === 'true';
};

/**
 * Get environment variable as number
 */
const getEnvNumber = (name: string, defaultValue = 0): number => {
  const value = process.env[name];
  if (value === undefined || value === '') {
    return defaultValue;
  }
  const num = Number(value);
  if (isNaN(num)) {
    throw new Error(`Environment variable ${name} must be a valid number`);
  }
  return num;
};

/**
 * Get environment variable as array (comma-separated)
 */
const getEnvArray = (name: string, defaultValue: string[] = []): string[] => {
  const value = process.env[name];
  if (value === undefined || value === '') {
    return defaultValue;
  }
  return value.split(',').map(item => item.trim()).filter(Boolean);
};

/**
 * Validate single environment variable
 */
const validateEnvVar = (name: string, value: string): boolean => {
  const validator = VALIDATION_RULES[name];
  if (!validator) {
    return true; // No specific validation rule
  }
  return validator(value);
};

/**
 * Validate all environment variables
 */
const validateEnvironment = (): ValidationResult => {
  const errors: string[] = [];
  const missing: string[] = [];

  // Check required variables
  for (const envVar of REQUIRED_ENV_VARS) {
    const value = process.env[envVar.name];
    
    if (value === undefined || value === '') {
      if (envVar.defaultValue === undefined) {
        missing.push(envVar.name);
      }
    } else {
      // Validate the value if present
      if (!validateEnvVar(envVar.name, value)) {
        errors.push(`Invalid value for ${envVar.name}`);
      }
    }
  }

  // Validate optional variables if present
  for (const envVar of OPTIONAL_ENV_VARS) {
    const value = process.env[envVar.name];
    
    if (value !== undefined && value !== '') {
      if (!validateEnvVar(envVar.name, value)) {
        errors.push(`Invalid value for ${envVar.name}`);
      }
    }
  }

  return {
    isValid: errors.length === 0 && missing.length === 0,
    errors,
    missing,
  };
};

// =============================================================================
// CONFIGURATION BUILDERS
// =============================================================================

/**
 * Build database configuration
 */
const buildDatabaseConfig = () => ({
  url: getEnvVar('DATABASE_URL'),
  poolSize: getEnvNumber('DATABASE_POOL_SIZE', 10),
  logging: getEnvBool('DATABASE_LOGGING', false),
  slowQueryThreshold: getEnvNumber('DATABASE_SLOW_QUERY_THRESHOLD', 1000),
});

/**
 * Build MongoDB configuration
 */
const buildMongoConfig = () => ({
  url: getEnvVar('MONGODB_URL'),
  dbName: getEnvVar('MONGODB_DB_NAME', 'testbook_clone'),
});

/**
 * Build Redis configuration
 */
const buildRedisConfig = () => ({
  url: getEnvVar('REDIS_URL'),
  password: process.env['REDIS_PASSWORD'],
  db: getEnvNumber('REDIS_DB', 0),
});

/**
 * Build authentication configuration
 */
const buildAuthConfig = () => ({
  nextAuthSecret: getEnvVar('NEXTAUTH_SECRET'),
  nextAuthUrl: getEnvVar('NEXTAUTH_URL'),
  jwtSecret: getEnvVar('JWT_SECRET'),
  jwtExpiresIn: getEnvVar('JWT_EXPIRES_IN', '7d'),
  refreshTokenExpiresIn: getEnvVar('REFRESH_TOKEN_EXPIRES_IN', '30d'),
  sessionTimeout: getEnvVar('SESSION_TIMEOUT', '24h'),
  cookieSecure: getEnvBool('COOKIE_SECURE', false),
  cookieSameSite: (getEnvVar('COOKIE_SAME_SITE', 'lax') as CookieSameSite),
});

/**
 * Build OAuth configuration
 */
const buildOAuthConfig = () => ({
  google: {
    clientId: getEnvVar('GOOGLE_CLIENT_ID', ''),
    clientSecret: getEnvVar('GOOGLE_CLIENT_SECRET', ''),
  },
  facebook: {
    clientId: getEnvVar('FACEBOOK_CLIENT_ID', ''),
    clientSecret: getEnvVar('FACEBOOK_CLIENT_SECRET', ''),
  },
  github: process.env['GITHUB_CLIENT_ID'] ? {
    clientId: getEnvVar('GITHUB_CLIENT_ID'),
    clientSecret: getEnvVar('GITHUB_CLIENT_SECRET'),
  } : undefined,
});

/**
 * Build payment configuration
 */
const buildPaymentConfig = () => ({
  razorpay: {
    keyId: getEnvVar('RAZORPAY_KEY_ID', ''),
    keySecret: getEnvVar('RAZORPAY_KEY_SECRET', ''),
    webhookSecret: getEnvVar('RAZORPAY_WEBHOOK_SECRET', ''),
  },
  stripe: {
    publishableKey: getEnvVar('STRIPE_PUBLISHABLE_KEY', ''),
    secretKey: getEnvVar('STRIPE_SECRET_KEY', ''),
    webhookSecret: getEnvVar('STRIPE_WEBHOOK_SECRET', ''),
  },
  paypal: {
    clientId: getEnvVar('PAYPAL_CLIENT_ID', ''),
    clientSecret: getEnvVar('PAYPAL_CLIENT_SECRET', ''),
    webhookId: getEnvVar('PAYPAL_WEBHOOK_ID', ''),
  },
});

/**
 * Build AWS S3 configuration
 */
const buildS3Config = () => ({
  accessKeyId: getEnvVar('AWS_ACCESS_KEY_ID', ''),
  secretAccessKey: getEnvVar('AWS_SECRET_ACCESS_KEY', ''),
  region: getEnvVar('AWS_REGION', 'ap-south-1'),
  bucket: getEnvVar('AWS_S3_BUCKET', ''),
  cloudFrontDomain: process.env['AWS_CLOUDFRONT_DOMAIN'],
});

/**
 * Build email configuration
 */
const buildEmailConfig = () => ({
  sendgrid: {
    apiKey: getEnvVar('SENDGRID_API_KEY', ''),
    fromEmail: getEnvVar('SENDGRID_FROM_EMAIL', ''),
    fromName: getEnvVar('SENDGRID_FROM_NAME', 'TestBook Clone'),
  },
  smtp: {
    host: getEnvVar('SMTP_HOST', 'smtp.gmail.com'),
    port: getEnvNumber('SMTP_PORT', 587),
    user: getEnvVar('SMTP_USER', ''),
    pass: getEnvVar('SMTP_PASS', ''),
    secure: getEnvBool('SMTP_SECURE', false),
  },
});

/**
 * Build SMS configuration
 */
const buildSMSConfig = () => ({
  twilio: {
    accountSid: getEnvVar('TWILIO_ACCOUNT_SID', ''),
    authToken: getEnvVar('TWILIO_AUTH_TOKEN', ''),
    phoneNumber: getEnvVar('TWILIO_PHONE_NUMBER', ''),
  },
  awsSns: {
    accessKeyId: getEnvVar('AWS_SNS_ACCESS_KEY_ID', ''),
    secretAccessKey: getEnvVar('AWS_SNS_SECRET_ACCESS_KEY', ''),
    region: getEnvVar('AWS_SNS_REGION', 'ap-south-1'),
  },
});

/**
 * Build OpenAI configuration
 */
const buildOpenAIConfig = () => ({
  apiKey: getEnvVar('OPENAI_API_KEY', ''),
  model: (getEnvVar('OPENAI_MODEL', 'gpt-4') as OpenAIModel),
  maxTokens: getEnvNumber('OPENAI_MAX_TOKENS', 2000),
  assistantId: process.env['OPENAI_ASSISTANT_ID'],
});

/**
 * Build live streaming configuration
 */
const buildLiveStreamingConfig = () => ({
  agora: {
    appId: getEnvVar('AGORA_APP_ID', ''),
    appCertificate: getEnvVar('AGORA_APP_CERTIFICATE', ''),
  },
  mediaConvert: {
    endpoint: getEnvVar('AWS_MEDIACONVERT_ENDPOINT', ''),
    roleArn: getEnvVar('AWS_MEDIACONVERT_ROLE_ARN', ''),
  },
  vimeo: {
    clientId: getEnvVar('VIMEO_CLIENT_ID', ''),
    clientSecret: getEnvVar('VIMEO_CLIENT_SECRET', ''),
    accessToken: getEnvVar('VIMEO_ACCESS_TOKEN', ''),
  },
});

/**
 * Build search configuration
 */
const buildSearchConfig = () => ({
  elasticsearch: {
    url: getEnvVar('ELASTICSEARCH_URL', 'http://localhost:9200'),
    username: getEnvVar('ELASTICSEARCH_USERNAME', 'elastic'),
    password: getEnvVar('ELASTICSEARCH_PASSWORD', ''),
  },
  algolia: {
    appId: getEnvVar('ALGOLIA_APP_ID', ''),
    apiKey: getEnvVar('ALGOLIA_API_KEY', ''),
    searchKey: getEnvVar('ALGOLIA_SEARCH_KEY', ''),
  },
});

/**
 * Build analytics configuration
 */
const buildAnalyticsConfig = () => ({
  googleAnalyticsId: process.env['GOOGLE_ANALYTICS_ID'],
  mixpanelToken: process.env['MIXPANEL_PROJECT_TOKEN'],
  sentry: {
    dsn: process.env['SENTRY_DSN'],
    authToken: process.env['SENTRY_AUTH_TOKEN'],
  },
  logRocketAppId: process.env['LOGROCKET_APP_ID'],
});

/**
 * Build push notification configuration
 */
const buildPushNotificationConfig = () => ({
  firebase: {
    projectId: getEnvVar('FIREBASE_PROJECT_ID', ''),
    privateKey: getEnvVar('FIREBASE_PRIVATE_KEY', ''),
    clientEmail: getEnvVar('FIREBASE_CLIENT_EMAIL', ''),
    serverKey: getEnvVar('FIREBASE_SERVER_KEY', ''),
  },
  oneSignal: {
    appId: getEnvVar('ONESIGNAL_APP_ID', ''),
    restApiKey: getEnvVar('ONESIGNAL_REST_API_KEY', ''),
  },
});

/**
 * Build feature flags configuration
 */
const buildFeatureFlags = () => ({
  aiDoubtResolution: getEnvBool('FEATURE_AI_DOUBT_RESOLUTION', true),
  liveClasses: getEnvBool('FEATURE_LIVE_CLASSES', true),
  socialLogin: getEnvBool('FEATURE_SOCIAL_LOGIN', true),
  paymentIntegration: getEnvBool('FEATURE_PAYMENT_INTEGRATION', true),
  mobileApp: getEnvBool('FEATURE_MOBILE_APP', false),
  betaFeatures: getEnvBool('FEATURE_BETA_FEATURES', false),
});

/**
 * Build rate limiting configuration
 */
const buildRateLimitConfig = () => ({
  windowMs: getEnvNumber('RATE_LIMIT_WINDOW_MS', 900000), // 15 minutes
  maxRequests: getEnvNumber('RATE_LIMIT_MAX_REQUESTS', 100),
  skipSuccessfulRequests: getEnvBool('RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS', true),
});

/**
 * Build CORS configuration
 */
const buildCORSConfig = () => ({
  allowedOrigins: getEnvArray('ALLOWED_ORIGINS', ['http://localhost:3000']),
  allowedMethods: getEnvArray('ALLOWED_METHODS', ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']),
});

/**
 * Build localization configuration
 */
const buildLocalizationConfig = () => ({
  defaultLanguage: (getEnvVar('DEFAULT_LANGUAGE', 'en') as SupportedLanguage),
  supportedLanguages: (getEnvArray('SUPPORTED_LANGUAGES', ['en', 'hi']) as SupportedLanguage[]),
  defaultTimezone: getEnvVar('DEFAULT_TIMEZONE', 'Asia/Kolkata'),
  defaultCurrency: (getEnvVar('DEFAULT_CURRENCY', 'INR') as SupportedCurrency),
});

/**
 * Build performance configuration
 */
const buildPerformanceConfig = () => ({
  cacheTtl: getEnvNumber('CACHE_TTL', 3600),
  cdnCacheTtl: getEnvNumber('CDN_CACHE_TTL', 86400),
  apiRateLimit: getEnvNumber('API_RATE_LIMIT', 1000),
  maxFileUploadSize: getEnvVar('MAX_FILE_UPLOAD_SIZE', '50MB'),
  maxVideoUploadSize: getEnvVar('MAX_VIDEO_UPLOAD_SIZE', '1GB'),
});

// =============================================================================
// MAIN CONFIGURATION LOADING
// =============================================================================

/**
 * Load and build complete application configuration
 */
const loadConfig = (options: ConfigOptions = {}): AppConfig => {
  const { strict = false, validate = true } = options;

  // Validate environment variables if requested
  if (validate) {
    const validation = validateEnvironment();
    if (!validation.isValid) {
      const errorMessage = [
        'Environment validation failed:',
        ...validation.errors.map(err => `  - ${err}`),
        ...validation.missing.map(missing => `  - Missing required variable: ${missing}`),
      ].join('\n');

      if (strict) {
        throw new Error(errorMessage);
      } else {
        console.warn(errorMessage);
      }
    }
  }

  // Build and return complete configuration
  const config: AppConfig = {
    env: (getEnvVar('NODE_ENV', 'development') as NodeEnvironment),
    appUrl: getEnvVar('APP_URL', 'http://localhost:3000'),
    appName: getEnvVar('APP_NAME', 'TestBook Clone'),
    appVersion: getEnvVar('APP_VERSION', '1.0.0'),
    debug: getEnvBool('DEBUG', false),
    logLevel: (getEnvVar('LOG_LEVEL', 'info') as LogLevel),
    database: buildDatabaseConfig(),
    mongodb: buildMongoConfig(),
    redis: buildRedisConfig(),
    auth: buildAuthConfig(),
    oauth: buildOAuthConfig(),
    payment: buildPaymentConfig(),
    s3: buildS3Config(),
    email: buildEmailConfig(),
    sms: buildSMSConfig(),
    openai: buildOpenAIConfig(),
    liveStreaming: buildLiveStreamingConfig(),
    search: buildSearchConfig(),
    analytics: buildAnalyticsConfig(),
    pushNotifications: buildPushNotificationConfig(),
    features: buildFeatureFlags(),
    rateLimit: buildRateLimitConfig(),
    cors: buildCORSConfig(),
    localization: buildLocalizationConfig(),
    performance: buildPerformanceConfig(),
    maintenanceMode: getEnvBool('MAINTENANCE_MODE', false),
    maintenanceMessage: getEnvVar('MAINTENANCE_MESSAGE', 'System maintenance in progress'),
  };

  return config;
};

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let configInstance: AppConfig | null = null;

/**
 * Get singleton configuration instance
 */
export const getConfig = (options?: ConfigOptions): AppConfig => {
  if (configInstance === null) {
    configInstance = loadConfig(options);
  }
  return configInstance;
};

/**
 * Reset configuration instance (useful for testing)
 */
export const resetConfig = (): void => {
  configInstance = null;
};

// =============================================================================
// EXPORTS
// =============================================================================

export {
  loadConfig,
  validateEnvironment,
  validateEnvVar,
  getEnvVar,
  getEnvBool,
  getEnvNumber,
  getEnvArray,
  REQUIRED_ENV_VARS,
  OPTIONAL_ENV_VARS,
  VALIDATION_RULES,
};

export default getConfig;