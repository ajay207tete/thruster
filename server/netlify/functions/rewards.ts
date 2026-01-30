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

      // Find or create user
      let user = await User.findOne({ walletAddress: wallet.toLowerCase() });
      if (!user) {
        user = new User({
          walletAddress: wallet.toLowerCase(),
          totalPoints: 0,
          isActive: true
        });
        await user.save();
      }

      // Get rewards with new schema
      const rewards = await Reward.find({ userId: wallet.toLowerCase() })
        .sort({ completedAt: -1 })
        .lean();

      // Transform to old format for frontend compatibility
      const transformedRewards = rewards.map(reward => ({
        _id: reward._id,
        actionType: reward.rewardType,
        platform: reward.actionId,
        points: reward.points,
        status: reward.verified ? 'COMPLETED' : 'PENDING',
        timestamp: reward.completedAt.toISOString()
      }));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          totalPoints: user.totalPoints,
          rewards: transformedRewards,
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

      // Find or create user
      let user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
      if (!user) {
        user = new User({
          walletAddress: walletAddress.toLowerCase(),
          totalPoints: 0,
          isActive: true
        });
        await user.save();
      }

      // Check if reward already claimed using new schema
      const existingReward = await Reward.findOne({
        userId: walletAddress.toLowerCase(),
        rewardType: actionType,
        actionId: platform,
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

      // Use MongoDB transaction for atomicity
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // Create reward record with new schema
        const reward = new Reward({
          userId: walletAddress.toLowerCase(),
          rewardType: actionType,
          actionId: platform,
          points,
          completedAt: new Date(),
          verified: true,
          metadata: {
            platform,
            claimedVia: 'social_action'
          }
        });

        await reward.save({ session });

        // Update user's total points
        await User.findByIdAndUpdate(
          user._id,
          { $inc: { totalPoints: points } },
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
            message: `${points} points added!`,
            pointsAdded: points,
            totalPoints: updatedUser?.totalPoints || user.totalPoints + points,
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
