'use client';

import React, { forwardRef, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { ModalProps, ModalHeaderProps, ModalBodyProps, ModalFooterProps } from '@/types/ui';

const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ 
    children, 
    open = false,
    size = 'md',
    centered = false,
    closeOnOverlayClick = true,
    closeOnEscape = true,
    preventScroll = true,
    className = '',
    overlayClassName = '',
    onClose,
    onOpen,
    onOverlayClick,
    ...props 
  }, ref) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const previousActiveElement = useRef<HTMLElement | null>(null);

    const sizeStyles = {
      xs: 'max-w-xs',
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      '2xl': 'max-w-2xl',
      '3xl': 'max-w-3xl',
      '4xl': 'max-w-4xl',
      '5xl': 'max-w-5xl',
      '6xl': 'max-w-6xl',
      '7xl': 'max-w-7xl',
      full: 'max-w-full'
    };

    const handleEscape = useCallback((event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEscape && onClose) {
        event.preventDefault();
        onClose();
      }
    }, [closeOnEscape, onClose]);

    const handleOverlayClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget && closeOnOverlayClick) {
        onOverlayClick?.(event);
        onClose?.();
      }
    }, [closeOnOverlayClick, onClose, onOverlayClick]);

    const trapFocus = useCallback((event: KeyboardEvent) => {
      if (!modalRef.current) return;

      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement?.focus();
          }
        }
      }
    }, []);

    useEffect(() => {
      if (open) {
        previousActiveElement.current = document.activeElement as HTMLElement;
        onOpen?.();

        if (preventScroll) {
          document.body.style.overflow = 'hidden';
        }

        document.addEventListener('keydown', handleEscape);
        document.addEventListener('keydown', trapFocus);

        setTimeout(() => {
          const firstFocusable = modalRef.current?.querySelector(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          ) as HTMLElement;
          firstFocusable?.focus();
        }, 100);
      } else {
        if (preventScroll) {
          document.body.style.overflow = '';
        }
        
        document.removeEventListener('keydown', handleEscape);
        document.removeEventListener('keydown', trapFocus);

        if (previousActiveElement.current) {
          previousActiveElement.current.focus();
          previousActiveElement.current = null;
        }
      }

      return () => {
        if (preventScroll) {
          document.body.style.overflow = '';
        }
        document.removeEventListener('keydown', handleEscape);
        document.removeEventListener('keydown', trapFocus);
      };
    }, [open, handleEscape, trapFocus, preventScroll, onOpen]);

    if (!open) return null;

    const modalContent = (
      <div
        className={`
          fixed inset-0 z-50 flex items-center justify-center p-4
          ${centered ? 'items-center' : 'items-start pt-16'}
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <div
          className={`
            fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300
            ${overlayClassName}
          `}
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
        
        <div
          ref={modalRef || ref}
          className={`
            relative bg-white rounded-lg shadow-xl transform transition-all duration-300
            w-full ${sizeStyles[size]} max-h-[90vh] overflow-hidden
            dark:bg-gray-900 dark:border dark:border-gray-700
            ${className}
          `}
          {...props}
        >
          {children}
        </div>
      </div>
    );

    return createPortal(modalContent, document.body);
  }
);

Modal.displayName = 'Modal';

const ModalHeader = forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ children, showCloseButton = true, onClose, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700
          ${className}
        `}
        {...props}
      >
        <h2 id="modal-title" className="text-xl font-semibold text-gray-900 dark:text-white">
          {children}
        </h2>
        
        {showCloseButton && onClose && (
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded-lg p-1.5 ml-auto inline-flex items-center dark:hover:text-gray-300"
            onClick={onClose}
            aria-label="Close modal"
          >
            <svg
              className="w-5 h-5"
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
      </div>
    );
  }
);

ModalHeader.displayName = 'ModalHeader';

const ModalBody = forwardRef<HTMLDivElement, ModalBodyProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        id="modal-description"
        className={`p-6 overflow-y-auto ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ModalBody.displayName = 'ModalBody';

const ModalFooter = forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ModalFooter.displayName = 'ModalFooter';

export default Modal;
export { ModalHeader, ModalBody, ModalFooter };