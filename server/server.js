
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
  console.error('Please set these environment variables in your .env file or system environment.');
  process.exit(1);
}

console.log('Environment variables validated successfully.');
console.log(`JWT_SECRET loaded: ${!!process.env.JWT_SECRET}`);
console.log(`Server starting in ${process.env.NODE_ENV || 'development'} mode`);

const app = express();
const PORT = process.env.PORT || 5001; // Use environment variable or default to 5001

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:8081',
    'http://localhost:8082',
    'http://localhost:8085',
    'http://localhost:3000',
    'http://localhost:5000',
    'http://localhost:5007',
    'https://thruster-three.vercel.app/',
    'https://thrusterapp.netlify.app/',
    'http://localhost:19006',
    'http://localhost:19000',
    'http://localhost:19001',
    'http://localhost:19002',
    'http://localhost:19004',
    'http://localhost:19005',
    'http://localhost:19007',
    'http://localhost:19008',
    'exp://localhost:*',
    'exp://192.168.*',
    'exp://10.0.*',
    'exp://172.*',
    // Additional common Expo ports
    'http://localhost:19009',
    'http://localhost:19010',
    'http://localhost:19011',
    'http://localhost:19012',
    'http://localhost:19013',
    'http://localhost:19014',
    'http://localhost:19015',
    // More localhost ports for Expo
    'http://localhost:19016',
    'http://localhost:19017',
    'http://localhost:19018',
    'http://localhost:19019',
    'http://localhost:19020',
    'http://localhost:19021',
    'http://localhost:19022',
    'http://localhost:19023',
    'http://localhost:19024',
    'http://localhost:19025'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// MongoDB connection
const mongoOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

// Connect mongoose main connection once
mongoose.connect(process.env.MONGODB_URI, mongoOptions)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Handle MongoDB connection events
mongoose.connection.on('error', (err) => {
  console.error('MongoDB runtime connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed due to app termination');
  process.exit(0);
});

// Health check endpoint
app.get('/health', (req, res) => {
  const healthCheck = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  };

  const isHealthy = mongoose.connection.readyState === 1;
  res.status(isHealthy ? 200 : 503).json(healthCheck);
});

// TonConnect manifest endpoint
app.get('/tonconnect-manifest.json', (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const manifest = {
    url: isProduction ? "https://thruster.netlify.app" : "http://localhost:8081",
    name: "Thruster",
    iconUrl: "https://chocolate-chemical-orangutan-457.mypinata.cloud/ipfs/bafybeig2ke6iowzphw7cxexu5o64k73tlaoph7vtpi2tsccbkexfryl37m",
    termsOfUseUrl: isProduction ? "https://thruster.netlify.app/terms" : "http://localhost:8081/terms",
    privacyPolicyUrl: isProduction ? "https://thruster.netlify.app/privacy" : "http://localhost:8081/privacy"
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  res.json(manifest);
});

// Routes
import productsRoutes from './routes/products.js';
import authRoutes from './routes/auth.js';
import orderRoutes from './routes/order.js';
import paymentRoutes from './routes/payment.js';
import paymentRoutes2 from './routes/payment.routes.js';
import ordersRoutes from './routes/orders.js';
import usersRoutes from './routes/users.js';
import activitiesRoutes from './routes/activities.js';

import paymentCallbackRoutes from './routes/paymentCallback.js';
import cartRoutes from './routes/cart.js';
import rewardsRoutes from './routes/rewards.js';

app.use('/products', productsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/payment', paymentRoutes2);
app.use('/api/orders', ordersRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/paymentCallback', paymentCallbackRoutes);
app.use('/api/cart', cartRoutes);
app.use('/rewards', rewardsRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: 'Thruster App Backend API',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API Documentation: http://localhost:${PORT}`);
});
