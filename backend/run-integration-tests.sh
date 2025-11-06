#!/bin/bash

# Script to run integration tests with backend server
# This starts the server, waits for it to be ready, runs tests, and cleans up

set -e

echo "==================================="
echo "Integration Test Runner"
echo "==================================="

# Configuration
API_URL=${API_URL:-"http://localhost:5000"}
BACKEND_PID=""

# Cleanup function
cleanup() {
    echo ""
    echo "Cleaning up..."
    if [ ! -z "$BACKEND_PID" ]; then
        echo "Stopping backend server (PID: $BACKEND_PID)..."
        kill $BACKEND_PID 2>/dev/null || true
        wait $BACKEND_PID 2>/dev/null || true
        echo "✓ Backend server stopped"
    fi
}

# Set trap to cleanup on exit
trap cleanup EXIT INT TERM

# Check if MySQL is running and database exists
echo "Checking database connection..."
if ! mysql -u ${MYSQL_USER:-root} -p${MYSQL_PASS:-password} -e "USE ${MYSQL_DB:-cosc471};" 2>/dev/null; then
    echo "✗ Cannot connect to database. Please ensure MySQL is running and database exists."
    echo "  Set MYSQL_USER, MYSQL_PASS, and MYSQL_DB environment variables if needed."
    exit 1
fi
echo "✓ Database connection OK"

# Initialize database with schema and test data
echo ""
echo "Initializing database schema and test data..."
mysql -u ${MYSQL_USER:-root} -p${MYSQL_PASS:-password} ${MYSQL_DB:-cosc471} < ../schema.sql
echo "✓ Database initialized with test data"

# Start backend server in background (listen on PORT=5000)
echo ""
echo "Starting backend server on port 5000..."
PORT=5000 npm start > /tmp/backend-server.log 2>&1 &
BACKEND_PID=$!
echo "Backend server started (PID: $BACKEND_PID)"

# Wait for server to be ready
echo ""
echo "Waiting for server to be ready..."
npm run test:wait

# Run integration tests one by one
echo ""
echo "==================================="
echo "Running Integration Tests"
echo "==================================="

TEST_EXIT_CODE=0
TESTS_PASSED=0
TESTS_FAILED=0

# Array of test suites
declare -a TEST_SUITES=(
    "auth:Authentication"
    "classes:Classes"
    "assignments:Assignments"
    "groups:Groups"
    "rubrics:Rubrics & Reviews"
)

# Run each test suite
for suite in "${TEST_SUITES[@]}"; do
    IFS=':' read -r test_name test_label <<< "$suite"
    echo ""
    echo "-----------------------------------"
    echo "Running: $test_label Tests"
    echo "-----------------------------------"

    if npm run test:integration:$test_name; then
        echo "✓ $test_label tests passed"
        ((TESTS_PASSED++))
    else
        echo "✗ $test_label tests failed"
        ((TESTS_FAILED++))
        TEST_EXIT_CODE=1
    fi
done

echo ""
echo "==================================="
echo "Test Summary"
echo "==================================="
echo "Passed: $TESTS_PASSED"
echo "Failed: $TESTS_FAILED"
echo "Total:  ${#TEST_SUITES[@]}"

echo ""
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "==================================="
    echo "✓ All integration tests passed!"
    echo "==================================="
else
    echo "==================================="
    echo "✗ Integration tests failed"
    echo "==================================="
    echo ""
    echo "Backend server logs:"
    cat /tmp/backend-server.log
fi

exit $TEST_EXIT_CODE
