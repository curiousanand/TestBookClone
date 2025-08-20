'use client';

import React, { forwardRef } from 'react';
import type { BadgeProps } from '@/types/ui';

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ 
    children, 
    variant = 'default',
    size = 'md',
    rounded = 'md',
    withDot = false,
    removable = false,
    className = '',
    onRemove,
    ...props 
  }, ref) => {
    const baseStyles = 'inline-flex items-center font-medium transition-all duration-200';
    
    const variantStyles = {
      default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      primary: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
      secondary: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
      success: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
      warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
      danger: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
      info: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300',
      outline: 'border border-gray-300 bg-transparent text-gray-700 dark:border-gray-600 dark:text-gray-300',
      'outline-primary': 'border border-blue-300 bg-transparent text-blue-700 dark:border-blue-600 dark:text-blue-300',
      'outline-success': 'border border-green-300 bg-transparent text-green-700 dark:border-green-600 dark:text-green-300',
      'outline-warning': 'border border-yellow-300 bg-transparent text-yellow-700 dark:border-yellow-600 dark:text-yellow-300',
      'outline-danger': 'border border-red-300 bg-transparent text-red-700 dark:border-red-600 dark:text-red-300'
    };

    const sizeStyles = {
      xs: 'px-1.5 py-0.5 text-xs',
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-0.5 text-sm',
      lg: 'px-3 py-1 text-sm',
      xl: 'px-4 py-1 text-base'
    };

    const roundedStyles = {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded',
      lg: 'rounded-lg',
      full: 'rounded-full'
    };

    const dotColors = {
      default: 'bg-gray-500',
      primary: 'bg-blue-500',
      secondary: 'bg-purple-500',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      danger: 'bg-red-500',
      info: 'bg-cyan-500',
      outline: 'bg-gray-500',
      'outline-primary': 'bg-blue-500',
      'outline-success': 'bg-green-500',
      'outline-warning': 'bg-yellow-500',
      'outline-danger': 'bg-red-500'
    };

    const combinedClassName = `
      ${baseStyles}
      ${variantStyles[variant]}
      ${sizeStyles[size]}
      ${roundedStyles[rounded]}
      ${className}
    `.trim().replace(/\s+/g, ' ');

    return (
      <span
        ref={ref}
        className={combinedClassName}
        role="status"
        aria-label={typeof children === 'string' ? children : undefined}
        {...props}
      >
        {withDot && (
          <span
            className={`
              inline-block w-1.5 h-1.5 rounded-full mr-1.5
              ${dotColors[variant]}
            `}
            aria-hidden="true"
          />
        )}
        
        <span>{children}</span>
        
        {removable && onRemove && (
          <button
            type="button"
            className="inline-flex items-center justify-center w-4 h-4 ml-1.5 text-current hover:bg-black hover:bg-opacity-10 rounded-full focus:outline-none focus:ring-1 focus:ring-current transition-colors duration-150"
            onClick={onRemove}
            aria-label="Remove badge"
          >
            <svg
              className="w-2.5 h-2.5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;