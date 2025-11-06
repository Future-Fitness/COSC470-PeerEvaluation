#!/bin/bash

# Script to run integration tests with backend server
# This starts the server, waits for it to be ready, runs tests, and cleans up

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ${NC} $@"
}

log_success() {
    echo -e "${GREEN}✓${NC} $@"
}

log_error() {
    echo -e "${RED}✗${NC} $@"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $@"
}

log_section() {
    echo ""
    echo "========================================="
    echo "$@"
    echo "========================================="
    echo ""
}

# Configuration
API_URL=${API_URL:-"http://localhost:5000"}
BACKEND_PID=""
START_TIME=$(date +%s)
LOG_DIR="/tmp/integration-tests-$(date +%s)"
mkdir -p "$LOG_DIR"

# Cleanup function
cleanup() {
    log_section "Cleanup"
    
    if [ ! -z "$BACKEND_PID" ]; then
        log_info "Stopping backend server (PID: $BACKEND_PID)..."
        kill $BACKEND_PID 2>/dev/null || true
        wait $BACKEND_PID 2>/dev/null || true
        log_success "Backend server stopped"
    fi
    
    # Calculate elapsed time
    END_TIME=$(date +%s)
    ELAPSED=$((END_TIME - START_TIME))
    log_info "Total execution time: ${ELAPSED}s"
}

# Set trap to cleanup on exit
trap cleanup EXIT INT TERM

# Check if MySQL is running and database exists
log_section "System Information"
log_info "Hostname: $(hostname)"
log_info "Node version: $(node --version)"
log_info "npm version: $(npm --version)"
log_info "Log directory: $LOG_DIR"
log_info "Test API URL: $API_URL"

log_section "Database Setup"
MYSQL_HOST=${MYSQL_HOST:-localhost}
MYSQL_PORT=${MYSQL_PORT:-3306}
MYSQL_USER=${MYSQL_USER:-root}
MYSQL_PASS=${MYSQL_PASS:-password}
MYSQL_DB=${MYSQL_DB:-cosc471}

log_info "Checking database connection at ${MYSQL_HOST}:${MYSQL_PORT}..."
if ! mysql -h ${MYSQL_HOST} -P ${MYSQL_PORT} -u ${MYSQL_USER} -p${MYSQL_PASS} -e "USE ${MYSQL_DB};" 2>/dev/null; then
    log_error "Cannot connect to database at ${MYSQL_HOST}:${MYSQL_PORT}"
    log_error "Please ensure MySQL is running and database '${MYSQL_DB}' exists"
    log_info "Set MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASS, MYSQL_DB environment variables if needed"
    exit 1
fi
log_success "Database connection OK (${MYSQL_HOST}:${MYSQL_PORT}/${MYSQL_DB})"

log_info "Initializing database schema and test data..."
if mysql -h ${MYSQL_HOST} -P ${MYSQL_PORT} -u ${MYSQL_USER} -p${MYSQL_PASS} ${MYSQL_DB} < ../schema.sql; then
    log_success "Database initialized with schema and test data"
else
    log_error "Failed to initialize database"
    exit 1
fi

# Start backend server in background (listen on PORT=5000)
log_section "Starting Backend Server"
log_info "Starting backend server on port 5000..."
PORT=5000 npm start > "$LOG_DIR/backend-server.log" 2>&1 &
BACKEND_PID=$!
log_success "Backend server started (PID: $BACKEND_PID)"

# Wait for server to be ready
log_section "Waiting for Backend Server to be Ready"
log_info "Testing connection to $API_URL..."

MAX_ATTEMPTS=60
ATTEMPT=0
while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    if curl -sSf "$API_URL/ping" >/dev/null 2>&1; then
        log_success "Backend server is ready!"
        break
    fi
    
    ATTEMPT=$((ATTEMPT + 1))
    if [ $((ATTEMPT % 10)) -eq 0 ]; then
        log_info "Waiting for server... ($ATTEMPT/$MAX_ATTEMPTS)"
    fi
    sleep 1
done

if [ $ATTEMPT -ge $MAX_ATTEMPTS ]; then
    log_error "Backend server failed to become ready after ${MAX_ATTEMPTS}s"
    log_section "Backend Server Logs:"
    cat "$LOG_DIR/backend-server.log"
    exit 1
fi

# Run integration tests one by one
log_section "Running Integration Tests"

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
    
    log_section "Test Suite: $test_label"

    if npm run test:integration:$test_name 2>&1 | tee "$LOG_DIR/test-$test_name.log"; then
        log_success "$test_label tests passed"
        ((TESTS_PASSED++))
    else
        log_error "$test_label tests failed"
        ((TESTS_FAILED++))
        TEST_EXIT_CODE=1
    fi
done

log_section "Integration Tests Summary"
log_info "Passed: $TESTS_PASSED"
log_info "Failed: $TESTS_FAILED"
log_info "Total:  ${#TEST_SUITES[@]}"

echo ""
if [ $TEST_EXIT_CODE -eq 0 ]; then
    log_section "✓ All integration tests passed!"
else
    log_section "✗ Integration tests failed"
    log_section "Backend server logs:"
    cat "$LOG_DIR/backend-server.log"
fi

log_info "Test logs saved to: $LOG_DIR"
exit $TEST_EXIT_CODE
