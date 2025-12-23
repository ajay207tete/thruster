const express = require('express');
const router = express.Router();
const tonService = require('../services/ton.service');
const Order = require('../models/Order');

// Environment variables
const TON_RECEIVER_WALLET = process.env.TON_RECEIVER_WALLET;
const TON_RPC_URL = process.env.TON_RPC_URL || 'https://toncenter.com/api/v2/jsonRPC';
const TON_API_KEY = process.env.TON_API_KEY;

/**
 * POST /api/payment/ton/create
 * Create TON payment payload for an order
 */
router.post('/ton/create', async (req, res) => {
  try {
    const { orderId, amount, userWallet } = req.body;

    // Validate input
    if (!orderId || !amount || !userWallet) {
      return res.status(400).json({
        success: false,
        message: 'Order ID, amount, and user wallet are required'
      });
    }

    // Find and validate order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.paymentStatus !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Order is not in pending status'
      });
    }

    if (order.userId.toString() !== req.user?.id && !req.user?.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to access this order'
      });
    }

    // Create TON transaction payload
    const transaction = await tonService.createPaymentPayload(orderId, amount, userWallet);

    // Store payment attempt in order
    order.paymentAttempts = order.paymentAttempts || [];
    order.paymentAttempts.push({
      method: 'TON',
      amount: amount,
      userWallet: userWallet,
      timestamp: new Date(),
      status: 'CREATED'
    });
    await order.save();

    res.json({
      success: true,
      transaction,
      orderId
    });

  } catch (error) {
    console.error('TON payment creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create payment payload'
    });
  }
});

/**
 * POST /api/payment/ton/verify
 * Verify TON payment transaction
 */
router.post('/ton/verify', async (req, res) => {
  try {
    const { orderId, txHash } = req.body;

    // Validate input
    if (!orderId || !txHash) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and transaction hash are required'
      });
    }

    // Find and validate order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.paymentStatus !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Order is not in pending status'
      });
    }

    // Verify transaction on TON blockchain
    const verificationResult = await tonService.verifyPayment(txHash, orderId, order.totalAmount);

    if (!verificationResult.success) {
      return res.status(400).json({
        success: false,
        message: verificationResult.message
      });
    }

    // Update order status
    order.paymentStatus = 'PAID';
    order.txHash = txHash;
    order.paidAt = new Date();

    // Update payment attempt
    const lastAttempt = order.paymentAttempts[order.paymentAttempts.length - 1];
    if (lastAttempt) {
      lastAttempt.status = 'VERIFIED';
      lastAttempt.txHash = txHash;
    }

    await order.save();

    // TODO: Trigger NFT minting or other post-payment actions
    console.log(`Order ${orderId} payment verified successfully. Triggering post-payment actions...`);

    res.json({
      success: true,
      message: 'Payment verified successfully',
      order: {
        id: order._id,
        status: order.paymentStatus,
        txHash: order.txHash
      }
    });

  } catch (error) {
    console.error('TON payment verification error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Payment verification failed'
    });
  }
});

/**
 * GET /api/payment/ton/status/:orderId
 * Get payment status for an order
 */
router.get('/ton/status/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.userId.toString() !== req.user?.id && !req.user?.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to access this order'
      });
    }

    res.json({
      success: true,
      paymentStatus: order.paymentStatus,
      txHash: order.txHash,
      paidAt: order.paidAt
    });

  } catch (error) {
    console.error('Payment status check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check payment status'
    });
  }
});

/**
 * POST /api/payment/inr/create
 * Create INR payment (placeholder for future implementation)
 */
router.post('/inr/create', async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'INR payment not yet implemented'
  });
});

/**
 * POST /api/payment/nowpayments/create
 * Create NOWPayments invoice (placeholder for future implementation)
 */
router.post('/nowpayments/create', async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'NOWPayments not yet implemented'
  });
});

module.exports = router;
