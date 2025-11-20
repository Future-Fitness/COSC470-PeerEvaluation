#!/bin/bash

# Script to start MariaDB, seed data, and start the full application

set -e  # Exit on error

echo "🚀 Starting Complete Application Setup..."
echo ""

# 1. Start MariaDB
echo "📦 Step 1: Starting MariaDB database..."
docker-compose stop mariadb 2>/dev/null || true
docker-compose rm -f mariadb 2>/dev/null || true
docker-compose up -d mariadb

echo "⏳ Waiting for database to be ready..."
MAX_TRIES=15
TRIES=0

while [ $TRIES -lt $MAX_TRIES ]; do
    if docker-compose exec -T mariadb mysql -uroot -proot -e "SELECT 1;" &>/dev/null; then
        echo "✅ Database is ready!"
        break
    fi
    TRIES=$((TRIES + 1))
    sleep 3
done

if [ $TRIES -eq $MAX_TRIES ]; then
    echo "❌ Database failed to start within 45 seconds."
    echo "Check logs: docker-compose logs mariadb"
    exit 1
fi

# 2. Seed the database
echo ""
echo "🌱 Step 2: Seeding database with test data..."
docker-compose exec -T mariadb mysql -uroot -proot cosc471 < schema-aiven.sql
echo "✅ Database seeded successfully!"

# 3. Copy local env file for backend
echo ""
echo "⚙️  Step 3: Setting up backend environment..."
cp backend/.env.postgres backend/.env
echo "✅ Backend environment configured!"

# 4. Install backend dependencies if needed
echo ""
echo "📥 Step 4: Installing backend dependencies..."
cd backend
if [ ! -d "node_modules" ]; then
    pnpm install
else
    echo "✅ Dependencies already installed"
fi
cd ..

# 5. Install frontend dependencies if needed
echo ""
echo "📥 Step 5: Installing frontend dependencies..."
cd frontend
if [ ! -d "node_modules" ]; then
    pnpm install
else
    echo "✅ Dependencies already installed"
fi
cd ..

# 6. Start backend and frontend
echo ""
echo "🚀 Step 6: Starting backend and frontend..."
echo ""
echo "════════════════════════════════════════════════════════════"
echo "  Application is starting..."
echo "════════════════════════════════════════════════════════════"
echo ""
echo "📊 Database Credentials:"
echo "   Host: localhost:3306"
echo "   User: root / root"
echo "   Database: cosc471"
echo ""
echo "🔐 Test Accounts:"
echo "   Student: test@test.com / 1234"
echo "   Teacher: test2@test.com / 1234"
echo "   Professor: prof@example.com / alice123"
echo ""
echo "🌐 Application URLs:"
echo "   Frontend: http://localhost:5009"
echo "   Backend:  http://localhost:5008"
echo ""
echo "════════════════════════════════════════════════════════════"
echo ""

# Run in parallel using pnpm workspace
pnpm run dev
