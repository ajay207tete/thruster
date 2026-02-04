import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Reward from '../models/Reward.js';
import Task from '../models/Task.js';

const router = express.Router();

const connectDB = async () => {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set');
  }
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI);
  }
};

const validateWalletAddress = (wallet) => {
  return /^UQ[A-Za-z0-9_-]{46}$/.test(wallet) || /^EQ[A-Za-z0-9_-]{46}$/.test(wallet);
};

// GET /api/rewards/tasks - Return all tasks
router.get('/tasks', async (req, res) => {
  try {
    await connectDB();
    const tasks = await Task.find({ isActive: true }).lean();
    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /api/rewards/users/:walletAddress - Return: { points, completedTasks }
router.get('/users/:walletAddress', async (req, res) => {
  try {
    await connectDB();
    const { walletAddress } = req.params;

    if (!walletAddress || !validateWalletAddress(walletAddress)) {
      return res.status(400).json({ success: false, error: 'Invalid wallet address' });
    }

    let user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    if (!user) {
      user = new User({
        walletAddress: walletAddress.toLowerCase(),
        totalPoints: 0,
        completedTasks: [],
        isActive: true
      });
      await user.save();
    }

    res.json({
      points: user.totalPoints,
      completedTasks: user.completedTasks
    });
  } catch (error) {
    console.error('Get user points error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /api/rewards/claim - Body: { walletAddress, taskId }
router.post('/claim', async (req, res) => {
  try {
    await connectDB();
    const { walletAddress, taskId } = req.body;

    if (!walletAddress || !taskId) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    if (!validateWalletAddress(walletAddress)) {
      return res.status(400).json({ success: false, error: 'Invalid wallet address format' });
    }

    // Find task
    const task = await Task.findOne({ taskId, isActive: true });
    if (!task) {
      return res.status(400).json({ success: false, error: 'Invalid task' });
    }

    // Find or create user
    let user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    if (!user) {
      user = new User({
        walletAddress: walletAddress.toLowerCase(),
        totalPoints: 0,
        completedTasks: [],
        isActive: true
      });
      await user.save();
    }

    // Check if task already completed
    if (user.completedTasks.includes(taskId)) {
      return res.status(400).json({ success: false, error: 'Task already completed' });
    }

    // Use MongoDB transaction for atomicity
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Create reward record
      const reward = new Reward({
        userId: walletAddress.toLowerCase(),
        rewardType: taskId,
        actionId: taskId,
        points: task.points,
        completedAt: new Date(),
        verified: true,
        metadata: {
          taskId,
          claimedVia: 'task_completion'
        }
      });

      await reward.save({ session });

      // Update user's total points and completed tasks
      await User.findByIdAndUpdate(
        user._id,
        {
          $inc: { totalPoints: task.points },
          $push: { completedTasks: taskId }
        },
        { session, new: true }
      );

      await session.commitTransaction();

      // Get updated user data
      const updatedUser = await User.findById(user._id);

      res.json({
        success: true,
        message: `${task.points} points added!`,
        pointsAdded: task.points,
        totalPoints: updatedUser?.totalPoints || user.totalPoints + task.points,
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error('Claim reward error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Legacy endpoint for backward compatibility
router.get('/:walletAddress', async (req, res) => {
  try {
    await connectDB();
    const { walletAddress } = req.params;

    if (!validateWalletAddress(walletAddress)) {
      return res.status(400).json({ success: false, error: 'Invalid wallet address' });
    }

    const rewards = await Reward.find({ userId: walletAddress.toLowerCase() })
      .sort({ completedAt: -1 })
      .lean();

    const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });

    res.json({
      success: true,
      totalPoints: user?.totalPoints || 0,
      rewards: rewards.map(reward => ({
        _id: reward._id,
        actionType: reward.rewardType,
        platform: 'social',
        points: reward.points,
        status: 'COMPLETED',
        timestamp: reward.completedAt.toISOString()
      }))
    });
  } catch (error) {
    console.error('Get rewards error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
