import express from 'express';
import Order from '../models/Order.js';
import User from '../models/User.js';

const router = express.Router();

// POST /api/order/create
router.post('/create', async (req, res) => {
  try {
    const { userWallet, items, paymentMethod } = req.body;

    // Validate required fields
    if (!userWallet || !items || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'userWallet, items, and paymentMethod are required'
      });
    }

    // Validate wallet address format
    const walletRegex = /^UQ[A-Za-z0-9_-]{46}$|^EQ[A-Za-z0-9_-]{46}$/;
    if (!walletRegex.test(userWallet)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid wallet address format'
      });
    }

    // Validate payment method
    if (!['NOWPAYMENTS', 'TON_NATIVE'].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method'
      });
    }

    // Validate items array
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Items must be a non-empty array'
      });
    }

    // Validate each item
    for (const item of items) {
      if (!item.productId || !item.name || !item.price || !item.quantity) {
        return res.status(400).json({
          success: false,
          message: 'Each item must have productId, name, price, and quantity'
        });
      }
      if (item.price <= 0 || item.quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Price and quantity must be positive numbers'
        });
      }
    }

    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Find or create user
    let user = await User.findOne({ walletAddress: userWallet.toLowerCase() });
    if (!user) {
      user = new User({ walletAddress: userWallet.toLowerCase() });
      await user.save();
    }

    // Create order
    const order = new Order({
      userId: user._id,
      items,
      totalAmount,
      paymentMethod
    });

    await order.save();

    res.status(201).json({
      success: true,
      order: {
        id: order._id,
        userWallet: user.walletAddress,
        items: order.items,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt
      }
    });

  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order'
    });
  }
});

// GET /api/order/history/:walletAddress
router.get('/history/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;

    // Validate wallet address format
    const walletRegex = /^UQ[A-Za-z0-9_-]{46}$|^EQ[A-Za-z0-9_-]{46}$/;
    if (!walletRegex.test(walletAddress)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid wallet address format'
      });
    }

    // Find user by wallet address
    const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    if (!user) {
      return res.json({
        success: true,
        orders: []
      });
    }

    const orders = await Order.find({
      userId: user._id
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      orders: orders.map(order => ({
        id: order._id,
        items: order.items,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        paymentId: order.paymentId,
        invoiceUrl: order.invoiceUrl,
        txHash: order.txHash,
        createdAt: order.createdAt,
        paidAt: order.paidAt
      }))
    });

  } catch (error) {
    console.error('Order history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order history'
    });
  }
});

export default router;
