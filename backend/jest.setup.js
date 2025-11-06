/**
 * Jest Setup File
 * Configure global test setup
 */

// Set test timeout defaults
jest.setTimeout(30000);

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️  Unhandled Rejection:', reason);
});
