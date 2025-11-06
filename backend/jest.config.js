/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  testTimeout: 30000,
  maxWorkers: 1,
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/tests/**/*.test.ts',
  ],
  collectCoverage: false,
  testPathIgnorePatterns: ['/node_modules/'],
};

module.exports = config;