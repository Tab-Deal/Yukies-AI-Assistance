#!/bin/bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "=========================================================="
echo "  YUKIES Vienna AI Assistant & Live Chat - Launch Script   "
echo "=========================================================="

# 1. Activate virtualenv
if [ -d ".venv" ]; then
    source .venv/bin/activate
else
    echo "Error: .venv not found."
    exit 1
fi

# 2. Find cloudflared
CLOUDFLARED_BIN=$(which cloudflared 2>/dev/null || echo "/opt/homebrew/bin/cloudflared")
if [ ! -x "$CLOUDFLARED_BIN" ]; then
    echo "Error: cloudflared binary not found. Install via: brew install cloudflared"
    exit 1
fi

echo ">> Starting Uvicorn backend server on http://127.0.0.1:8000..."
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload &
UVICORN_PID=$!

cleanup() {
    echo ""
    echo ">> Stopping YUKIES server and Cloudflare Tunnel..."
    kill $UVICORN_PID 2>/dev/null || true
    kill $CLOUDFLARED_PID 2>/dev/null || true
    exit 0
}
trap cleanup INT TERM EXIT

sleep 2

echo ">> Starting Cloudflare Quick Tunnel..."
echo ">> The public HTTPS URL will appear below (look for *.trycloudflare.com)..."
echo "----------------------------------------------------------"

"$CLOUDFLARED_BIN" tunnel --url http://127.0.0.1:8000 &
CLOUDFLARED_PID=$!

wait
