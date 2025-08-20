'use client';

import React, { forwardRef, useState } from 'react';
import type { InputProps } from '@/types/ui';

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    type = 'text',
    size = 'md',
    variant = 'default',
    fullWidth = false,
    disabled = false,
    readonly = false,
    required = false,
    label,
    placeholder,
    helperText,
    error,
    success,
    leftIcon,
    rightIcon,
    leftAddon,
    rightAddon,
    maxLength,
    showCount = false,
    className = '',
    wrapperClassName = '',
    id,
    name,
    value,
    onChange,
    onFocus,
    onBlur,
    ...props 
  }, ref) => {
      const [charCount, setCharCount] = useState(value?.toString().length || 0);

    const inputId = id || `input-${name || Math.random().toString(36).substr(2, 9)}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;

    const baseStyles = 'block w-full rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed readonly:bg-gray-50 readonly:cursor-default dark:readonly:bg-gray-800';
    
    const variantStyles = {
      default: `
        border-gray-300 bg-white text-gray-900 placeholder-gray-500
        focus:border-blue-500 focus:ring-blue-500
        dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder-gray-400
        ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
        ${success ? 'border-green-500 focus:border-green-500 focus:ring-green-500' : ''}
      `,
      filled: `
        border-transparent bg-gray-100 text-gray-900 placeholder-gray-500
        focus:border-blue-500 focus:ring-blue-500 focus:bg-white
        dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:bg-gray-900
        ${error ? 'bg-red-50 border-red-500 focus:border-red-500 focus:ring-red-500 dark:bg-red-900/20' : ''}
        ${success ? 'bg-green-50 border-green-500 focus:border-green-500 focus:ring-green-500 dark:bg-green-900/20' : ''}
      `,
      underlined: `
        border-0 border-b-2 border-gray-300 bg-transparent rounded-none px-0 text-gray-900 placeholder-gray-500
        focus:border-blue-500 focus:ring-0
        dark:border-gray-600 dark:text-white dark:placeholder-gray-400
        ${error ? 'border-red-500 focus:border-red-500' : ''}
        ${success ? 'border-green-500 focus:border-green-500' : ''}
      `
    };

    const sizeStyles = {
      xs: 'px-2 py-1.5 text-xs min-h-[28px]',
      sm: 'px-3 py-2 text-sm min-h-[32px]',
      md: 'px-4 py-2.5 text-sm min-h-[40px]',
      lg: 'px-4 py-3 text-base min-h-[48px]',
      xl: 'px-6 py-4 text-lg min-h-[56px]'
    };

    const iconSizeStyles = {
      xs: 'w-3 h-3',
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-5 h-5',
      xl: 'w-6 h-6'
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      if (showCount) {
        setCharCount(newValue.length);
      }
      onChange?.(e);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      onBlur?.(e);
    };

    const hasLeftElement = leftIcon || leftAddon;
    const hasRightElement = rightIcon || rightAddon || (showCount && maxLength);

    const inputClassName = `
      ${baseStyles}
      ${variantStyles[variant]}
      ${sizeStyles[size]}
      ${hasLeftElement ? 'pl-10' : ''}
      ${hasRightElement ? 'pr-10' : ''}
      ${fullWidth ? 'w-full' : ''}
      ${className}
    `.trim().replace(/\s+/g, ' ');

    return (
      <div className={`${fullWidth ? 'w-full' : ''} ${wrapperClassName}`}>
        {label && (
          <label 
            htmlFor={inputId}
            className={`
              block text-sm font-medium mb-2
              ${error ? 'text-red-700 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}
              ${required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ''}
            `}
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftAddon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span className="text-gray-500 text-sm dark:text-gray-400">
                {leftAddon}
              </span>
            </div>
          )}
          
          {leftIcon && !leftAddon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span className={`${iconSizeStyles[size]} text-gray-400 dark:text-gray-500`}>
                {leftIcon}
              </span>
            </div>
          )}
          
          <input
            ref={ref}
            type={type}
            id={inputId}
            name={name}
            value={value}
            placeholder={placeholder}
            maxLength={maxLength}
            required={required}
            disabled={disabled}
            readOnly={readonly}
            className={inputClassName}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={`${errorId || ''} ${helperId || ''}`.trim() || undefined}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
          
          {rightAddon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className="text-gray-500 text-sm dark:text-gray-400">
                {rightAddon}
              </span>
            </div>
          )}
          
          {rightIcon && !rightAddon && !(showCount && maxLength) && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className={`${iconSizeStyles[size]} text-gray-400 dark:text-gray-500`}>
                {rightIcon}
              </span>
            </div>
          )}
          
          {showCount && maxLength && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className={`
                text-xs
                ${charCount >= maxLength ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}
              `}>
                {charCount}/{maxLength}
              </span>
            </div>
          )}
        </div>
        
        {error && (
          <p id={errorId} className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}
        
        {success && !error && (
          <p className="mt-2 text-sm text-green-600 dark:text-green-400">
            {success}
          </p>
        )}
        
        {helperText && !error && !success && (
          <p id={helperId} className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;