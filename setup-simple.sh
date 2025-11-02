#!/bin/bash

# Barista Cafe Booking System - Simple Ubuntu Setup Script
# Basic setup without Nginx (for testing/development)

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }

echo "=========================================="
echo "  Barista Cafe - Simple Ubuntu Setup"
echo "=========================================="

# Update system
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js
print_status "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MySQL
print_status "Installing MySQL..."
sudo apt install -y mysql-server

# Secure MySQL
print_status "Configuring MySQL..."
sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';"
sudo mysql -e "FLUSH PRIVILEGES;"

# Get MySQL password
echo
read -s -p "Enter MySQL root password: " mysql_password
echo
read -s -p "Confirm MySQL root password: " mysql_password_confirm
echo

if [ "$mysql_password" != "$mysql_password_confirm" ]; then
    echo "Passwords don't match. Exiting."
    exit 1
fi

sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '$mysql_password';"

# Get EC2 IP
read -p "Enter your EC2 public IP: " ec2_ip

# Install dependencies
print_status "Installing project dependencies..."
npm install

# Configure environment
print_status "Configuring environment..."
cp env.example .env
sed -i "s/your_password/$mysql_password/g" .env
sed -i "s|http://localhost:8080|http://$ec2_ip:8080|g" .env
sed -i "s/NODE_ENV=development/NODE_ENV=production/g" .env

# Initialize database
print_status "Initializing database..."
npm run init-db

# Install PM2
print_status "Installing PM2..."
sudo npm install -g pm2

# Start with PM2
print_status "Starting application..."
pm2 start server.js --name "barista-api"
pm2 startup
pm2 save

# Configure firewall
print_status "Configuring firewall..."
sudo ufw allow 22
sudo ufw allow 3000
sudo ufw allow 8080
sudo ufw --force enable

print_success "Setup complete!"
echo
echo "Access URLs:"
echo "  🌐 Website: http://$ec2_ip:8080"
echo "  📊 Admin:  http://$ec2_ip:8080/../admin.html"
echo "  🔧 API:    http://$ec2_ip:3000/api/health"
echo
echo "Management:"
echo "  pm2 status"
echo "  pm2 logs barista-api"
echo "  pm2 restart barista-api"
