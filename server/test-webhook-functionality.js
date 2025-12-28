import axios from 'axios';
const crypto = require('crypto');
const mongoose = require('mongoose');
require('dotenv').config();

// Mock environment variables for testing
process.env.NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY || 'test_api_key';
process.env.NOWPAYMENTS_IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET || 'test_secret_key';
process.env.BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/thruster_test';

// Import services and models
const Order = require('./models/Order');
const NowPaymentsService = require('./services/Nowpayment.service');
const TonService = require('./services/ton.service');

class WebhookTester {
  constructor() {
    this.baseUrl = 'http://localhost:3000';
    this.testResults = {
      nowpayments: {},
      ton: {},
      database: {},
      errorHandling: {}
    };
  }

  async runAllTests() {
    console.log('🚀 Starting comprehensive webhook functionality tests...\n');

    try {
      // Connect to database
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ Connected to MongoDB');

      // Test NowPayments webhook
      await this.testNowPaymentsWebhook();

      // Test TON verification
      await this.testTonVerification();

      // Test error handling
      await this.testErrorHandling();

      // Test database operations
      await this.testDatabaseOperations();

      // Generate report
      this.generateReport();

    } catch (error) {
      console.error('❌ Test suite failed:', error.message);
    } finally {
      await mongoose.disconnect();
    }
  }

  async testNowPaymentsWebhook() {
    console.log('📋 Testing NowPayments Webhook...');

    try {
      // Create a test order
      const testOrder = new Order({
        userId: 'test_user_id',
        totalAmount: 10.00,
        paymentMethod: 'NOWPAYMENTS',
        paymentStatus: 'PENDING',
        items: [{ productId: 'test_product', quantity: 1, price: 10.00 }]
      });
      await testOrder.save();
      console.log('✅ Test order created:', testOrder._id);

      // Simulate successful payment webhook
      const webhookData = {
        payment_id: 'test_payment_123',
        payment_status: 'finished',
        order_id: testOrder._id.toString(),
        pay_address: 'test_address',
        price_amount: '10.00',
        pay_amount: '10.00'
      };

      // Generate signature
      const signature = crypto
        .createHmac('sha512', process.env.NOWPAYMENTS_IPN_SECRET)
        .update(JSON.stringify(webhookData))
        .digest('hex');

      const response = await axios.post(`${this.baseUrl}/api/payment/nowpayments/webhook`, webhookData, {
        headers: {
          'x-nowpayments-sig': signature,
          'Content-Type': 'application/json'
        }
      });

      // Verify order status updated
      const updatedOrder = await Order.findById(testOrder._id);
      if (updatedOrder.paymentStatus === 'PAID') {
        console.log('✅ NowPayments webhook processed successfully');
        this.testResults.nowpayments.webhook = true;
      } else {
        console.log('❌ Order status not updated');
        this.testResults.nowpayments.webhook = false;
      }

      // Clean up
      await Order.findByIdAndDelete(testOrder._id);

    } catch (error) {
      console.log('❌ NowPayments webhook test failed:', error.message);
      this.testResults.nowpayments.webhook = false;
    }
  }

  async testTonVerification() {
    console.log('📋 Testing TON Payment Verification...');

    try {
      // Create a test order
      const testOrder = new Order({
        userId: 'test_user_id',
        totalAmount: 1.00,
        paymentMethod: 'TON_NATIVE',
        paymentStatus: 'PENDING',
        items: [{ productId: 'test_product', quantity: 1, price: 1.00 }]
      });
      await testOrder.save();

      // Mock TON transaction verification (since we can't access real blockchain)
      const mockTxHash = 'test_transaction_hash_123';

      // Test the verification endpoint
      const response = await axios.post(`${this.baseUrl}/api/payment/ton/verify`, {
        orderId: testOrder._id.toString(),
        txHash: mockTxHash
      });

      console.log('✅ TON verification endpoint responded');
      this.testResults.ton.verification = true;

      // Clean up
      await Order.findByIdAndDelete(testOrder._id);

    } catch (error) {
      console.log('❌ TON verification test failed:', error.message);
      this.testResults.ton.verification = false;
    }
  }

  async testErrorHandling() {
    console.log('📋 Testing Error Handling...');

    try {
      // Test invalid signature
      const invalidWebhookData = {
        payment_id: 'test_payment_123',
        payment_status: 'finished',
        order_id: 'invalid_order_id'
      };

      const invalidSignature = 'invalid_signature';

      try {
        await axios.post(`${this.baseUrl}/api/payment/nowpayments/webhook`, invalidWebhookData, {
          headers: {
            'x-nowpayments-sig': invalidSignature,
            'Content-Type': 'application/json'
          }
        });
        console.log('❌ Invalid signature should have been rejected');
        this.testResults.errorHandling.invalidSignature = false;
      } catch (error) {
        if (error.response?.status === 401) {
          console.log('✅ Invalid signature properly rejected');
          this.testResults.errorHandling.invalidSignature = true;
        } else {
          console.log('❌ Unexpected error for invalid signature:', error.message);
          this.testResults.errorHandling.invalidSignature = false;
        }
      }

      // Test invalid order ID
      try {
        await axios.post(`${this.baseUrl}/api/payment/ton/verify`, {
          orderId: 'invalid_order_id',
          txHash: 'test_hash'
        });
        console.log('❌ Invalid order ID should have been rejected');
        this.testResults.errorHandling.invalidOrder = false;
      } catch (error) {
        if (error.response?.status === 404) {
          console.log('✅ Invalid order ID properly rejected');
          this.testResults.errorHandling.invalidOrder = true;
        } else {
          console.log('❌ Unexpected error for invalid order:', error.message);
          this.testResults.errorHandling.invalidOrder = false;
        }
      }

    } catch (error) {
      console.log('❌ Error handling test failed:', error.message);
      this.testResults.errorHandling = { invalidSignature: false, invalidOrder: false };
    }
  }

  async testDatabaseOperations() {
    console.log('📋 Testing Database Operations...');

    try {
      // Create test order
      const testOrder = new Order({
        userId: 'test_user_id',
        totalAmount: 5.00,
        paymentMethod: 'NOWPAYMENTS',
        paymentStatus: 'PENDING'
      });
      await testOrder.save();

      // Update order status
      testOrder.paymentStatus = 'PAID';
      testOrder.txHash = 'test_tx_hash';
      testOrder.paidAt = new Date();
      await testOrder.save();

      // Verify update
      const updatedOrder = await Order.findById(testOrder._id);
      if (updatedOrder.paymentStatus === 'PAID' && updatedOrder.txHash === 'test_tx_hash') {
        console.log('✅ Database operations working correctly');
        this.testResults.database.updates = true;
      } else {
        console.log('❌ Database update failed');
        this.testResults.database.updates = false;
      }

      // Clean up
      await Order.findByIdAndDelete(testOrder._id);

    } catch (error) {
      console.log('❌ Database operations test failed:', error.message);
      this.testResults.database.updates = false;
    }
  }

  generateReport() {
    console.log('\n📊 Test Results Summary:');
    console.log('========================');

    const allPassed = Object.values(this.testResults).every(category =>
      Object.values(category).every(result => result === true)
    );

    console.log(`Overall Status: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);

    Object.entries(this.testResults).forEach(([category, tests]) => {
      console.log(`\n${category.toUpperCase()}:`);
      Object.entries(tests).forEach(([test, passed]) => {
        console.log(`  ${test}: ${passed ? '✅ PASS' : '❌ FAIL'}`);
      });
    });

    console.log('\n🎯 Recommendations:');
    if (allPassed) {
      console.log('✅ Webhook functionality is working correctly');
      console.log('✅ Ready for production deployment');
    } else {
      console.log('❌ Some issues found - review failed tests above');
      console.log('❌ Address issues before production deployment');
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new WebhookTester();
  tester.runAllTests().catch(console.error);
}

module.exports = WebhookTester;
