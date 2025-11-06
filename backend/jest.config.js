/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\.tsx?$': ['ts-jest',{}],
  },
  verbose: true,
  testTimeout: 10000,
  collectCoverage: false,
  maxWorkers: 1,
};