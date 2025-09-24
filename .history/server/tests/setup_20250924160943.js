const mongoose = require('mongoose');

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';

// Clean up after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Global test utilities
global.testUtils = {
  // Create a valid ObjectId string
  validObjectId: () => new mongoose.Types.ObjectId().toString(),

  // Create test user data
  createTestUser: (overrides = {}) => ({
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    phone: '1234567890',
    address: {
      street: '123 Test St',
      city: 'Test City',
      state: 'Test State',
      zipCode: '12345',
      country: 'Test Country'
    },
    ...overrides
  }),

  // Create test product data
  createTestProduct: (overrides = {}) => ({
    name: 'Test Product',
    description: 'A test product for testing',
    price: 99.99,
    category: 'electronics',
    image: 'test-image.jpg',
    stock: 10,
    tags: ['test', 'electronics'],
    featured: false,
    ...overrides
  }),

  // Generate auth token for testing
  generateAuthToken: (userId) => {
    const jwt = require('jsonwebtoken');
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
  }
};
