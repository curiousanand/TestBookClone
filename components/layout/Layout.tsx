'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
}

interface LayoutProps {
  children: React.ReactNode;
  user?: User | null | undefined;
  showHeader?: boolean;
  showFooter?: boolean;
  showSidebar?: boolean;
  headerClassName?: string;
  footerClassName?: string;
  mainClassName?: string;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  user,
  showHeader = true,
  showFooter = true,
  showSidebar = true,
  headerClassName = '',
  footerClassName = '',
  mainClassName = '',
  className = ''
}) => {
  const pathname = usePathname();
  
  // State management
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'hi'>('en');
  const [isScrolled, setIsScrolled] = useState(false);

  // Language persistence
  useEffect(() => {
    const savedLanguage = localStorage.getItem('testbook-language') as 'en' | 'hi';
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  // Scroll detection for header styling
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  // Handle sidebar toggle
  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  // Handle language change
  const handleLanguageChange = (language: 'en' | 'hi') => {
    setCurrentLanguage(language);
    localStorage.setItem('testbook-language', language);
    
    // Here you could also trigger a language change in your i18n system
    // For example: i18n.changeLanguage(language);
  };

  // Determine if we should hide header/footer for specific pages
  const isAuthPage = pathname?.startsWith('/auth/');
  const isErrorPage = pathname?.includes('/404') || pathname?.includes('/500');
  const isMaintenancePage = pathname?.includes('/maintenance');
  
  const shouldShowHeader = showHeader && !isAuthPage && !isErrorPage && !isMaintenancePage;
  const shouldShowFooter = showFooter && !isAuthPage && !isErrorPage && !isMaintenancePage;

  // SEO and meta tags based on current route
  useEffect(() => {
    // Update document language
    document.documentElement.lang = currentLanguage;
    
    // Update page title based on route and language
    const getPageTitle = () => {
      const baseTitles = {
        en: {
          '/': 'TestBook - India\'s #1 Online Learning Platform',
          '/test-series': 'Test Series - Mock Tests & Practice Papers',
          '/live-classes': 'Live Classes - Expert Faculty Sessions',
          '/courses': 'Courses - Complete Exam Preparation',
          '/current-affairs': 'Current Affairs - Daily Updates & Analysis',
          '/study-material': 'Study Material - Free PDFs & Notes',
          '/results': 'Results - Check Your Performance',
          '/profile': 'My Profile - Account Settings',
          '/dashboard': 'Dashboard - Your Learning Progress'
        },
        hi: {
          '/': 'टेस्टबुक - भारत का #1 ऑनलाइन शिक्षा मंच',
          '/test-series': 'टेस्ट सीरीज - मॉक टेस्ट और अभ्यास पत्र',
          '/live-classes': 'लाइव क्लासेज - विशेषज्ञ शिक्षक सत्र',
          '/courses': 'कोर्सेज - पूर्ण परीक्षा तैयारी',
          '/current-affairs': 'करंट अफेयर्स - दैनिक अपडेट और विश्लेषण',
          '/study-material': 'अध्ययन सामग्री - मुफ्त पीडीएफ और नोट्स',
          '/results': 'परिणाम - अपना प्रदर्शन देखें',
          '/profile': 'मेरी प्रोफ़ाइल - खाता सेटिंग्स',
          '/dashboard': 'डैशबोर्ड - आपकी शिक्षा प्रगति'
        }
      };

      const currentPath = pathname || '/';
      const title = baseTitles[currentLanguage][currentPath as keyof typeof baseTitles[typeof currentLanguage]] || baseTitles[currentLanguage]['/'];
      
      return title;
    };

    document.title = getPageTitle();
  }, [pathname, currentLanguage]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Alt + M to toggle mobile menu
      if (event.altKey && event.key === 'm') {
        event.preventDefault();
        setIsSidebarOpen(!isSidebarOpen);
      }
      
      // Alt + L to toggle language
      if (event.altKey && event.key === 'l') {
        event.preventDefault();
        handleLanguageChange(currentLanguage === 'en' ? 'hi' : 'en');
      }
      
      // Escape to close sidebar
      if (event.key === 'Escape' && isSidebarOpen) {
        event.preventDefault();
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarOpen, currentLanguage]);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-lg z-50 focus:z-50"
      >
        Skip to main content
      </a>

      {/* Header */}
      {shouldShowHeader && (
        <Header
          user={user}
          currentLanguage={currentLanguage}
          onLanguageChange={handleLanguageChange}
          onMobileMenuToggle={handleSidebarToggle}
          className={`${isScrolled ? 'shadow-md backdrop-blur-sm bg-white/95 dark:bg-gray-900/95' : ''} ${headerClassName}`}
        />
      )}

      {/* Sidebar for mobile */}
      {showSidebar && (
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={handleSidebarClose}
          user={user}
          currentLanguage={currentLanguage}
          onLanguageChange={handleLanguageChange}
        />
      )}

      {/* Main Content */}
      <main
        id="main-content"
        className={`flex-1 focus:outline-none ${mainClassName}`}
        tabIndex={-1}
      >
        {children}
      </main>

      {/* Footer */}
      {shouldShowFooter && (
        <Footer className={footerClassName} />
      )}

      {/* Loading indicator for navigation */}
      <div
        id="navigation-loading"
        className="fixed top-0 left-0 right-0 h-1 bg-blue-600 transform scale-x-0 transition-transform duration-300 z-50"
        role="progressbar"
        aria-label="Page loading"
      />

      {/* Back to top button */}
      {isScrolled && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 z-40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Back to top"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </button>
      )}

      {/* Announcement banner (can be controlled via props or context) */}
      <div
        id="announcement-banner"
        className="hidden fixed top-0 left-0 right-0 bg-yellow-400 text-yellow-900 px-4 py-2 text-center text-sm font-medium z-50"
        role="banner"
      >
        <span>🎉 New courses now available! Check out our latest offerings.</span>
        <button
          className="ml-4 text-yellow-700 hover:text-yellow-900 font-bold"
          onClick={(e) => {
            const banner = e.currentTarget.parentElement;
            banner?.classList.add('hidden');
          }}
          aria-label="Dismiss announcement"
        >
          ✕
        </button>
      </div>

      {/* Accessibility improvements - screen reader announcements */}
      <div
        id="screen-reader-announcements"
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      />

      {/* Style injection for theme variables based on language */}
      <style jsx>{`
        :root {
          --current-language: '${currentLanguage}';
          --font-family-primary: ${currentLanguage === 'hi' 
            ? "'Noto Sans Devanagari', 'Inter', system-ui, sans-serif" 
            : "'Inter', system-ui, sans-serif"
          };
        }
        
        body {
          font-family: var(--font-family-primary);
          direction: ${currentLanguage === 'hi' ? 'ltr' : 'ltr'}; /* Both languages are LTR */
        }
        
        /* Smooth scroll behavior */
        html {
          scroll-behavior: smooth;
        }
        
        /* Custom scrollbar for webkit browsers */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
        
        /* Dark mode scrollbar */
        @media (prefers-color-scheme: dark) {
          ::-webkit-scrollbar-track {
            background: #2d3748;
          }
          
          ::-webkit-scrollbar-thumb {
            background: #4a5568;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: #718096;
          }
        }
        
        /* Focus visible styles for better accessibility */
        .focus-visible {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
        
        /* Reduced motion for users who prefer it */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
          
          html {
            scroll-behavior: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default Layout;