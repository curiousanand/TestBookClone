'use client';

import React, { useState } from 'react';
import Layout from './Layout';
import { Button, Card, CardHeader, CardBody, Badge, Alert } from '../ui';

/**
 * LayoutShowcase - Demo component to test all layout components
 * This component demonstrates the functionality of the responsive layout system
 */
const LayoutShowcase: React.FC = () => {
  const [mockUser, setMockUser] = useState<any>(null);

  // Mock user data for testing
  const sampleUser = {
    id: '1',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@example.com',
    avatar: '',
    role: 'STUDENT' as const
  };

  const toggleMockUser = () => {
    setMockUser(mockUser ? null : sampleUser);
  };

  return (
    <Layout user={mockUser}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center py-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Layout Components Showcase
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Responsive Header, Footer, Sidebar & Mobile Navigation
          </p>
          <Button variant="secondary" size="lg" onClick={toggleMockUser}>
            {mockUser ? 'Sign Out Demo User' : 'Sign In Demo User'}
          </Button>
        </div>

        {/* Features Overview */}
        <Alert variant="info" title="Layout Features Demonstration">
          This showcase demonstrates the comprehensive layout system with Testbook-style navigation,
          responsive design, mobile hamburger menu, and English/Hindi language toggle.
        </Alert>

        {/* Header Features */}
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              🎯 Header Component Features
              <Badge variant="success">Responsive</Badge>
            </h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Desktop Navigation</h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li>✅ 8 main menu items matching Testbook structure</li>
                  <li>✅ Mega menu dropdowns with organized content</li>
                  <li>✅ Language toggle (English/Hindi)</li>
                  <li>✅ User dropdown with profile actions</li>
                  <li>✅ Responsive logo and branding</li>
                  <li>✅ Hover and focus states</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3">Mobile Features</h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li>✅ Hamburger menu button</li>
                  <li>✅ Collapsible navigation</li>
                  <li>✅ Touch-friendly interface</li>
                  <li>✅ Accessible focus management</li>
                  <li>✅ Smooth animations</li>
                  <li>✅ Backdrop overlay</li>
                </ul>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Navigation Structure */}
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              🧭 Testbook Navigation Structure
              <Badge variant="primary">8 Menu Items</Badge>
            </h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: '🏠', name: 'Home', description: 'Dashboard & Overview' },
                { icon: '📝', name: 'Test Series', description: 'Mock Tests & Practice', badge: 'New' },
                { icon: '📹', name: 'Live Classes', description: 'Expert Faculty Sessions' },
                { icon: '📚', name: 'Courses', description: 'Complete Preparation' },
                { icon: '📄', name: 'Previous Papers', description: 'Past Exam Questions' },
                { icon: '📰', name: 'Current Affairs', description: 'Daily Updates', badge: 'Updated' },
                { icon: '📖', name: 'Study Material', description: 'Free PDFs & Notes' },
                { icon: '🏆', name: 'Results', description: 'Performance Analysis' }
              ].map((item) => (
                <div key={item.name} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg text-center">
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <h3 className="font-semibold flex items-center justify-center gap-1">
                    {item.name}
                    {item.badge && <Badge variant="danger" size="xs">{item.badge}</Badge>}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.description}</p>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Sidebar Features */}
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              📱 Mobile Sidebar Features
              <Badge variant="warning">Touch Optimized</Badge>
            </h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Accessibility</h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li>✅ Focus trap management</li>
                  <li>✅ Keyboard navigation</li>
                  <li>✅ ARIA attributes</li>
                  <li>✅ Screen reader support</li>
                  <li>✅ Escape key handling</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3">User Experience</h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li>✅ Smooth slide animations</li>
                  <li>✅ Click outside to close</li>
                  <li>✅ User profile section</li>
                  <li>✅ Expandable menu items</li>
                  <li>✅ Language toggle</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3">Navigation</h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li>✅ Hierarchical structure</li>
                  <li>✅ Category descriptions</li>
                  <li>✅ Quick action buttons</li>
                  <li>✅ Auto-close on navigate</li>
                  <li>✅ Consistent styling</li>
                </ul>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Footer Features */}
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              🦶 Footer Component Features
              <Badge variant="info">300+ Links</Badge>
            </h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Content Organization</h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li>✅ 12 organized link sections</li>
                  <li>✅ 300+ categorized links</li>
                  <li>✅ Newsletter subscription</li>
                  <li>✅ Mobile app download links</li>
                  <li>✅ Social media integration</li>
                  <li>✅ Legal policy links</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3">Link Categories</h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li>📚 Banking Exams (20+ links)</li>
                  <li>🏛️ SSC Exams (20+ links)</li>
                  <li>🚂 Railway Exams (20+ links)</li>
                  <li>🎖️ Defense Exams (20+ links)</li>
                  <li>👨‍🏫 Teaching Exams (20+ links)</li>
                  <li>🔧 Engineering Exams (20+ links)</li>
                </ul>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Responsive Design */}
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              📱💻 Responsive Design Features
              <Badge variant="success">All Devices</Badge>
            </h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { device: '📱 Mobile', breakpoint: '< 640px', features: 'Hamburger menu, Touch navigation, Stacked layout' },
                { device: '📱 Tablet', breakpoint: '640px - 1024px', features: 'Responsive grid, Adaptive spacing, Touch support' },
                { device: '💻 Desktop', breakpoint: '1024px - 1280px', features: 'Full navigation, Mega menus, Hover states' },
                { device: '🖥️ Large', breakpoint: '> 1280px', features: 'Expanded layout, Maximum content width, Optimized spacing' }
              ].map((item) => (
                <div key={item.device} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="text-2xl mb-2 text-center">{item.device}</div>
                  <h3 className="font-semibold text-center mb-2">{item.breakpoint}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">{item.features}</p>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Language Support */}
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              🌍 Language Support
              <Badge variant="secondary">English/Hindi</Badge>
            </h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="text-4xl mb-4">🇺🇸</div>
                <h3 className="text-xl font-semibold mb-2">English</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Complete interface in English with proper font families and cultural adaptations.
                </p>
              </div>
              <div className="text-center p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="text-4xl mb-4">🇮🇳</div>
                <h3 className="text-xl font-semibold mb-2">हिंदी (Hindi)</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  हिंदी भाषा में पूरा इंटरफेस उचित फॉन्ट और सांस्कृतिक अनुकूलन के साथ।
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Testing Instructions */}
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold">🧪 Testing Instructions</h2>
          </CardHeader>
          <CardBody>
            <div className="prose max-w-none">
              <h3>To test the layout components:</h3>
              <ol className="list-decimal list-inside space-y-2">
                <li><strong>Desktop:</strong> Hover over navigation items to see mega menus</li>
                <li><strong>Mobile:</strong> Click the hamburger menu (☰) to open the sidebar</li>
                <li><strong>Language:</strong> Use the language toggle in header or sidebar</li>
                <li><strong>User State:</strong> Click "Sign In Demo User" to test authenticated state</li>
                <li><strong>Responsive:</strong> Resize your browser window to see breakpoint changes</li>
                <li><strong>Accessibility:</strong> Test with keyboard navigation (Tab, Enter, Escape)</li>
                <li><strong>Scroll:</strong> Scroll down to see the "Back to Top" button appear</li>
              </ol>
              
              <h3 className="mt-6">Keyboard Shortcuts:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li><kbd>Alt + M</kbd> - Toggle mobile menu</li>
                <li><kbd>Alt + L</kbd> - Toggle language</li>
                <li><kbd>Escape</kbd> - Close sidebar/modals</li>
                <li><kbd>Tab</kbd> - Navigate through focusable elements</li>
              </ul>
            </div>
          </CardBody>
        </Card>
      </div>
    </Layout>
  );
};

export default LayoutShowcase;