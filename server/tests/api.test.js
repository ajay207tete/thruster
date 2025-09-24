const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Product = require('../models/Product');
const User = require('../models/User');

describe('API Integration Tests', () => {
  let server;
  let testUser;
  let authToken;
  let testProduct;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI + '_test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    server = app.listen(5004); // Use different port for tests
  });

  afterAll(async () => {
    // Clean up test database
    await Product.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
    server.close();
  });

  beforeEach(async () => {
    // Clean up before each test
    await Product.deleteMany({});
    await User.deleteMany({});

    // Create test user
    testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });

    await testUser.save();

    // Get auth token
    const loginResponse = await request(server)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    authToken = loginResponse.body.token;

    // Create test product
    testProduct = new Product({
      name: 'Test Product',
      description: 'A test product for testing',
      price: 99.99,
      category: 'electronics',
      image: 'test-image.jpg',
      stock: 10,
      tags: ['test', 'electronics'],
      featured: false
    });

    await testProduct.save();
  });

  describe('Products API', () => {
    describe('GET /api/products', () => {
      it('should get all products', async () => {
        const response = await request(server)
          .get('/api/products');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.products)).toBe(true);
        expect(response.body.products.length).toBeGreaterThan(0);
      });

      it('should get products with pagination', async () => {
        const response = await request(server)
          .get('/api/products?page=1&limit=5');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.products).toBeDefined();
        expect(response.body.pagination).toBeDefined();
      });

      it('should get products by category', async () => {
        const response = await request(server)
          .get('/api/products?category=electronics');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.products.length).toBeGreaterThan(0);
      });

      it('should get featured products', async () => {
        const response = await request(server)
          .get('/api/products?featured=true');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });

    describe('GET /api/products/:id', () => {
      it('should get product by ID', async () => {
        const response = await request(server)
          .get(`/api/products/${testProduct._id}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.product).toBeDefined();
        expect(response.body.product.name).toBe('Test Product');
      });

      it('should return 404 for non-existent product', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const response = await request(server)
          .get(`/api/products/${fakeId}`);

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Product not found');
      });
    });

    describe('POST /api/products', () => {
      it('should create product with authentication', async () => {
        const newProduct = {
          name: 'New Test Product',
          description: 'A new test product',
          price: 149.99,
          category: 'electronics',
          stock: 5,
          tags: ['new', 'test']
        };

        const response = await request(server)
          .post('/api/products')
          .set('Authorization', `Bearer ${authToken}`)
          .send(newProduct);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.product).toBeDefined();
        expect(response.body.product.name).toBe('New Test Product');
      });

      it('should fail to create product without authentication', async () => {
        const newProduct = {
          name: 'Unauthorized Product',
          description: 'Should not be created',
          price: 50.00,
          category: 'test'
        };

        const response = await request(server)
          .post('/api/products')
          .send(newProduct);

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
      });

      it('should fail to create product with invalid data', async () => {
        const invalidProduct = {
          name: '', // Invalid: empty name
          price: -10 // Invalid: negative price
        };

        const response = await request(server)
          .post('/api/products')
          .set('Authorization', `Bearer ${authToken}`)
          .send(invalidProduct);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      });
    });

    describe('PUT /api/products/:id', () => {
      it('should update product with authentication', async () => {
        const updateData = {
          name: 'Updated Test Product',
          price: 199.99,
          stock: 20
        };

        const response = await request(server)
          .put(`/api/products/${testProduct._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.product.name).toBe('Updated Test Product');
        expect(response.body.product.price).toBe(199.99);
      });

      it('should fail to update product without authentication', async () => {
        const updateData = {
          name: 'Unauthorized Update'
        };

        const response = await request(server)
          .put(`/api/products/${testProduct._id}`)
          .send(updateData);

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
      });
    });

    describe('DELETE /api/products/:id', () => {
      it('should delete product with authentication', async () => {
        const response = await request(server)
          .delete(`/api/products/${testProduct._id}`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Product deleted successfully');
      });

      it('should fail to delete product without authentication', async () => {
        const response = await request(server)
          .delete(`/api/products/${testProduct._id}`);

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
      });
    });
  });

  describe('Security Tests', () => {
    describe('Input Validation', () => {
      it('should sanitize malicious input', async () => {
        const maliciousProduct = {
          name: '<script>alert("xss")</script>Malicious Product',
          description: 'Normal description',
          price: 100
        };

        const response = await request(server)
          .post('/api/products')
          .set('Authorization', `Bearer ${authToken}`)
          .send(maliciousProduct);

        expect(response.status).toBe(201);
        expect(response.body.product.name).not.toContain('<script>');
        expect(response.body.product.name).toBe('Malicious Product');
      });

      it('should reject SQL injection attempts', async () => {
        const sqlInjection = {
          name: "'; DROP TABLE products; --",
          price: 100
        };

        const response = await request(server)
          .post('/api/products')
          .set('Authorization', `Bearer ${authToken}`)
          .send(sqlInjection);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      });
    });

    describe('Rate Limiting', () => {
      it('should handle rapid requests gracefully', async () => {
        const promises = [];
        for (let i = 0; i < 10; i++) {
          promises.push(
            request(server)
              .get('/api/products')
          );
        }

        const responses = await Promise.all(promises);
        const successResponses = responses.filter(r => r.status === 200);

        expect(successResponses.length).toBeGreaterThan(0);
      });
    });

    describe('CORS', () => {
      it('should handle CORS preflight requests', async () => {
        const response = await request(server)
          .options('/api/products')
          .set('Origin', 'http://localhost:8081')
          .set('Access-Control-Request-Method', 'GET');

        expect(response.status).toBe(200);
        expect(response.headers['access-control-allow-origin']).toBe('http://localhost:8081');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON gracefully', async () => {
      const response = await request(server)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json')
        .send('invalid json {');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should handle database connection errors', async () => {
      // This test would require disconnecting the database
      // For now, we'll test with invalid ObjectId
      const response = await request(server)
        .get('/api/products/invalid-object-id');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Performance Tests', () => {
    it('should respond quickly to simple requests', async () => {
      const startTime = Date.now();

      await request(server)
        .get('/api/products');

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
    });

    it('should handle concurrent requests', async () => {
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(
          request(server)
            .get('/api/products')
        );
      }

      const responses = await Promise.all(promises);
      const allSuccessful = responses.every(r => r.status === 200);

      expect(allSuccessful).toBe(true);
    });
  });
});
