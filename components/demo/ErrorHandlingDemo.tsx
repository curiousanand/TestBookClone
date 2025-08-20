'use client';

import React, { useState } from 'react';
import { ErrorDisplay, InlineError, ErrorToast, FieldError } from '@/components/ui/ErrorDisplay';
import { createError, ERROR_CODES, createValidationError, handleClientError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export function ErrorHandlingDemo() {
  const [showToast, setShowToast] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<any>(null);

  // Demo different error types
  const demoErrors = [
    createError(ERROR_CODES.VALIDATION_FAILED, 'Email format is invalid', 'Please enter a valid email address'),
    createError(ERROR_CODES.AUTHENTICATION_REQUIRED),
    createError(ERROR_CODES.ACCESS_DENIED, 'You need premium subscription', 'This content requires a premium subscription'),
    createError(ERROR_CODES.COURSE_NOT_FOUND),
    createError(ERROR_CODES.RATE_LIMIT_EXCEEDED),
    createError(ERROR_CODES.INTERNAL_SERVER_ERROR),
  ];

  const simulateApiCall = async () => {
    try {
      // Simulate API call that fails
      throw new Error('Network request failed');
    } catch (error) {
      const appError = handleClientError(error, { component: 'ErrorHandlingDemo', action: 'simulateApiCall' });
      setApiError(appError);
    }
  };

  const simulateFormValidation = () => {
    const errors: Record<string, string> = {};
    errors.email = 'Email is required';
    errors.password = 'Password must be at least 8 characters';
    setFormErrors(errors);
  };

  const triggerErrorBoundary = () => {
    // This will trigger the error boundary
    throw new Error('Intentional error to test Error Boundary');
  };

  const testLogging = () => {
    logger.debug('Debug message', { userId: '123', action: 'test' });
    logger.info('Info message', { component: 'ErrorHandlingDemo' });
    logger.warn('Warning message', { issue: 'deprecated_api' });
    logger.error('Error message', { error: new Error('Test error') });
    logger.fatal('Fatal error', { critical: true });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Error Handling System Demo</h1>
        <p className="text-gray-600">
          This page demonstrates the comprehensive error handling system with various error types,
          display components, and logging capabilities.
        </p>
      </div>

      {/* Error Display Examples */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800">Error Display Components</h2>
        
        <div className="grid gap-4">
          {demoErrors.map((error, index) => (
            <ErrorDisplay
              key={index}
              error={error}
              options={{
                showDetails: true,
                showRetry: error.category !== 'authentication',
                customActions: error.category === 'authentication' ? [
                  { label: 'Sign In', action: () => alert('Redirect to sign in'), variant: 'primary' }
                ] : undefined,
              }}
              onRetry={() => alert('Retry action triggered')}
            />
          ))}
        </div>
      </section>

      {/* Form Error Examples */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Form Validation Errors</h2>
        
        <div className="bg-white p-6 border rounded-lg">
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  formErrors.email ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              <FieldError error={formErrors.email} touched={!!formErrors.email} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  formErrors.password ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              <FieldError error={formErrors.password} touched={!!formErrors.password} />
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={simulateFormValidation}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Trigger Form Errors
              </button>
              <button
                type="button"
                onClick={() => setFormErrors({})}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Clear Errors
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* API Error Handling */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">API Error Handling</h2>
        
        <div className="bg-white p-6 border rounded-lg">
          <div className="space-y-4">
            <button
              onClick={simulateApiCall}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Simulate API Error
            </button>

            {apiError && (
              <ErrorDisplay
                error={apiError}
                options={{ showRetry: true }}
                onRetry={() => setApiError(null)}
                onDismiss={() => setApiError(null)}
              />
            )}
          </div>
        </div>
      </section>

      {/* Toast Notification */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Toast Notifications</h2>
        
        <div className="bg-white p-6 border rounded-lg">
          <button
            onClick={() => setShowToast(true)}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
          >
            Show Error Toast
          </button>

          {showToast && (
            <div className="fixed top-4 right-4 z-50">
              <ErrorToast
                error={createError(ERROR_CODES.NETWORK_ERROR)}
                onClose={() => setShowToast(false)}
              />
            </div>
          )}
        </div>
      </section>

      {/* Error Boundary Test */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Error Boundary Test</h2>
        
        <div className="bg-white p-6 border rounded-lg">
          <p className="text-gray-600 mb-4">
            Click the button below to trigger an error that will be caught by the Error Boundary.
          </p>
          <button
            onClick={triggerErrorBoundary}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Trigger Error Boundary
          </button>
        </div>
      </section>

      {/* Logging Test */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Logging System Test</h2>
        
        <div className="bg-white p-6 border rounded-lg">
          <div className="space-y-4">
            <p className="text-gray-600">
              Test the logging system by clicking the button below. Check the browser console to see the logs.
            </p>
            <button
              onClick={testLogging}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Test Logging
            </button>
            {typeof window !== 'undefined' && (
              <div className="text-sm text-gray-500">
                <p>Available debug commands in console:</p>
                <ul className="list-disc ml-5 space-y-1">
                  <li><code>__showLogs()</code> - Show all stored logs</li>
                  <li><code>__downloadLogs()</code> - Download logs as JSON</li>
                  <li><code>__clearLogs()</code> - Clear all stored logs</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Inline Error Example */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Inline Error Examples</h2>
        
        <div className="bg-white p-6 border rounded-lg space-y-4">
          <InlineError error="This is a simple inline error message" />
          <InlineError error={createValidationError('Invalid input format', { field: 'username' })} />
        </div>
      </section>
    </div>
  );
}