# Error Handling System Documentation

This document outlines the comprehensive error handling system implemented in the TestBook Clone application.

## Overview

The error handling system provides:
- **Global Error Boundary** for React component errors
- **Standardized Error Types** with user-friendly messages
- **Multiple Display Components** for different contexts
- **Client-Side Logging** with remote log submission
- **API Error Handling** with consistent response format
- **Form Validation Errors** with field-level feedback

## Architecture

### Core Components

1. **ErrorBoundary** (`/components/ErrorBoundary.tsx`)
   - Catches React component errors globally
   - Provides fallback UI with retry/navigation options
   - Logs errors automatically
   - Shows technical details in development

2. **Error Utilities** (`/lib/errors.ts`)
   - Defines standardized error types and codes
   - Provides error factory functions
   - Handles error parsing and conversion
   - Includes retry logic utilities

3. **Logging System** (`/lib/logger.ts`)
   - Structured logging with multiple levels
   - Client-side and server-side support
   - Local storage persistence
   - Remote log submission
   - Performance timing utilities

4. **Display Components** (`/components/ui/ErrorDisplay.tsx`)
   - ErrorDisplay: Full error cards with actions
   - InlineError: Simple inline error messages
   - ErrorToast: Toast notifications
   - FullPageError: Full-page error screens
   - FieldError: Form field errors

### Error Types

#### Error Categories
- `validation`: Input validation errors
- `authentication`: Authentication required/failed
- `authorization`: Access denied/insufficient permissions
- `network`: Network connectivity issues
- `server`: Internal server errors
- `client`: Client-side errors
- `business`: Business logic violations

#### Severity Levels
- `low`: Minor issues (info icon, blue theme)
- `medium`: Warnings (warning icon, yellow theme)
- `high`: Errors (alert icon, orange theme)
- `critical`: Critical failures (error icon, red theme)

#### Common Error Codes
```typescript
ERROR_CODES = {
  // Validation (400)
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  
  // Authentication (401)
  AUTHENTICATION_REQUIRED: 'AUTHENTICATION_REQUIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  
  // Authorization (403)
  ACCESS_DENIED: 'ACCESS_DENIED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // Not Found (404)
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  COURSE_NOT_FOUND: 'COURSE_NOT_FOUND',
  
  // Server Errors (500)
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  
  // Business Logic
  ENROLLMENT_LIMIT_REACHED: 'ENROLLMENT_LIMIT_REACHED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
}
```

## Usage Examples

### 1. API Error Handling

```typescript
import { handleApiError, sendError } from '@/lib/api-utils';

export async function POST(request: Request) {
  try {
    // API logic here
    return sendSuccess(data);
  } catch (error) {
    const appError = handleApiError(error, { 
      component: 'CourseAPI',
      action: 'createCourse'
    });
    return sendError(appError);
  }
}
```

### 2. Client Error Handling

```typescript
import { handleClientError, ErrorDisplay } from '@/components/ui/ErrorDisplay';

function MyComponent() {
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    try {
      await submitData();
    } catch (err) {
      const appError = handleClientError(err, { 
        component: 'MyComponent',
        action: 'submitData'
      });
      setError(appError);
    }
  };

  return (
    <div>
      {error && (
        <ErrorDisplay 
          error={error}
          onRetry={() => {
            setError(null);
            handleSubmit();
          }}
          onDismiss={() => setError(null)}
        />
      )}
    </div>
  );
}
```

### 3. Form Validation

```typescript
import { createValidationError, FieldError } from '@/lib/errors';

function LoginForm() {
  const [errors, setErrors] = useState({});

  const validate = (data) => {
    const errors = {};
    if (!data.email) {
      errors.email = 'Email is required';
    }
    if (!data.password) {
      errors.password = 'Password is required';
    }
    return errors;
  };

  return (
    <form>
      <input type="email" name="email" />
      <FieldError error={errors.email} touched={!!errors.email} />
      
      <input type="password" name="password" />
      <FieldError error={errors.password} touched={!!errors.password} />
    </form>
  );
}
```

### 4. Custom Error Creation

```typescript
import { createError, ERROR_CODES } from '@/lib/errors';

// Create specific error
const authError = createError(
  ERROR_CODES.AUTHENTICATION_REQUIRED,
  'User session expired',
  'Please sign in again to continue',
  401,
  { lastActivity: timestamp }
);

// Create validation error
const validationError = createValidationError(
  'Invalid email format',
  { field: 'email', value: userInput }
);
```

### 5. Logging

```typescript
import { logger } from '@/lib/logger';

// Basic logging
logger.info('User logged in', { userId: '123' });
logger.error('Database connection failed', { error });

// With context
const childLogger = logger.child({ component: 'UserService' });
childLogger.debug('Processing user data', { userId });

// Performance timing
logger.time('database-query');
await runQuery();
logger.timeEnd('database-query');

// Error logging
logger.logError(error, 'Failed to process payment', {
  userId: '123',
  paymentId: 'pay_456'
});
```

## Configuration

### Environment Variables

```env
# Logging
NEXT_PUBLIC_LOG_LEVEL=info
NEXT_PUBLIC_ENABLE_REMOTE_LOGGING=true
NEXT_PUBLIC_LOG_ENDPOINT=/api/logs

# Error Handling
NEXT_PUBLIC_SHOW_ERROR_DETAILS=false
NEXT_PUBLIC_ENABLE_ERROR_REPORTING=true
```

### Logger Configuration

```typescript
import { createLogger } from '@/lib/logger';

const customLogger = createLogger({
  level: 'debug',
  enableConsole: true,
  enableStorage: true,
  enableRemote: true,
  maxStorageEntries: 500,
  batchSize: 5,
  flushInterval: 10000,
  context: {
    component: 'MyComponent',
    version: '1.0.0'
  }
});
```

## Error Boundary Integration

The global error boundary is automatically included in the root layout:

```typescript
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ErrorBoundary>
          <ReduxProvider>
            {children}
          </ReduxProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

## Page-Level Error Handling

- **`app/error.tsx`**: Handles page-level errors
- **`app/not-found.tsx`**: Custom 404 page
- **`app/global-error.tsx`**: Global error fallback

## API Error Responses

All API errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Validation failed",
    "statusCode": 400,
    "details": {
      "zodErrors": [...]
    }
  }
}
```

## Best Practices

### 1. Error Classification
- Use appropriate error codes and categories
- Provide user-friendly messages
- Include technical details for debugging

### 2. Error Context
- Always include relevant context (user ID, component, action)
- Use structured logging for better analysis
- Track error patterns and frequencies

### 3. User Experience
- Show actionable error messages
- Provide retry options when appropriate
- Graceful degradation for non-critical errors

### 4. Security
- Never expose sensitive information in error messages
- Log security-related errors for monitoring
- Use appropriate error codes to prevent information disclosure

### 5. Performance
- Batch log submissions to reduce network overhead
- Use appropriate log levels to avoid noise
- Implement proper error boundaries to prevent cascading failures

## Testing

### Demo Page
Visit `/demo/error-handling` to see all error handling components in action.

### Development Tools
In development mode, the following debug commands are available in the browser console:
- `__showLogs()`: Display all stored logs
- `__downloadLogs()`: Download logs as JSON
- `__clearLogs()`: Clear stored logs
- `__logger`: Access to the logger instance

### Error Simulation
The demo page includes buttons to:
- Trigger different error types
- Test form validation
- Simulate API failures
- Test error boundaries
- Generate log entries

## Monitoring and Analytics

### Log Analysis
- Stored logs can be analyzed for patterns
- Remote logs are sent to `/api/logs` endpoint
- Critical errors trigger immediate alerts

### Error Metrics
Track key metrics:
- Error frequency by type/category
- User impact (sessions affected)
- Error resolution time
- Most common error patterns

## Future Enhancements

1. **Error Reporting Integration**
   - Sentry or Bugsnag integration
   - Automatic error screenshots
   - User feedback collection

2. **Advanced Analytics**
   - Error trend analysis
   - User journey impact
   - Performance correlation

3. **Automated Recovery**
   - Smart retry mechanisms
   - Circuit breaker patterns
   - Fallback content delivery

4. **Enhanced UX**
   - Progressive error disclosure
   - Contextual help suggestions
   - Proactive error prevention