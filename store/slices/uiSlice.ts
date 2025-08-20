/**
 * UI State Slice
 * 
 * Manages global UI state, theme, modals, notifications, and layout preferences.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';

// Types
export type Theme = 'light' | 'dark' | 'system';
export type Language = 'en' | 'hi';
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number; // in milliseconds, 0 means no auto-dismiss
  isVisible: boolean;
  timestamp: number;
}

export interface Modal {
  id: string;
  component: string;
  props?: Record<string, any>;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closable?: boolean;
  backdrop?: boolean;
}

export interface Sidebar {
  isOpen: boolean;
  isPinned: boolean;
  width: number;
  collapsed: boolean;
}

export interface Navigation {
  activeRoute: string;
  breadcrumbs: Breadcrumb[];
  history: string[];
}

export interface Breadcrumb {
  label: string;
  path: string;
  isActive: boolean;
}

export interface Layout {
  headerHeight: number;
  sidebarWidth: number;
  contentPadding: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export interface SearchState {
  isOpen: boolean;
  query: string;
  results: SearchResult[];
  isLoading: boolean;
  recentSearches: string[];
  suggestions: string[];
}

export interface SearchResult {
  id: string;
  type: 'course' | 'exam' | 'live_class' | 'user';
  title: string;
  subtitle?: string;
  description?: string;
  url: string;
  thumbnail?: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  category: 'system' | 'course' | 'exam' | 'live_class' | 'social';
  actionUrl?: string;
  actionText?: string;
  metadata?: Record<string, any>;
}

export interface UIPreferences {
  theme: Theme;
  language: Language;
  fontSize: 'sm' | 'md' | 'lg';
  density: 'comfortable' | 'compact';
  animations: boolean;
  sounds: boolean;
  notifications: {
    desktop: boolean;
    email: boolean;
    push: boolean;
    courses: boolean;
    exams: boolean;
    liveClasses: boolean;
    achievements: boolean;
  };
  accessibility: {
    highContrast: boolean;
    reduceMotion: boolean;
    screenReader: boolean;
    keyboardNavigation: boolean;
  };
}

export interface UIState {
  // Theme and preferences
  preferences: UIPreferences;
  
  // Layout
  layout: Layout;
  sidebar: Sidebar;
  navigation: Navigation;
  
  // Modals and overlays
  modals: Modal[];
  toasts: Toast[];
  
  // Search
  search: SearchState;
  
  // Notifications
  notifications: Notification[];
  notificationCount: number;
  
  // Loading states
  globalLoading: boolean;
  loadingStates: Record<string, boolean>;
  
  // Form states
  formDirty: Record<string, boolean>;
  formErrors: Record<string, any>;
  
  // Feature flags
  features: Record<string, boolean>;
  
  // Connection status
  isOnline: boolean;
  lastOnline?: number;
  
  // Performance
  performanceMode: 'high' | 'balanced' | 'battery';
  
  // Debug
  debugMode: boolean;
}

// Initial state
const getInitialPreferences = (): UIPreferences => ({
  theme: 'system',
  language: 'en',
  fontSize: 'md',
  density: 'comfortable',
  animations: true,
  sounds: true,
  notifications: {
    desktop: true,
    email: true,
    push: true,
    courses: true,
    exams: true,
    liveClasses: true,
    achievements: true,
  },
  accessibility: {
    highContrast: false,
    reduceMotion: false,
    screenReader: false,
    keyboardNavigation: false,
  },
});

const initialState: UIState = {
  preferences: getInitialPreferences(),
  
  layout: {
    headerHeight: 64,
    sidebarWidth: 280,
    contentPadding: 24,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenSize: 'lg',
  },
  
  sidebar: {
    isOpen: true,
    isPinned: true,
    width: 280,
    collapsed: false,
  },
  
  navigation: {
    activeRoute: '',
    breadcrumbs: [],
    history: [],
  },
  
  modals: [],
  toasts: [],
  
  search: {
    isOpen: false,
    query: '',
    results: [],
    isLoading: false,
    recentSearches: [],
    suggestions: [],
  },
  
  notifications: [],
  notificationCount: 0,
  
  globalLoading: false,
  loadingStates: {},
  
  formDirty: {},
  formErrors: {},
  
  features: {
    darkMode: true,
    liveClasses: true,
    aiTutor: false,
    socialFeatures: true,
    gamification: true,
  },
  
  isOnline: true,
  
  performanceMode: 'balanced',
  
  debugMode: process.env.NODE_ENV === 'development',
};

// UI slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Preferences
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.preferences.theme = action.payload;
    },
    
    setLanguage: (state, action: PayloadAction<Language>) => {
      state.preferences.language = action.payload;
    },
    
    updatePreferences: (state, action: PayloadAction<Partial<UIPreferences>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    
    // Layout
    updateLayout: (state, action: PayloadAction<Partial<Layout>>) => {
      state.layout = { ...state.layout, ...action.payload };
    },
    
    setScreenSize: (state, action: PayloadAction<Layout['screenSize']>) => {
      state.layout.screenSize = action.payload;
      state.layout.isMobile = ['xs', 'sm'].includes(action.payload);
      state.layout.isTablet = action.payload === 'md';
      state.layout.isDesktop = ['lg', 'xl'].includes(action.payload);
    },
    
    // Sidebar
    toggleSidebar: (state) => {
      state.sidebar.isOpen = !state.sidebar.isOpen;
    },
    
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebar.isOpen = action.payload;
    },
    
    toggleSidebarPin: (state) => {
      state.sidebar.isPinned = !state.sidebar.isPinned;
    },
    
    collapseSidebar: (state, action: PayloadAction<boolean>) => {
      state.sidebar.collapsed = action.payload;
    },
    
    // Navigation
    setActiveRoute: (state, action: PayloadAction<string>) => {
      state.navigation.activeRoute = action.payload;
      
      // Add to history (keep last 10)
      if (!state.navigation.history.includes(action.payload)) {
        state.navigation.history.unshift(action.payload);
        if (state.navigation.history.length > 10) {
          state.navigation.history = state.navigation.history.slice(0, 10);
        }
      }
    },
    
    setBreadcrumbs: (state, action: PayloadAction<Breadcrumb[]>) => {
      state.navigation.breadcrumbs = action.payload;
    },
    
    // Modals
    openModal: (state, action: PayloadAction<Modal>) => {
      state.modals.push(action.payload);
    },
    
    closeModal: (state, action: PayloadAction<string>) => {
      state.modals = state.modals.filter(modal => modal.id !== action.payload);
    },
    
    closeAllModals: (state) => {
      state.modals = [];
    },
    
    updateModal: (state, action: PayloadAction<{ id: string; updates: Partial<Modal> }>) => {
      const modal = state.modals.find(m => m.id === action.payload.id);
      if (modal) {
        Object.assign(modal, action.payload.updates);
      }
    },
    
    // Toasts
    addToast: (state, action: PayloadAction<Omit<Toast, 'id' | 'timestamp' | 'isVisible'>>) => {
      const toast: Toast = {
        ...action.payload,
        id: `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        isVisible: true,
        duration: action.payload.duration ?? 5000,
      };
      
      state.toasts.push(toast);
      
      // Keep only last 10 toasts
      if (state.toasts.length > 10) {
        state.toasts = state.toasts.slice(-10);
      }
    },
    
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
    },
    
    hideToast: (state, action: PayloadAction<string>) => {
      const toast = state.toasts.find(t => t.id === action.payload);
      if (toast) {
        toast.isVisible = false;
      }
    },
    
    clearToasts: (state) => {
      state.toasts = [];
    },
    
    // Search
    toggleSearch: (state) => {
      state.search.isOpen = !state.search.isOpen;
      if (!state.search.isOpen) {
        state.search.query = '';
        state.search.results = [];
      }
    },
    
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.search.query = action.payload;
      
      // Add to recent searches when query is executed
      if (action.payload && !state.search.recentSearches.includes(action.payload)) {
        state.search.recentSearches.unshift(action.payload);
        if (state.search.recentSearches.length > 5) {
          state.search.recentSearches = state.search.recentSearches.slice(0, 5);
        }
      }
    },
    
    setSearchResults: (state, action: PayloadAction<SearchResult[]>) => {
      state.search.results = action.payload;
    },
    
    setSearchLoading: (state, action: PayloadAction<boolean>) => {
      state.search.isLoading = action.payload;
    },
    
    clearSearchHistory: (state) => {
      state.search.recentSearches = [];
    },
    
    // Notifications
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp' | 'isRead'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        isRead: false,
      };
      
      state.notifications.unshift(notification);
      state.notificationCount = state.notifications.filter(n => !n.isRead).length;
      
      // Keep only last 100 notifications
      if (state.notifications.length > 100) {
        state.notifications = state.notifications.slice(0, 100);
      }
    },
    
    markNotificationRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.notificationCount = Math.max(0, state.notificationCount - 1);
      }
    },
    
    markAllNotificationsRead: (state) => {
      state.notifications.forEach(n => n.isRead = true);
      state.notificationCount = 0;
    },
    
    removeNotification: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.isRead) {
        state.notificationCount = Math.max(0, state.notificationCount - 1);
      }
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    
    clearNotifications: (state) => {
      state.notifications = [];
      state.notificationCount = 0;
    },
    
    // Loading states
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.globalLoading = action.payload;
    },
    
    setLoading: (state, action: PayloadAction<{ key: string; loading: boolean }>) => {
      const { key, loading } = action.payload;
      if (loading) {
        state.loadingStates[key] = true;
      } else {
        delete state.loadingStates[key];
      }
    },
    
    clearLoadingStates: (state) => {
      state.loadingStates = {};
    },
    
    // Form states
    setFormDirty: (state, action: PayloadAction<{ formId: string; dirty: boolean }>) => {
      const { formId, dirty } = action.payload;
      if (dirty) {
        state.formDirty[formId] = true;
      } else {
        delete state.formDirty[formId];
      }
    },
    
    setFormError: (state, action: PayloadAction<{ formId: string; errors: any }>) => {
      const { formId, errors } = action.payload;
      if (errors && Object.keys(errors).length > 0) {
        state.formErrors[formId] = errors;
      } else {
        delete state.formErrors[formId];
      }
    },
    
    clearFormState: (state, action: PayloadAction<string>) => {
      const formId = action.payload;
      delete state.formDirty[formId];
      delete state.formErrors[formId];
    },
    
    // Feature flags
    setFeature: (state, action: PayloadAction<{ feature: string; enabled: boolean }>) => {
      const { feature, enabled } = action.payload;
      state.features[feature] = enabled;
    },
    
    // Connection status
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
      if (!action.payload) {
        state.lastOnline = Date.now();
      }
    },
    
    // Performance
    setPerformanceMode: (state, action: PayloadAction<UIState['performanceMode']>) => {
      state.performanceMode = action.payload;
    },
    
    // Debug
    toggleDebugMode: (state) => {
      state.debugMode = !state.debugMode;
    },
    
    // Utility actions
    showSuccess: (state, action: PayloadAction<string>) => {
      const toast: Toast = {
        id: `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'success',
        title: 'Success',
        message: action.payload,
        duration: 5000,
        isVisible: true,
        timestamp: Date.now(),
      };
      state.toasts.push(toast);
    },
    
    showError: (state, action: PayloadAction<string>) => {
      const toast: Toast = {
        id: `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'error',
        title: 'Error',
        message: action.payload,
        duration: 7000,
        isVisible: true,
        timestamp: Date.now(),
      };
      state.toasts.push(toast);
    },
    
    showWarning: (state, action: PayloadAction<string>) => {
      const toast: Toast = {
        id: `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'warning',
        title: 'Warning',
        message: action.payload,
        duration: 6000,
        isVisible: true,
        timestamp: Date.now(),
      };
      state.toasts.push(toast);
    },
    
    showInfo: (state, action: PayloadAction<string>) => {
      const toast: Toast = {
        id: `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'info',
        title: 'Info',
        message: action.payload,
        duration: 4000,
        isVisible: true,
        timestamp: Date.now(),
      };
      state.toasts.push(toast);
    },
    
    // Reset state
    reset: () => initialState,
  },
});

// Actions
export const {
  setTheme,
  setLanguage,
  updatePreferences,
  updateLayout,
  setScreenSize,
  toggleSidebar,
  setSidebarOpen,
  toggleSidebarPin,
  collapseSidebar,
  setActiveRoute,
  setBreadcrumbs,
  openModal,
  closeModal,
  closeAllModals,
  updateModal,
  addToast,
  removeToast,
  hideToast,
  clearToasts,
  toggleSearch,
  setSearchQuery,
  setSearchResults,
  setSearchLoading,
  clearSearchHistory,
  addNotification,
  markNotificationRead,
  markAllNotificationsRead,
  removeNotification,
  clearNotifications,
  setGlobalLoading,
  setLoading,
  clearLoadingStates,
  setFormDirty,
  setFormError,
  clearFormState,
  setFeature,
  setOnlineStatus,
  setPerformanceMode,
  toggleDebugMode,
  showSuccess,
  showError,
  showWarning,
  showInfo,
  reset,
} = uiSlice.actions;

// Selectors
export const selectUI = (state: RootState) => state.ui;
export const selectTheme = (state: RootState) => state.ui.preferences.theme;
export const selectLanguage = (state: RootState) => state.ui.preferences.language;
export const selectLayout = (state: RootState) => state.ui.layout;
export const selectSidebar = (state: RootState) => state.ui.sidebar;
export const selectModals = (state: RootState) => state.ui.modals;
export const selectToasts = (state: RootState) => state.ui.toasts;
export const selectVisibleToasts = (state: RootState) => state.ui.toasts.filter(t => t.isVisible);
export const selectSearch = (state: RootState) => state.ui.search;
export const selectNotifications = (state: RootState) => state.ui.notifications;
export const selectUnreadNotifications = (state: RootState) => 
  state.ui.notifications.filter(n => !n.isRead);
export const selectNotificationCount = (state: RootState) => state.ui.notificationCount;
export const selectIsLoading = (key?: string) => (state: RootState) => 
  key ? state.ui.loadingStates[key] || false : state.ui.globalLoading;
export const selectFormDirty = (formId: string) => (state: RootState) => 
  state.ui.formDirty[formId] || false;
export const selectFormErrors = (formId: string) => (state: RootState) => 
  state.ui.formErrors[formId];
export const selectFeature = (feature: string) => (state: RootState) => 
  state.ui.features[feature] || false;
export const selectIsOnline = (state: RootState) => state.ui.isOnline;

// Complex selectors
export const selectCurrentModal = (state: RootState) => {
  return state.ui.modals[state.ui.modals.length - 1] || null;
};

export const selectRecentNotifications = (count: number = 5) => (state: RootState) => {
  return state.ui.notifications.slice(0, count);
};

export const selectIsDarkMode = (state: RootState) => {
  const { theme } = state.ui.preferences;
  if (theme === 'dark') return true;
  if (theme === 'light') return false;
  
  // System theme - check if browser prefers dark mode
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  
  return false;
};

export const selectResponsiveValue = <T>(
  values: { xs?: T; sm?: T; md?: T; lg?: T; xl?: T }
) => (state: RootState) => {
  const { screenSize } = state.ui.layout;
  return values[screenSize] || values.lg || values.md || values.sm || values.xs;
};

export default uiSlice.reducer;