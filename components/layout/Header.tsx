'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Avatar, Dropdown, DropdownItem, DropdownDivider, Badge } from '../ui';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
}

interface NavigationItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string;
  megaMenu?: {
    sections: {
      title: string;
      items: { label: string; href: string; description?: string }[];
    }[];
  };
}

interface HeaderProps {
  user?: User | null | undefined;
  currentLanguage?: 'en' | 'hi';
  onLanguageChange?: (language: 'en' | 'hi') => void;
  onMobileMenuToggle?: () => void;
  className?: string;
}

const Header: React.FC<HeaderProps> = ({
  user,
  currentLanguage = 'en',
  onLanguageChange,
  onMobileMenuToggle,
  className = ''
}) => {
  const router = useRouter();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Testbook-style navigation structure (8 main menu items)
  const navigationItems: NavigationItem[] = [
    {
      label: 'Home',
      href: '/',
      icon: <span>🏠</span>
    },
    {
      label: 'Test Series',
      href: '/test-series',
      icon: <span>📝</span>,
      badge: 'New',
      megaMenu: {
        sections: [
          {
            title: 'Banking Exams',
            items: [
              { label: 'SBI PO', href: '/test-series/sbi-po', description: 'State Bank of India Probationary Officer' },
              { label: 'IBPS PO', href: '/test-series/ibps-po', description: 'Institute of Banking Personnel Selection' },
              { label: 'RBI Grade B', href: '/test-series/rbi-grade-b', description: 'Reserve Bank of India Grade B Officer' },
              { label: 'Bank Clerk', href: '/test-series/bank-clerk', description: 'Banking Clerical Exams' }
            ]
          },
          {
            title: 'SSC Exams',
            items: [
              { label: 'SSC CGL', href: '/test-series/ssc-cgl', description: 'Combined Graduate Level Examination' },
              { label: 'SSC CHSL', href: '/test-series/ssc-chsl', description: 'Combined Higher Secondary Level' },
              { label: 'SSC MTS', href: '/test-series/ssc-mts', description: 'Multi Tasking Staff' },
              { label: 'SSC GD', href: '/test-series/ssc-gd', description: 'General Duty Constable' }
            ]
          },
          {
            title: 'Railway Exams',
            items: [
              { label: 'RRB NTPC', href: '/test-series/rrb-ntpc', description: 'Non-Technical Popular Categories' },
              { label: 'RRB Group D', href: '/test-series/rrb-group-d', description: 'Railway Group D Examination' },
              { label: 'RRB JE', href: '/test-series/rrb-je', description: 'Junior Engineer Examination' },
              { label: 'RRB ALP', href: '/test-series/rrb-alp', description: 'Assistant Loco Pilot' }
            ]
          }
        ]
      }
    },
    {
      label: 'Live Classes',
      href: '/live-classes',
      icon: <span>📹</span>,
      megaMenu: {
        sections: [
          {
            title: 'Current Affairs',
            items: [
              { label: 'Daily Current Affairs', href: '/live-classes/current-affairs', description: 'Stay updated with latest events' },
              { label: 'Monthly Digest', href: '/live-classes/monthly-digest', description: 'Complete monthly compilation' },
              { label: 'Banking Awareness', href: '/live-classes/banking-awareness', description: 'Banking sector updates' }
            ]
          },
          {
            title: 'Subject Wise',
            items: [
              { label: 'Quantitative Aptitude', href: '/live-classes/quant', description: 'Mathematics and Data Interpretation' },
              { label: 'English Language', href: '/live-classes/english', description: 'Grammar, Vocabulary, Comprehension' },
              { label: 'Reasoning Ability', href: '/live-classes/reasoning', description: 'Logical and Analytical Reasoning' },
              { label: 'General Knowledge', href: '/live-classes/gk', description: 'Static GK and Current Affairs' }
            ]
          }
        ]
      }
    },
    {
      label: 'Courses',
      href: '/courses',
      icon: <span>📚</span>,
      megaMenu: {
        sections: [
          {
            title: 'Popular Courses',
            items: [
              { label: 'Banking Foundation', href: '/courses/banking-foundation', description: 'Complete banking exam preparation' },
              { label: 'SSC Foundation', href: '/courses/ssc-foundation', description: 'Staff Selection Commission exams' },
              { label: 'Railway Foundation', href: '/courses/railway-foundation', description: 'Indian Railways recruitment' },
              { label: 'UPSC Prelims', href: '/courses/upsc-prelims', description: 'Civil Services Preliminary Examination' }
            ]
          },
          {
            title: 'Skill Development',
            items: [
              { label: 'English Speaking', href: '/courses/english-speaking', description: 'Improve communication skills' },
              { label: 'Computer Basics', href: '/courses/computer-basics', description: 'Digital literacy program' },
              { label: 'Interview Preparation', href: '/courses/interview-prep', description: 'Personal interview guidance' }
            ]
          }
        ]
      }
    },
    {
      label: 'Previous Papers',
      href: '/previous-papers',
      icon: <span>📄</span>
    },
    {
      label: 'Current Affairs',
      href: '/current-affairs',
      icon: <span>📰</span>,
      badge: 'Updated'
    },
    {
      label: 'Study Material',
      href: '/study-material',
      icon: <span>📖</span>
    },
    {
      label: 'Results',
      href: '/results',
      icon: <span>🏆</span>
    }
  ];

  const languageOptions = {
    en: { label: 'English', flag: '🇺🇸' },
    hi: { label: 'हिंदी', flag: '🇮🇳' }
  };

  const handleSignOut = () => {
    // Handle sign out logic
    router.push('/auth/signin');
  };


  return (
    <header className={`bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                TestBook
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <div key={item.label} className="relative">
                {item.megaMenu ? (
                  <div
                    className="relative"
                    onMouseEnter={() => setActiveDropdown(item.label)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <button
                      className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                      aria-expanded={activeDropdown === item.label}
                      aria-haspopup="true"
                    >
                      {item.icon}
                      <span>{item.label}</span>
                      {item.badge && (
                        <Badge variant="danger" size="xs">
                          {item.badge}
                        </Badge>
                      )}
                      <svg
                        className={`w-4 h-4 transition-transform duration-200 ${
                          activeDropdown === item.label ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Mega Menu */}
                    {activeDropdown === item.label && (
                      <div className="absolute left-0 top-full w-screen max-w-4xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 rounded-lg mt-1 p-6">
                        <div className="grid grid-cols-3 gap-6">
                          {item.megaMenu.sections.map((section) => (
                            <div key={section.title}>
                              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                                {section.title}
                              </h3>
                              <ul className="space-y-2">
                                {section.items.map((subItem) => (
                                  <li key={subItem.label}>
                                    <Link
                                      href={subItem.href}
                                      className="block p-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors duration-200"
                                    >
                                      <div className="font-medium">{subItem.label}</div>
                                      {subItem.description && (
                                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                          {subItem.description}
                                        </div>
                                      )}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    {item.badge && (
                      <Badge variant="primary" size="xs">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <Dropdown
              trigger={
                <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                  <span>{languageOptions[currentLanguage].flag}</span>
                  <span className="hidden sm:inline">{languageOptions[currentLanguage].label}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Button>
              }
              placement="bottom-end"
            >
              <DropdownItem
                onClick={() => onLanguageChange?.('en')}
                leftIcon={<span>🇺🇸</span>}
              >
                English
              </DropdownItem>
              <DropdownItem
                onClick={() => onLanguageChange?.('hi')}
                leftIcon={<span>🇮🇳</span>}
              >
                हिंदी
              </DropdownItem>
            </Dropdown>

            {/* User Menu or Auth Buttons */}
            {user ? (
              <Dropdown
                trigger={
                  <button className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200">
                    <Avatar
                      name={user.name}
                      {...(user.avatar ? { src: user.avatar } : {})}
                      size="sm"
                      status="online"
                    />
                    <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {user.name.split(' ')[0]}
                    </span>
                  </button>
                }
                placement="bottom-end"
              >
                <DropdownItem leftIcon={<span>👤</span>} onClick={() => router.push('/profile')}>
                  Profile
                </DropdownItem>
                <DropdownItem leftIcon={<span>📊</span>} onClick={() => router.push('/dashboard')}>
                  Dashboard
                </DropdownItem>
                <DropdownItem leftIcon={<span>⚙️</span>} onClick={() => router.push('/settings')}>
                  Settings
                </DropdownItem>
                <DropdownItem leftIcon={<span>🎓</span>} onClick={() => router.push('/my-courses')}>
                  My Courses
                </DropdownItem>
                <DropdownItem leftIcon={<span>📈</span>} onClick={() => router.push('/progress')}>
                  Progress
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem leftIcon={<span>❓</span>} onClick={() => router.push('/help')}>
                  Help & Support
                </DropdownItem>
                <DropdownItem 
                  danger 
                  leftIcon={<span>🚪</span>} 
                  onClick={handleSignOut}
                >
                  Sign Out
                </DropdownItem>
              </Dropdown>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={() => router.push('/auth/signin')}>
                  Sign In
                </Button>
                <Button variant="primary" size="sm" onClick={() => router.push('/auth/signup')}>
                  Sign Up
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
              onClick={onMobileMenuToggle}
              aria-label="Toggle mobile menu"
              aria-expanded="false"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;