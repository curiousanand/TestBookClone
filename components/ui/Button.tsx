'use client';

import React, { forwardRef } from 'react';
import type { ButtonProps } from '@/types/ui';

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    fullWidth = false, 
    loading = false, 
    disabled = false, 
    leftIcon, 
    rightIcon,
    className = '',
    type = 'button',
    ...props 
  }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantStyles = {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
      secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-500 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white',
      outline: 'border border-gray-300 bg-transparent hover:bg-gray-50 text-gray-700 focus:ring-blue-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800',
      ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-blue-500 dark:hover:bg-gray-800 dark:text-gray-300',
      danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
      success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
      warning: 'bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-500',
      link: 'bg-transparent hover:underline text-blue-600 focus:ring-blue-500 p-0 h-auto min-h-0 dark:text-blue-400'
    };

    const sizeStyles = {
      xs: 'px-2.5 py-1.5 text-xs min-h-[28px]',
      sm: 'px-3 py-2 text-sm min-h-[32px]',
      md: 'px-4 py-2 text-sm min-h-[36px]',
      lg: 'px-6 py-3 text-base min-h-[44px]',
      xl: 'px-8 py-4 text-lg min-h-[52px]'
    };

    const iconSizeStyles = {
      xs: 'w-3 h-3',
      sm: 'w-4 h-4',
      md: 'w-4 h-4',
      lg: 'w-5 h-5',
      xl: 'w-6 h-6'
    };

    const getLoadingSpinner = () => (
      <svg
        className={`animate-spin ${iconSizeStyles[size]} ${leftIcon || rightIcon ? 'mr-2' : ''}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
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
      </svg>
    );

    const combinedClassName = `
      ${baseStyles}
      ${variantStyles[variant]}
      ${variant !== 'link' ? sizeStyles[size] : ''}
      ${fullWidth ? 'w-full' : ''}
      ${loading ? 'cursor-wait' : ''}
      ${className}
    `.trim().replace(/\s+/g, ' ');

    return (
      <button
        ref={ref}
        type={type}
        className={combinedClassName}
        disabled={disabled || loading}
        aria-disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading && !leftIcon && getLoadingSpinner()}
        
        {leftIcon && !loading && (
          <span className={`${iconSizeStyles[size]} mr-2`} aria-hidden="true">
            {leftIcon}
          </span>
        )}
        
        {loading && leftIcon && getLoadingSpinner()}
        
        <span className={loading && !leftIcon && !rightIcon ? 'ml-2' : ''}>
          {children}
        </span>
        
        {rightIcon && !loading && (
          <span className={`${iconSizeStyles[size]} ml-2`} aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;