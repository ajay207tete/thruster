import { Handler } from '@netlify/functions';
import mongoose from 'mongoose';
import User from '../../models/User';
import Reward from '../../models/Reward';

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

    if (event.httpMethod === 'GET') {
      // Get rewards history
      const wallet = event.path.split('/').pop();

      if (!wallet || !validateWalletAddress(wallet)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ success: false, error: 'Invalid wallet address' }),
        };
      }

      const user = await User.findOne({ walletAddress: wallet.toLowerCase() });
      if (!user) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ success: false, error: 'User not found' }),
        };
      }

      const rewards = await Reward.find({ userWallet: wallet.toLowerCase() })
        .sort({ timestamp: -1 })
        .lean();

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          totalPoints: user.totalPoints,
          rewards,
        }),
      };
    }

    if (event.httpMethod === 'POST') {
      // Claim social reward
      const { walletAddress, actionType, platform } = JSON.parse(event.body || '{}');

      if (!walletAddress || !actionType || !platform) {
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

      const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
      if (!user) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ success: false, error: 'User not found' }),
        };
      }

      // Check if reward already claimed
      const existingReward = await Reward.findOne({
        userWallet: walletAddress.toLowerCase(),
        actionType,
        platform,
      });

      if (existingReward) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ success: false, error: 'Reward already claimed' }),
        };
      }

      // Define points for each action
      const pointsMap: { [key: string]: number } = {
        FOLLOW_X: 100,
        FOLLOW_INSTAGRAM: 100,
        SHARE_APP: 100,
      };

      const points = pointsMap[actionType];
      if (!points) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ success: false, error: 'Invalid action type' }),
        };
      }

      // Create reward record
      const reward = new Reward({
        userWallet: walletAddress.toLowerCase(),
        actionType,
        platform,
        points,
        status: 'COMPLETED',
      });

      await reward.save();

      // Update user's total points
      user.totalPoints += points;
      await user.save();

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: `${points} points added!`,
          pointsAdded: points,
          totalPoints: user.totalPoints,
        }),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, error: 'Method not allowed' }),
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
