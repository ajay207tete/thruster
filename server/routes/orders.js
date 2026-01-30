import express from 'express';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Activity from '../models/Activity.js';

const router = express.Router();

// POST /api/orders - Create order
router.post('/', async (req, res) => {
  try {
    const order = new Order({
      ...req.body,
      paymentStatus: 'pending'
    });
    const savedOrder = await order.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PATCH /api/orders/:id/pay - Mark paid + save txHash
router.patch('/:id/pay', async (req, res) => {
  try {
    const { txHash } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        paymentStatus: 'paid',
        txHash
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Calculate reward points (10% of order value)
    const rewardPoints = Math.floor(order.totalAmount * 0.1);

    // Update user points
    await User.findOneAndUpdate(
      { walletAddress: order.userWalletAddress },
      { $inc: { totalPoints: rewardPoints } }
    );

    // Create purchase activity
    await Activity.create({
      userWalletAddress: order.userWalletAddress,
      actionType: 'purchase',
      points: rewardPoints,
      referenceId: order._id
    });

    // Update order with reward points
    order.rewardPointsEarned = rewardPoints;
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
