# 🚀 Performance Optimization Guide

## Overview

This guide provides comprehensive strategies for optimizing your Cyberpunk app's performance across all layers: frontend, backend, database, and deployment.

## 📊 Performance Metrics

### Target Performance Goals
- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **First Input Delay (FID)**: < 100ms
- **Cumulative Layout Shift (CLS)**: < 0.1
- **API Response Time**: < 200ms for simple queries
- **Database Query Time**: < 50ms for indexed queries

## 🔧 Frontend Optimizations

### 1. Bundle Optimization
```javascript
// client/metro.config.js - Enable bundle splitting
module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    // Enable tree shaking
    unstable_enablePackageExports: true,
  },
};
```

### 2. Image Optimization
```javascript
// Use react-native-fast-image for better image performance
import FastImage from 'react-native-fast-image';

<FastImage
  source={{ uri: imageUrl }}
  style={styles.image}
  resizeMode={FastImage.resizeMode.cover}
  priority={FastImage.priority.high}
/>
```

### 3. Code Splitting
```javascript
// Lazy load heavy components
const ProductDetail = lazy(() => import('./ProductDetail'));
const Checkout = lazy(() => import('./Checkout'));

// Use Suspense for loading states
<Suspense fallback={<Loading />}>
  <ProductDetail />
</Suspense>
```

### 4. Memory Management
```javascript
// Clean up subscriptions and timers
useEffect(() => {
  const subscription = someObservable.subscribe();
  const timer = setInterval(() => {}, 1000);

  return () => {
    subscription.unsubscribe();
    clearInterval(timer);
  };
}, []);
```

### 5. List Virtualization
```javascript
// Use FlatList with proper optimization
<FlatList
  data={products}
  keyExtractor={(item) => item.id}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  updateCellsBatchingPeriod={50}
  removeClippedSubviews={true}
  renderItem={({ item }) => <ProductItem item={item} />}
/>
```

## ⚙️ Backend Optimizations

### 1. Database Indexing
```javascript
// Add indexes to Product model
ProductSchema.index({ category: 1, price: -1 });
ProductSchema.index({ name: 'text', description: 'text' });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ featured: 1, createdAt: -1 });
```

### 2. Query Optimization
```javascript
// Use lean queries for read-only operations
const products = await Product.find({ category: 'electronics' })
  .select('name price image')
  .sort({ createdAt: -1 })
  .limit(20)
  .lean(); // Returns plain JS objects, faster

// Use aggregation for complex queries
const productStats = await Product.aggregate([
  { $match: { category: 'electronics' } },
  { $group: {
    _id: null,
    averagePrice: { $avg: '$price' },
    totalProducts: { $sum: 1 },
    minPrice: { $min: '$price' },
    maxPrice: { $max: '$price' }
  }}
]);
```

### 3. Caching Strategy
```javascript
// Implement Redis caching
const redis = require('redis');
const client = redis.createClient();

const getCachedProducts = async (category) => {
  const cacheKey = `products:${category}`;

  // Try cache first
  const cached = await client.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // Fetch from database
  const products = await Product.find({ category })
    .limit(20)
    .lean();

  // Cache for 5 minutes
  await client.setex(cacheKey, 300, JSON.stringify(products));

  return products;
};
```

### 4. Connection Pooling
```javascript
// MongoDB connection with pooling
mongoose.connect(process.env.MONGODB_URI, {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  bufferCommands: false, // Disable mongoose buffering
  bufferMaxEntries: 0, // Disable mongoose buffering
});
```

## 🗄️ Database Optimizations

### 1. Schema Optimization
```javascript
// Optimize User schema
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  // Use sparse indexes for optional fields
  phone: {
    type: String,
    sparse: true,
    trim: true
  }
}, {
  timestamps: true,
  // Optimize write performance
  minimize: false,
  // Add versioning control
  versionKey: false
});

// Add compound indexes
UserSchema.index({ email: 1, createdAt: -1 });
```

### 2. Query Performance
```javascript
// Use projection to select only needed fields
const users = await User.find({}, 'name email createdAt');

// Use $in for multiple values
const products = await Product.find({
  category: { $in: ['electronics', 'clothing'] }
});

// Use $regex for text search
const searchResults = await Product.find({
  $text: { $search: 'wireless headphones' }
});
```

## 🚀 Deployment Optimizations

### 1. Server Configuration
```javascript
// Production server optimizations
const app = express();

// Enable compression
app.use(compression());

// Set security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);
```

### 2. Load Balancing
```nginx
# Nginx load balancer configuration
upstream backend {
    server 127.0.0.1:5002 weight=3;
    server 127.0.0.1:5003 weight=2;
    server 127.0.0.1:5004 weight=1;
}

server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. CDN Configuration
```javascript
// Use CDN for static assets
const CDN_URL = process.env.NODE_ENV === 'production'
  ? 'https://cdn.yourdomain.com'
  : '';

// Image URLs with CDN
const imageUrl = `${CDN_URL}/images/${product.image}`;
```

## 📈 Monitoring & Analytics

### 1. Performance Monitoring
```javascript
// Add performance monitoring middleware
const performanceMonitor = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} - ${duration}ms`);

    // Log slow queries
    if (duration > 1000) {
      console.warn(`Slow query detected: ${req.method} ${req.url} - ${duration}ms`);
    }
  });

  next();
};

app.use(performanceMonitor);
```

### 2. Error Tracking
```javascript
// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);

  // Log to error tracking service
  errorTracker.captureException(err, {
    req,
    user: req.user?.id,
    url: req.url,
    method: req.method
  });

  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});
```

## 🧪 Performance Testing

### 1. Load Testing
```bash
# Install load testing tools
npm install -g artillery

# Create load test
# artillery.yml
config:
  target: 'http://localhost:5002'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Sustained load"
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

### 2. Database Performance Testing
```javascript
// Benchmark database queries
const benchmark = async () => {
  const iterations = 1000;
  const startTime = Date.now();

  for (let i = 0; i < iterations; i++) {
    await Product.findOne({ category: 'electronics' });
  }

  const endTime = Date.now();
  const avgTime = (endTime - startTime) / iterations;

  console.log(`Average query time: ${avgTime}ms`);
};
```

## 📋 Optimization Checklist

### Frontend
- [ ] Enable code splitting and lazy loading
- [ ] Optimize images and implement lazy loading
- [ ] Use FlatList virtualization for large lists
- [ ] Implement proper memory management
- [ ] Minimize re-renders with React.memo
- [ ] Use proper key props in lists

### Backend
- [ ] Add database indexes for all query patterns
- [ ] Implement caching strategy (Redis)
- [ ] Optimize database queries with projection
- [ ] Add connection pooling
- [ ] Implement rate limiting
- [ ] Add request compression

### Database
- [ ] Create indexes for all filter and sort fields
- [ ] Use lean queries for read operations
- [ ] Implement proper schema design
- [ ] Monitor slow queries
- [ ] Regular database maintenance

### Deployment
- [ ] Configure load balancer
- [ ] Set up CDN for static assets
- [ ] Implement proper caching headers
- [ ] Monitor server performance
- [ ] Set up error tracking
- [ ] Configure proper logging

## 🔍 Performance Tools

### Frontend Tools
- **React DevTools Profiler**: Analyze component render performance
- **Flipper**: Debug React Native performance
- **Bundle Analyzer**: Analyze bundle size and dependencies

### Backend Tools
- **MongoDB Profiler**: Monitor database query performance
- **New Relic**: Application performance monitoring
- **PM2**: Process management and monitoring

### Testing Tools
- **Artillery**: Load testing
- **JMeter**: Performance testing
- **Lighthouse**: Web performance auditing

## 📊 Performance Budget

Set performance budgets to maintain optimal performance:

```javascript
// Performance budget configuration
const performanceBudget = {
  bundleSize: {
    max: 5 * 1024 * 1024, // 5MB max bundle size
    warning: 3 * 1024 * 1024, // 3MB warning threshold
  },
  firstPaint: {
    max: 1500, // 1.5s max FCP
    warning: 1000, // 1s warning threshold
  },
  apiResponse: {
    max: 200, // 200ms max API response
    warning: 100, // 100ms warning threshold
  }
};
```

This comprehensive optimization guide will help you achieve excellent performance across all layers of your application. Regular monitoring and testing are essential to maintain optimal performance as your application grows.
