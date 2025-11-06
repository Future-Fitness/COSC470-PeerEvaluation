# CI/CD Integration Tests Summary

## GitHub Actions Workflow

The workflow `.github/workflows/auth-integration-tests.yml` runs automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`
- Manual trigger via GitHub Actions UI

## Test Execution Flow

### 1. Setup Phase
```
✓ Checkout code
✓ Setup Node.js 20
✓ Install pnpm
✓ Install backend dependencies
✓ Start MySQL 8.0 service
✓ Wait for MySQL to be ready
✓ Initialize database with schema and test data
✓ Start backend server
✓ Wait for backend to be ready
```

### 2. Test Execution (Sequential)

Each test suite runs separately with detailed output:

#### Authentication Tests
```
=========================================
Running: Authentication Tests
=========================================
PASS tests/integration/auth.integration.test.ts
  Authentication Integration Tests
    ✓ Backend server is running
    POST /login - Basic Authentication
      ✓ should successfully login with valid student credentials
      ✓ should successfully login with valid teacher credentials
      ✓ should fail with invalid username
      ✓ should fail with invalid password
      ... (more tests)
    Token-based Authentication
      ✓ should access protected endpoint with valid token
      ... (more tests)
    Session Management
      ✓ should maintain session across multiple requests
      ... (more tests)

Test Suites: 1 passed, 1 total
Tests:       24 passed, 24 total
```

#### Classes Tests
```
=========================================
Running: Classes Tests
=========================================
PASS tests/integration/classes.integration.test.ts
  Classes Integration Tests
    GET /classes
      ✓ should return list of classes
      ✓ should fail without authentication token
    POST /create_class
      ✓ should create a new class with valid data
      ✓ should fail when creating duplicate class
      ... (more tests)

Test Suites: 1 passed, 1 total
Tests:       12 passed, 12 total
```

#### Assignments Tests
```
=========================================
Running: Assignments Tests
=========================================
PASS tests/integration/assignments.integration.test.ts
  Assignments Integration Tests
    POST /create_assignment
      ✓ should create a new assignment with valid data
      ... (more tests)
    GET /assignments/:course
      ✓ should return assignments for a valid course
      ... (more tests)

Test Suites: 1 passed, 1 total
Tests:       15 passed, 15 total
```

#### Groups Tests
```
=========================================
Running: Groups Tests
=========================================
PASS tests/integration/groups.integration.test.ts
  Groups Integration Tests
    POST /create_group
      ✓ should create a new group with valid data
      ... (more tests)
    GET /list_all_groups/:assignmentID
      ✓ should return list of groups for assignment
      ... (more tests)

Test Suites: 1 passed, 1 total
Tests:       18 passed, 18 total
```

#### Rubrics & Reviews Tests
```
=========================================
Running: Rubrics & Reviews Tests
=========================================
PASS tests/integration/rubrics-reviews.integration.test.ts
  Rubrics and Reviews Integration Tests
    POST /create_rubric
      ✓ should create rubric with valid data
      ... (more tests)
    GET /rubric
      ✓ should get rubric by ID
      ... (more tests)
    POST /create_review
      ✓ should create review with valid data
      ... (more tests)

Test Suites: 1 passed, 1 total
Tests:       21 passed, 21 total
```

### 3. Summary Phase
```
=========================================
Integration Tests Summary
=========================================

Test Suites Executed:
  ✓ Authentication Tests
  ✓ Classes Tests
  ✓ Assignments Tests
  ✓ Groups Tests
  ✓ Rubrics & Reviews Tests

Results:
  - Auth Tests:        success
  - Classes Tests:     success
  - Assignments Tests: success
  - Groups Tests:      success
  - Rubrics Tests:     success

=========================================
For detailed test results, check each test step above
=========================================
```

### 4. Cleanup Phase
```
✓ Stop backend server
✓ Cleanup resources
```

## On Failure

If any test fails:
1. Test execution stops at the failed test suite
2. Backend server logs are displayed
3. Workflow marks as failed
4. Summary shows which tests passed/failed

Example failure output:
```
=========================================
Backend Server Logs
=========================================
[timestamp] Server started on port 3000
[timestamp] Database connected
[timestamp] Error in endpoint: ...
```

## GitHub Actions UI

In the GitHub Actions tab, you'll see:

```
API Integration Tests
├─ Run All Integration Tests
   ├─ ✓ Checkout code
   ├─ ✓ Setup Node.js
   ├─ ✓ Install pnpm
   ├─ ✓ Install backend dependencies
   ├─ ✓ Wait for MySQL to be ready
   ├─ ✓ Initialize database schema and seed test data
   ├─ ✓ Start backend server
   ├─ ✓ Wait for backend to be ready
   ├─ ✓ Run Authentication Tests
   ├─ ✓ Run Classes Tests
   ├─ ✓ Run Assignments Tests
   ├─ ✓ Run Groups Tests
   ├─ ✓ Run Rubrics & Reviews Tests
   ├─ ✓ Test Summary
   └─ ✓ Cleanup
```

## Test Statistics

- **Total Test Suites**: 5
- **Total Tests**: ~90 tests
- **Average Runtime**: 3-5 minutes
- **Database**: MySQL 8.0 with seeded test data
- **Server**: Node.js backend on port 3000

## Viewing Results

1. Go to repository → Actions tab
2. Click on the workflow run
3. Click "Run All Integration Tests" job
4. View detailed logs for each step
5. Check summary at the bottom

## Manual Trigger

To manually run tests:
1. Go to Actions tab
2. Select "API Integration Tests" workflow
3. Click "Run workflow"
4. Select branch
5. Click "Run workflow" button
