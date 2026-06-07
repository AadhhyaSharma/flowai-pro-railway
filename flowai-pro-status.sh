#!/bin/bash

###############################################################################
# FlowAI Pro - Status Checker
#
# This script checks if the FlowAI Pro application is running and displays
# its status, connection information, and logs.
#
# Usage: ./flowai-pro-status.sh [--logs] [--tail N]
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PORT=3000
LOG_FILE="/tmp/flowai-pro.log"
APP_NAME="FlowAI Pro"

# Parse arguments
SHOW_LOGS=false
TAIL_LINES=20

while [[ $# -gt 0 ]]; do
    case $1 in
        --logs)
            SHOW_LOGS=true
            shift
            ;;
        --tail)
            TAIL_LINES="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [--logs] [--tail N]"
            exit 1
            ;;
    esac
done

# Functions
print_header() {
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC}  $1"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Display header
print_header "$APP_NAME - Status Checker"
echo ""

# Check if process is running on port
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    PID=$(lsof -ti:$PORT)
    print_success "Application is ONLINE"
    echo ""
    echo -e "${GREEN}Connection Details:${NC}"
    echo "  Local URL:    http://localhost:$PORT"
    echo "  Process ID:   $PID"
    echo "  Port:         $PORT"
    echo ""
    
    # Get process info
    if command -v ps &> /dev/null; then
        UPTIME=$(ps -o etime= -p $PID 2>/dev/null | xargs || echo "unknown")
        MEMORY=$(ps -o rss= -p $PID 2>/dev/null | xargs || echo "unknown")
        
        echo -e "${BLUE}Process Information:${NC}"
        echo "  Uptime:       $UPTIME"
        if [ "$MEMORY" != "unknown" ]; then
            echo "  Memory:       $((MEMORY / 1024)) MB"
        fi
        echo ""
    fi
    
    # Check connectivity
    if curl -s http://localhost:$PORT > /dev/null 2>&1; then
        print_success "Server is responding to requests"
    else
        print_warning "Server is listening but not responding"
    fi
    
else
    print_error "Application is OFFLINE"
    echo ""
    print_info "To start the application, run:"
    echo "  /home/ubuntu/flowai-pro-launcher.sh"
    echo ""
fi

# Show logs if requested
if [ "$SHOW_LOGS" = true ]; then
    echo ""
    print_header "Recent Logs (Last $TAIL_LINES lines)"
    if [ -f "$LOG_FILE" ]; then
        tail -n $TAIL_LINES "$LOG_FILE"
    else
        print_warning "Log file not found: $LOG_FILE"
    fi
fi

# Show quick commands
echo ""
print_header "Quick Commands"
echo "  Start app:        /home/ubuntu/flowai-pro-launcher.sh"
echo "  Check status:     /home/ubuntu/flowai-pro-status.sh"
echo "  View logs:        /home/ubuntu/flowai-pro-status.sh --logs"
echo "  Tail logs:        /home/ubuntu/flowai-pro-status.sh --logs --tail 50"
echo "  Stop app:         kill \$(lsof -ti:3000)"
echo ""
