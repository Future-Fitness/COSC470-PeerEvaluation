#!/bin/bash

# Local Development Setup Script
# This script sets up local development environment with Docker database

set -e

echo "🚀 Setting up Local Development Environment"
echo "=========================================="
echo ""

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install it first:"
    echo "npm install -g pnpm"
    exit 1
fi

# Stop any existing Docker containers
echo "📦 Stopping existing Docker containers..."
docker-compose down 2>/dev/null || true

# Start only the database
echo "🗄️  Starting MariaDB database..."
docker-compose up -d mariadb

# Wait for database to be healthy
echo "⏳ Waiting for database to be ready..."
timeout=60
counter=0

while [ $counter -lt $timeout ]; do
    if docker-compose ps mariadb 2>/dev/null | grep -q "healthy"; then
        echo "✅ Database is ready!"
        break
    fi
    echo "   Checking database status... ($counter/$timeout seconds)"
    sleep 2
    counter=$((counter + 2))
done

if [ $counter -ge $timeout ]; then
    echo "❌ Database failed to start within $timeout seconds"
    exit 1
fi

# Setup backend
echo ""
echo "🔧 Setting up backend..."
cd backend

# Copy local environment file
if [ -f ".env.local" ]; then
    cp .env.local .env
    echo "✅ Copied local environment configuration"
else
    echo "❌ .env.local not found"
    exit 1
fi

# Install dependencies
echo "📦 Installing backend dependencies..."
pnpm install

echo "✅ Backend setup complete!"

# Setup frontend
echo ""
echo "🎨 Setting up frontend..."
cd ../frontend

# Install dependencies
echo "📦 Installing frontend dependencies..."
pnpm install

echo "✅ Frontend setup complete!"

cd ..

echo ""
echo "🎉 Local development environment is ready!"
echo ""
echo "📍 Database Status:"
echo "  Host: localhost:3306"
echo "  Status: $(docker-compose ps mariadb --format json 2>/dev/null | grep -o '"Health":"[^"]*"' | cut -d'"' -f4)"
echo ""
echo "🚀 To start development servers:"
echo ""
echo "Terminal 1 - Backend:"
echo "  cd backend && pnpm dev"
echo "  Backend will run on: http://localhost:5008"
echo ""
echo "Terminal 2 - Frontend:"  
echo "  cd frontend && pnpm dev"
echo "  Frontend will run on: http://localhost:5173"
echo ""
echo "📋 Useful commands:"
echo "  Stop database: docker-compose down"
echo "  View database logs: docker logs cosc470-peerevaluation-mariadb-1"
echo "  Backend tests: cd backend && pnpm test"
echo ""
echo "⚠️  Note: Make sure to update frontend API calls to use localhost:5008 if needed"