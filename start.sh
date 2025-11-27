#!/bin/bash

# Single command to start everything with Docker
# This script:
# 1. Stops any existing containers
# 2. Rebuilds images
# 3. Starts all services (DB auto-seeds on first run)
# 4. Shows logs

set -e

echo "🚀 Starting COSC470 Peer Evaluation Platform"
echo "=============================================="
echo ""

# Stop and remove existing containers
echo "📦 Cleaning up existing containers..."
docker-compose down -v 2>/dev/null || true

# Build and start all services
echo ""
echo "🔨 Building and starting services..."
docker-compose up --build -d

# Wait for services to be healthy
echo ""
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check status
echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "✅ Application is running!"
echo ""
echo "🌐 Access the application:"
echo "   Frontend: http://localhost:5009"
echo "   Backend:  http://localhost:5008"
echo ""
echo "🔐 Test Accounts:"
echo "   Student: test@test.com / 1234"
echo "   Teacher: test2@test.com / 1234"
echo ""
echo "📝 View logs:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 Stop services:"
echo "   docker-compose down"
echo ""
