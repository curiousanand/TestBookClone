'use client';

import React, { forwardRef, useState } from 'react';
import type { AvatarProps, AvatarGroupProps } from '@/types/ui';

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ 
    src,
    alt,
    name,
    size = 'md',
    shape = 'circle',
    showBorder = false,
    status,
    fallbackSrc,
    className = '',
    onClick,
    ...props 
  }, ref) => {
    const [imgSrc, setImgSrc] = useState(src);
    const [hasError, setHasError] = useState(false);

    const sizeStyles = {
      xs: 'w-6 h-6 text-xs',
      sm: 'w-8 h-8 text-sm',
      md: 'w-10 h-10 text-base',
      lg: 'w-12 h-12 text-lg',
      xl: 'w-16 h-16 text-xl',
      '2xl': 'w-20 h-20 text-2xl'
    };

    const shapeStyles = {
      circle: 'rounded-full',
      square: 'rounded-lg'
    };

    const borderStyles = showBorder 
      ? 'ring-2 ring-white dark:ring-gray-800' 
      : '';

    const statusSizes = {
      xs: 'w-1.5 h-1.5',
      sm: 'w-2 h-2',
      md: 'w-2.5 h-2.5',
      lg: 'w-3 h-3',
      xl: 'w-4 h-4',
      '2xl': 'w-5 h-5'
    };

    const statusColors = {
      online: 'bg-green-500',
      offline: 'bg-gray-400',
      away: 'bg-yellow-500',
      busy: 'bg-red-500'
    };

    const getInitials = (name: string) => {
      if (!name) return '?';
      const names = name.trim().split(' ');
      if (names.length === 1) {
        return names[0]?.charAt(0).toUpperCase() || '?';
      }
      const firstChar = names[0]?.charAt(0) || '';
      const lastChar = names[names.length - 1]?.charAt(0) || '';
      return (firstChar + lastChar).toUpperCase() || '?';
    };

    const handleImageError = () => {
      if (fallbackSrc && !hasError) {
        setImgSrc(fallbackSrc);
        setHasError(true);
      } else {
        setImgSrc(undefined);
      }
    };

    const combinedClassName = `
      relative inline-flex items-center justify-center overflow-hidden bg-gray-100 
      dark:bg-gray-600 transition-all duration-200
      ${sizeStyles[size]}
      ${shapeStyles[shape]}
      ${borderStyles}
      ${onClick ? 'cursor-pointer hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2' : ''}
      ${className}
    `.trim().replace(/\s+/g, ' ');

    const Component = onClick ? 'button' : 'div';

    return (
      <Component
        ref={ref as any}
        className={combinedClassName}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        aria-label={alt || name || 'Avatar'}
        {...props}
      >
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={alt || name || 'Avatar'}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        ) : (
          <span className="font-medium text-gray-600 dark:text-gray-300 select-none">
            {name ? getInitials(name) : '?'}
          </span>
        )}
        
        {status && (
          <span
            className={`
              absolute bottom-0 right-0 block rounded-full ring-2 ring-white dark:ring-gray-800
              ${statusSizes[size]}
              ${statusColors[status]}
            `}
            aria-label={`Status: ${status}`}
            role="status"
          />
        )}
      </Component>
    );
  }
);

Avatar.displayName = 'Avatar';

const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ 
    children, 
    max = 4,
    size = 'md',
    spacing = 'normal',
    className = '',
    ...props 
  }, ref) => {
    const avatars = React.Children.toArray(children);
    const visibleAvatars = avatars.slice(0, max);
    const remainingCount = Math.max(0, avatars.length - max);

    const spacingStyles = {
      tight: '-space-x-1',
      normal: '-space-x-2',
      loose: '-space-x-1'
    };

    const sizeStyles = {
      xs: 'w-6 h-6 text-xs',
      sm: 'w-8 h-8 text-sm',
      md: 'w-10 h-10 text-base',
      lg: 'w-12 h-12 text-lg',
      xl: 'w-16 h-16 text-xl',
      '2xl': 'w-20 h-20 text-2xl'
    };

    return (
      <div
        ref={ref}
        className={`flex items-center ${spacingStyles[spacing]} ${className}`}
        {...props}
      >
        {visibleAvatars.map((avatar, index) => {
          if (React.isValidElement(avatar)) {
            const avatarProps = (avatar as any).props || {};
            return React.cloneElement(avatar, {
              key: index,
              size,
              showBorder: true,
              className: `relative z-${10 - index} ${avatarProps.className || ''}`,
              ...avatarProps
            });
          }
          return avatar;
        })}
        
        {remainingCount > 0 && (
          <div
            className={`
              relative z-0 inline-flex items-center justify-center overflow-hidden 
              bg-gray-100 rounded-full ring-2 ring-white dark:bg-gray-600 dark:ring-gray-800
              ${sizeStyles[size]}
            `}
            aria-label={`${remainingCount} more members`}
          >
            <span className="font-medium text-gray-600 dark:text-gray-300 select-none">
              +{remainingCount}
            </span>
          </div>
        )}
      </div>
    );
  }
);

AvatarGroup.displayName = 'AvatarGroup';

export default Avatar;
export { AvatarGroup };