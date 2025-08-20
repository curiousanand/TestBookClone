'use client';

import React, { forwardRef } from 'react';
import type { CardProps, CardHeaderProps, CardBodyProps, CardFooterProps } from '@/types/ui';

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ 
    children, 
    variant = 'default',
    size = 'md',
    hoverable = false,
    clickable = false,
    shadow = true,
    className = '',
    onClick,
    ...props 
  }, ref) => {
    const baseStyles = 'rounded-lg border transition-all duration-200';
    
    const variantStyles = {
      default: 'bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-700',
      outlined: 'bg-transparent border-gray-300 dark:border-gray-600',
      elevated: 'bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-700',
      filled: 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
    };

    const sizeStyles = {
      xs: 'p-2',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-10'
    };

    const shadowStyles = shadow ? {
      default: 'shadow-sm',
      outlined: '',
      elevated: 'shadow-lg',
      filled: 'shadow-sm'
    } : {
      default: '',
      outlined: '',
      elevated: '',
      filled: ''
    };

    const interactiveStyles = hoverable || clickable ? {
      default: 'hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600',
      outlined: 'hover:border-gray-400 hover:bg-gray-50 dark:hover:border-gray-500 dark:hover:bg-gray-800',
      elevated: 'hover:shadow-xl hover:border-gray-300 dark:hover:border-gray-600',
      filled: 'hover:bg-gray-100 hover:border-gray-300 dark:hover:bg-gray-700 dark:hover:border-gray-600'
    } : {
      default: '',
      outlined: '',
      elevated: '',
      filled: ''
    };

    const combinedClassName = `
      ${baseStyles}
      ${variantStyles[variant]}
      ${sizeStyles[size]}
      ${shadowStyles[variant]}
      ${interactiveStyles[variant]}
      ${clickable ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2' : ''}
      ${className}
    `.trim().replace(/\s+/g, ' ');

    const Component = clickable ? 'button' : 'div';

    return (
      <Component
        ref={ref as any}
        className={combinedClassName}
        onClick={onClick}
        role={clickable ? 'button' : undefined}
        tabIndex={clickable ? 0 : undefined}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Card.displayName = 'Card';

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`border-b border-gray-200 pb-4 mb-4 dark:border-gray-700 ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={className}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardBody.displayName = 'CardBody';

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`border-t border-gray-200 pt-4 mt-4 dark:border-gray-700 ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';

export default Card;
export { CardHeader, CardBody, CardFooter };