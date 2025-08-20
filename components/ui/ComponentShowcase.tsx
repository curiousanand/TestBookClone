'use client';

import React, { useState } from 'react';
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardBody,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Dropdown,
  DropdownItem,
  DropdownDivider,
  Badge,
  Avatar,
  AvatarGroup,
  Loading,
  Alert
} from './';

/**
 * ComponentShowcase - Demo component to test all UI components
 * This component demonstrates the functionality and accessibility of all UI components
 */
const ComponentShowcase: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(true);
  const [inputValue, setInputValue] = useState('');

  const handleLoadingTest = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        UI Component Library Showcase
      </h1>

      {/* Alert Component */}
      {alertVisible && (
        <Alert
          variant="info"
          title="Welcome to the Component Library"
          dismissible
          onDismiss={() => setAlertVisible(false)}
        >
          This showcase demonstrates all available UI components with proper accessibility features.
        </Alert>
      )}

      {/* Button Components */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Button Components</h2>
        </CardHeader>
        <CardBody>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="success">Success</Button>
            <Button variant="warning">Warning</Button>
            <Button variant="link">Link Button</Button>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-4">
            <Button size="xs">Extra Small</Button>
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
            <Button size="xl">Extra Large</Button>
          </div>

          <div className="mt-4 flex flex-wrap gap-4">
            <Button loading>Loading</Button>
            <Button disabled>Disabled</Button>
            <Button leftIcon={<span>👤</span>}>With Icon</Button>
            <Button rightIcon={<span>→</span>}>Right Icon</Button>
          </div>
        </CardBody>
      </Card>

      {/* Input Component */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Input Component</h2>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <Input
              label="Full Name"
              placeholder="Enter your full name"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              helperText="This is a helper text"
            />
            
            <Input
              label="Email"
              type="email"
              placeholder="Enter your email"
              leftIcon={<span>📧</span>}
              required
            />
            
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              error="Password is too weak"
            />
            
            <Input
              label="Success Input"
              placeholder="This field is valid"
              success="Looks good!"
            />
            
            <Input
              label="Character Count"
              placeholder="Type something..."
              maxLength={50}
              showCount
            />
          </div>
        </CardBody>
      </Card>

      {/* Modal Component */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Modal Component</h2>
        </CardHeader>
        <CardBody>
          <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
          
          <Modal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            size="md"
            centered
          >
            <ModalHeader onClose={() => setModalOpen(false)}>
              Modal Title
            </ModalHeader>
            <ModalBody>
              <p>This is a modal with proper focus management and accessibility features.</p>
              <Input label="Test Input" placeholder="Focus management test" className="mt-4" />
            </ModalBody>
            <ModalFooter>
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setModalOpen(false)}>
                Confirm
              </Button>
            </ModalFooter>
          </Modal>
        </CardBody>
      </Card>

      {/* Dropdown Component */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Dropdown Component</h2>
        </CardHeader>
        <CardBody>
          <Dropdown
            trigger={<Button variant="outline">Actions</Button>}
            placement="bottom-start"
          >
            <DropdownItem leftIcon={<span>👤</span>}>Profile</DropdownItem>
            <DropdownItem leftIcon={<span>⚙️</span>}>Settings</DropdownItem>
            <DropdownDivider />
            <DropdownItem danger leftIcon={<span>🚪</span>}>Logout</DropdownItem>
          </Dropdown>
        </CardBody>
      </Card>

      {/* Badge Component */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Badge Component</h2>
        </CardHeader>
        <CardBody>
          <div className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="primary">Primary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="danger">Danger</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge withDot variant="success">Online</Badge>
            <Badge removable onRemove={() => alert('Badge removed!')}>
              Removable
            </Badge>
          </div>
        </CardBody>
      </Card>

      {/* Avatar Component */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Avatar Component</h2>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar name="John Doe" size="xs" />
              <Avatar name="Jane Smith" size="sm" />
              <Avatar name="Bob Johnson" size="md" />
              <Avatar name="Alice Brown" size="lg" />
              <Avatar name="Charlie Wilson" size="xl" />
            </div>
            
            <div className="flex items-center gap-4">
              <Avatar name="Online User" status="online" />
              <Avatar name="Away User" status="away" />
              <Avatar name="Busy User" status="busy" />
              <Avatar name="Offline User" status="offline" />
            </div>
            
            <AvatarGroup max={3}>
              <Avatar name="User 1" />
              <Avatar name="User 2" />
              <Avatar name="User 3" />
              <Avatar name="User 4" />
              <Avatar name="User 5" />
            </AvatarGroup>
          </div>
        </CardBody>
      </Card>

      {/* Loading Component */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Loading Component</h2>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <div className="flex items-center gap-8">
              <Loading variant="spinner" />
              <Loading variant="dots" />
              <Loading variant="bars" />
              <Loading variant="pulse" />
              <Loading variant="ring" />
            </div>
            
            <div className="flex items-center gap-4">
              <Loading size="xs" />
              <Loading size="sm" />
              <Loading size="md" />
              <Loading size="lg" />
              <Loading size="xl" />
            </div>
            
            <Button onClick={handleLoadingTest} disabled={loading}>
              {loading ? 'Testing...' : 'Test Loading'}
            </Button>
            
            {loading && (
              <div className="relative h-24 border-2 border-dashed border-gray-300 rounded-lg">
                <Loading overlay text="Loading data..." />
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Card Variants */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card variant="default">
          <CardBody>Default Card</CardBody>
        </Card>
        
        <Card variant="outlined">
          <CardBody>Outlined Card</CardBody>
        </Card>
        
        <Card variant="elevated">
          <CardBody>Elevated Card</CardBody>
        </Card>
        
        <Card variant="filled">
          <CardBody>Filled Card</CardBody>
        </Card>
        
        <Card clickable onClick={() => alert('Card clicked!')}>
          <CardBody>Clickable Card</CardBody>
        </Card>
        
        <Card hoverable>
          <CardBody>Hoverable Card</CardBody>
        </Card>
      </div>
    </div>
  );
};

export default ComponentShowcase;