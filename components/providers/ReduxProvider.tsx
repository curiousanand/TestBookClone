'use client';

/**
 * Redux Provider Component
 * 
 * Wraps the application with Redux store and persistence.
 */

import React, { useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor, type AppStore } from '@/store';

// Loading component for PersistGate
const PersistLoading: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-600 text-sm">Loading your data...</p>
      </div>
    </div>
  );
};

interface ReduxProviderProps {
  children: React.ReactNode;
}

export const ReduxProvider: React.FC<ReduxProviderProps> = ({ children }) => {
  const storeRef = useRef<AppStore>();
  
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = store;
  }

  useEffect(() => {
    // Set up online/offline detection
    const handleOnline = () => {
      storeRef.current?.dispatch({ type: 'ui/setOnlineStatus', payload: true });
    };
    
    const handleOffline = () => {
      storeRef.current?.dispatch({ type: 'ui/setOnlineStatus', payload: false });
    };

    // Set up screen size detection
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        const width = window.innerWidth;
        let screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'lg';
        
        if (width < 640) screenSize = 'xs';
        else if (width < 768) screenSize = 'sm';
        else if (width < 1024) screenSize = 'md';
        else if (width < 1280) screenSize = 'lg';
        else screenSize = 'xl';
        
        storeRef.current?.dispatch({ 
          type: 'ui/setScreenSize', 
          payload: screenSize 
        });
      }
    };

    // Set up session checking for auth
    const checkSession = () => {
      storeRef.current?.dispatch({ type: 'auth/checkSession' });
    };

    // Initial setup
    if (typeof window !== 'undefined') {
      handleResize();
      handleOnline();
      
      // Add event listeners
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      window.addEventListener('resize', handleResize);
      
      // Check session every 5 minutes
      const sessionInterval = setInterval(checkSession, 5 * 60 * 1000);
      
      // Cleanup function
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        window.removeEventListener('resize', handleResize);
        clearInterval(sessionInterval);
      };
    }
  }, []);

  return (
    <Provider store={storeRef.current}>
      <PersistGate loading={<PersistLoading />} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
};

export default ReduxProvider;