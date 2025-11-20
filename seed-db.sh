#!/bin/bash

# Script to seed/reset the database with test data

echo "🌱 Seeding database with test data..."

# Check if mariadb is running
if ! docker-compose ps mariadb | grep -q "Up"; then
    echo "❌ MariaDB is not running. Please start it first with ./run-postgres.sh"
    exit 1
fi

# Drop and recreate database
echo "🗑️  Dropping existing database..."
docker-compose exec -T mariadb mysql -uroot -proot -e "DROP DATABASE IF EXISTS cosc471; CREATE DATABASE cosc471;"

# Seed with schema and data
echo "📥 Loading schema and test data..."
docker-compose exec -T mariadb mysql -uroot -proot cosc471 < schema-aiven.sql

echo ""
echo "✅ Database seeded successfully!"
echo ""
echo "🔐 Test Accounts Available:"
echo "   Student: test@test.com / 1234"
echo "   Teacher: test2@test.com / 1234"
echo "   Student: alice@example.com / alice123"
echo "   Professor: prof@example.com / alice123"
echo "   Student: john.doe@example.com / JDoe123"
echo ""
echo "📊 Database: localhost:3306"
echo "   User: root"
echo "   Password: root"
echo "   Database: cosc471"
echo ""
