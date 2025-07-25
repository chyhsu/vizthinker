# 🚀 VizThinker Quick Deployment Guide

This application supports deployment to any specified server IP address.

## 🎯 One-Click Deployment

### Method 1: Interactive Deployment (Recommended)
```bash
# Ensure you are in the project root directory
cd /home/jemmy/vizthinker

# Run the deployment script, the system will prompt you to enter the IP address
./deploy/deploy.sh
```

### Method 2: Command Line Argument Deployment
```bash
# Directly specify the IP address
./deploy/deploy.sh 192.168.1.100
```

## 📋 Pre-Deployment Checklist

- [ ] System has Node.js 18+ installed
- [ ] System has Python 3.10+ installed
- [ ] System has nginx installed
- [ ] System has PostgreSQL installed
- [ ] Database user `root` is created with password `00000000`
- [ ] Database `mydb` is created
- [ ] Firewall allows ports 80 and 8000
- [ ] Target server IP address is accessible

## 🌐 Access Addresses

After successful deployment, you can access the application at the following addresses (assuming your IP is 192.168.1.100):

- **Frontend Application**: http://[Your IP Address]
- **Backend API**: http://[Your IP Address]:8000
- **Health Check**: http://[Your IP Address]:8000/health

## 🔧 Service Management

```bash
# Check service status
sudo systemctl status vizthinker-backend
sudo systemctl status nginx

# Restart services
sudo systemctl restart vizthinker-backend
sudo systemctl restart nginx

# View logs
sudo journalctl -u vizthinker-backend -f
```

## 🧪 Test Deployment

### Auto-Detect IP Address
```bash
# If the deployment script has been run, the test script will auto-detect the IP
./deploy/test-deployment.sh
```

### Specify IP Address for Testing
```bash
# Manually specify the IP address for testing
./deploy/test-deployment.sh 192.168.1.100
```

## ⚙️ Dynamic Configuration Explanation

The new deployment system automatically generates the following configuration files based on the IP address you enter:

- `deploy/nginx.conf` - nginx server configuration
- `deploy/backend_config.py` - Backend CORS configuration
- `src/config/api.ts` - Frontend API configuration

These files are regenerated with each deployment to ensure consistency with the target IP address.

## 📁 Project Structure Changes

The following files have been modified/created to support dynamic IP deployment:

### New Files:
- `deploy/deploy.sh` - Automatic deployment script supporting dynamic IP
- `deploy/test-deployment.sh` - Deployment test script supporting dynamic IP
- `deploy/vizthinker-backend.service` - systemd service file
- `deploy/README.md` - Detailed deployment documentation

### Dynamically Generated Files:
- `deploy/nginx.conf` - Generated based on target IP
- `deploy/backend_config.py` - Generated based on target IP  
- `src/config/api.ts` - Generated based on target IP

### Modified Files:
- `server/main.py` - Updated CORS configuration to use dynamic settings
- `config/vite.config.ts` - Added production environment configuration
- `pyproject.toml` - Fixed poetry configuration issues

## 🔧 Key Configuration Changes

1. **Dynamic IP Support**: All configuration files are now dynamically generated based on the IP address entered by the user
2. **Backend CORS Configuration**: Automatically configured to allow access from the target IP
3. **Frontend API Configuration**: Automatically selects the correct API URL based on the deployment environment
4. **Configuration File Management**: Deployment script regenerates configuration files with each run

## 🚨 Important Reminders

- Configuration files are regenerated each time the deployment script is run
- If you need to customize the configuration, modify it after running the deployment script
- Ensure the target server's firewall allows access to ports 80 and 8000
- It is recommended to run the test script to confirm connectivity before deploying in a new environment 