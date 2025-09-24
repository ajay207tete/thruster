# 🚀 Production Deployment Guide

## Overview

This comprehensive guide will walk you through deploying your Cyberpunk app to production with all optimizations, security measures, and monitoring in place.

## 📋 Deployment Checklist

### ✅ Pre-Deployment Tasks
- [x] Environment variables configured
- [x] Database connection tested
- [x] Authentication system implemented
- [x] Security middleware configured
- [x] Tests passing
- [x] Performance optimizations applied

### 🔄 Deployment Steps
- [ ] Set up production environment
- [ ] Configure CI/CD pipeline
- [ ] Deploy backend server
- [ ] Deploy frontend application
- [ ] Set up monitoring and logging
- [ ] Configure SSL certificates
- [ ] Set up domain and DNS
- [ ] Performance testing
- [ ] Security audit

## 🖥️ Backend Deployment

### Option 1: Railway (Recommended for simplicity)

#### 1. Install Railway CLI
```bash
npm install -g @railway/cli
railway login
```

#### 2. Deploy Backend
```bash
cd server
railway init
railway up
```

#### 3. Set Environment Variables
```bash
railway variables set NODE_ENV=production
railway variables set MONGODB_URI=your_production_mongodb_uri
railway variables set JWT_SECRET=your_production_jwt_secret
```

### Option 2: DigitalOcean App Platform

#### 1. Create App
```bash
# Install doctl
doctl apps create --spec server/app.yaml
```

#### 2. App Specification (server/app.yaml)
```yaml
name: cyberpunk-backend
services:
- name: web
  github:
    repo: your-repo/server
    branch: main
  envs:
  - key: NODE_ENV
    value: production
  - key: MONGODB_URI
    value: your_mongodb_uri
  - key: JWT_SECRET
    value: your_jwt_secret
```

### Option 3: AWS EC2 with PM2

#### 1. EC2 Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install MongoDB
sudo apt install -y mongodb

# Clone your repository
git clone your-repo-url
cd server

# Install dependencies
npm install --production

# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'cyberpunk-server',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5002
    }
  }]
};
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 🌐 Frontend Deployment

### Option 1: Vercel (Recommended)

#### 1. Install Vercel CLI
```bash
npm install -g vercel
vercel login
```

#### 2. Deploy Frontend
```bash
cd client
vercel --prod
```

#### 3. Environment Variables
```bash
vercel env add NODE_ENV
vercel env add API_BASE_URL
vercel env add SANITY_PROJECT_ID
```

### Option 2: Netlify

#### 1. Build Settings
```bash
# netlify.toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "https://your-backend.herokuapp.com/:splat"
  status = 200
```

#### 2. Deploy
```bash
netlify deploy --prod --dir=client/dist
```

## 🗄️ Database Setup

### MongoDB Atlas (Recommended)

#### 1. Create Cluster
1. Go to MongoDB Atlas
2. Create new cluster (M0 free tier)
3. Set up database user and password
4. Whitelist IP addresses (0.0.0.0/0 for all)

#### 2. Connection String
```javascript
// .env.production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cyberpunk_app?retryWrites=true&w=majority
```

### Alternative: Local MongoDB
```bash
# Install MongoDB locally
sudo apt install -y mongodb

# Start MongoDB service
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

## 🔒 SSL Configuration

### Let's Encrypt (Free SSL)

#### 1. Install Certbot
```bash
sudo apt install -y certbot
```

#### 2. Get SSL Certificate
```bash
sudo certbot certonly --standalone -d yourdomain.com
```

#### 3. Auto-renewal
```bash
sudo crontab -e
# Add: 0 3 * * * certbot renew --quiet
```

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:5002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
        proxy_pass http://localhost:5002/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 📊 Monitoring & Logging

### 1. Application Monitoring

#### PM2 Monitoring
```bash
# Install PM2 monitoring
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 10

# Real-time monitoring
pm2 monit
```

#### Health Check Endpoint
```javascript
// Add to server.js
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});
```

### 2. Error Tracking

#### Sentry Setup
```bash
npm install @sentry/node
```

```javascript
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: 'your_sentry_dsn',
  environment: process.env.NODE_ENV
});

// Global error handler
app.use(Sentry.Handlers.errorHandler());
```

### 3. Performance Monitoring

#### New Relic
```bash
npm install newrelic
```

```javascript
// Add to top of server.js
require('newrelic');
```

## 🔄 CI/CD Pipeline

### GitHub Actions

#### 1. Create workflow file
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2

    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'

    - name: Install dependencies
      run: npm ci

    - name: Run tests
      run: npm test

    - name: Build frontend
      run: npm run build

    - name: Deploy to Railway
      uses: railwayapp/railway-action@v1
      with:
        railway-token: ${{ secrets.RAILWAY_TOKEN }}
```

### 2. Environment Secrets
```bash
# Add to GitHub repository secrets
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
RAILWAY_TOKEN=your_railway_token
```

## 🧪 Production Testing

### 1. Load Testing
```bash
# Install Artillery
npm install -g artillery

# Create load test
artillery run load-test.yml
```

### 2. Load Test Configuration
```yaml
# load-test.yml
config:
  target: 'https://yourdomain.com'
  phases:
    - duration: 300
      arrivalRate: 5
      name: "Normal load"
    - duration: 300
      arrivalRate: 20
      name: "High load"
scenarios:
  - name: "Get products"
    get:
      url: "/api/products"
  - name: "User authentication"
    post:
      url: "/api/auth/login"
      json:
        email: "test@example.com"
        password: "password123"
```

### 3. Security Testing
```bash
# Install security testing tools
npm install -g nmap sqlmap nikto

# Run security scans
nikto -h https://yourdomain.com
sqlmap -u https://yourdomain.com/api/products --batch
```

## 📱 Mobile App Deployment

### Expo Application Services (EAS)

#### 1. Install EAS CLI
```bash
npm install -g @expo/eas-cli
eas login
```

#### 2. Configure EAS Build
```bash
eas build:configure
```

#### 3. Build for Production
```bash
eas build --platform all --profile production
```

#### 4. Submit to Stores
```bash
eas submit --platform ios
eas submit --platform android
```

## 🔧 Environment Configuration

### Production Environment Variables
```bash
# .env.production
NODE_ENV=production
PORT=5002

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cyberpunk_app

# Security
JWT_SECRET=your-super-secure-production-jwt-secret-256-bit-key
CORS_ORIGIN=https://yourdomain.com

# External APIs
AMADEUS_CLIENT_ID=your_amadeus_client_id
AMADEUS_CLIENT_SECRET=your_amadeus_client_secret

# TON Connect
TON_MANIFEST_URL=https://yourdomain.com/tonconnect-manifest.json

# Monitoring
SENTRY_DSN=your_sentry_dsn
NEW_RELIC_LICENSE_KEY=your_newrelic_key
```

## 🚨 Emergency Procedures

### 1. Rollback Plan
```bash
# GitHub Actions rollback
git revert HEAD
git push origin main

# Railway rollback
railway rollback
```

### 2. Database Backup
```bash
# MongoDB backup
mongodump --uri="mongodb+srv://username:password@cluster.mongodb.net" --out backup

# Restore from backup
mongorestore --uri="mongodb+srv://username:password@cluster.mongodb.net" backup
```

### 3. Incident Response
```bash
# Check server logs
pm2 logs cyberpunk-server --lines 100

# Check system resources
htop

# Restart services
pm2 restart all
```

## 📞 Support & Maintenance

### 1. Regular Maintenance Tasks
- [ ] Weekly: Review logs and performance metrics
- [ ] Monthly: Update dependencies and security patches
- [ ] Quarterly: Performance testing and optimization
- [ ] Annually: Security audit and penetration testing

### 2. Monitoring Alerts
```bash
# Set up alerts for:
- Server response time > 1 second
- Error rate > 5%
- CPU usage > 80%
- Memory usage > 90%
- Database connection failures
```

## 🎯 Performance Benchmarks

### Target Metrics
- **Response Time**: < 200ms for API calls
- **Uptime**: 99.9% (8.76 hours downtime/year)
- **Error Rate**: < 0.1%
- **Throughput**: 1000+ requests/minute
- **Database Query Time**: < 50ms

### Monitoring Tools
- **UptimeRobot**: Website monitoring
- **Pingdom**: Performance monitoring
- **Google Analytics**: User behavior tracking
- **New Relic**: Application performance monitoring

## 📚 Additional Resources

- [Railway Documentation](https://docs.railway.app)
- [MongoDB Atlas Documentation](https://docs.mongodb.com/atlas)
- [Vercel Documentation](https://vercel.com/docs)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Nginx Documentation](https://nginx.org/en/docs/)

---

## 🚀 Quick Start Commands

```bash
# Backend Deployment (Railway)
cd server
railway login
railway init
railway up

# Frontend Deployment (Vercel)
cd client
vercel login
vercel --prod

# Testing
npm test
artillery run load-test.yml

# Monitoring
pm2 monit
pm2 logs
```

Your Cyberpunk app is now ready for production deployment! 🚀
