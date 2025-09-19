const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');

// Create a new order
router.post('/', async (req, res) => {
  try {
    const { userId, items, totalAmount, paymentId, paymentCurrency, shippingDetails } = req.body;

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate products exist and have sufficient stock
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.product} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`
        });
      }
    }

    // Create the order
    const orderData = {
      items,
      totalAmount,
      paymentId,
      paymentCurrency,
      shippingDetails,
      status: 'pending',
      paymentStatus: 'pending'
    };

    user.orders.push(orderData);
    await user.save();

    // Update product stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    res.status(201).json({
      message: 'Order created successfully',
      order: user.orders[user.orders.length - 1]
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's orders
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate('orders.items.product');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ orders: user.orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get order by ID
router.get('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    // Find user with the order
    const user = await User.findOne({ 'orders._id': orderId })
      .populate('orders.items.product');

    if (!user) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = user.orders.id(orderId);
    res.json({ order });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update order status
router.put('/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, paymentStatus } = req.body;

    const user = await User.findOne({ 'orders._id': orderId });

    if (!user) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = user.orders.id(orderId);
    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    await user.save();

    res.json({
      message: 'Order updated successfully',
      order
    });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Cancel order
router.put('/:orderId/cancel', async (req, res) => {
  try {
    const { orderId } = req.params;

    const user = await User.findOne({ 'orders._id': orderId });

    if (!user) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = user.orders.id(orderId);

    // Only allow cancellation if order is still pending
    if (order.status !== 'pending') {
      return res.status(400).json({
        message: 'Cannot cancel order that is already being processed'
      });
    }

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity }
      });
    }

    order.status = 'cancelled';
    order.paymentStatus = 'refunded';
    await user.save();

    res.json({
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
