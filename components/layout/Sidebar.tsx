'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Button, Avatar, Badge } from '../ui';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
}

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  children?: {
    label: string;
    href: string;
    description?: string;
  }[];
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null | undefined;
  currentLanguage?: 'en' | 'hi';
  onLanguageChange?: (language: 'en' | 'hi') => void;
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  user,
  currentLanguage = 'en',
  onLanguageChange,
  className = ''
}) => {
  const router = useRouter();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Mobile navigation items
  const sidebarItems: SidebarItem[] = [
    {
      label: 'Home',
      href: '/',
      icon: <span className="text-lg">🏠</span>
    },
    {
      label: 'Test Series',
      href: '/test-series',
      icon: <span className="text-lg">📝</span>,
      badge: 'New',
      children: [
        { label: 'Banking Exams', href: '/test-series/banking', description: 'SBI, IBPS, RBI and more' },
        { label: 'SSC Exams', href: '/test-series/ssc', description: 'CGL, CHSL, MTS, GD' },
        { label: 'Railway Exams', href: '/test-series/railway', description: 'NTPC, Group D, JE, ALP' },
        { label: 'State PSC', href: '/test-series/state-psc', description: 'State Public Service Commission' },
        { label: 'Defense Exams', href: '/test-series/defense', description: 'NDA, CDS, AFCAT' },
        { label: 'Teaching Exams', href: '/test-series/teaching', description: 'CTET, DSSSB, KVS, NVS' }
      ]
    },
    {
      label: 'Live Classes',
      href: '/live-classes',
      icon: <span className="text-lg">📹</span>,
      children: [
        { label: 'Current Affairs', href: '/live-classes/current-affairs', description: 'Daily updates and analysis' },
        { label: 'Quantitative Aptitude', href: '/live-classes/quant', description: 'Mathematics and DI' },
        { label: 'English Language', href: '/live-classes/english', description: 'Grammar and Comprehension' },
        { label: 'Reasoning Ability', href: '/live-classes/reasoning', description: 'Logical Reasoning' },
        { label: 'General Knowledge', href: '/live-classes/gk', description: 'Static GK and Current Affairs' }
      ]
    },
    {
      label: 'Courses',
      href: '/courses',
      icon: <span className="text-lg">📚</span>,
      children: [
        { label: 'Banking Foundation', href: '/courses/banking-foundation', description: 'Complete banking preparation' },
        { label: 'SSC Foundation', href: '/courses/ssc-foundation', description: 'SSC exam preparation' },
        { label: 'Railway Foundation', href: '/courses/railway-foundation', description: 'Railway exam preparation' },
        { label: 'UPSC Prelims', href: '/courses/upsc-prelims', description: 'Civil Services preparation' },
        { label: 'English Speaking', href: '/courses/english-speaking', description: 'Communication skills' },
        { label: 'Computer Basics', href: '/courses/computer-basics', description: 'Digital literacy' }
      ]
    },
    {
      label: 'Previous Papers',
      href: '/previous-papers',
      icon: <span className="text-lg">📄</span>
    },
    {
      label: 'Current Affairs',
      href: '/current-affairs',
      icon: <span className="text-lg">📰</span>,
      badge: 'Updated'
    },
    {
      label: 'Study Material',
      href: '/study-material',
      icon: <span className="text-lg">📖</span>,
      children: [
        { label: 'PDF Downloads', href: '/study-material/pdfs', description: 'Free downloadable content' },
        { label: 'Video Lectures', href: '/study-material/videos', description: 'Recorded video content' },
        { label: 'Practice Sets', href: '/study-material/practice', description: 'Topic-wise practice' },
        { label: 'Formula Sheets', href: '/study-material/formulas', description: 'Quick reference guides' }
      ]
    },
    {
      label: 'Results',
      href: '/results',
      icon: <span className="text-lg">🏆</span>
    }
  ];

  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(new Set());

  const toggleExpanded = (itemLabel: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemLabel)) {
      newExpanded.delete(itemLabel);
    } else {
      newExpanded.add(itemLabel);
    }
    setExpandedItems(newExpanded);
  };

  // Handle click outside
  const handleClickOutside = (event: MouseEvent) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
      onClose();
    }
  };

  // Handle escape key
  const handleEscapeKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  };

  // Focus trap
  const trapFocus = (event: KeyboardEvent) => {
    if (!sidebarRef.current) return;

    const focusableElements = sidebarRef.current.querySelectorAll(
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
  };

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      document.addEventListener('keydown', trapFocus);

      // Focus first focusable element
      setTimeout(() => {
        const firstFocusable = sidebarRef.current?.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as HTMLElement;
        firstFocusable?.focus();
      }, 100);
    } else {
      document.body.style.overflow = '';
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
      document.removeEventListener('keydown', trapFocus);

      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
        previousActiveElement.current = null;
      }
    }

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
      document.removeEventListener('keydown', trapFocus);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sidebarContent = (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300" />
      
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white dark:bg-gray-900 shadow-xl transform transition-transform duration-300 ease-in-out ${className}`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <Link href="/" className="flex items-center space-x-2" onClick={onClose}>
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              TestBook
            </span>
          </Link>
          
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
            aria-label="Close sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* User Section */}
        {user ? (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Avatar
                name={user.name}
                {...(user.avatar ? { src: user.avatar } : {})}
                size="md"
                status="online"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.email}
                </p>
              </div>
            </div>
            
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={() => { router.push('/profile'); onClose(); }} className="justify-center">
                Profile
              </Button>
              <Button variant="outline" size="sm" onClick={() => { router.push('/dashboard'); onClose(); }} className="justify-center">
                Dashboard
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={() => { router.push('/auth/signin'); onClose(); }} className="justify-center">
                Sign In
              </Button>
              <Button variant="primary" size="sm" onClick={() => { router.push('/auth/signup'); onClose(); }} className="justify-center">
                Sign Up
              </Button>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto">
          <div className="px-2 py-4 space-y-1">
            {sidebarItems.map((item) => (
              <div key={item.label}>
                {item.children ? (
                  <>
                    <button
                      onClick={() => toggleExpanded(item.label)}
                      className="w-full flex items-center justify-between px-3 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
                      aria-expanded={expandedItems.has(item.label)}
                    >
                      <div className="flex items-center space-x-3">
                        {item.icon}
                        <span className="font-medium">{item.label}</span>
                        {item.badge && (
                          <Badge variant="danger" size="xs">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <svg
                        className={`w-5 h-5 transition-transform duration-200 ${
                          expandedItems.has(item.label) ? 'rotate-90' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    
                    {expandedItems.has(item.label) && (
                      <div className="ml-6 mt-1 space-y-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href}
                            onClick={onClose}
                            className="block px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
                          >
                            <div className="font-medium">{child.label}</div>
                            {child.description && (
                              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                {child.description}
                              </div>
                            )}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="flex items-center space-x-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
                  >
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <Badge variant="primary" size="xs">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          {/* Language Toggle */}
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Language / भाषा
            </label>
            <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
              <button
                onClick={() => onLanguageChange?.('en')}
                className={`flex-1 px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                  currentLanguage === 'en'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                🇺🇸 English
              </button>
              <button
                onClick={() => onLanguageChange?.('hi')}
                className={`flex-1 px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                  currentLanguage === 'hi'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                🇮🇳 हिंदी
              </button>
            </div>
          </div>

          {user && (
            <div className="space-y-2">
              <Link
                href="/help"
                onClick={onClose}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
              >
                <span>❓</span>
                <span>Help & Support</span>
              </Link>
              
              <button
                onClick={() => {
                  onClose();
                  // Handle sign out
                }}
                className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
              >
                <span>🚪</span>
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(sidebarContent, document.body);
};

export default Sidebar;