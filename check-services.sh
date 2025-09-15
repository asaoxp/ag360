#!/bin/bash

# Agriverse360 - Service Health Check Script
# This script checks the health of all running services

echo "🔍 Checking Agriverse360 Services Health..."
echo "==========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check service health
check_service() {
    local url=$1
    local name=$2
    local expected_status=${3:-200}

    echo -n "Checking $name... "

    if curl -s --max-time 5 "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ RUNNING${NC}"

        # Get detailed health info if available
        if [[ $url == *"/health"* ]] || [[ $url == *"/status"* ]]; then
            echo -e "${BLUE}  Details:${NC}"
            curl -s "$url" | python3 -m json.tool 2>/dev/null || curl -s "$url"
            echo ""
        fi
    else
        echo -e "${RED}❌ NOT RESPONDING${NC}"
    fi
}

# Function to check port
check_port() {
    local port=$1
    local name=$2

    echo -n "Checking $name (port $port)... "

    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${GREEN}✅ LISTENING${NC}"
    else
        echo -e "${RED}❌ NOT LISTENING${NC}"
    fi
}

echo ""
echo "🔌 Port Status:"
echo "---------------"
check_port 3000 "Frontend (React)"
check_port 5001 "Backend API (Node.js)"
check_port 5004 "ML Service (Python)"

echo ""
echo "🌐 Service Health:"
echo "------------------"
check_service "http://localhost:3000" "Frontend Web App"
check_service "http://localhost:5001/health" "Backend API Health"
check_service "http://localhost:5001/status" "Backend API Status"
check_service "http://localhost:5004/health" "ML Service Health"
check_service "http://localhost:5004/status" "ML Service Status"

echo ""
echo "📊 API Endpoints:"
echo "-----------------"
echo -e "${BLUE}Disease Detection:${NC} POST http://localhost:5001/api/upload"
echo -e "${BLUE}Plant Search:${NC} POST http://localhost:5001/api/plant/search"
echo -e "${BLUE}Plant Identification:${NC} POST http://localhost:5001/api/plant/identify"
echo -e "${BLUE}Plant Info:${NC} POST http://localhost:5001/api/plant/info"

echo ""
echo "💡 Quick Tests:"
echo "---------------"
echo -e "${YELLOW}Test Plant Search:${NC}"
echo "curl -X POST http://localhost:5001/api/plant/search \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"plantName\":\"tomato\"}'"

echo ""
echo -e "${YELLOW}Test Backend Health:${NC}"
echo "curl http://localhost:5001/health"

echo ""
echo -e "${YELLOW}Test ML Service Health:${NC}"
echo "curl http://localhost:5004/health"

echo ""
echo -e "${GREEN}✅ Health check complete!${NC}"