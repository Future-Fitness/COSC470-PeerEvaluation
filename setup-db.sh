#!/bin/bash

echo "🚀 Starting MariaDB and seeding data..."

# Start MariaDB
docker-compose up -d mariadb

# Wait for database
echo "⏳ Waiting for database..."
sleep 8

# Seed database
echo "🌱 Seeding database..."
docker-compose exec -T mariadb mysql -uroot -proot cosc471 < schema.sql

echo ""
echo "✅ Done!"
echo ""
echo "🔐 Test Accounts:"
echo "   test@test.com / 1234"
echo "   test2@test.com / 1234"
echo ""
echo "📊 Database: localhost:3306 (root/root/cosc471)"
