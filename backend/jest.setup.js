/**
 * Jest Setup File
 * Configure global test setup and logging
 */

// Suppress verbose logs unless running in CI or with VERBOSE flag
const VERBOSE = process.env.VERBOSE || process.env.CI;

// Global test timeout handler
beforeEach(() => {
  if (VERBOSE) {
    console.log(`\n📝 Starting test: ${expect.getState().currentTestName}`);
  }
});

afterEach(() => {
  if (VERBOSE) {
    const state = expect.getState();
    const testResult = state.numPassedAssertions > 0 ? '✓' : '✗';
    console.log(`${testResult} Test completed: ${state.currentTestName}\n`);
  }
});

// Custom matchers for better error messages
expect.extend({
  toBeValidHttpStatus(received) {
    const pass = received >= 200 && received < 400;
    return {
      pass,
      message: () => 
        `Expected HTTP status to be 2xx or 3xx, but got ${received}`,
    };
  },
});

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️  Unhandled Rejection at:', promise, 'reason:', reason);
});

// Set test timeout defaults
jest.setTimeout(30000);
