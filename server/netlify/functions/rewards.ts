import { Handler } from '@netlify/functions';
import mongoose from 'mongoose';
import User from '../../models/User';
import Reward from '../../models/Reward';
import Task from '../../models/Task';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not set');
}

const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI);
  }
};

const validateWalletAddress = (wallet: string): boolean => {
  return /^UQ[A-Za-z0-9_-]{46}$/.test(wallet) || /^EQ[A-Za-z0-9_-]{46}$/.test(wallet);
};

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    await connectDB();

    const path = event.path.replace('/.netlify/functions/rewards', '');

    // GET /api/tasks - Return all tasks
    if (event.httpMethod === 'GET' && path === '/tasks') {
      const tasks = await Task.find({ isActive: true }).lean();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(tasks),
      };
    }

    // GET /api/users/:walletAddress - Return: { points, completedTasks }
    if (event.httpMethod === 'GET' && path.startsWith('/users/')) {
      const walletAddress = path.replace('/users/', '');

      if (!walletAddress || !validateWalletAddress(walletAddress)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ success: false, error: 'Invalid wallet address' }),
        };
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

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          points: user.totalPoints,
          completedTasks: user.completedTasks
        }),
      };
    }

    // POST /api/rewards/claim - Body: { walletAddress, taskId }
    if (event.httpMethod === 'POST' && path === '/claim') {
      const { walletAddress, taskId } = JSON.parse(event.body || '{}');

      if (!walletAddress || !taskId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ success: false, error: 'Missing required fields' }),
        };
      }

      if (!validateWalletAddress(walletAddress)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ success: false, error: 'Invalid wallet address format' }),
        };
      }

      // Find task
      const task = await Task.findOne({ taskId, isActive: true });
      if (!task) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ success: false, error: 'Invalid task' }),
        };
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
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ success: false, error: 'Task already completed' }),
        };
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

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            message: `${task.points} points added!`,
            pointsAdded: task.points,
            totalPoints: updatedUser?.totalPoints || user.totalPoints + task.points,
          }),
        };
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ success: false, error: 'Endpoint not found' }),
    };
  } catch (error) {
    console.error('Rewards function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: 'Internal server error' }),
    };
  }
};
