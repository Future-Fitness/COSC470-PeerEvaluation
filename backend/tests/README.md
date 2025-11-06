# Authentication Integration Tests

This directory contains comprehensive integration tests for the authentication system that make **real HTTP requests** to the backend API with a **real MySQL database**.

## Test Coverage

The integration tests cover:

### Authentication Tests
- Login with Basic Auth
- Token generation and validation
- Session management
- Multiple user types (student/teacher)
- Edge cases (special chars, case sensitivity)

### Classes Tests
- GET /classes
- POST /create_class
- GET /get_className/:classID
- GET /class_members/:courseID

### Assignments Tests
- POST /create_assignment
- GET /assignments/:course
- Data integrity validation

### Groups Tests
- POST /create_group
- GET /list_all_groups/:assignmentID
- GET /list_group_members/:groupID
- DELETE /delete_group/:groupID
- GET /list_stu_group/:studentID

### Rubrics & Reviews Tests
- POST /create_rubric
- GET /rubric
- GET /criteria
- POST /create_review
- GET /review

## Prerequisites

1. **MySQL** must be running and accessible
2. **Database** `cosc471` must exist
3. **Node.js** and **pnpm** installed
4. Environment variables configured (see below)

## Environment Variables

The tests use the following environment variables:

```bash
# Database Configuration
MYSQL_HOST=localhost      # Database host (default: localhost)
MYSQL_PORT=3306          # Database port (default: 3306)
MYSQL_USER=root          # Database user (default: root)
MYSQL_PASS=password      # Database password (default: password)
MYSQL_DB=cosc471         # Database name (default: cosc471)

# API Configuration
API_URL=http://localhost:3000  # Backend API URL (default: http://localhost:3000)
PORT=3000                      # Backend server port (default: 3000)
```

## Running Tests

### Option 1: Automated Script (Recommended)

The easiest way to run integration tests is using the automated script:

```bash
cd backend
./run-integration-tests.sh
```

This script will:
1. ✓ Check database connection
2. ✓ Initialize database with schema and test data
3. ✓ Start the backend server
4. ✓ Wait for server to be ready
5. ✓ Run integration tests
6. ✓ Clean up and stop the server

### Option 2: Manual Steps

If you prefer to run tests manually:

```bash
# Terminal 1: Prepare database
cd backend
mysql -u root -p cosc471 < ../schema.sql

# Terminal 1: Start backend server
npm start

# Terminal 2: Wait for server and run tests
cd backend
npm run test:wait           # Wait for server to be ready
npm run test:integration    # Run integration tests
```

### Option 3: Run Specific Test Suites

```bash
# Run only unit tests (with mocks, no server needed)
npm run test:unit

# Run only integration tests (requires running server)
npm run test:integration

# Run all tests
npm test
```

## CI/CD Pipeline

The project includes a GitHub Actions workflow that automatically runs integration tests on every push and pull request.

### Workflow: `.github/workflows/auth-integration-tests.yml`

The CI pipeline:
1. Sets up MySQL 8.0 service container
2. Installs Node.js and pnpm
3. Installs dependencies
4. Initializes database with schema and test data
5. Starts backend server
6. Waits for server to be ready
7. Runs integration tests
8. Displays logs on failure
9. Cleans up resources

### Triggering CI/CD

The workflow runs automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches
- Manual trigger via GitHub Actions UI

To trigger manually:
1. Go to GitHub repository → Actions tab
2. Select "Authentication Integration Tests" workflow
3. Click "Run workflow"

## Test Data

The tests use data from `schema.sql` which includes:

### Test Users

| Username  | Password     | Email              | Role    | User ID |
|-----------|--------------|--------------------| ------- |---------|
| test      | 1234         | test@test.com      | Student | 1       |
| test2     | 1234         | teacher@test.com   | Teacher | 2       |
| JDoe      | (hashed)     | john.doe@...       | Student | 3       |
| ... and more dummy users ...                                    |

**Note:** The main test users are `test` (student) and `test2` (teacher) with password `1234`.

## Test Structure

```
backend/tests/
├── README.md                          # This file
├── integration/                       # Integration tests (real HTTP + DB)
│   ├── auth.integration.test.ts
│   ├── classes.integration.test.ts
│   ├── assignments.integration.test.ts
│   ├── groups.integration.test.ts
│   └── rubrics-reviews.integration.test.ts
├── wait-for-server.ts                 # Utility to wait for server startup
├── login.test.ts                      # Unit tests (mocked)
├── user_id.test.ts                    # Unit tests (mocked)
└── ... other unit test files ...
```

## Writing New Integration Tests

To add new integration tests:

1. **Use axios** for making HTTP requests:
```typescript
const response = await axios.get(`${API_BASE_URL}/endpoint`, {
  headers: {
    Authorization: createBearerAuthHeader(token),
  },
});
```

2. **Use test helpers**:
```typescript
// Create Basic Auth header
const authHeader = createBasicAuthHeader('username', 'password');

// Create Bearer token header
const bearerHeader = createBearerAuthHeader(token);
```

3. **Handle errors properly**:
```typescript
try {
  await axios.get(`${API_BASE_URL}/protected`);
  fail('Expected request to fail');
} catch (error) {
  const axiosError = error as AxiosError;
  expect(axiosError.response?.status).toBe(401);
}
```

4. **Add appropriate timeouts**:
```typescript
test('should do something', async () => {
  // test code
}, TEST_TIMEOUT);
```

## Debugging

### View Backend Logs

When using the automated script:
```bash
# Logs are saved to /tmp/backend-server.log
tail -f /tmp/backend-server.log
```

### Common Issues

**Problem:** Tests fail with "Server not available"
- **Solution:** Ensure backend is running: `npm start`
- **Solution:** Check if port 3000 is already in use: `lsof -i :3000`

**Problem:** Database connection errors
- **Solution:** Verify MySQL is running: `systemctl status mysql`
- **Solution:** Check credentials in environment variables
- **Solution:** Ensure database exists: `mysql -e "CREATE DATABASE IF NOT EXISTS cosc471;"`

**Problem:** "Cannot connect to database" in CI/CD
- **Solution:** Check MySQL service configuration in workflow file
- **Solution:** Verify database credentials in workflow

**Problem:** Tests timeout
- **Solution:** Increase TEST_TIMEOUT constant in test file
- **Solution:** Check server logs for errors
- **Solution:** Verify database is properly seeded

## Performance

- **Integration tests:** ~15-30 seconds (includes server startup)
- **Unit tests:** ~1-2 seconds (mocked, no server)
- **CI/CD pipeline:** ~2-3 minutes (full setup + tests)

## Best Practices

1. **Always seed the database** before running integration tests
2. **Run unit tests frequently** during development (faster feedback)
3. **Run integration tests** before committing (full validation)
4. **Use the automated script** for consistent test execution
5. **Check CI/CD results** before merging pull requests
6. **Clean up test data** between test runs if needed

## npm Scripts Reference

| Script               | Description                                      |
|---------------------|--------------------------------------------------|
| `npm test`          | Run all tests (unit tests with auth disabled)   |
| `npm run test:unit` | Run only unit tests (mocked, fast)              |
| `npm run test:integration` | Run all integration tests (with server setup) |
| `npm run test:integration:all` | Run all integration tests (server must be running) |
| `npm run test:integration:auth` | Run authentication tests only       |
| `npm run test:integration:classes` | Run classes tests only           |
| `npm run test:integration:assignments` | Run assignments tests only   |
| `npm run test:integration:groups` | Run groups tests only            |
| `npm run test:integration:rubrics` | Run rubrics & reviews tests only |
| `npm run test:wait` | Wait for server to be ready                      |
| `npm start`         | Start backend server                             |

## Additional Resources

- [Jest Documentation](https://jestjs.io/)
- [Axios Documentation](https://axios-http.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Fastify Testing Documentation](https://www.fastify.io/docs/latest/Guides/Testing/)
