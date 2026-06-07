#!/bin/bash

# ╔════════════════════════════════════════════════════════════╗
# ║         FlowAI Pro - Application Launcher                 ║
# ╚════════════════════════════════════════════════════════════╝

PORT=3000
LOG_FILE="/tmp/flowai-pro.log"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "╔════════════════════════════════════════════════════════════╗"
echo "║         FlowAI Pro - Application Launcher                 ║"
echo "╚════════════════════════════════════════════════════════════╝"

if ! command -v node &> /dev/null; then
  echo "✗ Node.js not found. Install from https://nodejs.org/"
  exit 1
fi
echo "✓ Node.js found: $(node --version)"

if ! command -v pnpm &> /dev/null; then
  echo "ℹ Installing pnpm..."
  npm install -g pnpm
fi
echo "✓ pnpm found: $(pnpm --version)"
echo "ℹ Working directory: $PROJECT_DIR"
cd "$PROJECT_DIR"

if [ ! -d "node_modules" ]; then
  echo "ℹ Installing dependencies..."
  pnpm install
else
  echo "✓ Dependencies already installed"
fi

if lsof -ti:$PORT &> /dev/null 2>&1; then
  echo "ℹ Freeing port $PORT..."
  lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
  sleep 1
fi

echo "ℹ Starting FlowAI Pro on port $PORT..."
nohup pnpm dev > "$LOG_FILE" 2>&1 &
SERVER_PID=$!
echo "✓ Server started with PID: $SERVER_PID"

echo "ℹ Waiting for server to start..."
for i in {1..30}; do
  if curl -s http://localhost:$PORT > /dev/null 2>&1; then
    echo "✓ Server is ready!"
    break
  fi
  sleep 1
done

if command -v xdg-open &> /dev/null; then
  xdg-open "http://localhost:$PORT" &
elif command -v open &> /dev/null; then
  open "http://localhost:$PORT" &
fi

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║              FlowAI Pro is Running                        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo "  Local URL:  http://localhost:$PORT"
echo "  PID:        $SERVER_PID"
echo "  Log File:   $LOG_FILE"
echo "ℹ Press Ctrl+C to stop the server"

wait $SERVER_PID
