# VizThinker Deployment Guide

This guide will help you deploy the VizThinker application frontend and backend on any specified server.

## System Requirements

- Ubuntu/Debian Linux
- Python 3.10+
- Node.js 18+
- nginx
- PostgreSQL
- sudo privileges

## Quick Deployment

1. **Clone the project to the server**
   ```bash
   cd /home/jemmy
   git clone <your-repo-url> vizthinker
   cd vizthinker
   ```

2. **Run the automatic deployment script**
   ```bash
   # Interactive deployment (the system will prompt for IP input)
   ./deploy/deploy.sh
   
   # Or directly specify the IP address
   ./deploy/deploy.sh 192.168.1.100
   ```

## Manual Deployment Steps

If the automatic deployment script fails, you can manually deploy by following these steps:

### 1. Install System Dependencies

```bash
# Update the system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Python-related packages
sudo apt install -y python3 python3-pip python3-venv

# Install nginx
sudo apt install -y nginx

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib
```

### 2. Configure PostgreSQL

```bash
# Switch to the postgres user
sudo -u postgres psql

-- Execute in the PostgreSQL shell:
CREATE USER root WITH PASSWORD '00000000';
CREATE DATABASE mydb OWNER root;
GRANT ALL PRIVILEGES ON DATABASE mydb TO root;
\q
```

### 3. Build the Frontend

```bash
cd /home/jemmy/vizthinker
npm install
npm run build
```

### 4. Set Up the Backend

```bash
# Create a virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install poetry
poetry install --only=main --no-root
```

### 5. Generate Configuration Files

**Note**: The new deployment system uses dynamic configuration. If you are manually deploying, you need to run the deployment script first or manually create configuration files:

```bash
# If manually configuring, replace YOUR_IP_ADDRESS with the actual IP
TARGET_IP="YOUR_IP_ADDRESS"

# Generate nginx configuration (refer to the template in deploy.sh)
# Generate backend configuration (refer to the template in deploy.sh)
# Generate frontend API configuration (refer to the template in deploy.sh)
```

### 6. Configure nginx

```bash
# Set up the frontend static file directory
sudo mkdir -p /var/www/vizthinker
sudo cp -r dist/* /var/www/vizthinker/
sudo chown -R www-data:www-data /var/www/vizthinker

# Copy configuration files (ensure they are generated with the correct IP)
sudo cp deploy/nginx.conf /etc/nginx/sites-available/vizthinker
sudo ln -sf /etc/nginx/sites-available/vizthinker /etc/nginx/sites-enabled/vizthinker
sudo rm -f /etc/nginx/sites-enabled/default

# Test the configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

### 7. Set Up systemd Service

```bash
# Copy the service file
sudo cp deploy/vizthinker-backend.service /etc/systemd/system/

# Reload systemd
sudo systemctl daemon-reload

# Enable the service
sudo systemctl enable vizthinker-backend

# Start the service
sudo systemctl start vizthinker-backend
```

## Test Deployment

```bash
# Run the test script
./deploy/test-deployment.sh

# Or specify the IP address for testing
./deploy/test-deployment.sh YOUR_IP_ADDRESS
```

## Access the Application

After successful deployment, you can access the application at the following addresses (replace YOUR_IP_ADDRESS with the actual IP):

- **Frontend**: http://YOUR_IP_ADDRESS
- **Backend API**: http://YOUR_IP_ADDRESS:8000
- **Health Check**: http://YOUR_IP_ADDRESS:8000/health

## Dynamic Configuration Explanation

The new deployment system supports the following features:

1. **Dynamic IP Configuration**: Automatically generates all configuration files based on user input
2. **Automatic Configuration File Generation**: nginx, backend CORS, and frontend API configurations are all automatically generated
3. **Simplified Deployment Process**: Deploy to any IP address with a single command
4. **Intelligent Testing**: The test script can automatically detect the configured IP address

## Troubleshooting

### Common Issues

1. **IP Address Format Error**
   - Ensure the IP format is xxx.xxx.xxx.xxx
   - Check network connectivity

2. **Port Occupied**
   ```bash
   # Check port usage
   sudo ss -tlnp | grep :80
   sudo ss -tlnp | grep :8000
   ```

3. **Service Startup Failure**
   ```bash
   # View service logs
   sudo journalctl -u vizthinker-backend -f
   sudo journalctl -u nginx -f
   ```

4. **Configuration File Issues**
   - Rerunning the deployment script will regenerate all configuration files
   - Check if the IP address in the generated configuration files is correct

### Redeployment

If you need to change the IP address or reconfigure:

```bash
# Rerun the deployment script
./deploy/deploy.sh NEW_IP_ADDRESS
```

This will regenerate all configuration files and restart the services.

## Service Management

```bash
# Check service status
sudo systemctl status vizthinker-backend
sudo systemctl status nginx

# Restart services
sudo systemctl restart vizthinker-backend
sudo systemctl restart nginx

# Stop services
sudo systemctl stop vizthinker-backend
sudo systemctl stop nginx

# View logs
sudo journalctl -u vizthinker-backend -f
sudo journalctl -u nginx -f
``` 