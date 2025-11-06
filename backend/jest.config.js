/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\.tsx?$': ['ts-jest', {
      tsconfig: {
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      }
    }],
  },
  verbose: true,
  testTimeout: 30000,
  collectCoverage: process.env.COLLECT_COVERAGE === 'true',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    }
  },
  maxWorkers: 1,
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/tests/**/*.test.ts',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['/node_modules/'],
  globals: {
    'ts-jest': {
      isolatedModules: true,
    }
  }
};