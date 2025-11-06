# Integration Tests

Real HTTP requests to API server with real database.

## Structure

```
tests/integration/
├── auth.integration.test.ts           # Authentication & session tests
├── classes.integration.test.ts        # Class management tests
├── assignments.integration.test.ts    # Assignment tests
├── groups.integration.test.ts         # Group management tests
└── rubrics-reviews.integration.test.ts # Rubrics & reviews tests
```

## Running Tests

### All Tests (Recommended)
```bash
npm run test:integration
```
Runs all integration tests sequentially with server setup and cleanup.

### All Tests (Direct)
```bash
npm run test:integration:all
```
Runs all tests assuming server is already running.

### Individual Test Suites
```bash
npm run test:integration:auth
npm run test:integration:classes
npm run test:integration:assignments
npm run test:integration:groups
npm run test:integration:rubrics
```

## Prerequisites

1. MySQL running with `cosc471` database
2. Environment variables configured
3. Test data seeded (done automatically by run-integration-tests.sh)

## Manual Setup

```bash
# Terminal 1: Start server
npm start

# Terminal 2: Run tests
npm run test:integration:all
```
