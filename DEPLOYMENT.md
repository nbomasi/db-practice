# Barista Cafe - Ubuntu EC2 Deployment Guide

This guide provides multiple deployment options for your Barista Cafe booking system on Ubuntu EC2.

## 🚀 Quick Deployment Options

### Option 1: Automated Full Setup (Recommended for Production)
```bash
# Make script executable
chmod +x setup-ubuntu.sh

# Run the full automated setup
./setup-ubuntu.sh
```

**What it does:**
- Installs Node.js 18.x, MySQL, Nginx
- Configures systemd services
- Sets up reverse proxy
- Configures firewall
- Creates production-ready setup

### Option 2: Simple Setup (For Testing/Development)
```bash
# Make script executable
chmod +x setup-simple.sh

# Run the simple setup
./setup-simple.sh
```

**What it does:**
- Installs Node.js, MySQL
- Uses PM2 for process management
- Basic firewall configuration
- Simpler setup for testing

### Option 3: Manual Step-by-Step Setup

#### 1. Upload Project Files
```bash
# Upload your project to EC2
scp -r /path/to/your/project user@your-ec2-ip:/home/user/

# Or clone from git
git clone <your-repo-url>
cd barista-cafe
```

#### 2. Install Prerequisites
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MySQL
sudo apt install -y mysql-server
```

#### 3. Configure MySQL
```bash
# Secure MySQL installation
sudo mysql_secure_installation

# Or manually:
sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password';"
sudo mysql -e "FLUSH PRIVILEGES;"
```

#### 4. Setup Project
```bash
# Install dependencies
npm install

# Configure environment
cp env.example .env
# Edit .env with your MySQL password and EC2 IP

# Initialize database
npm run init-db
```

#### 5. Start Services
```bash
# Option A: Using PM2
npm install -g pm2
pm2 start server.js --name "barista-api"
pm2 startup
pm2 save

# Option B: Using systemd
sudo cp barista-api.service /etc/systemd/system/
sudo systemctl enable barista-api
sudo systemctl start barista-api
```

## 🔧 Configuration Details

### Environment Variables (.env)
```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=barista_cafe

# Server Configuration
PORT=3000
NODE_ENV=production

# CORS Configuration
FRONTEND_URL=http://your-ec2-public-ip:8080
```

### EC2 Security Group Configuration
Open these ports in your EC2 Security Group:
- **Port 22** (SSH) - Source: Your IP
- **Port 80** (HTTP) - Source: 0.0.0.0/0
- **Port 443** (HTTPS) - Source: 0.0.0.0/0
- **Port 3000** (API) - Source: 0.0.0.0/0 (if not using Nginx)
- **Port 8080** (Frontend) - Source: 0.0.0.0/0 (if not using Nginx)

## 🌐 Access URLs

After setup, your application will be available at:

### With Nginx (Full Setup)
- **Main Website**: `http://your-ec2-ip`
- **Admin Panel**: `http://your-ec2-ip/admin`
- **API Health**: `http://your-ec2-ip/api/health`

### Without Nginx (Simple Setup)
- **Main Website**: `http://your-ec2-ip:8080`
- **Admin Panel**: `http://your-ec2-ip:8080/../admin.html`
- **API Health**: `http://your-ec2-ip:3000/api/health`

## 🔍 Troubleshooting

### Common Issues

#### 1. MySQL Connection Error
```bash
# Check MySQL status
sudo systemctl status mysql

# Restart MySQL
sudo systemctl restart mysql

# Check MySQL logs
sudo journalctl -u mysql
```

#### 2. Node.js Service Not Starting
```bash
# Check service status
sudo systemctl status barista-api

# Check logs
sudo journalctl -u barista-api -f

# Test manually
node server.js
```

#### 3. Port Already in Use
```bash
# Find process using port
sudo lsof -i :3000

# Kill process
sudo kill -9 <PID>

# Or change port in .env
```

#### 4. Permission Issues
```bash
# Fix file permissions
sudo chown -R $USER:$USER /path/to/project
chmod +x setup-*.sh
```

### Service Management Commands

#### With systemd (Full Setup)
```bash
# Check status
sudo systemctl status barista-api
sudo systemctl status nginx
sudo systemctl status mysql

# Restart services
sudo systemctl restart barista-api
sudo systemctl restart nginx

# View logs
sudo journalctl -u barista-api -f
sudo tail -f /var/log/nginx/error.log
```

#### With PM2 (Simple Setup)
```bash
# Check status
pm2 status

# View logs
pm2 logs barista-api

# Restart
pm2 restart barista-api

# Stop
pm2 stop barista-api
```

## 🔒 Security Considerations

### 1. Database Security
```bash
# Create dedicated database user
sudo mysql -u root -p
CREATE USER 'barista_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON barista_cafe.* TO 'barista_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2. SSL Certificate (Recommended)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 3. Firewall Hardening
```bash
# Deny all incoming by default
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow specific ports
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

## 📊 Monitoring

### Health Checks
```bash
# API health
curl http://localhost:3000/api/health

# Database connection
mysql -u root -p -e "SELECT 1"

# Service status
sudo systemctl is-active barista-api
```

### Log Monitoring
```bash
# Real-time logs
sudo journalctl -u barista-api -f

# Error logs
sudo tail -f /var/log/nginx/error.log

# Access logs
sudo tail -f /var/log/nginx/access.log
```

## 🚀 Production Optimization

### 1. Database Optimization
```sql
-- Add indexes for better performance
CREATE INDEX idx_booking_date ON bookings(booking_date);
CREATE INDEX idx_booking_status ON bookings(status);
```

### 2. Node.js Optimization
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=2048"

# Use cluster mode with PM2
pm2 start server.js -i max --name "barista-api"
```

### 3. Nginx Optimization
```nginx
# Add to nginx.conf
worker_processes auto;
worker_connections 1024;

# Enable gzip compression
gzip on;
gzip_types text/plain application/json application/javascript text/css;
```

## 📝 Maintenance

### Regular Tasks
- **Daily**: Check service status and logs
- **Weekly**: Review booking data and performance
- **Monthly**: Update system packages and dependencies
- **Quarterly**: Review security and backup procedures

### Backup Strategy
```bash
# Database backup
mysqldump -u root -p barista_cafe > backup_$(date +%Y%m%d).sql

# Project files backup
tar -czf project_backup_$(date +%Y%m%d).tar.gz /path/to/project
```

This deployment guide provides everything you need to successfully deploy your Barista Cafe booking system on Ubuntu EC2!
