'use client';

import React, { forwardRef } from 'react';
import type { LoadingProps } from '@/types/ui';

const Loading = forwardRef<HTMLDivElement, LoadingProps>(
  ({ 
    size = 'md',
    variant = 'spinner',
    color = 'primary',
    overlay = false,
    fullScreen = false,
    text,
    className = '',
    ...props 
  }, ref) => {
    const sizeStyles = {
      xs: 'w-4 h-4',
      sm: 'w-5 h-5',
      md: 'w-6 h-6',
      lg: 'w-8 h-8',
      xl: 'w-12 h-12'
    };

    const colorStyles = {
      primary: 'text-blue-600',
      secondary: 'text-gray-600',
      success: 'text-green-600',
      warning: 'text-yellow-600',
      danger: 'text-red-600',
      white: 'text-white'
    };

    const textSizes = {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl'
    };

    const renderSpinner = () => (
      <svg
        className={`animate-spin ${sizeStyles[size]} ${colorStyles[color]}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        role="status"
        aria-label="Loading"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
        <span className="sr-only">Loading...</span>
      </svg>
    );

    const renderDots = () => (
      <div className={`flex space-x-1 ${colorStyles[color]}`} role="status" aria-label="Loading">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`rounded-full bg-current animate-pulse ${
              size === 'xs' ? 'w-1 h-1' :
              size === 'sm' ? 'w-1.5 h-1.5' :
              size === 'md' ? 'w-2 h-2' :
              size === 'lg' ? 'w-3 h-3' :
              'w-4 h-4'
            }`}
            style={{
              animationDelay: `${i * 0.2}s`,
              animationDuration: '1s'
            }}
          />
        ))}
        <span className="sr-only">Loading...</span>
      </div>
    );

    const renderBars = () => (
      <div className={`flex space-x-0.5 ${colorStyles[color]}`} role="status" aria-label="Loading">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`bg-current rounded-sm animate-pulse ${
              size === 'xs' ? 'w-0.5 h-3' :
              size === 'sm' ? 'w-1 h-4' :
              size === 'md' ? 'w-1 h-5' :
              size === 'lg' ? 'w-1.5 h-6' :
              'w-2 h-8'
            }`}
            style={{
              animationDelay: `${i * 0.15}s`,
              animationDuration: '1.2s'
            }}
          />
        ))}
        <span className="sr-only">Loading...</span>
      </div>
    );

    const renderPulse = () => (
      <div
        className={`rounded-full bg-current animate-pulse ${sizeStyles[size]} ${colorStyles[color]}`}
        style={{ animationDuration: '2s' }}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    );

    const renderRing = () => (
      <div
        className={`border-4 border-gray-200 border-t-current rounded-full animate-spin ${sizeStyles[size]} ${colorStyles[color]}`}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    );

    const renderLoadingContent = () => {
      switch (variant) {
        case 'dots':
          return renderDots();
        case 'bars':
          return renderBars();
        case 'pulse':
          return renderPulse();
        case 'ring':
          return renderRing();
        default:
          return renderSpinner();
      }
    };

    const loadingContent = (
      <div
        ref={ref}
        className={`
          flex flex-col items-center justify-center space-y-2
          ${className}
        `}
        {...props}
      >
        {renderLoadingContent()}
        {text && (
          <p className={`${textSizes[size]} ${colorStyles[color]} animate-pulse`}>
            {text}
          </p>
        )}
      </div>
    );

    if (fullScreen) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-90 dark:bg-gray-900 dark:bg-opacity-90">
          {loadingContent}
        </div>
      );
    }

    if (overlay) {
      return (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-white bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75">
          {loadingContent}
        </div>
      );
    }

    return loadingContent;
  }
);

Loading.displayName = 'Loading';

export default Loading;