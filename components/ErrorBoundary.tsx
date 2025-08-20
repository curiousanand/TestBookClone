'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronRight } from 'lucide-react';
import { logger } from '@/lib/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log the error
    logger.error('React Error Boundary caught an error', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      errorInfo: {
        componentStack: errorInfo.componentStack,
      },
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
  };

  toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  override render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorInfo } = this.state;
      const isDevelopment = process.env.NODE_ENV === 'development';

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-8">
            {/* Header */}
            <div className="flex items-center space-x-3 mb-6">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Something went wrong
                </h1>
                <p className="text-gray-600 mt-1">
                  We apologize for the inconvenience. An unexpected error occurred.
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                <h3 className="text-sm font-medium text-red-800 mb-2">
                  Error Details
                </h3>
                <p className="text-sm text-red-700 font-mono">
                  {error.message || 'Unknown error occurred'}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <button
                onClick={this.handleRefresh}
                className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Page
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </button>
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Try Again
              </button>
            </div>

            {/* Technical Details (Development only or if showDetails is enabled) */}
            {(isDevelopment || this.props.showDetails) && error && (
              <div className="border-t pt-6">
                <button
                  onClick={this.toggleDetails}
                  className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
                >
                  {this.state.showDetails ? (
                    <ChevronDown className="h-4 w-4 mr-1" />
                  ) : (
                    <ChevronRight className="h-4 w-4 mr-1" />
                  )}
                  Technical Details
                </button>

                {this.state.showDetails && (
                  <div className="space-y-4">
                    {/* Error Stack */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Error Stack
                      </h4>
                      <div className="bg-gray-900 text-gray-100 text-xs font-mono p-4 rounded-md overflow-auto max-h-48">
                        <pre>{error.stack}</pre>
                      </div>
                    </div>

                    {/* Component Stack */}
                    {errorInfo?.componentStack && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                          Component Stack
                        </h4>
                        <div className="bg-gray-900 text-gray-100 text-xs font-mono p-4 rounded-md overflow-auto max-h-48">
                          <pre>{errorInfo.componentStack}</pre>
                        </div>
                      </div>
                    )}

                    {/* Environment Info */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Environment
                      </h4>
                      <div className="bg-gray-50 text-xs p-4 rounded-md space-y-1">
                        <div><strong>URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}</div>
                        <div><strong>User Agent:</strong> {typeof window !== 'undefined' ? window.navigator.userAgent : 'N/A'}</div>
                        <div><strong>Timestamp:</strong> {new Date().toISOString()}</div>
                        <div><strong>Environment:</strong> {process.env.NODE_ENV}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Help Text */}
            <div className="mt-6 text-sm text-gray-500 border-t pt-4">
              <p>
                If this problem persists, please contact support with the error details above.
                {isDevelopment && (
                  <span className="block mt-1 text-yellow-600">
                    <strong>Development Mode:</strong> Check the browser console for additional information.
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Hook for handling errors in functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: string) => {
    logger.error('Manual error reported', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      errorInfo,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    });

    // In development, also throw the error to trigger error boundary
    if (process.env.NODE_ENV === 'development') {
      throw error;
    }
  };
}