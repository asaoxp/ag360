#!/bin/bash

# Agriverse360 - Unified Service Startup Script
# This script starts all services: Backend, ML Service, and Frontend

echo "🌱 Starting Agriverse360 Services..."
echo "====================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a port is in use
check_port() {
    local port=$1
    local name=$2
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${YELLOW}⚠️  Port $port ($name) is already in use${NC}"
        return 1
    else
        echo -e "${GREEN}✅ Port $port ($name) is available${NC}"
        return 0
    fi
}

# Function to start a service in background
start_service() {
    local name=$1
    local command=$2
    local log_file=$3

    echo -e "${BLUE}🚀 Starting $name...${NC}"

    # Start service in background and redirect output
    eval "$command" > "$log_file" 2>&1 &
    local pid=$!

    # Wait a moment for service to start
    sleep 2

    # Check if process is still running
    if kill -0 $pid 2>/dev/null; then
        echo -e "${GREEN}✅ $name started successfully (PID: $pid)${NC}"
        echo -e "${BLUE}📄 Logs: $log_file${NC}"
        return $pid
    else
        echo -e "${RED}❌ Failed to start $name${NC}"
        echo -e "${YELLOW}📄 Check logs: $log_file${NC}"
        return 0
    fi
}

# Create logs directory
mkdir -p logs

echo ""
echo "🔍 Checking port availability..."
check_port 3000 "Frontend (React)"
check_port 5001 "Backend (Node.js)"
check_port 5004 "ML Service (Python)"

echo ""
echo "📊 Starting services..."

# Start Backend (which will also start ML service)
if check_port 5001 "Backend"; then
    start_service "Backend API" "cd backend && npm start" "logs/backend.log"
    BACKEND_PID=$?

    # Wait for backend to fully start and initialize ML service
    echo -e "${YELLOW}⏳ Waiting for backend and ML service to initialize...${NC}"
    sleep 5
else
    echo -e "${YELLOW}⚠️  Backend port 5001 is busy, skipping...${NC}"
fi

# Start Frontend
if check_port 3000 "Frontend"; then
    start_service "Frontend (React)" "cd frontend && npm start" "logs/frontend.log"
    FRONTEND_PID=$?
else
    echo -e "${YELLOW}⚠️  Frontend port 3000 is busy, skipping...${NC}"
fi

echo ""
echo "🎉 Service startup complete!"
echo "============================"

# Display service information
echo ""
echo -e "${GREEN}🌐 Access your application:${NC}"
echo -e "   Frontend: ${BLUE}http://localhost:3000${NC}"
echo -e "   Backend API: ${BLUE}http://localhost:5001${NC}"
echo -e "   ML Service: ${BLUE}http://localhost:5004${NC}"

echo ""
echo -e "${GREEN}📊 Health Check Endpoints:${NC}"
echo -e "   Backend Health: ${BLUE}http://localhost:5001/health${NC}"
echo -e "   Backend Status: ${BLUE}http://localhost:5001/status${NC}"
echo -e "   ML Service Health: ${BLUE}http://localhost:5004/health${NC}"

echo ""
echo -e "${GREEN}📁 Log Files:${NC}"
echo -e "   Backend: ${BLUE}logs/backend.log${NC}"
echo -e "   Frontend: ${BLUE}logs/frontend.log${NC}"

echo ""
echo -e "${YELLOW}💡 Tips:${NC}"
echo "   - Use 'Ctrl+C' to stop all services"
echo "   - Check logs for detailed startup information"
echo "   - Visit /health endpoints to verify service status"

echo ""
echo -e "${GREEN}🚀 Agriverse360 is ready!${NC}"

# Wait for user interrupt
trap 'echo ""; echo -e "${YELLOW}🛑 Shutting down services...${NC}"; exit 0' INT

# Keep script running to show logs
while true; do
    sleep 1
done