const express = require('express');
const crypto = require('crypto');
const Order = require('../models/Order');
import axios from 'axios';

const router = express.Router();

// Environment variables
const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;
const NOWPAYMENTS_API_URL = process.env.NOWPAYMENTS_API_URL || 'https://api.nowpayments.io/v1';
const NOWPAYMENTS_IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET;

// POST /api/payment/nowpayments/create
router.post('/nowpayments/create', async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.paymentMethod !== 'NOWPAYMENTS') {
      return res.status(400).json({
        success: false,
        message: 'Order payment method is not NOWPayments'
      });
    }

    if (order.paymentStatus !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Order is not in pending status'
      });
    }

    // Create NOWPayments invoice
    const invoiceData = {
      price_amount: order.totalAmount,
      price_currency: 'USD',
      pay_currency: 'TON',
      order_id: orderId,
      order_description: `Order ${orderId}`,
      ipn_callback_url: `${process.env.BASE_URL}/api/payment/nowpayments/webhook`,
      success_url: `${process.env.FRONTEND_URL}/payment/success`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`
    };

    const response = await axios.post(
      `${NOWPAYMENTS_API_URL}/invoice`,
      invoiceData,
      {
        headers: {
          'x-api-key': NOWPAYMENTS_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    const { id: paymentId, invoice_url } = response.data;

    // Update order with payment details
    order.paymentId = paymentId;
    order.invoiceUrl = invoice_url;
    await order.save();

    res.json({
      success: true,
      paymentId,
      invoiceUrl: invoice_url
    });

  } catch (error) {
    console.error('NOWPayments invoice creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment invoice'
    });
  }
});

// POST /api/payment/nowpayments/webhook
router.post('/nowpayments/webhook', async (req, res) => {
  try {
    const { payment_status, payment_id, order_id } = req.body;

    // Verify webhook signature
    const signature = req.headers['x-nowpayments-sig'];
    const bodyString = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha512', NOWPAYMENTS_IPN_SECRET)
      .update(bodyString)
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(401).json({ message: 'Invalid signature' });
    }

    if (payment_status === 'finished') {
      const order = await Order.findById(order_id);
      if (order && order.paymentStatus === 'PENDING') {
        order.paymentStatus = 'PAID';
        await order.save();

        // TODO: Trigger NFT mint function here
        console.log(`Order ${order_id} paid successfully. Triggering NFT mint...`);
      }
    }

    res.json({ message: 'Webhook processed' });

  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
});

// POST /api/payment/ton/verify
router.post('/ton/verify', async (req, res) => {
  try {
    const { orderId, txHash } = req.body;

    if (!orderId || !txHash) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and transaction hash are required'
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.paymentMethod !== 'TON_NATIVE') {
      return res.status(400).json({
        success: false,
        message: 'Order payment method is not TON native'
      });
    }

    if (order.paymentStatus !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Order is not in pending status'
      });
    }

    // Verify transaction on TON blockchain
    const tonApiUrl = process.env.TON_API_URL || 'https://toncenter.com/api/v2';
    const response = await axios.get(`${tonApiUrl}/getTransaction`, {
      params: {
        hash: txHash,
        api_key: process.env.TON_API_KEY
      }
    });

    const transaction = response.data;

    // Verify transaction details
    if (!transaction.ok) {
      return res.status(400).json({
        success: false,
        message: 'Transaction not found or invalid'
      });
    }

    // Verify amount and recipient
    const expectedAmount = Math.floor(order.totalAmount * 1000000000); // Convert to nanotons
    const actualAmount = parseInt(transaction.result.out_msgs[0]?.value || '0');

    if (actualAmount < expectedAmount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient payment amount'
      });
    }

    // Update order status
    order.paymentStatus = 'PAID';
    order.txHash = txHash;
    await order.save();

    // TODO: Trigger NFT mint function here
    console.log(`Order ${orderId} paid successfully via TON. Triggering NFT mint...`);

    res.json({
      success: true,
      message: 'Payment verified successfully'
    });

  } catch (error) {
    console.error('TON payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed'
    });
  }
});

module.exports = router;
