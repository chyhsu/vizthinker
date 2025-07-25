#!/bin/bash

# VizThinker Deployment Test Script

set -e

echo "🧪 VizThinker Deployment Test"
echo "===================="

# Get target IP address
if [ -n "$1" ]; then
    TARGET_IP="$1"
    echo "Using IP address provided as command line argument: $TARGET_IP"
elif [ -f "deploy/backend_config.py" ]; then
    # Attempt to extract IP address from backend_config.py
    TARGET_IP=$(grep -o 'http://[0-9.]*' deploy/backend_config.py | head -n1 | sed 's/http:\/\///')
    if [ -n "$TARGET_IP" ]; then
        echo "Detected IP address from configuration file: $TARGET_IP"
    else
        echo "❌ Unable to detect IP address from configuration file, please provide IP as an argument"
        echo "Usage: $0 <IP address>"
        exit 1
    fi
else
    echo "❌ Please provide an IP address as an argument or ensure the deployment script has been run"
    echo "Usage: $0 <IP address>"
    exit 1
fi

echo ""

# Test backend health check
echo "🏥 Testing backend health check..."
if curl -f -s http://127.0.0.1:8000/health > /dev/null; then
    echo "✅ Backend health check: Passed"
else
    echo "❌ Backend health check: Failed"
    exit 1
fi

# Test frontend access
echo "🌐 Testing frontend access..."
if curl -f -s http://$TARGET_IP > /dev/null; then
    echo "✅ Frontend access: Passed"
else
    echo "❌ Frontend access: Failed"
    exit 1
fi

# Test nginx configuration
echo "⚙️ Testing nginx configuration..."
if sudo nginx -t > /dev/null 2>&1; then
    echo "✅ nginx configuration: Valid"
else
    echo "❌ nginx configuration: Invalid"
    exit 1
fi

# Test service status
echo "🔧 Testing service status..."
if systemctl is-active --quiet vizthinker-backend; then
    echo "✅ Backend service: Running"
else
    echo "❌ Backend service: Not running"
    exit 1
fi

if systemctl is-active --quiet nginx; then
    echo "✅ nginx service: Running"
else
    echo "❌ nginx service: Not running"
    exit 1
fi

echo ""
echo "🎉 All tests passed!"
echo "Application successfully deployed to: $TARGET_IP"
echo ""
echo "Access addresses:"
echo "  - Frontend: http://$TARGET_IP"
echo "  - Backend API: http://$TARGET_IP:8000" 