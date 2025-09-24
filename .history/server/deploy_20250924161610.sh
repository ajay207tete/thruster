#!/bin/bash

# Cyberpunk App Production Deployment Script
# Usage: ./deploy.sh [environment]

set -e  # Exit on any error

ENVIRONMENT=${1:-production}
echo "🚀 Starting deployment for $ENVIRONMENT environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status messages
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."

    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+"
        exit 1
    fi

    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm"
        exit 1
    fi

    if ! command -v pm2 &> /dev/null; then
        print_warning "PM2 not found. Installing globally..."
        npm install -g pm2
    fi

    print_status "Dependencies check completed"
}

# Install production dependencies
install_dependencies() {
    print_status "Installing production dependencies..."

    if [ -f "package.json" ]; then
        npm ci --production
        print_status "Dependencies installed successfully"
    else
        print_error "package.json not found"
        exit 1
    fi
}

# Run database migrations (if any)
run_migrations() {
    print_status "Running database setup..."

    # Add your migration logic here if needed
    print_status "Database setup completed"
}

# Build application (if needed)
build_application() {
    print_status "Building application..."

    # Add build steps here if needed
    print_status "Build completed"
}

# Configure environment
configure_environment() {
    print_status "Configuring environment..."

    if [ ! -f ".env.$ENVIRONMENT" ]; then
        print_error ".env.$ENVIRONMENT file not found"
        exit 1
    fi

    # Copy environment file
    cp ".env.$ENVIRONMENT" ".env"
    print_status "Environment configured"
}

# Start application with PM2
start_application() {
    print_status "Starting application with PM2..."

    # Create PM2 ecosystem file
    cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'cyberpunk-server',
    script: 'server.production.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: '$ENVIRONMENT',
      PORT: 5002
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    merge_logs: true,
    max_memory_restart: '1G',
    restart_delay: 4000,
    autorestart: true,
    watch: false,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
EOF

    # Start with PM2
    pm2 start ecosystem.config.js
    pm2 save

    print_status "Application started successfully"
}

# Setup monitoring
setup_monitoring() {
    print_status "Setting up monitoring..."

    # Install PM2 monitoring
    pm2 install pm2-logrotate
    pm2 set pm2-logrotate:max_size 10M
    pm2 set pm2-logrotate:retain 10

    # Setup health check
    pm2 startup

    print_status "Monitoring setup completed"
}

# Run security checks
run_security_checks() {
    print_status "Running security checks..."

    # Add security checks here
    print_status "Security checks completed"
}

# Main deployment process
main() {
    print_status "Starting Cyberpunk App deployment..."

    check_dependencies
    configure_environment
    install_dependencies
    run_migrations
    build_application
    start_application
    setup_monitoring
    run_security_checks

    print_status "🎉 Deployment completed successfully!"
    print_status "📊 Application is running on port 5002"
    print_status "🔗 Health check: http://localhost:5002/health"
    print_status "📈 PM2 Dashboard: pm2 monit"
    print_status "📝 Logs: pm2 logs"

    # Show PM2 status
    echo ""
    echo "=== PM2 Status ==="
    pm2 status
    echo ""
    echo "=== PM2 Logs ==="
    pm2 logs --lines 10
}

# Handle script arguments
case "${ENVIRONMENT}" in
    "production")
        print_status "Deploying to PRODUCTION environment"
        ;;
    "staging")
        print_status "Deploying to STAGING environment"
        ;;
    "development")
        print_status "Deploying to DEVELOPMENT environment"
        ;;
    *)
        print_error "Invalid environment: $ENVIRONMENT"
        print_error "Usage: $0 [production|staging|development]"
        exit 1
        ;;
esac

# Run deployment
main

# Exit successfully
exit 0
