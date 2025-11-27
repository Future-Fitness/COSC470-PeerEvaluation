#!/bin/bash

# Script to run only the database container for local development
# This allows you to run backend and frontend locally while using Docker database

echo "🗄️  Starting MariaDB container for local development"
echo "=================================================="

# Stop all services first
echo "Stopping all existing containers..."
docker-compose down 2>/dev/null || true

# Start only the database
echo "Starting MariaDB database..."
docker-compose up -d mariadb

# Wait for database to be healthy
echo "Waiting for database to be ready..."
timeout=60
counter=0

while [ $counter -lt $timeout ]; do
    if docker-compose ps mariadb | grep -q "healthy"; then
        echo "✅ Database is ready!"
        break
    fi
    echo "⏳ Waiting for database... ($counter/$timeout)"
    sleep 2
    counter=$((counter + 2))
done

if [ $counter -ge $timeout ]; then
    echo "❌ Database failed to start within $timeout seconds"
    exit 1
fi

echo ""
echo "🎉 MariaDB is now running and ready for local development!"
echo ""
echo "Database connection details:"
echo "  Host: localhost"
echo "  Port: 3306"
echo "  User: root"
echo "  Password: root"
echo "  Database: cosc471"
echo ""
echo "To stop the database, run:"
echo "  docker-compose down"
echo ""
echo "Next steps:"
echo "1. Backend: cd backend && cp .env.local .env && pnpm dev"
echo "2. Frontend: cd frontend && pnpm dev"