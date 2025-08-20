/**
 * Configuration Types for TestBook Clone
 * 
 * This file contains TypeScript type definitions for all environment
 * configuration variables and application settings.
 */

// =============================================================================
// ENVIRONMENT TYPES
// =============================================================================

/**
 * Node.js environment types
 */
export type NodeEnvironment = 'development' | 'production' | 'test';

/**
 * Log levels for application logging
 */
export type LogLevel = 'error' | 'warn' | 'info' | 'http' | 'verbose' | 'debug' | 'silly';

/**
 * Supported languages for internationalization
 */
export type SupportedLanguage = 'en' | 'hi' | 'ta' | 'te' | 'bn' | 'gu' | 'mr' | 'kn';

/**
 * Supported currencies for payments
 */
export type SupportedCurrency = 'INR' | 'USD' | 'EUR' | 'GBP';

/**
 * Cookie same-site policy options
 */
export type CookieSameSite = 'strict' | 'lax' | 'none';

/**
 * OpenAI model types
 */
export type OpenAIModel = 'gpt-3.5-turbo' | 'gpt-4' | 'gpt-4-turbo' | 'gpt-4o';

// =============================================================================
// DATABASE CONFIGURATION
// =============================================================================

/**
 * Database configuration interface
 */
export interface DatabaseConfig {
  /** PostgreSQL connection string */
  url: string;
  /** Connection pool size */
  poolSize: number;
  /** Enable query logging */
  logging: boolean;
  /** Slow query threshold in milliseconds */
  slowQueryThreshold: number;
}

/**
 * MongoDB configuration interface
 */
export interface MongoConfig {
  /** MongoDB connection string */
  url: string;
  /** Database name */
  dbName: string;
}

/**
 * Redis configuration interface
 */
export interface RedisConfig {
  /** Redis connection string */
  url: string;
  /** Redis password */
  password: string | undefined;
  /** Redis database number */
  db: number;
}

// =============================================================================
// AUTHENTICATION CONFIGURATION
// =============================================================================

/**
 * Authentication configuration interface
 */
export interface AuthConfig {
  /** NextAuth secret key */
  nextAuthSecret: string;
  /** NextAuth URL */
  nextAuthUrl: string;
  /** JWT secret key */
  jwtSecret: string;
  /** JWT token expiration */
  jwtExpiresIn: string;
  /** Refresh token expiration */
  refreshTokenExpiresIn: string;
  /** Session timeout */
  sessionTimeout: string;
  /** Cookie security settings */
  cookieSecure: boolean;
  /** Cookie same-site policy */
  cookieSameSite: CookieSameSite;
}

/**
 * OAuth provider configuration
 */
export interface OAuthProviderConfig {
  /** Client ID */
  clientId: string;
  /** Client secret */
  clientSecret: string;
}

/**
 * All OAuth providers configuration
 */
export interface OAuthConfig {
  /** Google OAuth configuration */
  google: OAuthProviderConfig;
  /** Facebook OAuth configuration */
  facebook: OAuthProviderConfig;
  /** GitHub OAuth configuration */
  github: OAuthProviderConfig | undefined;
}

// =============================================================================
// PAYMENT GATEWAY CONFIGURATION
// =============================================================================

/**
 * Razorpay configuration interface
 */
export interface RazorpayConfig {
  /** Razorpay key ID */
  keyId: string;
  /** Razorpay secret key */
  keySecret: string;
  /** Webhook secret */
  webhookSecret: string;
}

/**
 * Stripe configuration interface
 */
export interface StripeConfig {
  /** Stripe publishable key */
  publishableKey: string;
  /** Stripe secret key */
  secretKey: string;
  /** Webhook secret */
  webhookSecret: string;
}

/**
 * PayPal configuration interface
 */
export interface PayPalConfig {
  /** PayPal client ID */
  clientId: string;
  /** PayPal client secret */
  clientSecret: string;
  /** Webhook ID */
  webhookId: string;
}

/**
 * Payment gateways configuration
 */
export interface PaymentConfig {
  /** Razorpay configuration */
  razorpay: RazorpayConfig;
  /** Stripe configuration */
  stripe: StripeConfig;
  /** PayPal configuration */
  paypal: PayPalConfig;
}

// =============================================================================
// CLOUD SERVICES CONFIGURATION
// =============================================================================

/**
 * AWS S3 configuration interface
 */
export interface AWSS3Config {
  /** AWS access key ID */
  accessKeyId: string;
  /** AWS secret access key */
  secretAccessKey: string;
  /** AWS region */
  region: string;
  /** S3 bucket name */
  bucket: string;
  /** CloudFront domain */
  cloudFrontDomain: string | undefined;
}

/**
 * Email service configuration
 */
export interface EmailConfig {
  /** SendGrid configuration */
  sendgrid: {
    apiKey: string;
    fromEmail: string;
    fromName: string;
  };
  /** SMTP configuration */
  smtp: {
    host: string;
    port: number;
    user: string;
    pass: string;
    secure: boolean;
  };
}

/**
 * SMS service configuration
 */
export interface SMSConfig {
  /** Twilio configuration */
  twilio: {
    accountSid: string;
    authToken: string;
    phoneNumber: string;
  };
  /** AWS SNS configuration */
  awsSns: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
  };
}

// =============================================================================
// AI AND EXTERNAL SERVICES
// =============================================================================

/**
 * OpenAI configuration interface
 */
export interface OpenAIConfig {
  /** OpenAI API key */
  apiKey: string;
  /** Default model to use */
  model: OpenAIModel;
  /** Maximum tokens per request */
  maxTokens: number;
  /** Assistant ID for doubt resolution */
  assistantId: string | undefined;
}

/**
 * Live streaming configuration
 */
export interface LiveStreamingConfig {
  /** Agora configuration */
  agora: {
    appId: string;
    appCertificate: string;
  };
  /** AWS MediaConvert configuration */
  mediaConvert: {
    endpoint: string;
    roleArn: string;
  };
  /** Vimeo configuration */
  vimeo: {
    clientId: string;
    clientSecret: string;
    accessToken: string;
  };
}

/**
 * Search service configuration
 */
export interface SearchConfig {
  /** Elasticsearch configuration */
  elasticsearch: {
    url: string;
    username: string;
    password: string;
  };
  /** Algolia configuration */
  algolia: {
    appId: string;
    apiKey: string;
    searchKey: string;
  };
}

// =============================================================================
// MONITORING AND ANALYTICS
// =============================================================================

/**
 * Analytics configuration interface
 */
export interface AnalyticsConfig {
  /** Google Analytics ID */
  googleAnalyticsId: string | undefined;
  /** Mixpanel token */
  mixpanelToken: string | undefined;
  /** Sentry configuration */
  sentry: {
    dsn: string | undefined;
    authToken: string | undefined;
  };
  /** LogRocket app ID */
  logRocketAppId: string | undefined;
}

/**
 * Push notification configuration
 */
export interface PushNotificationConfig {
  /** Firebase configuration */
  firebase: {
    projectId: string;
    privateKey: string;
    clientEmail: string;
    serverKey: string;
  };
  /** OneSignal configuration */
  oneSignal: {
    appId: string;
    restApiKey: string;
  };
}

// =============================================================================
// APPLICATION CONFIGURATION
// =============================================================================

/**
 * Feature flags configuration
 */
export interface FeatureFlags {
  /** Enable AI doubt resolution */
  aiDoubtResolution: boolean;
  /** Enable live classes */
  liveClasses: boolean;
  /** Enable social login */
  socialLogin: boolean;
  /** Enable payment integration */
  paymentIntegration: boolean;
  /** Enable mobile app features */
  mobileApp: boolean;
  /** Enable beta features */
  betaFeatures: boolean;
}

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
  /** Time window in milliseconds */
  windowMs: number;
  /** Maximum requests per window */
  maxRequests: number;
  /** Skip successful requests in rate limit */
  skipSuccessfulRequests: boolean;
}

/**
 * CORS configuration
 */
export interface CORSConfig {
  /** Allowed origins */
  allowedOrigins: string[];
  /** Allowed HTTP methods */
  allowedMethods: string[];
}

/**
 * Localization configuration
 */
export interface LocalizationConfig {
  /** Default language */
  defaultLanguage: SupportedLanguage;
  /** Supported languages */
  supportedLanguages: SupportedLanguage[];
  /** Default timezone */
  defaultTimezone: string;
  /** Default currency */
  defaultCurrency: SupportedCurrency;
}

/**
 * Performance configuration
 */
export interface PerformanceConfig {
  /** Cache TTL in seconds */
  cacheTtl: number;
  /** CDN cache TTL in seconds */
  cdnCacheTtl: number;
  /** API rate limit per minute */
  apiRateLimit: number;
  /** Maximum file upload size */
  maxFileUploadSize: string;
  /** Maximum video upload size */
  maxVideoUploadSize: string;
}

// =============================================================================
// MAIN CONFIGURATION INTERFACE
// =============================================================================

/**
 * Complete application configuration interface
 */
export interface AppConfig {
  /** Application environment */
  env: NodeEnvironment;
  /** Application URL */
  appUrl: string;
  /** Application name */
  appName: string;
  /** Application version */
  appVersion: string;
  /** Debug mode */
  debug: boolean;
  /** Log level */
  logLevel: LogLevel;
  /** Database configuration */
  database: DatabaseConfig;
  /** MongoDB configuration */
  mongodb: MongoConfig;
  /** Redis configuration */
  redis: RedisConfig;
  /** Authentication configuration */
  auth: AuthConfig;
  /** OAuth configuration */
  oauth: OAuthConfig;
  /** Payment configuration */
  payment: PaymentConfig;
  /** AWS S3 configuration */
  s3: AWSS3Config;
  /** Email configuration */
  email: EmailConfig;
  /** SMS configuration */
  sms: SMSConfig;
  /** OpenAI configuration */
  openai: OpenAIConfig;
  /** Live streaming configuration */
  liveStreaming: LiveStreamingConfig;
  /** Search configuration */
  search: SearchConfig;
  /** Analytics configuration */
  analytics: AnalyticsConfig;
  /** Push notification configuration */
  pushNotifications: PushNotificationConfig;
  /** Feature flags */
  features: FeatureFlags;
  /** Rate limiting configuration */
  rateLimit: RateLimitConfig;
  /** CORS configuration */
  cors: CORSConfig;
  /** Localization configuration */
  localization: LocalizationConfig;
  /** Performance configuration */
  performance: PerformanceConfig;
  /** Maintenance mode */
  maintenanceMode: boolean;
  /** Maintenance message */
  maintenanceMessage: string;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Environment variable validation result
 */
export interface ValidationResult {
  /** Whether validation passed */
  isValid: boolean;
  /** Validation errors */
  errors: string[];
  /** Missing required variables */
  missing: string[];
}

/**
 * Configuration loading options
 */
export interface ConfigOptions {
  /** Whether to throw on missing required variables */
  strict?: boolean;
  /** Whether to validate configuration */
  validate?: boolean;
  /** Custom validation rules */
  validationRules?: Record<string, (value: string) => boolean>;
}

/**
 * Environment variable metadata
 */
export interface EnvVarMetadata {
  /** Variable name */
  name: string;
  /** Whether the variable is required */
  required: boolean;
  /** Default value if not provided */
  defaultValue?: string;
  /** Variable description */
  description?: string;
  /** Validation function */
  validator?: (value: string) => boolean;
}

export default AppConfig;