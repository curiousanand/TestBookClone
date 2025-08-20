'use client';

import React, { forwardRef, useState, useRef, useEffect, useCallback } from 'react';
import type { DropdownProps, DropdownItemProps, DropdownDividerProps } from '@/types/ui';

const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(
  ({ 
    children, 
    trigger,
    placement = 'bottom-start',
    offset = 4,
    closeOnClick = true,
    disabled = false,
    className = '',
    triggerClassName = '',
    onOpen,
    onClose,
    ...props 
  }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const itemsRef = useRef<HTMLElement[]>([]);

    const placementStyles = {
      'top': 'bottom-full mb-1',
      'top-start': 'bottom-full mb-1',
      'top-end': 'bottom-full mb-1 right-0',
      'bottom': 'top-full mt-1',
      'bottom-start': 'top-full mt-1',
      'bottom-end': 'top-full mt-1 right-0',
      'left': 'right-full mr-1',
      'left-start': 'right-full mr-1',
      'left-end': 'right-full mr-1 bottom-0',
      'right': 'left-full ml-1',
      'right-start': 'left-full ml-1',
      'right-end': 'left-full ml-1 bottom-0'
    };

    const handleToggle = useCallback(() => {
      if (disabled) return;
      
      if (!isOpen) {
        setIsOpen(true);
        setFocusedIndex(-1);
        onOpen?.();
      } else {
        setIsOpen(false);
        setFocusedIndex(-1);
        onClose?.();
      }
    }, [disabled, isOpen, onOpen, onClose]);

    const handleClose = useCallback(() => {
      setIsOpen(false);
      setFocusedIndex(-1);
      triggerRef.current?.focus();
      onClose?.();
    }, [onClose]);

    const handleClickOutside = useCallback((event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    }, [handleClose]);

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
      if (!isOpen) return;

      const items = itemsRef.current.filter(item => 
        item && !item.hasAttribute('disabled') && item.getAttribute('role') === 'menuitem'
      );

      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          handleClose();
          break;
        
        case 'ArrowDown':
          event.preventDefault();
          setFocusedIndex(prev => {
            const nextIndex = prev < items.length - 1 ? prev + 1 : 0;
            items[nextIndex]?.focus();
            return nextIndex;
          });
          break;
        
        case 'ArrowUp':
          event.preventDefault();
          setFocusedIndex(prev => {
            const nextIndex = prev > 0 ? prev - 1 : items.length - 1;
            items[nextIndex]?.focus();
            return nextIndex;
          });
          break;
        
        case 'Home':
          event.preventDefault();
          setFocusedIndex(0);
          items[0]?.focus();
          break;
        
        case 'End':
          event.preventDefault();
          setFocusedIndex(items.length - 1);
          items[items.length - 1]?.focus();
          break;
        
        case 'Enter':
        case ' ':
          if (focusedIndex >= 0 && items[focusedIndex]) {
            event.preventDefault();
            items[focusedIndex].click();
          }
          break;
      }
    }, [isOpen, focusedIndex, handleClose]);

    useEffect(() => {
      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        
        // Focus first item after opening
        setTimeout(() => {
          const items = itemsRef.current.filter(item => 
            item && !item.hasAttribute('disabled') && item.getAttribute('role') === 'menuitem'
          );
          if (items.length > 0) {
            setFocusedIndex(0);
            items[0]?.focus();
          }
        }, 0);
      } else {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleKeyDown);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }, [isOpen, handleClickOutside, handleKeyDown]);

    const triggerElement = React.cloneElement(trigger as React.ReactElement, {
      ref: triggerRef,
      onClick: handleToggle,
      onKeyDown: (event: React.KeyboardEvent) => {
        if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleToggle();
        }
        trigger.props.onKeyDown?.(event);
      },
      'aria-expanded': isOpen,
      'aria-haspopup': 'menu',
      className: `${trigger.props.className || ''} ${triggerClassName}`,
      disabled
    });

    return (
      <div ref={ref} className="relative inline-block" {...props}>
        {triggerElement}
        
        {isOpen && (
          <div
            ref={dropdownRef}
            role="menu"
            className={`
              absolute z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[160px]
              dark:bg-gray-800 dark:border-gray-600 dark:shadow-gray-900/20
              ${placementStyles[placement]}
              ${className}
            `}
            style={{ marginTop: placement.includes('bottom') ? `${offset}px` : undefined }}
          >
            {React.Children.map(children, (child, index) => {
              if (React.isValidElement(child)) {
                return React.cloneElement(child, {
                  ref: (el: HTMLElement) => {
                    itemsRef.current[index] = el;
                  },
                  onClose: closeOnClick ? handleClose : undefined,
                  ...child.props
                });
              }
              return child;
            })}
          </div>
        )}
      </div>
    );
  }
);

Dropdown.displayName = 'Dropdown';

const DropdownItem = forwardRef<HTMLButtonElement, DropdownItemProps>(
  ({ 
    children, 
    disabled = false,
    danger = false,
    leftIcon,
    rightIcon,
    className = '',
    onClose,
    onClick,
    ...props 
  }, ref) => {
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      onClose?.();
    };

    return (
      <button
        ref={ref}
        type="button"
        role="menuitem"
        disabled={disabled}
        className={`
          w-full text-left px-4 py-2 text-sm transition-colors duration-150
          flex items-center space-x-3
          ${disabled 
            ? 'text-gray-400 cursor-not-allowed dark:text-gray-600' 
            : danger
              ? 'text-red-700 hover:bg-red-50 focus:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 dark:focus:bg-red-900/20'
              : 'text-gray-700 hover:bg-gray-100 focus:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:bg-gray-700'
          }
          focus:outline-none
          ${className}
        `}
        onClick={handleClick}
        tabIndex={-1}
        {...props}
      >
        {leftIcon && (
          <span className="w-4 h-4 flex-shrink-0" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        
        <span className="flex-1">{children}</span>
        
        {rightIcon && (
          <span className="w-4 h-4 flex-shrink-0" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

DropdownItem.displayName = 'DropdownItem';

const DropdownDivider = forwardRef<HTMLHRElement, DropdownDividerProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <hr
        ref={ref}
        role="separator"
        className={`my-1 border-gray-200 dark:border-gray-600 ${className}`}
        {...props}
      />
    );
  }
);

DropdownDivider.displayName = 'DropdownDivider';

export default Dropdown;
export { DropdownItem, DropdownDivider };