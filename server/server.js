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
const PORT = process.env.PORT || 5002;

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.CORS_ORIGIN ?
      process.env.CORS_ORIGIN.split(',') :
      ['http://localhost:8081', 'http://localhost:3000', 'http://localhost:19006'];

    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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

app.use('/api/products', productsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/payment', paymentRoutes2);
app.use('/api/orders', ordersRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/paymentCallback', paymentCallbackRoutes);
app.use('/api/cart', cartRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: 'Cyberpunk App Backend API',
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
