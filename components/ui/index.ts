// UI Component Library - Central Exports
// This file provides a single entry point for all UI components

// Button Component
export { default as Button } from './Button';

// Input Component  
export { default as Input } from './Input';

// Card Components
export { default as Card, CardHeader, CardBody, CardFooter } from './Card';

// Modal Components
export { default as Modal, ModalHeader, ModalBody, ModalFooter } from './Modal';

// Dropdown Components
export { default as Dropdown, DropdownItem, DropdownDivider } from './Dropdown';

// Badge Component
export { default as Badge } from './Badge';

// Avatar Components
export { default as Avatar, AvatarGroup } from './Avatar';

// Loading Component
export { default as Loading } from './Loading';

// Alert Component
export { default as Alert } from './Alert';

// Type exports for better TypeScript integration
export type {
  ButtonProps,
  InputProps,
  CardProps,
  CardHeaderProps,
  CardBodyProps,
  CardFooterProps,
  ModalProps,
  ModalHeaderProps,
  ModalBodyProps,
  ModalFooterProps,
  DropdownProps,
  DropdownItemProps,
  DropdownDividerProps,
  BadgeProps,
  AvatarProps,
  AvatarGroupProps,
  LoadingProps,
  AlertProps
} from '@/types/ui';