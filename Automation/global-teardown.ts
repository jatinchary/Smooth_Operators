import { FullConfig } from '@playwright/test';

/**
 * Global teardown that runs after all tests
 * Cleans up any global state or resources
 */
async function globalTeardown(config: FullConfig) {
  console.log('🧹 Running global teardown...');

  // Add any cleanup logic here if needed
  // For example: clean up test data, close connections, etc.

  console.log('✅ Global teardown complete');
  console.log('🏁 Smooth Operators Automation Test Suite finished');
}

export default globalTeardown;
