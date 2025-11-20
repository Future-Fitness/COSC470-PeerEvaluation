#!/bin/bash

echo "======================================"
echo "Running Application Locally"
echo "======================================"
echo ""
echo "Services:"
echo "  Backend:  http://localhost:5008"
echo "  Frontend: http://localhost:5009"
echo "  Database: localhost:3306"
echo ""
echo "======================================"
echo ""

# Function to cleanup on exit
cleanup() {
  echo ""
  echo "Shutting down..."
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
  exit 0
}

trap cleanup SIGINT SIGTERM

# Start backend
echo "Starting backend..."
./run-backend.sh &
BACKEND_PID=$!

sleep 3

# Start frontend
echo "Starting frontend..."
./run-frontend.sh &
FRONTEND_PID=$!

echo ""
echo "✅ Services running! Press Ctrl+C to stop"
echo ""

wait $BACKEND_PID $FRONTEND_PID
