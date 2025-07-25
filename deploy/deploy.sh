#!/bin/bash

# VizThinker Deployment Script
# Used to deploy frontend and backend applications to a specified server

set -e  # Exit on error

# Get user input for IP address
echo "🎯 VizThinker Deployment Script"
echo "======================"

# Check if IP address is provided as a parameter
if [ -n "$1" ]; then
    TARGET_IP="$1"
    echo "Using IP address provided as command line argument: $TARGET_IP"
else
    # Prompt user to input IP address
    echo "Please enter the server IP address for deployment:"
    read -p "IP address (e.g., 192.168.1.100): " TARGET_IP
    
    # Validate IP address format
    if [[ ! $TARGET_IP =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
        echo "❌ Error: Invalid IP address format"
        exit 1
    fi
fi

echo ""
echo "🚀 Starting deployment of VizThinker application to server: $TARGET_IP"
echo ""

# Check if in the correct directory
if [ ! -f "package.json" ] || [ ! -f "pyproject.toml" ]; then
    echo "Error: Please run this script in the root directory of the VizThinker project"
    exit 1
fi

# Generate dynamic configuration files
echo "📝 Generating configuration files..."

# Generate nginx configuration
cat > deploy/nginx.conf << EOF
server {
    listen 80;
    server_name $TARGET_IP;

    # Frontend static files
    location / {
        root /var/www/vizthinker;
        try_files \$uri \$uri/ /index.html;
        
        # Add CORS headers
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        
        # Handle preflight requests
        if (\$request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE';
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization';
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }

    # Backend API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8000/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Add CORS headers
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
    }

    # Direct access to backend (optional)
    location /chat {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /auth {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /settings {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /health {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /welcome {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /markdown {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Generate backend configuration
cat > deploy/backend_config.py << EOF
"""
Backend deployment configuration
Configure uvicorn server to allow external access
"""

# Server configuration
SERVER_CONFIG = {
    "host": "0.0.0.0",  # Allow all IP access
    "port": 8000,
    "workers": 4,
    "reload": False,  # Do not use reload in production
    "log_level": "info",
    "access_log": True,
}

# CORS configuration - Allow external domain access
CORS_ORIGINS = [
    "http://$TARGET_IP",
    "http://$TARGET_IP:80",
    "http://$TARGET_IP:3000",
    "http://$TARGET_IP:5173",
    "https://$TARGET_IP",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
EOF

# Generate frontend API configuration
cat > src/config/api.ts << EOF
/**
 * API configuration
 * Automatically select API URL based on environment
 */

export function getBaseApiUrl(): string {
  // In production, return the current server address
  if (import.meta.env.PROD) {
    return 'http://$TARGET_IP:8000';
  }
  
  // Development environment
  if (import.meta.env.DEV) {
    return 'http://localhost:8000';
  }
  
  // Default return localhost
  return 'http://localhost:8000';
}

export const API_BASE_URL = getBaseApiUrl();
EOF

echo "✅ Configuration files generated"

# 1. Install frontend dependencies and build
echo "🔧 Installing frontend dependencies..."
npm install

echo "🏗️ Building frontend application..."
npm run build

# 2. Set up Python virtual environment
echo "🐍 Setting up Python virtual environment..."
if [ ! -d ".venv" ]; then
    python3 -m venv .venv
fi

source .venv/bin/activate

# 3. Install backend dependencies
echo "📦 Installing backend dependencies..."
pip install --upgrade pip
pip install poetry
poetry install --only=main --no-root

# 4. Set up PostgreSQL database
echo "🗄️ Setting up PostgreSQL database..."

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "Installing PostgreSQL..."
    sudo apt install -y postgresql postgresql-contrib
fi

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user (if not exist)
echo "Setting up database user and database..."
sudo -u postgres psql -c "SELECT 1 FROM pg_roles WHERE rolname='root'" | grep -q 1 || sudo -u postgres psql -c "CREATE USER root WITH PASSWORD '00000000';"
sudo -u postgres psql -c "SELECT 1 FROM pg_database WHERE datname='mydb'" | grep -q 1 || sudo -u postgres psql -c "CREATE DATABASE mydb OWNER root;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE mydb TO root;"

echo "Database setup complete"

# 5. Configure nginx
echo "🌐 Configuring nginx..."

# Check if nginx is installed
if ! command -v nginx &> /dev/null; then
    echo "Installing nginx..."
    sudo apt update
    sudo apt install -y nginx
fi

# Ensure nginx directories exist
sudo mkdir -p /etc/nginx/sites-available
sudo mkdir -p /etc/nginx/sites-enabled

# Set up frontend static file directory
echo "Setting up frontend file directory..."
sudo mkdir -p /var/www/vizthinker
sudo cp -r dist/* /var/www/vizthinker/
sudo chown -R www-data:www-data /var/www/vizthinker

# Copy configuration files
sudo cp deploy/nginx.conf /etc/nginx/sites-available/vizthinker
sudo ln -sf /etc/nginx/sites-available/vizthinker /etc/nginx/sites-enabled/vizthinker
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
echo "Testing nginx configuration..."
sudo nginx -t

# 6. Set up systemd service
echo "⚙️ Setting up systemd service..."
sudo cp deploy/vizthinker-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable vizthinker-backend

# 7. Start services
echo "🚀 Starting services..."
sudo systemctl restart vizthinker-backend
sudo systemctl restart nginx

# 8. Check service status
echo "✅ Checking service status..."
sudo systemctl status vizthinker-backend --no-pager
sudo systemctl status nginx --no-pager

# 9. Test health check
echo "🏥 Testing backend health check..."
sleep 5
curl -f http://127.0.0.1:8000/health || echo "Backend health check failed"

echo "🎉 Deployment complete!"
echo "Application can be accessed at the following addresses:"
echo "  - Frontend: http://$TARGET_IP"
echo "  - Backend API: http://$TARGET_IP:8000"
echo ""
echo "To view service logs, use:"
echo "  sudo journalctl -u vizthinker-backend -f"
echo "  sudo journalctl -u nginx -f" 