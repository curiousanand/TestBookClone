'use client';

import React from 'react';
import { AlertTriangle, XCircle, AlertCircle, Info, RefreshCw, Home, ExternalLink } from 'lucide-react';
import { AppError, ErrorDisplayOptions } from '@/lib/errors';

// =============================================================================
// ERROR DISPLAY COMPONENTS
// =============================================================================

interface ErrorDisplayProps {
  error: AppError | Error | string;
  options?: ErrorDisplayOptions;
  className?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function ErrorDisplay({ error, options = {}, className = '', onRetry, onDismiss }: ErrorDisplayProps) {
  const appError = normalizeError(error);
  const { showDetails = false, showRetry = true, showContact = true, customActions = [] } = options;

  const severityConfig = getSeverityConfig(appError.severity);

  return (
    <div className={`rounded-lg border ${severityConfig.containerClasses} ${className}`}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {severityConfig.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`text-sm font-medium ${severityConfig.titleClasses}`}>
              {getSeverityTitle(appError.severity, appError.category)}
            </h3>
            <p className={`mt-1 text-sm ${severityConfig.messageClasses}`}>
              {appError.userMessage}
            </p>
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              <XCircle className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Error Details */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <details className="group">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                Technical Details
              </summary>
              <div className="mt-2 text-xs text-gray-600 space-y-2">
                <div><strong>Error Code:</strong> {appError.code}</div>
                <div><strong>Message:</strong> {appError.message}</div>
                <div><strong>Timestamp:</strong> {new Date(appError.timestamp).toLocaleString()}</div>
                {appError.details && (
                  <div>
                    <strong>Details:</strong>
                    <pre className="mt-1 bg-gray-100 p-2 rounded text-xs overflow-auto">
                      {JSON.stringify(appError.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          </div>
        )}

        {/* Actions */}
        {(showRetry || showContact || customActions.length > 0) && (
          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            {showRetry && onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </button>
            )}
            
            {customActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className={`inline-flex items-center px-3 py-2 border text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${getActionButtonClasses(action.variant)}`}
              >
                {action.label}
              </button>
            ))}

            {showContact && (
              <a
                href="mailto:support@testbook.com"
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Contact Support
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// INLINE ERROR DISPLAY (for forms)
// =============================================================================

interface InlineErrorProps {
  error: string | AppError;
  className?: string;
}

export function InlineError({ error, className = '' }: InlineErrorProps) {
  const message = typeof error === 'string' ? error : error.userMessage;

  return (
    <p className={`text-sm text-red-600 flex items-center space-x-1 ${className}`}>
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <span>{message}</span>
    </p>
  );
}

// =============================================================================
// TOAST ERROR NOTIFICATION
// =============================================================================

interface ErrorToastProps {
  error: AppError | Error | string;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

export function ErrorToast({ error, onClose, autoClose = true, duration = 5000 }: ErrorToastProps) {
  const appError = normalizeError(error);
  const severityConfig = getSeverityConfig(appError.severity);

  React.useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  return (
    <div className={`max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden`}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {severityConfig.icon}
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium text-gray-900">
              {getSeverityTitle(appError.severity, appError.category)}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {appError.userMessage}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={onClose}
              className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// FULL PAGE ERROR
// =============================================================================

interface FullPageErrorProps {
  error: AppError | Error | string;
  onRetry?: () => void;
  onGoHome?: () => void;
  showDetails?: boolean;
}

export function FullPageError({ error, onRetry, onGoHome, showDetails = false }: FullPageErrorProps) {
  const appError = normalizeError(error);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              {getSeverityTitle(appError.severity, appError.category)}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {appError.userMessage}
            </p>
          </div>

          {showDetails && (
            <div className="mt-6 bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-900">Error Details</h3>
              <div className="mt-2 text-xs text-gray-600 space-y-1">
                <div><strong>Code:</strong> {appError.code}</div>
                <div><strong>Message:</strong> {appError.message}</div>
                <div><strong>Time:</strong> {new Date(appError.timestamp).toLocaleString()}</div>
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-col space-y-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </button>
            )}
            <button
              onClick={onGoHome || (() => window.location.href = '/')}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// FORM FIELD ERROR
// =============================================================================

interface FieldErrorProps {
  error?: string;
  touched?: boolean;
  className?: string;
}

export function FieldError({ error, touched, className = '' }: FieldErrorProps) {
  if (!error || !touched) return null;

  return (
    <p className={`mt-1 text-sm text-red-600 ${className}`}>
      {error}
    </p>
  );
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function normalizeError(error: AppError | Error | string): AppError {
  if (typeof error === 'string') {
    return {
      code: 'GENERIC_ERROR',
      message: error,
      userMessage: error,
      statusCode: 500,
      severity: 'medium',
      category: 'client',
      timestamp: new Date().toISOString(),
    };
  }

  if (error instanceof Error) {
    return {
      code: 'GENERIC_ERROR',
      message: error.message,
      userMessage: 'An unexpected error occurred. Please try again.',
      statusCode: 500,
      severity: 'medium',
      category: 'client',
      timestamp: new Date().toISOString(),
    };
  }

  return error;
}

function getSeverityConfig(severity: AppError['severity']) {
  switch (severity) {
    case 'low':
      return {
        icon: <Info className="h-5 w-5 text-blue-400" />,
        containerClasses: 'bg-blue-50 border-blue-200',
        titleClasses: 'text-blue-800',
        messageClasses: 'text-blue-700',
      };
    case 'medium':
      return {
        icon: <AlertCircle className="h-5 w-5 text-yellow-400" />,
        containerClasses: 'bg-yellow-50 border-yellow-200',
        titleClasses: 'text-yellow-800',
        messageClasses: 'text-yellow-700',
      };
    case 'high':
      return {
        icon: <AlertTriangle className="h-5 w-5 text-orange-400" />,
        containerClasses: 'bg-orange-50 border-orange-200',
        titleClasses: 'text-orange-800',
        messageClasses: 'text-orange-700',
      };
    case 'critical':
      return {
        icon: <XCircle className="h-5 w-5 text-red-400" />,
        containerClasses: 'bg-red-50 border-red-200',
        titleClasses: 'text-red-800',
        messageClasses: 'text-red-700',
      };
    default:
      return {
        icon: <AlertCircle className="h-5 w-5 text-gray-400" />,
        containerClasses: 'bg-gray-50 border-gray-200',
        titleClasses: 'text-gray-800',
        messageClasses: 'text-gray-700',
      };
  }
}

function getSeverityTitle(severity: AppError['severity'], category: AppError['category']): string {
  if (category === 'authentication') return 'Authentication Required';
  if (category === 'authorization') return 'Access Denied';
  if (category === 'validation') return 'Input Error';
  if (category === 'network') return 'Connection Error';
  if (category === 'business') return 'Operation Failed';

  switch (severity) {
    case 'low': return 'Notice';
    case 'medium': return 'Warning';
    case 'high': return 'Error';
    case 'critical': return 'Critical Error';
    default: return 'Error';
  }
}

function getActionButtonClasses(variant?: 'primary' | 'secondary' | 'danger'): string {
  switch (variant) {
    case 'primary':
      return 'border-transparent text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
    case 'danger':
      return 'border-transparent text-white bg-red-600 hover:bg-red-700 focus:ring-red-500';
    case 'secondary':
    default:
      return 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-gray-500';
  }
}