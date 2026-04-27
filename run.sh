#!/bin/bash

# --- COLORS ---
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 Starting Auction System...${NC}"

# 1. Check Prerequisites
echo -e "${BLUE}🔍 Checking prerequisites...${NC}"

# Check Java
if ! command -v java &> /dev/null; then
    echo -e "${RED}❌ Java 17+ is not installed. Please install it to continue.${NC}"
    exit 1
fi

# Check MySQL
if ! command -v mysql &> /dev/null; then
    echo -e "${YELLOW}⚠️ MySQL is not found in your PATH. Please ensure it is installed and running.${NC}"
fi

# 2. Setup Database (Optional/Prompted)
echo -e "${BLUE}🗄️ Setting up the database (requires MySQL)...${NC}"
echo "   Attempting to create 'auction_db' if it doesn't exist..."
# This requires mysql to be installed and the user having permission to create DBs.
# We'll try to run the command and if it fails, we'll suggest manual setup.
echo -e "${YELLOW}🔑 Enter your MySQL root password if prompted:${NC}"
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS auction_db; ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'Mighty12'; FLUSH PRIVILEGES;" 2>/dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database setup successful (or already exists).${NC}"
else
    echo -e "${RED}⚠️ Database setup failed (could be missing permissions or MySQL not running).${NC}"
    echo "   Please follow SETUP.md for manual database configuration."
fi

# 3. Build and Run Backend
echo -e "${BLUE}🔨 Building and starting backend...${NC}"
# Use the relative path to backend folder from the zip root
cd backend
chmod +x mvnw
./mvnw clean install -DskipTests
./mvnw spring-boot:run &
BACKEND_PID=$!

echo -e "${GREEN}🌐 Backend is starting on http://localhost:8083${NC}"
echo -e "${BLUE}👉 Open frontend/login.html in your browser to start bidding!${NC}"

# Trap Ctrl+C to kill the backend process
trap "kill $BACKEND_PID; exit" SIGINT SIGTERM EXIT
wait
