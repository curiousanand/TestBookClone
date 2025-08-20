/**
 * Configuration Test File
 * This file tests the configuration system
 */

import { validateEnvironment } from './config';
import type { AppConfig } from '@/types/config';

// Test environment validation
const validation = validateEnvironment();

// Test that types are properly defined
const testConfig = (): AppConfig | null => {
  // This is just for type checking, not actual execution
  return null;
};

// Example usage to verify types compile correctly
const exampleConfig = testConfig();
if (exampleConfig) {
  // Test that all properties are accessible with correct types
  console.info('App name type check:', typeof exampleConfig.appName === 'string');
  console.info('Debug type check:', typeof exampleConfig.debug === 'boolean');
  console.info('Features accessible:', !!exampleConfig.features);
  console.info('Database URL accessible:', typeof exampleConfig.database.url === 'string');
  console.info('Types validated successfully');
}

export { validation, testConfig };