import express from 'express';
import User from '../models/User.js';
import Activity from '../models/Activity.js';

const router = express.Router();

// GET /api/users/:walletAddress - Get user by wallet address
router.get('/:walletAddress', async (req, res) => {
  try {
    const user = await User.findOne({ walletAddress: req.params.walletAddress });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/users - Create user
router.post('/', async (req, res) => {
  try {
    const user = new User(req.body);
    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PATCH /api/users/:walletAddress/points - Update user points
router.patch('/:walletAddress/points', async (req, res) => {
  try {
    const { points, actionType } = req.body;

    // Update user points
    const user = await User.findOneAndUpdate(
      { walletAddress: req.params.walletAddress },
      { $inc: { totalPoints: points } },
      { new: true, upsert: true }
    );

    // Create activity record
    await Activity.create({
      userWalletAddress: req.params.walletAddress,
      actionType,
      points
    });

    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
