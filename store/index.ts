/**
 * Redux Store Configuration
 * 
 * Configures the Redux store with RTK, persistence, and middleware.
 */

import { configureStore } from '@reduxjs/toolkit';
import { 
  persistStore, 
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';

// Import slices
import authSlice from './slices/authSlice';
import courseSlice from './slices/courseSlice';
import examSlice from './slices/examSlice';
import progressSlice from './slices/progressSlice';
import liveClassSlice from './slices/liveClassSlice';
import uiSlice from './slices/uiSlice';

// Import API slice
import { api } from './api';

// Root reducer
const rootReducer = combineReducers({
  auth: authSlice,
  courses: courseSlice,
  exams: examSlice,
  progress: progressSlice,
  liveClasses: liveClassSlice,
  ui: uiSlice,
  [api.reducerPath]: api.reducer,
});

// Persist configuration
const persistConfig = {
  key: 'testbook-root',
  version: 1,
  storage,
  // Only persist specific slices
  whitelist: ['auth', 'progress', 'ui'],
  // Blacklist sensitive or temporary data
  blacklist: ['courses', 'exams', 'liveClasses', api.reducerPath],
};

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(api.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

// Create persistor
export const persistor = persistStore(store);

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;

// Reset store action
export const resetStore = () => {
  persistor.purge();
  window.location.reload();
};

// Utility to check if store is rehydrated
export const isStoreRehydrated = (state: RootState): boolean => {
  return state._persist?.rehydrated ?? false;
};